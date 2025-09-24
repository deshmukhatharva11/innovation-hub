const express = require('express');
const { query } = require('express-validator');
const { Document, User, College } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/student-documents
// @desc    Get all public documents and college-specific documents for students
// @access  Private (student)
router.get('/', [
  authenticateToken,
  authorizeRoles('student'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('document_type').optional().isString().withMessage('Document type must be a string'),
  query('search').optional().isString().withMessage('Search must be a string'),
], async (req, res) => {
  try {
    const { page = 1, limit = 10, document_type, search } = req.query;
    const offset = (page - 1) * limit;
    const collegeId = req.user.college_id;

    // Build where clause for documents accessible to students
    const whereClause = {
      is_active: true,
      [Op.or]: [
        { is_public: true }, // Public documents
        { college_id: collegeId } // College-specific documents
      ]
    };
    
    if (document_type) {
      whereClause.document_type = document_type;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: documents } = await Document.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'name'] },
        { model: College, as: 'college', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get student documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get documents'
    });
  }
});

// @route   GET /api/student-documents/:id
// @desc    Get a specific document by ID
// @access  Private (student)
router.get('/:id', [
  authenticateToken,
  authorizeRoles('student'),
], async (req, res) => {
  try {
    const { id } = req.params;
    const collegeId = req.user.college_id;

    const document = await Document.findOne({
      where: {
        id: id,
        is_active: true,
        [Op.or]: [
          { is_public: true },
          { college_id: collegeId }
        ]
      },
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'name'] },
        { model: College, as: 'college', attributes: ['id', 'name'] }
      ]
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or access denied'
      });
    }

    res.json({
      success: true,
      data: { document }
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document'
    });
  }
});

module.exports = router;
