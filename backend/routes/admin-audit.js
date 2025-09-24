const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { User, College, Incubator, Idea, Notification, Document, Event, Mentor, PreIncubatee, AuditLog } = require('../models');
const { query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const AuditService = require('../services/auditService');

// ==================== COMPREHENSIVE AUDIT TRAIL ====================

// @route   GET /api/admin/audit/logs
// @desc    Get comprehensive audit trail logs (Super Admin only)
// @access  Private (Super Admin)
router.get('/logs', [
  authenticateToken,
  authorizeRoles('admin', 'super_admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('action').optional().isString().withMessage('Action must be a string'),
  query('action_category').optional().isString().withMessage('Action category must be a string'),
  query('user_id').optional().isInt().withMessage('User ID must be an integer'),
  query('status').optional().isString().withMessage('Status must be a string'),
  query('severity').optional().isString().withMessage('Severity must be a string'),
  query('resource_type').optional().isString().withMessage('Resource type must be a string'),
  query('college_id').optional().isInt().withMessage('College ID must be an integer'),
  query('incubator_id').optional().isInt().withMessage('Incubator ID must be an integer'),
  query('search').optional().isString().withMessage('Search term must be a string'),
  query('start_date').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('end_date').optional().isISO8601().withMessage('End date must be a valid date'),
  query('is_sensitive').optional().isBoolean().withMessage('Is sensitive must be a boolean'),
  query('sort_by').optional().isString().withMessage('Sort by must be a string'),
  query('sort_order').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const filters = {
      startDate: req.query.start_date,
      endDate: req.query.end_date,
      userId: req.query.user_id,
      action: req.query.action,
      actionCategory: req.query.action_category,
      status: req.query.status,
      severity: req.query.severity,
      resourceType: req.query.resource_type,
      collegeId: req.query.college_id,
      incubatorId: req.query.incubator_id,
      searchTerm: req.query.search,
      isSensitive: req.query.is_sensitive
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      sortBy: req.query.sort_by || 'created_at',
      sortOrder: req.query.sort_order || 'DESC'
    };

    const result = await AuditService.getLogs(filters, pagination);

    // Log this audit access
    await AuditService.log({
      userId: req.user.id,
      action: 'AUDIT_ACCESS',
      actionCategory: 'ADMINISTRATION',
      description: 'Accessed audit trail logs',
      request: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestId: req.headers['x-request-id']
      },
      metadata: { filters, pagination }
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message
    });
  }
});

// @route   GET /api/admin/audit/stats
// @desc    Get comprehensive audit statistics (Super Admin only)
// @access  Private (Super Admin)
router.get('/stats', [
  authenticateToken,
  authorizeRoles('admin', 'super_admin'),
  query('start_date').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('end_date').optional().isISO8601().withMessage('End date must be a valid date'),
  query('college_id').optional().isInt().withMessage('College ID must be an integer'),
  query('incubator_id').optional().isInt().withMessage('Incubator ID must be an integer'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const filters = {
      startDate: req.query.start_date,
      endDate: req.query.end_date,
      collegeId: req.query.college_id,
      incubatorId: req.query.incubator_id
    };

    const stats = await AuditService.getStatistics(filters);

    // Calculate additional statistics
    const totalLogs = await AuditLog.count({
      where: filters.startDate && filters.endDate ? {
        created_at: {
          [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
        }
      } : {}
    });

    const uniqueUsers = await AuditLog.count({
      distinct: true,
      col: 'user_id',
      where: {
        user_id: { [Op.ne]: null },
        ...(filters.startDate && filters.endDate ? {
          created_at: {
            [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
          }
        } : {})
      }
    });

    const criticalActions = await AuditLog.count({
      where: {
        severity: 'CRITICAL',
        ...(filters.startDate && filters.endDate ? {
          created_at: {
            [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
          }
        } : {})
      }
    });

    const failedActions = await AuditLog.count({
      where: {
        status: 'FAILED',
        ...(filters.startDate && filters.endDate ? {
          created_at: {
            [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
          }
        } : {})
      }
    });

    // Log this stats access
    await AuditService.log({
      userId: req.user.id,
      action: 'AUDIT_STATS_ACCESS',
      actionCategory: 'ADMINISTRATION',
      description: 'Accessed audit statistics',
      request: {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      metadata: { filters }
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalLogs,
          uniqueUsers,
          criticalActions,
          failedActions
        },
        categoryStats: stats,
        timeRange: {
          startDate: filters.startDate,
          endDate: filters.endDate
        }
      }
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit statistics',
      error: error.message
    });
  }
});

// @route   GET /api/admin/audit/user/:userId/activity
// @desc    Get user activity summary (Super Admin only)
// @access  Private (Super Admin)
router.get('/user/:userId/activity', [
  authenticateToken,
  authorizeRoles('admin', 'super_admin'),
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
], async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days) || 30;

    const activities = await AuditService.getUserActivitySummary(userId, days);
    const recentLogs = await AuditLog.getUserActivity(userId, 20);

    // Log this user activity access
    await AuditService.log({
      userId: req.user.id,
      action: 'USER_ACTIVITY_ACCESS',
      actionCategory: 'ADMINISTRATION',
      description: `Accessed activity for user ${userId}`,
      request: {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      metadata: { targetUserId: userId, days }
    });

    res.json({
      success: true,
      data: {
        userId: parseInt(userId),
        period: `${days} days`,
        activities,
        recentLogs
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity',
      error: error.message
    });
  }
});

// @route   GET /api/admin/audit/export
// @desc    Export audit logs to CSV (Super Admin only)
// @access  Private (Super Admin)
router.get('/export', [
  authenticateToken,
  authorizeRoles('admin', 'super_admin'),
  query('start_date').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('end_date').optional().isISO8601().withMessage('End date must be a valid date'),
  query('format').optional().isIn(['csv', 'json']).withMessage('Format must be csv or json'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const filters = {
      startDate: req.query.start_date,
      endDate: req.query.end_date
    };

    const format = req.query.format || 'csv';
    const result = await AuditService.getLogs(filters, { page: 1, limit: 10000 });

    // Log this export
    await AuditService.log({
      userId: req.user.id,
      action: 'AUDIT_EXPORT',
      actionCategory: 'ADMINISTRATION',
      description: `Exported audit logs in ${format.toUpperCase()} format`,
      request: {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      metadata: { format, recordCount: result.logs.length }
    });

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Timestamp,User,Role,Action,Category,Resource,Description,Status,Severity,IP Address,User Agent\n';
      const csvRows = result.logs.map(log => [
        log.getFormattedTimestamp(),
        log.user_name || 'System',
        log.user_role || 'N/A',
        log.action,
        log.action_category,
        log.resource_name || 'N/A',
        `"${log.description.replace(/"/g, '""')}"`,
        log.status,
        log.severity,
        log.ip_address || 'N/A',
        `"${(log.user_agent || '').replace(/"/g, '""')}"`
      ].join(',')).join('\n');

      const csvContent = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        data: result.logs,
        exportInfo: {
          format: 'json',
          recordCount: result.logs.length,
          exportedAt: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export audit logs',
      error: error.message
    });
  }
});

// @route   GET /api/admin/audit/recent
// @desc    Get recent audit activity (Super Admin only)
// @access  Private (Super Admin)
router.get('/recent', [
  authenticateToken,
  authorizeRoles('admin', 'super_admin'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const recentLogs = await AuditLog.getRecentActivity(limit);

    res.json({
      success: true,
      data: recentLogs
    });
  } catch (error) {
    console.error('Get recent audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent audit logs',
      error: error.message
    });
  }
});

// @route   GET /api/admin/audit/actions
// @desc    Get available actions and categories (Super Admin only)
// @access  Private (Super Admin)
router.get('/actions', [
  authenticateToken,
  authorizeRoles('admin', 'super_admin'),
], async (req, res) => {
  try {
    const actions = await AuditLog.findAll({
      attributes: ['action'],
      group: ['action'],
      order: [['action', 'ASC']],
      raw: true
    });

    const categories = await AuditLog.findAll({
      attributes: ['action_category'],
      group: ['action_category'],
      order: [['action_category', 'ASC']],
      raw: true
    });

    const statuses = await AuditLog.findAll({
      attributes: ['status'],
      group: ['status'],
      order: [['status', 'ASC']],
      raw: true
    });

    const severities = await AuditLog.findAll({
      attributes: ['severity'],
      group: ['severity'],
      order: [['severity', 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: {
        actions: actions.map(a => a.action),
        categories: categories.map(c => c.action_category),
        statuses: statuses.map(s => s.status),
        severities: severities.map(s => s.severity)
      }
    });
  } catch (error) {
    console.error('Get audit actions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit actions',
      error: error.message
    });
  }
});

// @route   POST /api/admin/audit/log
// @desc    Manually log an audit event (Super Admin only)
// @access  Private (Super Admin)
router.post('/log', [
  authenticateToken,
  authorizeRoles('admin', 'super_admin'),
], async (req, res) => {
  try {
    const {
      userId,
      action,
      actionCategory,
      description,
      resource,
      metadata,
      status,
      severity,
      isSensitive
    } = req.body;

    const auditLog = await AuditService.log({
      userId,
      action,
      actionCategory,
      description,
      resource,
      request: {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      metadata,
      status,
      severity,
      isSensitive
    });

    res.json({
      success: true,
      data: auditLog
    });
  } catch (error) {
    console.error('Manual audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create audit log',
      error: error.message
    });
  }
});

module.exports = router;