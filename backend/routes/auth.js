const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { User, College, Incubator } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { uploadConfigs, handleUploadError } = require('../middleware/upload');
const AuditService = require('../services/auditService');

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    id: user.id,
    role: user.role,
    email: user.email,
    college_id: user.college_id,
    incubator_id: user.incubator_id
  };
  
  // Add mentor-specific fields
  if (user.role === 'mentor') {
    payload.mentorId = user.id;
  }
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'innovation_hub_jwt_secret_key_2024_default',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper function to generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'innovation_hub_refresh_secret_key_2024_default',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['student', 'college_admin', 'incubator_manager']).withMessage('Invalid role'),
  body('college_id').optional().isInt().withMessage('College ID must be a valid integer'),
  body('incubator_id').optional().isInt().withMessage('Incubator ID must be a valid integer'),
  body('organization').optional().isString().withMessage('Organization must be a string'),
  body('phone').optional().isString(),
  body('department').optional().isString(),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    let { name, email, password, role, college_id, incubator_id, department, phone, organization } = req.body;

    // If organization name is provided (from frontend), resolve it to the corresponding ID
    if (!college_id && role === 'college_admin' && organization) {
      const matchedCollege = await College.findOne({ where: { name: organization } });
      if (!matchedCollege) {
        return res.status(400).json({ success: false, message: 'Invalid college name' });
      }
      college_id = matchedCollege.id;
    }
    
    // For incubator managers, we'll allow them to register with any organization name
    // and create a new incubator record for their organization if it doesn't exist
    if (role === 'incubator_manager' && organization) {
      let matchedIncubator = await Incubator.findOne({ where: { name: organization } });
      if (!matchedIncubator) {
        // Create a new incubator for this organization
        matchedIncubator = await Incubator.create({
          name: organization,
          city: 'Unknown',
          state: 'Unknown',
          country: 'India',
          is_active: true
        });
      }
      incubator_id = matchedIncubator.id;
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Validate college_id if provided
    if (college_id) {
      const college = await College.findByPk(college_id);
      if (!college) {
        return res.status(400).json({
          success: false,
          message: 'Invalid college ID',
        });
      }
    }

    // Validate incubator_id if provided
    if (incubator_id) {
      const incubator = await Incubator.findByPk(incubator_id);
      if (!incubator) {
        return res.status(400).json({
          success: false,
          message: 'Invalid incubator ID',
        });
      }
    }

    // Create user (email_verified will be false by default)
    const user = await User.create({
      name,
      email,
      password_hash: password, // Will be hashed by model hook
      role,
      college_id,
      incubator_id,
      department,
      phone,
      email_verified: false, // Explicitly set to false
    });

    // Generate OTP for email verification
    const emailService = require('../services/emailService');
    const otp = emailService.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP
    await user.update({
      email_verification_otp: otp,
      email_verification_otp_expires: otpExpires,
    });

    // Send OTP email
    const emailResult = await emailService.sendOTPEmail(email, otp, name);

    // Log OTP request
    await AuditService.logAuth(user.id, 'otp_request', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.headers['x-request-id']
    }, {
      success: emailResult.success,
      email,
      purpose: 'email_verification',
      otpExpires: otpExpires
    });

    if (emailResult.success) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification OTP.',
        data: {
          user: user.toJSON(),
          email_verification_required: true,
          email_sent: true,
        },
      });
    } else {
      // User created but email failed - still return success but warn about email
      res.status(201).json({
        success: true,
        message: 'User registered successfully, but failed to send verification email. Please try logging in to resend.',
        data: {
          user: user.toJSON(),
          email_verification_required: true,
          email_sent: false,
          email_error: emailResult.error,
        },
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    console.log('🔍 Attempting login for email:', email);
    console.log('🔍 Password provided:', password ? 'YES' : 'NO');

    // Find user by email with minimal includes for faster login
    const user = await User.findOne({ 
      where: { email: email },
      include: [
        { model: College, as: 'college', attributes: ['id', 'name'] },
        { model: Incubator, as: 'incubator', attributes: ['id', 'name'] }
      ],
      attributes: ['id', 'name', 'email', 'password_hash', 'role', 'college_id', 'incubator_id', 'is_active', 'email_verified', 'profile_image_url']
    });

    if (!user) {
      console.log('❌ User not found:', email);
      
      // Log failed login attempt
      await AuditService.logAuth(null, 'login', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestId: req.headers['x-request-id']
      }, {
        success: false,
        email,
        reason: 'User not found'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    console.log('✅ User found:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      email_verified: user.email_verified,
      has_password: !!user.password_hash
    });

    // Check if user is active
    if (!user.is_active) {
      console.log('❌ User account is inactive:', email);
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.',
      });
    }

    // Verify password
    console.log('🔍 Verifying password...');
    console.log('   Provided password:', password);
    console.log('   Stored hash:', user.password_hash ? user.password_hash.substring(0, 30) + '...' : 'NULL');
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('   Password verification result:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if email is verified
    if (!user.email_verified) {
      console.log('❌ Email not verified for user:', email);
      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please check your email for verification OTP.',
        data: {
          email_verification_required: true,
          email: user.email,
        },
      });
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user.id);

    // Update last login (tolerate SQLITE_BUSY by retrying briefly)
    // Make this fire-and-forget to avoid blocking login
    user.update({ last_login: new Date() }).catch(() => {});

    // Prepare user data for response
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      college_id: user.college_id,
      incubator_id: user.incubator_id,
      college: user.college ? {
        id: user.college.id,
        name: user.college.name
      } : null,
      incubator: user.incubator ? {
        id: user.incubator.id,
        name: user.incubator.name
      } : null,
      profile_image_url: user.profile_image_url,
      is_active: user.is_active,
      email_verified: user.email_verified
    };

    console.log('✅ Login successful for user:', email);
    
    // Log successful login
    await AuditService.logAuth(user.id, 'login', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.headers['x-request-id']
    }, {
      success: true,
      email,
      role: user.role,
      collegeId: user.college_id,
      incubatorId: user.incubator_id
    });
    
    // Send success response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});


// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    // Check if user exists and is active
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user',
      });
    }

    // Generate new tokens
    const newToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }
    
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a more complex system, you might want to blacklist the token
    // For now, we'll just return a success response
    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    // Rate limiting: Check if user has requested too many resets
    const recentReset = await User.findOne({
      where: {
        email: email,
        reset_password_expires: { [require('sequelize').Op.gt]: new Date(Date.now() - 300000) } // 5 minutes
      }
    });

    if (recentReset) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 5 minutes before requesting another password reset',
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.reset_password_token = resetToken;
    user.reset_password_expires = resetTokenExpiry;
    await user.save();

    // Send password reset email
    try {
      const emailService = require('../services/emailService');
      const emailServiceInstance = new emailService();
      
      await emailServiceInstance.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.name || user.email
      );

      console.log(`Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { token, password } = req.body;

    const user = await User.findOne({
      where: {
        reset_password_token: token,
        reset_password_expires: { [require('sequelize').Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Check if new password is different from current password
    const isSamePassword = await user.comparePassword(password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from your current password',
      });
    }

    // Update password
    user.password_hash = password; // Will be hashed by model hook
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save();

    // Send confirmation email
    try {
      const emailService = require('../services/emailService');
      const emailServiceInstance = new emailService();
      
      await emailServiceInstance.sendPasswordChangeConfirmation(
        user.email,
        user.name || user.email
      );

      console.log(`Password change confirmation sent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send password change confirmation:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email with token
// @access  Public
router.post('/verify-email', [
  body('token').notEmpty().withMessage('Verification token is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { token } = req.body;

    const user = await User.findOne({
      where: { email_verification_token: token },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token',
      });
    }

    // Mark email as verified
    user.email_verified = true;
    user.email_verification_token = null;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name'],
        },
        {
          model: Incubator,
          as: 'incubator',
          attributes: ['id', 'name'],
        },
      ],
      attributes: ['id', 'name', 'email', 'role', 'college_id', 'incubator_id', 'profile_image_url', 'is_active', 'email_verified', 'department', 'phone', 'bio', 'skills', 'social_links']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prepare user data for response
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      college_id: user.college_id,
      incubator_id: user.incubator_id,
      college: user.college ? {
        id: user.college.id,
        name: user.college.name
      } : null,
      incubator: user.incubator ? {
        id: user.incubator.id,
        name: user.incubator.name
      } : null,
      profile_image_url: user.profile_image_url,
      is_active: user.is_active,
      email_verified: user.email_verified,
      department: user.department,
      phone: user.phone,
      bio: user.bio,
      skills: user.skills,
      social_links: user.social_links
    };

    res.json({
      success: true,
      data: {
        user: userData,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change password
// @access  Private
router.post('/change-password', [
  authenticateToken,
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { current_password, new_password } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(current_password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Check if new password is different from current password
    const isSamePassword = await user.comparePassword(new_password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from your current password',
      });
    }

    // Update password
    user.password_hash = new_password; // Will be hashed by model hook
    await user.save();

    // Send confirmation email
    try {
      const emailService = require('../services/emailService');
      const emailServiceInstance = new emailService();
      
      await emailServiceInstance.sendPasswordChangeConfirmation(
        user.email,
        user.name || user.email
      );

      console.log(`Password change confirmation sent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send password change confirmation:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
    });
  }
});

module.exports = router;
