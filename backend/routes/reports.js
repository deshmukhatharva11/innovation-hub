const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Report, User, College, Idea, Mentor, PreIncubatee, Event, Document, Comment, Like } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Op } = require('sequelize');
const ReportGenerator = require('../services/reportGenerator');

const router = express.Router();

// @route   GET /api/reports
// @desc    Get all reports
// @access  Private (college_admin, incubator_manager, admin)
router.get('/', [
  authenticateToken,
  authorizeRoles('college_admin', 'incubator_manager', 'admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
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

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};

    // Filter by college for college admin
    if (req.user.role === 'college_admin' && req.user.college_id) {
      whereClause.college_id = req.user.college_id;
    }

    // Filter by incubator for incubator manager
    if (req.user.role === 'incubator_manager' && req.user.incubator_id) {
      whereClause.incubator_id = req.user.incubator_id;
    }

    const { count, rows: reports } = await Report.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        },
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
});

// @route   POST /api/reports
// @desc    Create a new report
// @access  Private (college_admin, incubator_manager, admin)
router.post('/', [
  authenticateToken,
  authorizeRoles('college_admin', 'incubator_manager', 'admin'),
  body('report_type').notEmpty().withMessage('Report type is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('period_start').optional().isISO8601().withMessage('Invalid start date'),
  body('period_end').optional().isISO8601().withMessage('Invalid end date'),
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

    const { report_type, title, period_start, period_end, description } = req.body;

    // Generate comprehensive report data using ReportGenerator
    const reportGenerator = new ReportGenerator(req.user);
    let reportData = {};
    
    try {
      switch (report_type) {
        case 'comprehensive':
          reportData = await reportGenerator.generateComprehensiveReport(period_start, period_end);
          break;
        case 'quarterly':
          reportData = await reportGenerator.generateQuarterlyReport(period_start, period_end);
          break;
        case 'annual':
          reportData = await reportGenerator.generateAnnualReport(period_start, period_end);
          break;
        case 'ideas':
        case 'idea_analytics':
          reportData = await reportGenerator.generateIdeaAnalyticsReport(period_start, period_end);
          break;
        case 'students':
          reportData = await reportGenerator.generateStudentEngagementReport(period_start, period_end);
          break;
        case 'events':
          reportData = await reportGenerator.generateEventPerformanceReport(period_start, period_end);
          break;
        case 'mentors':
        case 'mentor_effectiveness':
          reportData = await reportGenerator.generateMentorEffectivenessReport(period_start, period_end);
          break;
        case 'financial':
          reportData = await reportGenerator.generateFinancialReport(period_start, period_end);
          break;
        case 'college_performance':
          reportData = await reportGenerator.generateCollegePerformanceReport(period_start, period_end);
          break;
        case 'incubation_pipeline':
          reportData = await reportGenerator.generateIncubationPipelineReport(period_start, period_end);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid report type'
          });
      }
    } catch (error) {
      console.error('Error generating report data:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate report data: ' + error.message
      });
    }

    // Create report record
    const report = await Report.create({
      title,
      report_type,
      description: description || `Generated ${report_type} report`,
      status: 'completed',
      data: reportData,
      period_start: period_start ? new Date(period_start) : null,
      period_end: period_end ? new Date(period_end) : null,
      created_by: req.user.id,
      college_id: req.user.college_id,
      incubator_id: req.user.incubator_id
    });

    res.json({
      success: true,
      message: 'Report generated successfully',
      data: report
    });

  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create report'
    });
  }
});

// @route   GET /api/reports/:id/download
// @desc    Download report as PDF
// @access  Private (college_admin, incubator_manager, admin)
router.get('/:id/download', [
  authenticateToken,
  authorizeRoles('college_admin', 'incubator_manager', 'admin'),
], async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(id, {
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        },
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'college_admin' && report.college_id !== req.user.college_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'incubator_manager' && report.incubator_id !== req.user.incubator_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Generate CSV content
    const csvContent = await generateCSVContent(report);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${report.title}.csv"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download report'
    });
  }
});

// Helper functions to generate different types of reports
async function generateQuarterlyReport(user, periodStart, periodEnd) {
  const whereClause = {
    created_at: {
      [require('sequelize').Op.between]: [
        periodStart ? new Date(periodStart) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        periodEnd ? new Date(periodEnd) : new Date()
      ]
    }
  };

  // Always filter by college for college admins
  if (user.role === 'college_admin' && user.college_id) {
    whereClause.college_id = user.college_id;
  }

  const ideas = await Idea.findAll({
    where: whereClause,
    include: [
      { model: User, as: 'student', attributes: ['id', 'name', 'department'] },
      { model: College, as: 'college', attributes: ['id', 'name'] }
    ]
  });

  const stats = {
    total_ideas: ideas.length,
    submitted_ideas: ideas.filter(i => i.status === 'submitted').length,
    endorsed_ideas: ideas.filter(i => i.status === 'endorsed').length,
    incubated_ideas: ideas.filter(i => i.status === 'incubated').length,
    rejected_ideas: ideas.filter(i => i.status === 'rejected').length,
    ideas_by_category: {},
    ideas_by_department: {},
    top_performing_students: []
  };

  // Calculate category distribution
  ideas.forEach(idea => {
    stats.ideas_by_category[idea.category] = (stats.ideas_by_category[idea.category] || 0) + 1;
    stats.ideas_by_department[idea.student?.department] = (stats.ideas_by_department[idea.student?.department] || 0) + 1;
  });

  return {
    period: {
      start: periodStart,
      end: periodEnd
    },
    statistics: stats,
    summary: {
      totalIdeas: stats.total_ideas,
      evaluatedIdeas: stats.endorsed_ideas,
      forwardedIdeas: stats.incubated_ideas,
      incubatedIdeas: stats.incubated_ideas
    },
    ideas: ideas.map(idea => ({
      id: idea.id,
      title: idea.title,
      status: idea.status,
      student: idea.student?.name,
      department: idea.student?.department,
      created_at: idea.created_at
    }))
  };
}

async function generateAnnualReport(user, periodStart, periodEnd) {
  // Similar to quarterly but with yearly data
  return await generateQuarterlyReport(user, periodStart, periodEnd);
}

async function generateIdeaAnalyticsReport(user, periodStart, periodEnd) {
  const whereClause = {};

  // Always filter by college for college admins
  if (user.role === 'college_admin' && user.college_id) {
    whereClause.college_id = user.college_id;
  }

  if (user.role === 'incubator_manager' && user.incubator_id) {
    whereClause.incubator_id = user.incubator_id;
  }

  const ideas = await Idea.findAll({
    where: whereClause,
    include: [
      { model: User, as: 'student', attributes: ['id', 'name', 'department', 'year_of_study'] },
      { model: College, as: 'college', attributes: ['id', 'name'] }
    ]
  });

  const statusDistribution = {
    draft: ideas.filter(i => i.status === 'draft').length,
    submitted: ideas.filter(i => i.status === 'submitted').length,
    under_review: ideas.filter(i => i.status === 'under_review').length,
    endorsed: ideas.filter(i => i.status === 'endorsed').length,
    incubated: ideas.filter(i => i.status === 'incubated').length,
    rejected: ideas.filter(i => i.status === 'rejected').length
  };

  return {
    period: {
      start: periodStart,
      end: periodEnd
    },
    total_ideas: ideas.length,
    status_distribution: statusDistribution,
    summary: {
      totalIdeas: ideas.length,
      evaluatedIdeas: statusDistribution.endorsed,
      forwardedIdeas: statusDistribution.incubated,
      incubatedIdeas: statusDistribution.incubated
    },
    category_analysis: {},
    department_analysis: {},
    year_analysis: {}
  };
}

async function generateCollegePerformanceReport(user, periodStart, periodEnd) {
  try {
    // Get basic college data without complex associations
    const colleges = await College.findAll();

    // Get students and ideas separately to avoid complex nested associations
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'college_id', 'name', 'department']
    });

    const ideas = await Idea.findAll({
      attributes: ['id', 'college_id', 'status', 'title']
    });

    const collegeData = colleges.map(college => {
      const collegeStudents = students.filter(student => student.college_id === college.id);
      const collegeIdeas = ideas.filter(idea => idea.college_id === college.id);
      
      return {
        id: college.id,
        name: college.name,
        total_students: collegeStudents.length,
        total_ideas: collegeIdeas.length,
        endorsed_ideas: collegeIdeas.filter(idea => idea.status === 'endorsed').length,
        incubated_ideas: collegeIdeas.filter(idea => idea.status === 'incubated').length
      };
    });

    const totalIdeas = collegeData.reduce((sum, college) => sum + college.total_ideas, 0);
    const totalEndorsed = collegeData.reduce((sum, college) => sum + college.endorsed_ideas, 0);
    const totalIncubated = collegeData.reduce((sum, college) => sum + college.incubated_ideas, 0);

    return {
      period: {
        start: periodStart,
        end: periodEnd
      },
      colleges: collegeData,
      summary: {
        totalIdeas: totalIdeas,
        evaluatedIdeas: totalEndorsed,
        forwardedIdeas: totalIncubated,
        incubatedIdeas: totalIncubated
      }
    };
  } catch (error) {
    console.error('Error in generateCollegePerformanceReport:', error);
    throw error;
  }
}

async function generateMentorEffectivenessReport(user, periodStart, periodEnd) {
  try {
    // Get basic mentor data without complex associations
    const mentors = await Mentor.findAll({
      include: [
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name']
        }
      ]
    });

    // Get pre-incubatees separately to avoid complex nested associations
    const preIncubatees = await PreIncubatee.findAll({
      include: [
        {
          model: Idea,
          as: 'idea',
          required: false
        }
      ]
    });

    const mentorData = mentors.map(mentor => {
      const mentorPreIncubatees = preIncubatees.filter(preInc => preInc.mentor_id === mentor.id);
      
      return {
        id: mentor.id,
        name: mentor.name,
        specialization: mentor.specialization,
        college: mentor.college?.name,
        total_students: mentorPreIncubatees.length,
        students_with_ideas: mentorPreIncubatees.filter(preInc => preInc.idea).length,
        total_ideas: mentorPreIncubatees.filter(preInc => preInc.idea).length,
        endorsed_ideas: mentorPreIncubatees.filter(preInc => preInc.idea?.status === 'endorsed').length,
        incubated_ideas: mentorPreIncubatees.filter(preInc => preInc.idea?.status === 'incubated').length
      };
    });

    const totalIdeas = mentorData.reduce((sum, mentor) => sum + mentor.total_ideas, 0);
    const totalEndorsed = mentorData.reduce((sum, mentor) => sum + mentor.endorsed_ideas, 0);
    const totalIncubated = mentorData.reduce((sum, mentor) => sum + mentor.incubated_ideas, 0);

    return {
      period: {
        start: periodStart,
        end: periodEnd
      },
      mentors: mentorData,
      summary: {
        totalIdeas: totalIdeas,
        evaluatedIdeas: totalEndorsed,
        forwardedIdeas: totalIncubated,
        incubatedIdeas: totalIncubated
      }
    };
  } catch (error) {
    console.error('Error in generateMentorEffectivenessReport:', error);
    throw error;
  }
}

async function generateCSVContent(report) {
  let csvContent = '';
  
  // Add report header information
  csvContent += `Report Information\n`;
  csvContent += `Report ID,${report.id}\n`;
  csvContent += `Title,${report.title}\n`;
  csvContent += `Type,${report.report_type}\n`;
  csvContent += `Status,${report.status}\n`;
  csvContent += `Generated,${new Date(report.created_at).toLocaleString()}\n`;
  csvContent += `\n`;
  
  // Add summary data if available
  if (report.data && report.data.summary) {
    csvContent += `Summary Statistics\n`;
    csvContent += `Metric,Value\n`;
    csvContent += `Total Ideas,${report.data.summary.totalIdeas || 0}\n`;
    csvContent += `Evaluated Ideas,${report.data.summary.evaluatedIdeas || 0}\n`;
    csvContent += `Forwarded Ideas,${report.data.summary.forwardedIdeas || 0}\n`;
    csvContent += `Incubated Ideas,${report.data.summary.incubatedIdeas || 0}\n`;
    csvContent += `\n`;
  }
  
  // Get comprehensive ideas data for detailed CSV
  try {
    const { Idea, User, College } = require('../models');
    
    // Build where clause based on report type and user
    const whereClause = {};
    
    // Get all ideas with comprehensive details
    const ideas = await Idea.findAll({
      where: whereClause,
      include: [
        { 
          model: User, 
          as: 'student', 
          attributes: ['id', 'name', 'email', 'department', 'year_of_study', 'phone', 'created_at'],
          required: false
        },
        { 
          model: College, 
          as: 'college', 
          attributes: ['id', 'name', 'district', 'state', 'city'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Add comprehensive ideas data
    if (ideas && ideas.length > 0) {
      csvContent += `Comprehensive Ideas Data (${ideas.length} ideas)\n`;
      csvContent += `Idea ID,Title,Description,Category,Status,Funding Required,Innovation Level,Market Potential,Technical Feasibility,Student ID,Student Name,Student Email,Student Department,Student Year,Student Phone,College ID,College Name,College District,College State,College City,Submitted At,Updated At,Incubator ID\n`;
      
      ideas.forEach(idea => {
        csvContent += `${idea.id || ''},`;
        csvContent += `"${(idea.title || '').replace(/"/g, '""')}",`;
        csvContent += `"${(idea.description || '').replace(/"/g, '""')}",`;
        csvContent += `${idea.category || ''},`;
        csvContent += `${idea.status || ''},`;
        csvContent += `${idea.funding_required || 0},`;
        csvContent += `${idea.innovation_level || ''},`;
        csvContent += `${idea.market_potential || ''},`;
        csvContent += `${idea.technical_feasibility || ''},`;
        csvContent += `${idea.student_id || ''},`;
        csvContent += `"${(idea.student?.name || '').replace(/"/g, '""')}",`;
        csvContent += `${idea.student?.email || ''},`;
        csvContent += `${idea.student?.department || ''},`;
        csvContent += `${idea.student?.year_of_study || ''},`;
        csvContent += `${idea.student?.phone || ''},`;
        csvContent += `${idea.college_id || ''},`;
        csvContent += `"${(idea.college?.name || '').replace(/"/g, '""')}",`;
        csvContent += `${idea.college?.district || ''},`;
        csvContent += `${idea.college?.state || ''},`;
        csvContent += `${idea.college?.city || ''},`;
        csvContent += `${idea.created_at || ''},`;
        csvContent += `${idea.updated_at || ''},`;
        csvContent += `${idea.incubator_id || ''}\n`;
      });
      csvContent += `\n`;
    }
    
    // Add status distribution
    const statusCounts = {};
    ideas.forEach(idea => {
      statusCounts[idea.status] = (statusCounts[idea.status] || 0) + 1;
    });
    
    csvContent += `Ideas Status Distribution\n`;
    csvContent += `Status,Count,Percentage\n`;
    const totalIdeas = ideas.length;
    Object.entries(statusCounts).forEach(([status, count]) => {
      const percentage = totalIdeas > 0 ? ((count / totalIdeas) * 100).toFixed(2) : 0;
      csvContent += `${status},${count},${percentage}%\n`;
    });
    csvContent += `\n`;
    
    // Add category distribution
    const categoryCounts = {};
    ideas.forEach(idea => {
      categoryCounts[idea.category] = (categoryCounts[idea.category] || 0) + 1;
    });
    
    csvContent += `Ideas Category Distribution\n`;
    csvContent += `Category,Count,Percentage\n`;
    Object.entries(categoryCounts).forEach(([category, count]) => {
      const percentage = totalIdeas > 0 ? ((count / totalIdeas) * 100).toFixed(2) : 0;
      csvContent += `${category || 'Uncategorized'},${count},${percentage}%\n`;
    });
    csvContent += `\n`;
    
    // Add department distribution
    const departmentCounts = {};
    ideas.forEach(idea => {
      const dept = idea.student?.department || 'Unknown';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });
    
    csvContent += `Ideas Department Distribution\n`;
    csvContent += `Department,Count,Percentage\n`;
    Object.entries(departmentCounts).forEach(([department, count]) => {
      const percentage = totalIdeas > 0 ? ((count / totalIdeas) * 100).toFixed(2) : 0;
      csvContent += `${department},${count},${percentage}%\n`;
    });
    csvContent += `\n`;
    
    // Add college distribution
    const collegeCounts = {};
    ideas.forEach(idea => {
      const college = idea.college?.name || 'Unknown';
      collegeCounts[college] = (collegeCounts[college] || 0) + 1;
    });
    
    csvContent += `Ideas College Distribution\n`;
    csvContent += `College,Count,Percentage\n`;
    Object.entries(collegeCounts).forEach(([college, count]) => {
      const percentage = totalIdeas > 0 ? ((count / totalIdeas) * 100).toFixed(2) : 0;
      csvContent += `"${college.replace(/"/g, '""')}",${count},${percentage}%\n`;
    });
    csvContent += `\n`;
    
  } catch (error) {
    console.error('Error generating comprehensive CSV data:', error);
    csvContent += `Error generating comprehensive data: ${error.message}\n\n`;
  }
  
  // Add other report-specific data if available
  if (report.data) {
    if (report.data.colleges && Array.isArray(report.data.colleges)) {
      csvContent += `College Performance Data\n`;
      csvContent += `College ID,College Name,Total Students,Total Ideas,Endorsed Ideas,Incubated Ideas\n`;
      report.data.colleges.forEach(college => {
        csvContent += `${college.id || ''},${(college.name || '').replace(/,/g, ';')},${college.total_students || 0},${college.total_ideas || 0},${college.endorsed_ideas || 0},${college.incubated_ideas || 0}\n`;
      });
      csvContent += `\n`;
    }
    
    if (report.data.mentors && Array.isArray(report.data.mentors)) {
      csvContent += `Mentor Effectiveness Data\n`;
      csvContent += `Mentor ID,Mentor Name,Specialization,College,Total Students,Students with Ideas,Total Ideas,Endorsed Ideas,Incubated Ideas\n`;
      report.data.mentors.forEach(mentor => {
        csvContent += `${mentor.id || ''},${(mentor.name || '').replace(/,/g, ';')},${(mentor.specialization || '').replace(/,/g, ';')},${(mentor.college || '').replace(/,/g, ';')},${mentor.total_students || 0},${mentor.students_with_ideas || 0},${mentor.total_ideas || 0},${mentor.endorsed_ideas || 0},${mentor.incubated_ideas || 0}\n`;
      });
      csvContent += `\n`;
    }
    
    if (report.data.pre_incubatees && Array.isArray(report.data.pre_incubatees)) {
      csvContent += `Pre-Incubatees Data\n`;
      csvContent += `ID,Student Name,College Name,Idea Title,Current Phase,Progress %,Status,Start Date,Expected Completion\n`;
      report.data.pre_incubatees.forEach(preInc => {
        csvContent += `${preInc.id || ''},${(preInc.student_name || '').replace(/,/g, ';')},${(preInc.college_name || '').replace(/,/g, ';')},${(preInc.idea_title || '').replace(/,/g, ';')},${preInc.current_phase || ''},${preInc.progress_percentage || 0},${preInc.status || ''},${preInc.start_date || ''},${preInc.expected_completion || ''}\n`;
      });
      csvContent += `\n`;
    }
  }
  
  return Buffer.from(csvContent, 'utf8');
}

// Generate Incubation Pipeline Report
async function generateIncubationPipelineReport(user, periodStart, periodEnd) {
  const whereClause = {};
  
  if (user.role === 'college_admin' && user.college_id) {
    whereClause.college_id = user.college_id;
  }
  
  if (user.role === 'incubator_manager' && user.incubator_id) {
    whereClause.incubator_id = user.incubator_id;
  }

  // Get pre-incubatees data
  const preIncubatees = await PreIncubatee.findAll({
    where: whereClause,
    include: [
      { model: Idea, as: 'idea', attributes: ['id', 'title', 'description', 'category'] },
      { model: User, as: 'student', attributes: ['id', 'name', 'department'] },
      { model: College, as: 'college', attributes: ['id', 'name'] }
    ]
  });

  // Get ideas by status
  const ideasByStatus = await Idea.findAll({
    where: whereClause,
    attributes: ['status'],
    group: ['status'],
    raw: true
  });

  const statusCounts = ideasByStatus.reduce((acc, idea) => {
    acc[idea.status] = (acc[idea.status] || 0) + 1;
    return acc;
  }, {});

  // Calculate pipeline metrics
  const pipelineMetrics = {
    total_pre_incubatees: preIncubatees.length,
    active_pre_incubatees: preIncubatees.filter(p => p.status === 'active').length,
    completed_pre_incubatees: preIncubatees.filter(p => p.status === 'completed').length,
    ideas_by_status: statusCounts,
    average_progress: preIncubatees.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / preIncubatees.length || 0,
    phase_distribution: preIncubatees.reduce((acc, p) => {
      acc[p.current_phase] = (acc[p.current_phase] || 0) + 1;
      return acc;
    }, {})
  };

  return {
    period: {
      start: periodStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: periodEnd || new Date()
    },
    pipeline_metrics: pipelineMetrics,
    pre_incubatees: preIncubatees.map(p => ({
      id: p.id,
      student_name: p.student?.name,
      college_name: p.college?.name,
      idea_title: p.idea?.title,
      current_phase: p.current_phase,
      progress_percentage: p.progress_percentage,
      status: p.status,
      start_date: p.start_date,
      expected_completion: p.expected_completion_date
    })),
    summary: {
      total_ideas: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
      total_pre_incubatees: pipelineMetrics.total_pre_incubatees,
      active_pre_incubatees: pipelineMetrics.active_pre_incubatees,
      average_progress: Math.round(pipelineMetrics.average_progress)
    }
  };
}


module.exports = router;
