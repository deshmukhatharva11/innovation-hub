const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'innovation_hub_jwt_secret_key_2024_default');
    
    let user;
    
    // Check if it's a mentor token
    if (decoded.role === 'mentor' && (decoded.mentorId || decoded.id)) {
      // First try to find in Mentors table
      const { Mentor } = require('../models');
      user = await Mentor.findByPk(decoded.mentorId || decoded.id, {
        include: [
          {
            model: require('../models/College'),
            as: 'college',
            attributes: ['id', 'name'],
          },
          {
            model: require('../models/Incubator'),
            as: 'incubator',
            attributes: ['id', 'name'],
          },
        ],
      });
      
      // If not found in Mentors table, try users table
      if (!user) {
        user = await User.findByPk(decoded.userId, {
          include: [
            {
              model: require('../models/College'),
              as: 'college',
              attributes: ['id', 'name'],
            },
            {
              model: require('../models/Incubator'),
              as: 'incubator',
              attributes: ['id', 'name'],
            },
          ],
        });
      }
      
      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or inactive mentor',
        });
      }
      
      // Add role to user object for consistency
      user.role = 'mentor';
      user.id = user.id; // Ensure id is set
    } else {
      // Regular user authentication
      user = await User.findByPk(decoded.userId, {
        include: [
          {
            model: require('../models/College'),
            as: 'college',
            attributes: ['id', 'name'],
          },
          {
            model: require('../models/Incubator'),
            as: 'incubator',
            attributes: ['id', 'name'],
          },
        ],
      });

      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or inactive user',
        });
      }

      // Do not block requests with a write here; fire-and-forget
      user.update({ last_login: new Date() }).catch(() => {});
    }

    // ✅ FIXED VERSION:
    console.log('🔍 User loaded:', {
      userId: user?.id,
      role: user?.role,
      collegeId: user?.college_id,
      hasCollege: !!user?.college,
      collegeName: user?.college?.name,
      userObject: user?.toJSON ? user.toJSON() : user
    });

    req.user = user;
    // Explicitly set college_id for easier access
    req.user.college_id = user.college_id;
    req.user.incubator_id = user.incubator_id;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

// Middleware to check if user has required role(s)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Flatten the roles array in case it's nested
    const flatRoles = roles.flat();

    console.log('🔍 Authorization check:', {
      userRole: req.user.role,
      requiredRoles: flatRoles,
      hasRole: flatRoles.includes(req.user.role),
      userObject: {
        id: req.user.id,
        role: req.user.role,
        college_id: req.user.college_id
      }
    });

    if (!flatRoles.includes(req.user.role)) {
      console.log('❌ Role not authorized:', req.user.role, 'not in', flatRoles);
      console.log('❌ User details:', {
        id: req.user.id,
        role: req.user.role,
        email: req.user.email,
        college_id: req.user.college_id
      });
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    console.log('✅ Role authorized');
    next();
  };
};

// Middleware to check if user owns the resource or has admin access
const authorizeOwnerOrAdmin = (resourceModel, resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Admin can access everything
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params[resourceIdField];
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID is required',
        });
      }

      const resource = await resourceModel.findByPk(resourceId);
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
      }

      // Check if user owns the resource
      const ownerField = resourceModel.name === 'User' ? 'id' : 'student_id';
      if (resource[ownerField] === req.user.id) {
        return next();
      }

      // College admin can access resources from their college
      if (req.user.role === 'college_admin' && resource.college_id === req.user.college_id) {
        return next();
      }

      // Incubator manager can access resources from their incubator
      if (req.user.role === 'incubator_manager' && resource.incubator_id === req.user.incubator_id) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error',
      });
    }
  };
};

// Middleware to check if user can access college resources
const authorizeCollegeAccess = () => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Admin can access everything
      if (req.user.role === 'admin') {
        return next();
      }

      // College admin can access their college resources
      if (req.user.role === 'college_admin') {
        const collegeId = req.params.collegeId || req.body.college_id;
        if (collegeId && parseInt(collegeId) !== req.user.college_id) {
          return res.status(403).json({
            success: false,
            message: 'Can only access your own college resources',
          });
        }
        return next();
      }

      // Students can access their own college resources
      if (req.user.role === 'student') {
        const collegeId = req.params.collegeId || req.body.college_id;
        if (collegeId && parseInt(collegeId) !== req.user.college_id) {
          return res.status(403).json({
            success: false,
            message: 'Can only access your own college resources',
          });
        }
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    } catch (error) {
      console.error('College access authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error',
      });
    }
  };
};

// Middleware to check if user can access incubator resources
const authorizeIncubatorAccess = () => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Admin can access everything
      if (req.user.role === 'admin') {
        return next();
      }

      // Incubator manager can access their incubator resources
      if (req.user.role === 'incubator_manager') {
        const incubatorId = req.params.incubatorId || req.body.incubator_id;
        if (incubatorId && parseInt(incubatorId) !== req.user.incubator_id) {
          return res.status(403).json({
            success: false,
            message: 'Can only access your own incubator resources',
          });
        }
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    } catch (error) {
      console.error('Incubator access authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error',
      });
    }
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeOwnerOrAdmin,
  authorizeCollegeAccess,
  authorizeIncubatorAccess,
};
