
const express = require('express');
const { query, validationResult } = require('express-validator');
const { User, College, Incubator, Idea, Comment, Like, IdeaFile } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const router = express.Router();

// Clear cache route for testing
router.get('/clear-cache', (req, res) => {
  clearAnalyticsCache();
  res.json({ success: true, message: 'Cache cleared' });
});

// Old route removed - using /dashboard route instead

// Simple cache for analytics (in production, use Redis)
const analyticsCache = new Map();
const CACHE_DURATION = 0; // Disable cache for testing

// Clear cache function
function clearAnalyticsCache() {
  analyticsCache.clear();
  console.log('🧹 Analytics cache cleared');
}

// Helper function to get cached data or compute it
const getCachedOrCompute = async (key, computeFn) => {
  // Always compute fresh data for testing
  console.log('🔄 Computing fresh analytics data (cache disabled)');
  const data = await computeFn();
  return data;
};

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics based on user role
// @access  Private
router.get('/dashboard', [
  authenticateToken,
  query('period').optional().isIn(['7d', '30d', '90d', '1y', 'all']).withMessage('Invalid period'),
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

    const { period = '30d' } = req.query;
    const { role, college_id, incubator_id, id: userId } = req.user;

    // Create cache key based on user and period
    const cacheKey = `${role}_${college_id || incubator_id || userId}_${period}`;

    // Use cached data or compute with timeout
    const analytics = await getCachedOrCompute(cacheKey, async () => {
      const timeoutMs = 5000; // Increased timeout to 5 seconds
      
      try {
        console.log('🔍 Computing analytics for role:', role, 'college_id:', college_id, 'incubator_id:', incubator_id);
        const result = await computeAnalytics(role, college_id, incubator_id, userId, period);
        console.log('✅ Analytics computed successfully, result keys:', Object.keys(result));
        return result;
      } catch (error) {
        console.error('💥 Analytics compute error:', error);
        return getFallbackAnalytics(role);
      }
    });

    console.log('📤 Sending response with analytics keys:', Object.keys(analytics));
    res.json({
      success: true,
      data: {
        analytics,
        period,
        user_role: role,
      },
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard analytics',
    });
  }
});

// Main analytics computation function
async function computeAnalytics(role, collegeId, incubatorId, userId, period) {
  console.log('🔍 computeAnalytics called with:', { role, collegeId, incubatorId, userId, period });
  
  if (role === 'admin') {
    console.log('📊 Calling getAdminAnalytics');
    return await getAdminAnalytics(period);
  } else if (role === 'college_admin') {
    console.log('📊 Calling getCollegeAdminAnalytics with collegeId:', collegeId);
    const result = await getCollegeAdminAnalytics(collegeId, period);
    console.log('📊 College analytics result keys:', Object.keys(result));
    return result;
  } else if (role === 'incubator_manager') {
    console.log('📊 Calling getIncubatorManagerAnalytics with incubatorId:', incubatorId);
    return await getIncubatorManagerAnalytics(incubatorId, period);
  } else {
    console.log('📊 Calling getStudentAnalytics with userId:', userId);
    return await getStudentAnalytics(userId, period);
  }
}

// Fallback analytics for timeout/error cases
function getFallbackAnalytics(role) {
  const base = {
    users: { total: 0, students: 0 },
    ideas: { total: 0, by_status: [], by_category: [] },
    recent_ideas: [],
    top_ideas: []
  };

  if (role === 'admin') {
    return {
      ...base,
      institutions: { colleges: 0, incubators: 0 },
      growth_trends: []
    };
  }

  return base;
}

// Helper function for admin analytics
async function getAdminAnalytics(period) {
  const startDate = getDateRange(period);

  // Get comprehensive data for admin
  const results = await Promise.allSettled([
    // Basic counts
    Idea.count(),
    User.count({ where: { role: 'student' } }),
    College.count({ where: { is_active: true } }),
    
    // Ideas by status
    Idea.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true
    }),
    
    // Ideas by category
    Idea.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['category'],
      raw: true
    }),
    
    // Monthly trends
    Idea.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: { created_at: { [Op.gte]: startDate } },
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'ASC']],
      raw: true
    }),
    
    // Top performing colleges
    College.findAll({
      attributes: [
        'id', 'name', 'district', 'state',
        [sequelize.fn('COUNT', sequelize.col('ideas.id')), 'total_ideas'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN ideas.status = "endorsed" THEN 1 END')), 'endorsed_ideas']
      ],
      include: [{
        model: Idea,
        as: 'ideas',
        attributes: [],
        required: false
      }],
      group: ['College.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('ideas.id')), 'DESC']],
      limit: 10
    }),
    
    // Regional statistics
    College.findAll({
      attributes: [
        'district',
        [sequelize.fn('COUNT', sequelize.col('id')), 'college_count'],
        [sequelize.fn('COUNT', sequelize.col('ideas.id')), 'total_ideas']
      ],
      include: [{
        model: Idea,
        as: 'ideas',
        attributes: [],
        required: false
      }],
      group: ['district'],
      order: [[sequelize.fn('COUNT', sequelize.col('ideas.id')), 'DESC']]
    })
  ]);

  // Extract results with fallbacks
  const totalIdeas = results[0].status === 'fulfilled' ? results[0].value : 0;
  const totalStudents = results[1].status === 'fulfilled' ? results[1].value : 0;
  const totalColleges = results[2].status === 'fulfilled' ? results[2].value : 0;
  const ideasByStatus = results[3].status === 'fulfilled' ? results[3].value : [];
  const ideasByCategory = results[4].status === 'fulfilled' ? results[4].value : [];
  const monthlyTrends = results[5].status === 'fulfilled' ? results[5].value : [];
  const topColleges = results[6].status === 'fulfilled' ? results[6].value : [];
  const regionalStats = results[7].status === 'fulfilled' ? results[7].value : [];

  // Calculate success rate
  const endorsedCount = ideasByStatus.find(s => s.status === 'endorsed')?.count || 0;
  const incubatedCount = ideasByStatus.find(s => s.status === 'incubated')?.count || 0;
  const successRate = totalIdeas > 0 ? Math.round(((endorsedCount + incubatedCount) / totalIdeas) * 100) : 0;

  // Calculate average rating (mock data for now)
  const avgRating = 4.2;

  // Calculate total funding (mock data for now)
  const totalFunding = totalIdeas * 50000; // Average 50k per idea

  // Process ideas by status with percentages
  const processedIdeasByStatus = ideasByStatus.map(item => ({
    status: item.status,
    count: parseInt(item.count) || 0,
    percentage: totalIdeas > 0 ? Math.round((parseInt(item.count) / totalIdeas) * 100) : 0
  }));

  // Process ideas by category with percentages
  const processedIdeasByCategory = ideasByCategory.map(item => ({
    category: item.category || 'Uncategorized',
    count: parseInt(item.count) || 0,
    percentage: totalIdeas > 0 ? Math.round((parseInt(item.count) / totalIdeas) * 100) : 0
  }));

  // Process monthly trends
  const processedMonthlyTrends = monthlyTrends.map(item => ({
    month: item.month,
    submissions: parseInt(item.count) || 0,
    endorsements: Math.round((parseInt(item.count) || 0) * 0.7), // 70% endorsement rate
    acceptances: Math.round((parseInt(item.count) || 0) * 0.3)  // 30% acceptance rate
  }));

  // Process top colleges
  const processedTopColleges = topColleges.map(college => ({
    name: college.name,
    region: college.district || 'Unknown',
    ideas: parseInt(college.dataValues.total_ideas) || 0,
    endorsements: parseInt(college.dataValues.endorsed_ideas) || 0
  }));

  // Process regional statistics
  const processedRegionalStats = regionalStats.map(region => ({
    region: region.district || 'Unknown',
    colleges: parseInt(region.dataValues.college_count) || 0,
    ideas: parseInt(region.dataValues.total_ideas) || 0,
    avgRating: 4.0 + Math.random() * 1.0 // Random rating between 4.0-5.0
  }));

  return {
    ideas: {
      total: totalIdeas,
      by_status: processedIdeasByStatus,
      by_category: processedIdeasByCategory,
      success_rate: successRate,
      average_rating: avgRating,
      total_funding: totalFunding
    },
    users: {
      students: totalStudents
    },
    colleges: {
      total: totalColleges,
      top_performers: processedTopColleges
    },
    trends: {
      monthly: processedMonthlyTrends
    },
    regional: {
      stats: processedRegionalStats
    }
  };
}

// Helper function for college admin analytics
async function getCollegeAdminAnalytics(collegeId, period) {
  if (!collegeId) {
    return { 
      users: { total: 0, students: 0 }, 
      ideas: { total: 0, by_status: [], by_category: [] } 
    };
  }
  
  try {
    // Use Promise.allSettled for better error handling
    const results = await Promise.allSettled([
      User.count({ where: { college_id: collegeId, is_active: true } }),
      Idea.count({ where: { college_id: collegeId } }),
      Idea.findAll({
        attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        where: { college_id: collegeId },
        group: ['status'],
        raw: true
      }),
      Idea.findAll({
        attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        where: { college_id: collegeId },
        group: ['category'],
        raw: true
      }),
      Idea.findAll({
        where: { college_id: collegeId },
        include: [{ model: User, as: 'student', attributes: ['id', 'name'] }],
        order: [['created_at', 'DESC']],
        limit: 5,
        attributes: ['id', 'title', 'status', 'created_at']
      }),
      // Get top performers (students with most ideas and endorsed ideas)
      User.findAll({
        where: { 
          college_id: collegeId, 
          role: 'student',
          is_active: true 
        },
        include: [
          {
            model: Idea,
            as: 'ideas',
            attributes: ['id', 'status'],
            required: false
          }
        ],
        attributes: ['id', 'name', 'department', 'year_of_study'],
        limit: 5
      })
    ]);

    // Extract results with fallbacks
    const totalUsers = results[0].status === 'fulfilled' ? results[0].value : 0;
    const totalIdeas = results[1].status === 'fulfilled' ? results[1].value : 0;
    const ideasByStatus = results[2].status === 'fulfilled' ? results[2].value : [];
    const ideasByCategory = results[3].status === 'fulfilled' ? results[3].value : [];
    const recentIdeas = results[4].status === 'fulfilled' ? results[4].value : [];
    const topPerformers = results[5].status === 'fulfilled' ? results[5].value : [];
    

    
    // Process top performers to include idea counts
    const processedTopPerformers = topPerformers.map(student => {
      const totalIdeas = student.ideas?.length || 0;
      const endorsedIdeas = student.ideas?.filter(idea => idea.status === 'endorsed').length || 0;
      const incubatedIdeas = student.ideas?.filter(idea => idea.status === 'incubated').length || 0;
      

      
      return {
        id: student.id,
        name: student.name,
        department: student.department,
        year_of_study: student.year_of_study,
        total_ideas: totalIdeas,
        endorsed_ideas: endorsedIdeas,
        incubated_ideas: incubatedIdeas
      };
    }).sort((a, b) => b.total_ideas - a.total_ideas);
    

    

    
    // Calculate additional metrics
    const totalViews = recentIdeas.reduce((sum, idea) => sum + (idea.views_count || 0), 0);
    const totalLikes = recentIdeas.reduce((sum, idea) => sum + (idea.likes_count || 0), 0);
    
    const result = {
      users: { 
        total: totalUsers,
        students: totalUsers,
        active: totalUsers
      },
      ideas: { 
        total: totalIdeas,
        total_views: totalViews,
        total_likes: totalLikes,
        by_status: ideasByStatus.map(item => ({
          status: item.status,
          count: parseInt(item.count) || 0
        })),
        by_category: ideasByCategory.map(item => ({
          category: item.category,
          count: parseInt(item.count) || 0
        }))
      },
      growth: {
        ideas_monthly: Math.round(totalIdeas * 0.1) // Simple growth calculation
      },
      recent_ideas: recentIdeas.map(idea => ({
        id: idea.id,
        title: idea.title,
        status: idea.status,
        student_name: idea.student?.name || 'Unknown',
        created_at: idea.created_at
      })),
      top_performers: processedTopPerformers
    };
    

    
    return result;
    
  } catch (error) {
    console.error('💥 Analytics error:', error);
    console.error('💥 Error details:', error.message, error.stack);
    return { users: { total: 0 }, ideas: { total: 0 } };
  }
}


// Helper function for incubator manager analytics
async function getIncubatorManagerAnalytics(incubatorId, period) {
  try {
    const startDate = getDateRange(period);

    // Get comprehensive data for incubator manager
    const results = await Promise.allSettled([
      // Basic counts
      Idea.count(),
      User.count({ where: { role: 'student' } }),
      College.count({ where: { is_active: true } }),
      
      // Ideas by status
      Idea.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: ['status'],
        raw: true
      }),
      
      // Ideas by category
      Idea.findAll({
        attributes: [
          'category',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: ['category'],
        raw: true
      }),
      
      // Monthly trends
      Idea.findAll({
        attributes: [
          [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: { created_at: { [Op.gte]: startDate } },
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'ASC']],
        raw: true
      }),
      
      // Top performing colleges
      College.findAll({
        attributes: [
          'id', 'name', 'district', 'state',
          [sequelize.fn('COUNT', sequelize.col('ideas.id')), 'total_ideas'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN ideas.status = "endorsed" THEN 1 END')), 'endorsed_ideas']
        ],
        include: [{
          model: Idea,
          as: 'ideas',
          attributes: [],
          required: false
        }],
        group: ['College.id'],
        order: [[sequelize.fn('COUNT', sequelize.col('ideas.id')), 'DESC']],
        limit: 10
      }),
      
      // Regional statistics
      College.findAll({
        attributes: [
          'district',
          [sequelize.fn('COUNT', sequelize.col('id')), 'college_count'],
          [sequelize.fn('COUNT', sequelize.col('ideas.id')), 'total_ideas']
        ],
        include: [{
          model: Idea,
          as: 'ideas',
          attributes: [],
          required: false
        }],
        group: ['district'],
        order: [[sequelize.fn('COUNT', sequelize.col('ideas.id')), 'DESC']]
      }),
      
      // Recent ideas with details
      Idea.findAll({
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'name', 'department'],
          },
          {
            model: College,
            as: 'college',
            attributes: ['id', 'name', 'district'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit: 10
      })
    ]);

    // Extract results with fallbacks
    const totalIdeas = results[0].status === 'fulfilled' ? results[0].value : 0;
    const totalStudents = results[1].status === 'fulfilled' ? results[1].value : 0;
    const totalColleges = results[2].status === 'fulfilled' ? results[2].value : 0;
    const ideasByStatus = results[3].status === 'fulfilled' ? results[3].value : [];
    const ideasByCategory = results[4].status === 'fulfilled' ? results[4].value : [];
    const monthlyTrends = results[5].status === 'fulfilled' ? results[5].value : [];
    const topColleges = results[6].status === 'fulfilled' ? results[6].value : [];
    const regionalStats = results[7].status === 'fulfilled' ? results[7].value : [];
    const recentIdeas = results[8].status === 'fulfilled' ? results[8].value : [];

    // Calculate success rate
    const endorsedCount = ideasByStatus.find(s => s.status === 'endorsed')?.count || 0;
    const incubatedCount = ideasByStatus.find(s => s.status === 'incubated')?.count || 0;
    const successRate = totalIdeas > 0 ? Math.round(((endorsedCount + incubatedCount) / totalIdeas) * 100) : 0;

    // Calculate average rating (mock data for now)
    const avgRating = 4.2;

    // Calculate total funding (mock data for now)
    const totalFunding = totalIdeas * 50000; // Average 50k per idea

    // Process ideas by status with percentages
    const processedIdeasByStatus = ideasByStatus.map(item => ({
      status: item.status,
      count: parseInt(item.count) || 0,
      percentage: totalIdeas > 0 ? Math.round((parseInt(item.count) / totalIdeas) * 100) : 0
    }));

    // Process ideas by category with percentages
    const processedIdeasByCategory = ideasByCategory.map(item => ({
      category: item.category || 'Uncategorized',
      count: parseInt(item.count) || 0,
      percentage: totalIdeas > 0 ? Math.round((parseInt(item.count) / totalIdeas) * 100) : 0
    }));

    // Process monthly trends
    const processedMonthlyTrends = monthlyTrends.map(item => ({
      month: item.month,
      submissions: parseInt(item.count) || 0,
      endorsements: Math.round((parseInt(item.count) || 0) * 0.7), // 70% endorsement rate
      acceptances: Math.round((parseInt(item.count) || 0) * 0.3)  // 30% acceptance rate
    }));

    // Process top colleges
    const processedTopColleges = topColleges.map(college => ({
      name: college.name,
      region: college.district || 'Unknown',
      ideas: parseInt(college.dataValues.total_ideas) || 0,
      endorsements: parseInt(college.dataValues.endorsed_ideas) || 0
    }));

    // Process regional statistics
    const processedRegionalStats = regionalStats.map(region => ({
      region: region.district || 'Unknown',
      colleges: parseInt(region.dataValues.college_count) || 0,
      ideas: parseInt(region.dataValues.total_ideas) || 0,
      avgRating: 4.0 + Math.random() * 1.0 // Random rating between 4.0-5.0
    }));

    return {
      ideas: {
        total: totalIdeas,
        by_status: processedIdeasByStatus,
        by_category: processedIdeasByCategory,
        success_rate: successRate,
        average_rating: avgRating,
        total_funding: totalFunding
      },
      users: {
        students: totalStudents
      },
      colleges: {
        total: totalColleges,
        top_performers: processedTopColleges
      },
      trends: {
        monthly: processedMonthlyTrends
      },
      regional: {
        stats: processedRegionalStats
      },
      recent_ideas: recentIdeas.map(idea => ({
        id: idea.id,
        title: idea.title,
        status: idea.status,
        student_name: idea.student?.name || 'Unknown',
        college_name: idea.college?.name || 'Unknown',
        created_at: idea.created_at
      }))
    };
  } catch (error) {
    console.error('Error in getIncubatorManagerAnalytics:', error);
    // Return fallback data
    return {
      ideas: {
        total: 0,
        by_status: [],
        by_category: [],
        success_rate: 0,
        average_rating: 0,
        total_funding: 0
      },
      users: {
        students: 0
      },
      colleges: {
        total: 0,
        top_performers: []
      },
      trends: {
        monthly: []
      },
      regional: {
        stats: []
      },
      recent_ideas: []
    };
  }
}

// Helper function for student analytics
async function getStudentAnalytics(userId, period) {
  const startDate = getDateRange(period);

  // Student's ideas
  const totalIdeas = await Idea.count({ where: { student_id: userId } });
  const ideasByStatus = await Idea.findAll({
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    where: { student_id: userId },
    group: ['status'],
  });

  // Student's recent ideas
  const recentIdeas = await Idea.findAll({
    where: { 
      student_id: userId,
      created_at: { [Op.gte]: startDate }
    },
    order: [['created_at', 'DESC']],
    limit: 5,
  });

  // Student's engagement (comments, likes)
  const totalComments = await Comment.count({ where: { user_id: userId } });
  const totalLikes = await Like.count({ where: { user_id: userId } });

  // Student's most popular idea
  const mostPopularIdea = await Idea.findOne({
    where: { student_id: userId },
    order: [['likes_count', 'DESC']],
    include: [
      {
        model: College,
        as: 'college',
        attributes: ['id', 'name'],
      },
    ],
  });

  return {
    ideas: {
      total: totalIdeas,
      by_status: ideasByStatus,
      recent: recentIdeas,
      most_popular: mostPopularIdea,
    },
    engagement: {
      comments: totalComments,
      likes_given: totalLikes,
    },
  };
}

// Helper function to get date range
function getDateRange(period) {
  const now = new Date();
  switch (period) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(0); // All time
  }
}

// Helper function to get monthly growth
async function getMonthlyGrowth(startDate) {
  const monthExpr = sequelize.literal("strftime('%Y-%m', created_at)");
  const monthlyData = await Idea.findAll({
    attributes: [
      [monthExpr, 'month'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    where: { created_at: { [Op.gte]: startDate } },
    group: [monthExpr],
    order: [[monthExpr, 'ASC']],
  });

  return monthlyData;
}

// @route   GET /api/analytics/ideas
// @desc    Get idea analytics
// @access  Private
router.get('/ideas', [
  authenticateToken,
  query('period').optional().isIn(['7d', '30d', '90d', '1y', 'all']).withMessage('Invalid period'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('status').optional().isString().withMessage('Status must be a string'),
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

    const { period = '30d', category, status } = req.query;
    const { role, college_id, incubator_id } = req.user;

    const startDate = getDateRange(period);
    const whereClause = { created_at: { [Op.gte]: startDate } };

    // Apply role-based filters
    if (role === 'college_admin' && college_id) {
      whereClause.college_id = college_id;
    } else if (role === 'incubator_manager' && incubator_id) {
      whereClause.incubator_id = incubator_id;
    } else if (role === 'student') {
      whereClause.student_id = req.user.id;
    }

    // Apply additional filters
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;

    // Ideas by status
    const ideasByStatus = await Idea.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: whereClause,
      group: ['status'],
    });

    // Ideas by category
    const ideasByCategory = await Idea.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: whereClause,
      group: ['category'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
    });

    // Ideas by month
    const ideasByMonth = await Idea.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: whereClause,
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'ASC']],
    });

    // Top ideas by likes
    const topIdeasByLikes = await Idea.findAll({
      where: whereClause,
      order: [['likes_count', 'DESC']],
      limit: 10,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
    });

    // Top ideas by views
    const topIdeasByViews = await Idea.findAll({
      where: whereClause,
      order: [['views_count', 'DESC']],
      limit: 10,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
    });

    res.json({
      success: true,
      data: {
        by_status: ideasByStatus,
        by_category: ideasByCategory,
        by_month: ideasByMonth,
        top_by_likes: topIdeasByLikes,
        top_by_views: topIdeasByViews,
        period,
      },
    });
  } catch (error) {
    console.error('Get idea analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get idea analytics',
    });
  }
});

// @route   GET /api/analytics/users
// @desc    Get user analytics
// @access  Private (Admin, College Admin)
router.get('/users', [
  authenticateToken,
  authorizeRoles('admin', 'college_admin'),
  query('period').optional().isIn(['7d', '30d', '90d', '1y', 'all']).withMessage('Invalid period'),
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

    const { period = '30d' } = req.query;
    const { role, college_id } = req.user;

    const startDate = getDateRange(period);
    const whereClause = { created_at: { [Op.gte]: startDate } };

    // Apply college filter for college admins
    if (role === 'college_admin' && college_id) {
      whereClause.college_id = college_id;
    }

    // Users by role
    const usersByRole = await User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: whereClause,
      group: ['role'],
    });

    // Users by month
    const usersByMonth = await User.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: whereClause,
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'ASC']],
    });

    // Active vs inactive users
    const activeUsers = await User.count({ where: { ...whereClause, is_active: true } });
    const inactiveUsers = await User.count({ where: { ...whereClause, is_active: false } });

    // Recent registrations
    const recentUsers = await User.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: 10,
      include: [
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name'],
        },
      ],
    });

    res.json({
      success: true,
      data: {
        by_role: usersByRole,
        by_month: usersByMonth,
        active: activeUsers,
        inactive: inactiveUsers,
        recent: recentUsers,
        period,
      },
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user analytics',
    });
  }
});

// @route   GET /api/analytics/engagement
// @desc    Get engagement analytics
// @access  Private
router.get('/engagement', [
  authenticateToken,
  query('period').optional().isIn(['7d', '30d', '90d', '1y', 'all']).withMessage('Invalid period'),
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

    const { period = '30d' } = req.query;
    const { role, college_id, incubator_id } = req.user;

    const startDate = getDateRange(period);
    const whereClause = { created_at: { [Op.gte]: startDate } };

    // Apply role-based filters
    if (role === 'college_admin' && college_id) {
      whereClause.college_id = college_id;
    } else if (role === 'incubator_manager' && incubator_id) {
      whereClause.incubator_id = incubator_id;
    } else if (role === 'student') {
      whereClause.student_id = req.user.id;
    }

    // Comments analytics
    const totalComments = await Comment.count({ where: whereClause });
    const commentsByMonth = await Comment.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: whereClause,
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'ASC']],
    });

    // Likes analytics
    const totalLikes = await Like.count({ where: whereClause });
    const likesByType = await Like.findAll({
      attributes: [
        'like_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: whereClause,
      group: ['like_type'],
    });

    // File uploads analytics
    const totalFiles = await IdeaFile.count({ where: whereClause });
    const filesByType = await IdeaFile.findAll({
      attributes: [
        'file_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: whereClause,
      group: ['file_type'],
    });

    res.json({
      success: true,
      data: {
        comments: {
          total: totalComments,
          by_month: commentsByMonth,
        },
        likes: {
          total: totalLikes,
          by_type: likesByType,
        },
        files: {
          total: totalFiles,
          by_type: filesByType,
        },
        period,
      },
    });
  } catch (error) {
    console.error('Get engagement analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get engagement analytics',
    });
  }
});

// @route   GET /api/analytics/export
// @desc    Export analytics data
// @access  Private (Admin, College Admin)
router.get('/export', [
  authenticateToken,
  authorizeRoles('admin', 'college_admin'),
  query('type').isIn(['ideas', 'users', 'engagement']).withMessage('Invalid export type'),
  query('format').optional().isIn(['json', 'csv']).withMessage('Invalid format'),
  query('period').optional().isIn(['7d', '30d', '90d', '1y', 'all']).withMessage('Invalid period'),
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

    const { type, format = 'json', period = '30d' } = req.query;
    const { role, college_id } = req.user;

    const startDate = getDateRange(period);
    const whereClause = { created_at: { [sequelize.Op.gte]: startDate } };

    // Apply college filter for college admins
    if (role === 'college_admin' && college_id) {
      whereClause.college_id = college_id;
    }

    let data;

    switch (type) {
      case 'ideas':
        data = await Idea.findAll({
          where: whereClause,
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['id', 'name', 'email'],
            },
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
          order: [['created_at', 'DESC']],
        });
        break;

      case 'users':
        data = await User.findAll({
          where: whereClause,
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
          order: [['created_at', 'DESC']],
        });
        break;

      case 'engagement':
        const comments = await Comment.findAll({
          where: whereClause,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name'],
            },
            {
              model: Idea,
              as: 'idea',
              attributes: ['id', 'title'],
            },
          ],
          order: [['created_at', 'DESC']],
        });

        const likes = await Like.findAll({
          where: whereClause,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name'],
            },
            {
              model: Idea,
              as: 'idea',
              attributes: ['id', 'title'],
            },
          ],
          order: [['created_at', 'DESC']],
        });

        data = { comments, likes };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type',
        });
    }

    if (format === 'csv') {
      // TODO: Implement CSV export
      res.json({
        success: true,
        message: 'CSV export not yet implemented',
        data,
      });
    } else {
      res.json({
        success: true,
        data: {
          type,
          period,
          export_date: new Date().toISOString(),
          data,
        },
      });
    }
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics data',
    });
  }
});

// @route   GET /api/analytics/departments
// @desc    Get department-wise analytics
// @access  Private
router.get('/departments', [
  authenticateToken,
], async (req, res) => {
  try {
    const { role, college_id } = req.user;
    
    console.log('🔍 Department analytics:', {
      role,
      college_id
    });
    
    let whereClause = {};
    
    // Apply college filter for college admins
    if (role === 'college_admin' && college_id) {
      whereClause.college_id = college_id;
    }

    // Get department-wise statistics - simplified version
    const departmentStats = await User.findAll({
      where: {
        ...whereClause,
        role: 'student'
      },
      attributes: [
        'department',
        [sequelize.fn('COUNT', sequelize.col('id')), 'students_count']
      ],
      group: ['department'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      raw: true
    });

    // Clean up the results
    const departments = departmentStats
      .filter(stat => stat.department && stat.department !== 'Not specified')
      .map(stat => ({
        department: stat.department,
        students_count: parseInt(stat.students_count) || 0,
        ideas_count: 0, // Simplified for now
        endorsed_count: 0 // Simplified for now
      }));

    res.json({
      success: true,
      data: {
        departments
      }
    });
  } catch (error) {
    console.error('Get departments analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get department analytics'
    });
  }
});

module.exports = router;
