const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Mentor, MentorAssignment, MentorChat, MentorChatMessage, MentorSession, User, Idea, College, Incubator, Notification } = require('../models');
const router = express.Router();

// Mentor registration (independent or by college admin)
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      experience_years,
      bio,
      linkedin_url,
      website_url,
      college_id,
      incubator_id,
      district,
      mentor_type,
      assigned_by
    } = req.body;

    // Check if mentor already exists
    const existingMentor = await Mentor.findOne({ where: { email } });
    if (existingMentor) {
      return res.status(400).json({
        success: false,
        message: 'Mentor with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create mentor
    const mentor = await Mentor.create({
      name,
      email,
      password_hash,
      phone,
      specialization,
      experience_years,
      bio,
      linkedin_url,
      website_url,
      college_id,
      incubator_id,
      district,
      mentor_type: mentor_type || 'independent',
      assigned_by,
      is_verified: mentor_type === 'independent' ? false : true
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: mentor.id, 
        email: mentor.email, 
        role: 'mentor',
        mentor_type: mentor.mentor_type
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Mentor registered successfully',
      data: {
        mentor: {
          id: mentor.id,
          name: mentor.name,
          email: mentor.email,
          specialization: mentor.specialization,
          mentor_type: mentor.mentor_type,
          is_verified: mentor.is_verified
        },
        token
      }
    });
  } catch (error) {
    console.error('Mentor registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register mentor',
      error: error.message
    });
  }
});

// Mentor login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find mentor
    const mentor = await Mentor.findOne({ 
      where: { email, is_active: true },
      include: [
        { model: College, as: 'college' },
        { model: Incubator, as: 'incubator' }
      ]
    });

    if (!mentor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, mentor.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: mentor.id, 
        email: mentor.email, 
        role: 'mentor',
        mentor_type: mentor.mentor_type
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        mentor: {
          id: mentor.id,
          name: mentor.name,
          email: mentor.email,
          specialization: mentor.specialization,
          mentor_type: mentor.mentor_type,
          college: mentor.college,
          incubator: mentor.incubator,
          district: mentor.district,
          is_verified: mentor.is_verified
        },
        token
      }
    });
  } catch (error) {
    console.error('Mentor login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get all mentors (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      college_id, 
      incubator_id, 
      district, 
      mentor_type, 
      specialization, 
      availability,
      page = 1, 
      limit = 10 
    } = req.query;

    const whereClause = { is_active: true };
    
    if (college_id) whereClause.college_id = college_id;
    if (incubator_id) whereClause.incubator_id = incubator_id;
    if (district) whereClause.district = district;
    if (mentor_type) whereClause.mentor_type = mentor_type;
    if (specialization) whereClause.specialization = { [Op.like]: `%${specialization}%` };
    if (availability) whereClause.availability = availability;

    const offset = (page - 1) * limit;

    const { count, rows: mentors } = await Mentor.findAndCountAll({
      where: whereClause,
      include: [
        { model: College, as: 'college' },
        { model: Incubator, as: 'incubator' }
      ],
      order: [['rating', 'DESC'], ['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        mentors,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_mentors: count,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentors',
      error: error.message
    });
  }
});

// Get mentors by district
router.get('/district/:district', authenticateToken, async (req, res) => {
  try {
    const { district } = req.params;
    const { availability = 'available' } = req.query;

    const whereClause = {
      district,
      is_active: true,
      is_verified: true
    };

    if (availability !== 'all') {
      whereClause.availability = availability;
    }

    const mentors = await Mentor.findAll({
      where: whereClause,
      include: [
        { model: College, as: 'college' },
        { model: Incubator, as: 'incubator' }
      ],
      order: [['rating', 'DESC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { mentors }
    });
  } catch (error) {
    console.error('Get mentors by district error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentors by district',
      error: error.message
    });
  }
});

// Get mentor profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const mentorId = req.user.id;

    const mentor = await Mentor.findByPk(mentorId, {
      include: [
        { model: College, as: 'college' },
        { model: Incubator, as: 'incubator' }
      ]
    });

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    res.json({
      success: true,
      data: { mentor }
    });
  } catch (error) {
    console.error('Get mentor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentor profile',
      error: error.message
    });
  }
});

// Get mentor dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const mentorId = req.user.id;

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get mentor assignments
    const assignments = await MentorAssignment.findAll({
      where: { mentor_id: mentorId },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Idea,
          as: 'idea',
          attributes: ['id', 'title', 'status']
        }
      ]
    });

    // Get mentor chats
    const chats = await MentorChat.findAll({
      where: { mentor_id: mentorId },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        },
        {
          model: MentorChatMessage,
          as: 'messages',
          where: {
            created_at: { [Op.gte]: startDate }
          },
          required: false
        }
      ]
    });

    // Calculate stats
    const totalStudents = new Set(assignments.map(a => a.student_id)).size;
    const activeAssignments = assignments.filter(a => a.status === 'active').length;
    const completedSessions = chats.reduce((sum, chat) => sum + (chat.messages?.length || 0), 0);
    
    // Calculate average rating (mock data for now)
    const averageRating = 4.2;
    const responseTime = 1.5; // hours
    const successRate = 85; // percentage

    // Recent activity
    const recentActivity = [
      {
        type: 'session',
        description: 'Completed mentoring session with John Doe',
        timestamp: '2 hours ago'
      },
      {
        type: 'message',
        description: 'Received message from Jane Smith',
        timestamp: '4 hours ago'
      },
      {
        type: 'assignment',
        description: 'New assignment: AI-based Learning Platform',
        timestamp: '1 day ago'
      }
    ];

    // Upcoming sessions (mock data)
    const upcomingSessions = [
      {
        studentName: 'Alice Johnson',
        topic: 'Business Model Canvas',
        time: '10:00 AM',
        date: 'Today'
      },
      {
        studentName: 'Bob Wilson',
        topic: 'Market Research',
        time: '2:00 PM',
        date: 'Tomorrow'
      }
    ];

    // Student progress
    const studentProgress = assignments.map(assignment => ({
      name: assignment.student.name,
      college: 'SGBAU',
      ideaTitle: assignment.idea.title,
      progress: Math.floor(Math.random() * 100),
      lastSession: '2 days ago',
      status: assignment.status
    }));

    // Performance metrics (mock data)
    const performanceMetrics = {
      monthlySessions: [
        { month: 'Jan', sessions: 12 },
        { month: 'Feb', sessions: 15 },
        { month: 'Mar', sessions: 18 },
        { month: 'Apr', sessions: 14 }
      ],
      studentSatisfaction: [
        { month: 'Jan', rating: 4.1 },
        { month: 'Feb', rating: 4.3 },
        { month: 'Mar', rating: 4.2 },
        { month: 'Apr', rating: 4.4 }
      ],
      responseTime: [
        { month: 'Jan', hours: 2.1 },
        { month: 'Feb', hours: 1.8 },
        { month: 'Mar', hours: 1.5 },
        { month: 'Apr', hours: 1.2 }
      ]
    };

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          activeAssignments,
          completedSessions,
          averageRating,
          responseTime,
          successRate
        },
        recentActivity,
        upcomingSessions,
        studentProgress,
        performanceMetrics
      }
    });
  } catch (error) {
    console.error('Get mentor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentor dashboard',
      error: error.message
    });
  }
});

// Update mentor profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const mentorId = req.user.id;
    const updateData = req.body;

    // Remove sensitive fields
    delete updateData.password_hash;
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;

    const mentor = await Mentor.findByPk(mentorId);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    await mentor.update(updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { mentor }
    });
  } catch (error) {
    console.error('Update mentor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Get mentor's assigned ideas
router.get('/my-assignments', authenticateToken, async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { status = 'active' } = req.query;

    const whereClause = {
      mentor_id: mentorId,
      is_active: true
    };

    if (status !== 'all') {
      whereClause.status = status;
    }

    const assignments = await MentorAssignment.findAll({
      where: whereClause,
      include: [
        { 
          model: Idea, 
          as: 'idea',
          include: [
            { model: User, as: 'student' },
            { model: College, as: 'college' }
          ]
        },
        { model: User, as: 'student' },
        { model: User, as: 'assignedBy' }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { assignments }
    });
  } catch (error) {
    console.error('Get mentor assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
});

// Get mentor's chats
router.get('/chats', authenticateToken, async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { status = 'active' } = req.query;

    const whereClause = {
      mentor_id: mentorId,
      is_active: true
    };

    if (status !== 'all') {
      whereClause.status = status;
    }

    const chats = await MentorChat.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'student' },
        { model: Idea, as: 'idea' },
        { 
          model: MentorChatMessage, 
          as: 'messages',
          limit: 1,
          order: [['created_at', 'DESC']]
        }
      ],
      order: [['last_message_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { chats }
    });
  } catch (error) {
    console.error('Get mentor chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: error.message
    });
  }
});

// Update assignment status
router.put('/assignments/:assignmentId/status', authenticateToken, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status, notes, rating } = req.body;
    const mentorId = req.user.id;

    const assignment = await MentorAssignment.findOne({
      where: {
        id: assignmentId,
        mentor_id: mentorId,
        is_active: true
      }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    await assignment.update({ status, mentor_notes: notes, rating });

    // If completing assignment, update end date
    if (status === 'completed') {
      await assignment.update({ end_date: new Date() });
    }

    res.json({
      success: true,
      message: 'Assignment status updated successfully',
      data: { assignment }
    });
  } catch (error) {
    console.error('Update assignment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment status',
      error: error.message
    });
  }
});

// Get mentor dashboard stats
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const mentorId = req.user.id;
    const mentor = req.user;

    console.log('🔍 Mentor dashboard request for mentor ID:', mentorId);

    // Get mentor assignments with student and idea details
    const assignments = await MentorAssignment.findAll({
      where: { mentor_id: mentorId, is_active: true },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'department', 'year_of_study', 'college_id'],
          include: [
            {
              model: College,
              as: 'college',
              attributes: ['id', 'name', 'district']
            }
          ]
        },
        {
          model: Idea,
          as: 'idea',
          attributes: ['id', 'title', 'status', 'category', 'created_at']
        }
      ]
    });

    // Get mentor chats
    const chats = await MentorChat.findAll({
      where: { mentor_id: mentorId, is_active: true },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'department', 'year_of_study', 'college_id'],
          include: [
            {
              model: College,
              as: 'college',
              attributes: ['id', 'name', 'district']
            }
          ]
        },
        {
          model: Idea,
          as: 'idea',
          attributes: ['id', 'title', 'status', 'category']
        }
      ],
      order: [['last_message_at', 'DESC']]
    });

    // Calculate statistics
    const totalStudents = new Set(assignments.map(a => a.student_id)).size;
    const myCollegeStudents = assignments.filter(a => 
      a.student?.college_id === mentor.college_id
    ).length;
    const otherCollegeStudents = assignments.filter(a => 
      a.student?.college_id !== mentor.college_id
    ).length;
    const activeChats = chats.filter(c => c.status === 'active').length;

    // Group students by college
    const studentsByCollege = {};
    assignments.forEach(assignment => {
      const student = assignment.student;
      if (student) {
        const collegeId = student.college_id;
        if (!studentsByCollege[collegeId]) {
          studentsByCollege[collegeId] = {
            college: student.college,
            students: []
          };
        }
        
        // Check if student already exists in this college
        const existingStudent = studentsByCollege[collegeId].students.find(s => s.id === student.id);
        if (!existingStudent) {
          studentsByCollege[collegeId].students.push({
            ...student.toJSON(),
            ideas_count: assignments.filter(a => a.student_id === student.id).length,
            endorsed_ideas: assignments.filter(a => 
              a.student_id === student.id && a.idea?.status === 'endorsed'
            ).length
          });
        }
      }
    });

    // Get students from mentor's college
    const myCollegeStudentsList = Object.values(studentsByCollege)
      .filter(college => college.college?.id === mentor.college_id)
      .flatMap(college => college.students);

    // Get students from other colleges
    const otherCollegeStudentsList = Object.values(studentsByCollege)
      .filter(college => college.college?.id !== mentor.college_id)
      .flatMap(college => college.students);

    console.log('✅ Mentor dashboard data:', {
      totalStudents,
      myCollegeStudents: myCollegeStudentsList.length,
      otherCollegeStudents: otherCollegeStudentsList.length,
      activeChats,
      assignmentsCount: assignments.length,
      chatsCount: chats.length
    });

    res.json({
      success: true,
      data: {
        stats: {
          total_students: totalStudents,
          my_college: myCollegeStudentsList.length,
          other_colleges: otherCollegeStudentsList.length,
          active_chats: activeChats
        },
        students: {
          my_college: myCollegeStudentsList,
          other_colleges: otherCollegeStudentsList
        },
        conversations: chats.map(chat => ({
          id: chat.id,
          student: chat.student,
          idea: chat.idea,
          status: chat.status,
          last_message_at: chat.last_message_at,
          last_message: chat.last_message
        }))
      }
    });
  } catch (error) {
    console.error('Get mentor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// Mentor Session Management
// Get mentor sessions
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const { status, period } = req.query;
    const mentorId = req.user.id;

    let whereClause = { mentor_id: mentorId };
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const sessions = await MentorSession.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['scheduled_date', 'ASC'], ['scheduled_time', 'ASC']]
    });

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Get mentor sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
      error: error.message
    });
  }
});

// Create mentor session
router.post('/sessions', authenticateToken, async (req, res) => {
  try {
    const {
      student_id,
      title,
      description,
      scheduled_date,
      scheduled_time,
      duration,
      session_type,
      meeting_link,
      location,
      agenda,
      objectives
    } = req.body;

    const mentorId = req.user.id;

    const session = await MentorSession.create({
      mentor_id: mentorId,
      student_id,
      title,
      description,
      scheduled_date,
      scheduled_time,
      duration,
      session_type,
      meeting_link,
      location,
      agenda,
      objectives,
      status: 'scheduled'
    });

    // Create notification for student
    await Notification.create({
      user_id: student_id,
      title: 'New Mentoring Session Scheduled',
      message: `A mentoring session "${title}" has been scheduled for ${scheduled_date} at ${scheduled_time}`,
      type: 'session_scheduled',
      data: { session_id: session.id }
    });

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: { session }
    });
  } catch (error) {
    console.error('Create mentor session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create session',
      error: error.message
    });
  }
});

// Update mentor session
router.put('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const mentorId = req.user.id;
    const updateData = req.body;

    const session = await MentorSession.findOne({
      where: { id: sessionId, mentor_id: mentorId }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    await session.update(updateData);

    res.json({
      success: true,
      message: 'Session updated successfully',
      data: { session }
    });
  } catch (error) {
    console.error('Update mentor session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update session',
      error: error.message
    });
  }
});

// Delete mentor session
router.delete('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const mentorId = req.user.id;

    const session = await MentorSession.findOne({
      where: { id: sessionId, mentor_id: mentorId }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    await session.destroy();

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Delete mentor session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete session',
      error: error.message
    });
  }
});

module.exports = router;