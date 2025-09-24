const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, param, query, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Document, User, College } = require('../models');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, Excel, images, and text files are allowed.'));
    }
  }
});

// ==================== DOCUMENT ACCESS CONTROL ====================

// Helper function to check document access
const checkDocumentAccess = (document, userRole, userCollegeId, userId) => {
  switch (document.access_level) {
    case 'public':
      // Public: Show to everyone (students, college admins, incubator managers, super admins, and non-users on homepage)
      return true;
    
    case 'student_restricted':
      // Restricted: Show to students and college admins only
      return ['student', 'college_admin'].includes(userRole);
    
    case 'private':
      // Private: Show only to the uploader (own documents)
      if (userRole === 'incubator_manager' || userRole === 'admin') {
        return document.uploaded_by === userId;
      }
      return false;
    
    default:
      return false;
  }
};

// ==================== PUBLIC DOCUMENTS (Homepage/Resources) ====================

// @route   GET /api/documents/public
// @desc    Get public documents for homepage/resources
// @access  Public
router.get('/public', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('type').optional().isIn(['circular', 'template', 'poster', 'guideline', 'form', 'other']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 10, type } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      access_level: 'public',
      is_active: true
    };

    if (type) {
      whereClause.document_type = type;
    }

    const documents = await Document.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        },
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name', 'district', 'state']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        documents: documents.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(documents.count / limit),
          total_documents: documents.count,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching public documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public documents'
    });
  }
});

// ==================== STUDENT RESTRICTED DOCUMENTS ====================

// @route   GET /api/documents/student-restricted
// @desc    Get student restricted documents (college admin and students only)
// @access  Private (student, college_admin)
router.get('/student-restricted', [
  authenticateToken,
  authorizeRoles('student', 'college_admin'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('type').optional().isIn(['circular', 'template', 'poster', 'guideline', 'form', 'other']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 10, type } = req.query;
    const { role, college_id } = req.user;
    const offset = (page - 1) * limit;

    const whereClause = {
      access_level: 'student_restricted',
      is_active: true
    };

    if (type) {
      whereClause.document_type = type;
    }

    // College admins can see documents from their college
    if (role === 'college_admin') {
      whereClause.college_id = college_id;
    }

    const documents = await Document.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        },
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name', 'district', 'state']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        documents: documents.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(documents.count / limit),
          total_documents: documents.count,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching student restricted documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student restricted documents'
    });
  }
});

// ==================== PRIVATE DOCUMENTS (Incubator Only) ====================

// @route   GET /api/documents/private
// @desc    Get private documents (incubator managers only)
// @access  Private (incubator_manager, admin)
router.get('/private', [
  authenticateToken,
  authorizeRoles('incubator_manager', 'admin'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('type').optional().isIn(['circular', 'template', 'poster', 'guideline', 'form', 'other']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 10, type } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      access_level: 'private',
      is_active: true
    };

    if (type) {
      whereClause.document_type = type;
    }

    const documents = await Document.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        },
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name', 'district', 'state']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        documents: documents.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(documents.count / limit),
          total_documents: documents.count,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching private documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch private documents'
    });
  }
});

// ==================== ALL DOCUMENTS (Based on User Role) ====================

// @route   GET /api/documents
// @desc    Get all documents based on user role and access level
// @access  Private
router.get('/', [
  authenticateToken,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('type').optional().isIn(['circular', 'template', 'poster', 'guideline', 'form', 'other']),
  query('access_level').optional().isIn(['public', 'student_restricted', 'private']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 10, type, access_level } = req.query;
    const { role, college_id } = req.user;
    const offset = (page - 1) * limit;

    // Build access level filter based on user role
    let whereClause = {
      is_active: true
    };
    
    // Apply access level filtering based on new access control rules
    if (access_level) {
      whereClause.access_level = access_level;
    } else {
      // Default access based on user role
      if (role === 'student' || role === 'college_admin') {
        // Students and college admins can see public and restricted documents
        whereClause[require('sequelize').Op.or] = [
          { access_level: 'public' },
          { access_level: 'student_restricted' }
        ];
      } else if (role === 'incubator_manager' || role === 'admin') {
        // Incubator managers and admins can see all documents
        whereClause[require('sequelize').Op.or] = [
          { access_level: 'public' },
          { access_level: 'student_restricted' },
          { access_level: 'private' }
        ];
      } else {
        // Default to public only
        whereClause.access_level = 'public';
      }
    }

    if (type) {
      whereClause.document_type = type;
    }

    // College admins can only see documents from their college (except public)
    if (role === 'college_admin' && access_level !== 'public') {
      whereClause.college_id = college_id;
    }

    // For private documents, only show user's own documents
    if (access_level === 'private' || (role === 'incubator_manager' || role === 'admin')) {
      // Add filtering for private documents to only show user's own
      const privateFilter = {
        [require('sequelize').Op.or]: [
          { access_level: { [require('sequelize').Op.ne]: 'private' } },
          { 
            access_level: 'private',
            uploaded_by: req.user.id 
          }
        ]
      };
      
      if (whereClause[require('sequelize').Op.or]) {
        // If there's already an OR condition, we need to combine them
        whereClause[require('sequelize').Op.and] = [
          { [require('sequelize').Op.or]: whereClause[require('sequelize').Op.or] },
          privateFilter
        ];
        delete whereClause[require('sequelize').Op.or];
      } else {
        Object.assign(whereClause, privateFilter);
      }
    }

    const documents = await Document.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        },
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name', 'district', 'state']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        documents: documents.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(documents.count / limit),
          total_documents: documents.count,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents'
    });
  }
});

// ==================== UPLOAD DOCUMENT ====================

// @route   POST /api/documents
// @desc    Upload a new document
// @access  Private (college_admin, incubator_manager, admin)
router.post('/', [
  authenticateToken,
  authorizeRoles('college_admin', 'incubator_manager', 'admin', 'super_admin'),
  upload.single('document'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isString(),
  body('document_type').isIn(['circular', 'template', 'poster', 'guideline', 'form', 'other']).withMessage('Invalid document type'),
  body('access_level').isIn(['public', 'student_restricted', 'private']).withMessage('Invalid access level. Must be: public, student_restricted, or private'),
], async (req, res) => {
  try {
    console.log('🔍 Document upload request:', {
      user: req.user ? {
        id: req.user.id,
        role: req.user.role,
        college_id: req.user.college_id,
        email: req.user.email
      } : 'No user',
      body: req.body,
      file: req.file ? {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      } : 'No file'
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Document file is required'
      });
    }

    const { title, description, document_type, access_level } = req.body;
    const { role, college_id, id: userId } = req.user;

    // Validate access level permissions based on user role
    if (access_level === 'private' && !['incubator_manager', 'admin'].includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Only incubator managers and admins can upload private documents'
      });
    }
    
    if (access_level === 'student_restricted' && !['college_admin', 'incubator_manager', 'admin'].includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Only college admins, incubator managers, and admins can upload restricted documents'
      });
    }

    const documentData = {
      title,
      description,
      document_type,
      access_level,
      file_path: req.file.path,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_by: userId,
      college_id: role === 'college_admin' ? college_id : null
    };

    const document = await Document.create(documentData);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        document
      }
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
});

// ==================== DOWNLOAD DOCUMENT ====================

// @route   GET /api/documents/:id/download
// @desc    Download a document
// @access  Private (based on access level)
router.get('/:id/download', [
  authenticateToken,
  param('id').isInt().withMessage('Invalid document ID'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const documentId = req.params.id;
    const { role, college_id } = req.user;

    const document = await Document.findByPk(documentId, {
      include: [
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check access permissions
    if (!checkDocumentAccess(document, role, college_id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this document'
      });
    }

    // Check if file exists
    if (!fs.existsSync(document.file_path)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', document.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${document.title}${path.extname(document.file_path)}"`);
    res.setHeader('Content-Length', document.file_size);

    // Stream the file
    const fileStream = fs.createReadStream(document.file_path);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document'
    });
  }
});

// ==================== DELETE DOCUMENT ====================

// @route   DELETE /api/documents/:id
// @desc    Delete a document
// @access  Private (college_admin, incubator_manager, admin)
router.delete('/:id', [
  authenticateToken,
  authorizeRoles('college_admin', 'incubator_manager', 'admin'),
  param('id').isInt().withMessage('Invalid document ID'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const documentId = req.params.id;
    const { role, college_id, id: userId } = req.user;

    const document = await Document.findByPk(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check permissions
    if (role === 'college_admin' && document.college_id !== college_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to delete this document'
      });
    }

    if (role === 'incubator_manager' && document.access_level !== 'private') {
      return res.status(403).json({
        success: false,
        message: 'Incubator managers can only delete private documents'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    // Delete document from database
    await document.destroy();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
});

module.exports = router;