const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { User, College, Incubator, Idea, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get comprehensive system analytics (Super Admin only)
router.get('/system', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Simple parallel execution for better performance
    const [
      totalUsers,
      totalColleges,
      totalIncubators,
      totalIdeas,
      activeUsers,
      newUsers,
      newIdeas,
      students,
      collegeAdmins,
      incubatorManagers,
      admins,
      submittedIdeas,
      endorsedIdeas,
      incubatedIdeas,
      rejectedIdeas
    ] = await Promise.all([
      // Basic counts
      User.count(),
      College.count(),
      Incubator.count(),
      Idea.count(),
      User.count({ where: { is_active: true } }),
      
      // New registrations
      User.count({
        where: {
          created_at: { [Op.gte]: startDate }
        }
      }),
      
      // New ideas
      Idea.count({
        where: {
          created_at: { [Op.gte]: startDate }
        }
      }),
      
      // User breakdown
      User.count({ where: { role: 'student' } }),
      User.count({ where: { role: 'college_admin' } }),
      User.count({ where: { role: 'incubator_manager' } }),
      User.count({ where: { role: 'admin' } }),
      
      // Idea breakdown
      Idea.count({ where: { status: 'submitted' } }),
      Idea.count({ where: { status: 'endorsed' } }),
      Idea.count({ where: { status: 'incubated' } }),
      Idea.count({ where: { status: 'rejected' } })
    ]);

    // Get recent users and ideas
    const [recentUsers, recentIdeas] = await Promise.all([
      User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: 5
      }),
      Idea.findAll({
        attributes: ['id', 'title', 'status', 'created_at'],
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['name']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 5
      })
    ]);

    // Get top colleges and incubators (simplified)
    const [topColleges, topIncubators] = await Promise.all([
      College.findAll({
        attributes: ['id', 'name', 'city'],
        limit: 5,
        order: [['created_at', 'DESC']]
      }),
      Incubator.findAll({
        attributes: ['id', 'name', 'city'],
        limit: 5,
        order: [['created_at', 'DESC']]
      })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total_users: totalUsers,
          total_colleges: totalColleges,
          total_incubators: totalIncubators,
          total_ideas: totalIdeas,
          active_users: activeUsers,
          new_users: newUsers,
          new_ideas: newIdeas
        },
        user_breakdown: {
          students,
          college_admins: collegeAdmins,
          incubator_managers: incubatorManagers,
          admins
        },
        idea_breakdown: {
          submitted: submittedIdeas,
          endorsed: endorsedIdeas,
          incubated: incubatedIdeas,
          rejected: rejectedIdeas
        },
        top_performers: {
          colleges: topColleges,
          incubators: topIncubators
        },
        recent_activity: {
          users: recentUsers,
          ideas: recentIdeas
        }
      }
    });
  } catch (error) {
    console.error('Error fetching system analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system analytics'
    });
  }
});

// Get user analytics with filtering
router.get('/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { role, status, college_id, incubator_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (role) whereClause.role = role;
    if (status !== undefined) whereClause.is_active = status === 'active';
    if (college_id) whereClause.college_id = college_id;
    if (incubator_id) whereClause.incubator_id = incubator_id;

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: College,
          as: 'college',
          attributes: ['name', 'city']
        },
        {
          model: Incubator,
          as: 'incubator',
          attributes: ['name', 'city']
        }
      ],
      attributes: [
        'id', 'name', 'email', 'role', 'is_active', 'created_at', 'last_login'
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get idea counts for each user separately
    const usersWithIdeas = await Promise.all(
      users.map(async (user) => {
        const ideasCount = await Idea.count({ where: { student_id: user.id } });
        return {
          ...user.toJSON(),
          ideas_count: ideasCount
        };
      })
    );

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        users: usersWithIdeas,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics'
    });
  }
});

// Get idea analytics with filtering
router.get('/ideas', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status, category, college_id, incubator_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;
    if (college_id) whereClause.college_id = college_id;
    if (incubator_id) whereClause.incubator_id = incubator_id;

    const { count, rows: ideas } = await Idea.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['name', 'email']
        },
        {
          model: College,
          as: 'college',
          attributes: ['name', 'city']
        },
        {
          model: Incubator,
          as: 'incubator',
          attributes: ['name', 'city']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        ideas,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching idea analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch idea analytics'
    });
  }
});

// Get system health metrics
router.get('/health', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [
      totalNotifications,
      unreadNotifications,
      systemErrors,
      lastBackup,
      databaseSize
    ] = await Promise.all([
      Notification.count(),
      Notification.count({ where: { is_read: false } }),
      // Mock system errors count for now
      Promise.resolve(0),
      // Mock last backup time for now
      Promise.resolve(new Date().toISOString()),
      // Mock database size for now
      Promise.resolve('2.5 MB')
    ]);

    res.json({
      success: true,
      data: {
        notifications: {
          total: totalNotifications,
          unread: unreadNotifications
        },
        system: {
          errors: systemErrors,
          last_backup: lastBackup,
          database_size: databaseSize
        }
      }
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system health'
    });
  }
});

module.exports = router;
