const { User, College, Idea, Mentor, PreIncubatee, Event, Document, Comment, Like, Incubator } = require('../models');
const { Op } = require('sequelize');

class ReportGenerator {
  constructor(user) {
    this.user = user;
    this.isCollegeAdmin = user.role === 'college_admin';
    this.isIncubatorManager = user.role === 'incubator_manager';
    this.isAdmin = user.role === 'admin';
  }

  async generateQuarterlyReport(periodStart, periodEnd) {
    const startDate = periodStart ? new Date(periodStart) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const endDate = periodEnd ? new Date(periodEnd) : new Date();
    
    // Create base where clause - don't filter by date if created_at is undefined
    const whereClause = {};

    // Only add date filter if we have valid dates and the field exists
    if (startDate && endDate) {
      whereClause.created_at = { [Op.between]: [startDate, endDate] };
    }

    // Only filter by college if user has a valid college_id
    if (this.isCollegeAdmin && this.user.college_id) {
      whereClause.college_id = this.user.college_id;
    }

    const [
      ideas,
      students,
      mentors,
      events,
      documents,
      preIncubatees,
      colleges
    ] = await Promise.all([
      this.getIdeas(whereClause),
      this.getStudents(whereClause),
      this.getMentors(),
      this.getEvents(whereClause),
      this.getDocuments(whereClause),
      this.getPreIncubatees(whereClause),
      this.getColleges()
    ]);

    return {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        duration_days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      },
      summary: await this.generateSummary(ideas, students, mentors, events, documents, preIncubatees),
      ideas: await this.generateIdeaAnalysis(ideas, startDate, endDate),
      students: await this.generateStudentAnalysis(students, ideas),
      events: await this.generateEventAnalysis(events),
      documents: await this.generateDocumentAnalysis(documents),
      preIncubatees: await this.generatePreIncubateeAnalysis(preIncubatees),
      colleges: await this.generateCollegeAnalysis(colleges, ideas),
      insights: await this.generateInsights(ideas, students, events, preIncubatees),
      recommendations: await this.generateRecommendations(ideas, students, events, preIncubatees),
      trends: await this.generateTrends(ideas, startDate, endDate)
    };
  }

  async generateAnnualReport(periodStart, periodEnd) {
    const startDate = periodStart ? new Date(periodStart) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = periodEnd ? new Date(periodEnd) : new Date();
    
    const quarterlyReport = await this.generateQuarterlyReport(periodStart, periodEnd);
    
    // Add annual-specific analysis
    const yearOverYearGrowth = await this.calculateYearOverYearGrowth(startDate, endDate);
    const annualTrends = await this.calculateAnnualTrends(startDate, endDate);
    
    return {
      ...quarterlyReport,
      annual_analysis: {
        year_over_year_growth: yearOverYearGrowth,
        annual_trends: annualTrends,
        key_achievements: await this.identifyKeyAchievements(startDate, endDate),
        challenges: await this.identifyChallenges(startDate, endDate)
      }
    };
  }

  async generateIdeaAnalyticsReport(periodStart, periodEnd) {
    const startDate = periodStart ? new Date(periodStart) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = periodEnd ? new Date(periodEnd) : new Date();
    
    const whereClause = {};

    // Only add date filter if we have valid dates
    if (startDate && endDate) {
      whereClause.created_at = { [Op.between]: [startDate, endDate] };
    }

    if (this.isCollegeAdmin && this.user.college_id) {
      whereClause.college_id = this.user.college_id;
    }

    if (this.isIncubatorManager && this.user.incubator_id) {
      whereClause.incubator_id = this.user.incubator_id;
    }

    const ideas = await this.getIdeas(whereClause);
    
    return {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      idea_analytics: {
        total_ideas: ideas.length,
        status_distribution: this.calculateStatusDistribution(ideas),
        category_distribution: this.calculateCategoryDistribution(ideas),
        department_distribution: this.calculateDepartmentDistribution(ideas),
        year_distribution: this.calculateYearDistribution(ideas),
        quality_metrics: await this.calculateQualityMetrics(ideas),
        engagement_metrics: await this.calculateEngagementMetrics(ideas),
        top_performers: await this.identifyTopPerformers(ideas),
        improvement_areas: await this.identifyImprovementAreas(ideas)
      },
      detailed_analysis: await this.generateDetailedIdeaAnalysis(ideas),
      recommendations: await this.generateIdeaRecommendations(ideas)
    };
  }

  async generateCollegePerformanceReport(periodStart, periodEnd) {
    const startDate = periodStart ? new Date(periodStart) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = periodEnd ? new Date(periodEnd) : new Date();
    
    const whereClause = {
      created_at: { [Op.between]: [startDate, endDate] }
    };

    if (this.isCollegeAdmin && this.user.college_id) {
      whereClause.college_id = this.user.college_id;
    }

    const [ideas, students, events, documents, preIncubatees] = await Promise.all([
      this.getIdeas(whereClause),
      this.getStudents(whereClause),
      this.getEvents(whereClause),
      this.getDocuments(whereClause),
      this.getPreIncubatees(whereClause)
    ]);

    return {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      performance_metrics: {
        idea_submission_rate: await this.calculateIdeaSubmissionRate(students, ideas),
        idea_acceptance_rate: this.calculateIdeaAcceptanceRate(ideas),
        student_engagement_rate: await this.calculateStudentEngagementRate(students, ideas),
        event_participation_rate: await this.calculateEventParticipationRate(students, events),
        document_utilization_rate: await this.calculateDocumentUtilizationRate(students, documents),
        pre_incubation_success_rate: this.calculatePreIncubationSuccessRate(preIncubatees)
      },
      department_performance: await this.analyzeDepartmentPerformance(ideas, students),
      student_performance: await this.analyzeStudentPerformance(students, ideas),
      resource_utilization: await this.analyzeResourceUtilization(events, documents),
      comparative_analysis: await this.generateComparativeAnalysis(ideas, students, events),
      recommendations: await this.generatePerformanceRecommendations(ideas, students, events, preIncubatees)
    };
  }

  async generateMentorEffectivenessReport(periodStart, periodEnd) {
    const startDate = periodStart ? new Date(periodStart) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const endDate = periodEnd ? new Date(periodEnd) : new Date();
    
    const mentors = await this.getMentors();
    const ideas = await this.getIdeas({
      created_at: { [Op.between]: [startDate, endDate] }
    });

    return {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      mentor_effectiveness: {
        total_mentors: mentors.length,
        active_mentors: await this.countActiveMentors(mentors, startDate, endDate),
        mentor_workload: await this.calculateMentorWorkload(mentors, ideas),
        mentor_performance: await this.calculateMentorPerformance(mentors, ideas),
        student_satisfaction: await this.calculateStudentSatisfaction(mentors),
        mentor_impact: await this.calculateMentorImpact(mentors, ideas)
      },
      detailed_mentor_analysis: await this.generateDetailedMentorAnalysis(mentors, ideas),
      recommendations: await this.generateMentorRecommendations(mentors, ideas)
    };
  }

  async generateIncubationPipelineReport(periodStart, periodEnd) {
    const startDate = periodStart ? new Date(periodStart) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = periodEnd ? new Date(periodEnd) : new Date();
    
    const preIncubatees = await this.getPreIncubatees({
      created_at: { [Op.between]: [startDate, endDate] }
    });

    const ideas = await this.getIdeas({
      status: ['endorsed', 'incubated'],
      created_at: { [Op.between]: [startDate, endDate] }
    });

    return {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      pipeline_analysis: {
        total_in_pipeline: preIncubatees.length,
        pipeline_stages: this.analyzePipelineStages(preIncubatees),
        conversion_rates: await this.calculateConversionRates(ideas, preIncubatees),
        time_in_pipeline: await this.calculateTimeInPipeline(preIncubatees),
        success_factors: await this.identifySuccessFactors(preIncubatees),
        bottlenecks: await this.identifyBottlenecks(preIncubatees)
      },
      detailed_pipeline_analysis: await this.generateDetailedPipelineAnalysis(preIncubatees, ideas),
      recommendations: await this.generatePipelineRecommendations(preIncubatees, ideas)
    };
  }

  // Helper methods
  async getIdeas(whereClause) {
    return await Idea.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'department', 'year_of_study', 'email'] },
        { model: College, as: 'college', attributes: ['id', 'name', 'district', 'state'] }
      ]
    });
  }

  async getStudents(whereClause) {
    return await User.findAll({
      where: { 
        role: 'student',
        ...(this.isCollegeAdmin && this.user.college_id ? { college_id: this.user.college_id } : {})
      },
      include: [{ model: College, as: 'college', attributes: ['id', 'name'] }]
    });
  }

  async getMentors() {
    return await User.findAll({
      where: { role: 'mentor' },
      include: [{ model: College, as: 'college', attributes: ['id', 'name'] }]
    });
  }

  async getEvents(whereClause) {
    return await Event.findAll({
      where: {
        ...whereClause,
        ...(this.isCollegeAdmin && this.user.college_id ? { college_id: this.user.college_id } : {})
      },
      include: [{ model: College, as: 'college', attributes: ['id', 'name'] }]
    });
  }

  async getDocuments(whereClause) {
    return await Document.findAll({
      where: {
        ...whereClause,
        ...(this.isCollegeAdmin && this.user.college_id ? { college_id: this.user.college_id } : {})
      },
      include: [{ model: College, as: 'college', attributes: ['id', 'name'] }]
    });
  }

  async getPreIncubatees(whereClause) {
    return await PreIncubatee.findAll({
      where: {
        ...whereClause,
        ...(this.isCollegeAdmin && this.user.college_id ? { college_id: this.user.college_id } : {})
      },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'department'] },
        { model: College, as: 'college', attributes: ['id', 'name'] }
      ]
    });
  }

  async getColleges() {
    return await College.findAll({
      where: this.isCollegeAdmin && this.user.college_id ? { id: this.user.college_id } : {},
      attributes: ['id', 'name', 'district', 'state', 'established_year']
    });
  }

  // Analysis methods
  async generateSummary(ideas, students, mentors, events, documents, preIncubatees) {
    const previousPeriodIdeas = await Idea.count({
      where: {
        created_at: { [Op.between]: [new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)] },
        ...(this.isCollegeAdmin && this.user.college_id ? { college_id: this.user.college_id } : {})
      }
    });

    const ideaGrowthRate = previousPeriodIdeas > 0 ? 
      ((ideas.length - previousPeriodIdeas) / previousPeriodIdeas * 100).toFixed(2) : 0;

    return {
      total_ideas: ideas.length,
      total_students: students.length,
      total_mentors: mentors.length,
      total_events: events.length,
      total_documents: documents.length,
      total_pre_incubatees: preIncubatees.length,
      idea_growth_rate: parseFloat(ideaGrowthRate),
      average_ideas_per_student: students.length > 0 ? (ideas.length / students.length).toFixed(2) : 0,
      idea_acceptance_rate: ideas.length > 0 ? 
        ((ideas.filter(i => i.status === 'accepted').length / ideas.length) * 100).toFixed(2) : 0
    };
  }

  calculateStatusDistribution(ideas) {
    return ideas.reduce((acc, idea) => {
      acc[idea.status] = (acc[idea.status] || 0) + 1;
      return acc;
    }, {});
  }

  calculateCategoryDistribution(ideas) {
    return ideas.reduce((acc, idea) => {
      acc[idea.category] = (acc[idea.category] || 0) + 1;
      return acc;
    }, {});
  }

  calculateDepartmentDistribution(ideas) {
    return ideas.reduce((acc, idea) => {
      const dept = idea.student?.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
  }

  calculateYearDistribution(ideas) {
    return ideas.reduce((acc, idea) => {
      const year = idea.student?.year_of_study || 'Unknown';
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});
  }

  async calculateQualityMetrics(ideas) {
    const totalLikes = ideas.reduce((sum, idea) => sum + (idea.likes_count || 0), 0);
    const totalComments = ideas.reduce((sum, idea) => sum + (idea.comments_count || 0), 0);
    
    return {
      average_likes_per_idea: ideas.length > 0 ? (totalLikes / ideas.length).toFixed(2) : 0,
      average_comments_per_idea: ideas.length > 0 ? (totalComments / ideas.length).toFixed(2) : 0,
      high_quality_ideas: ideas.filter(idea => (idea.likes_count || 0) > 5).length,
      engagement_score: ideas.length > 0 ? ((totalLikes + totalComments) / ideas.length).toFixed(2) : 0
    };
  }

  async generateComprehensiveReport(periodStart, periodEnd) {
    const quarterlyReport = await this.generateQuarterlyReport(periodStart, periodEnd);
    
    // Add comprehensive-specific analysis
    const comprehensiveAnalysis = {
      cross_cutting_analysis: await this.getCrossCuttingAnalysis(periodStart, periodEnd),
      strategic_insights: await this.getStrategicInsights(periodStart, periodEnd),
      performance_benchmarks: await this.getPerformanceBenchmarks(periodStart, periodEnd),
      future_projections: await this.getFutureProjections(periodStart, periodEnd)
    };
    
    return {
      ...quarterlyReport,
      comprehensive_analysis: comprehensiveAnalysis
    };
  }

  async generateStudentEngagementReport(periodStart, periodEnd) {
    const startDate = periodStart ? new Date(periodStart) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = periodEnd ? new Date(periodEnd) : new Date();
    
    const whereClause = {};
    if (startDate && endDate) {
      whereClause.created_at = { [Op.between]: [startDate, endDate] };
    }
    if (this.isCollegeAdmin && this.user.college_id) {
      whereClause.college_id = this.user.college_id;
    }

    const students = await this.getStudents(whereClause);
    const ideas = await this.getIdeas(whereClause);
    
    return {
      period: { start: startDate.toISOString().split('T')[0], end: endDate.toISOString().split('T')[0] },
      student_engagement: {
        total_students: students.length,
        active_students: students.filter(s => s.last_login && new Date(s.last_login) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
        engagement_rate: students.length > 0 ? (students.filter(s => s.last_login && new Date(s.last_login) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length / students.length * 100).toFixed(1) : 0,
        participation_metrics: this.getParticipationMetrics(students, ideas),
        activity_trends: this.getActivityTrends(students, startDate, endDate)
      },
      recommendations: this.getStudentEngagementRecommendations(students, ideas)
    };
  }

  async generateEventPerformanceReport(periodStart, periodEnd) {
    const startDate = periodStart ? new Date(periodStart) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = periodEnd ? new Date(periodEnd) : new Date();
    
    const whereClause = {};
    if (startDate && endDate) {
      whereClause.created_at = { [Op.between]: [startDate, endDate] };
    }
    if (this.isCollegeAdmin && this.user.college_id) {
      whereClause.college_id = this.user.college_id;
    }

    const events = await this.getEvents(whereClause);
    
    return {
      period: { start: startDate.toISOString().split('T')[0], end: endDate.toISOString().split('T')[0] },
      event_performance: {
        total_events: events.length,
        attendance_stats: this.getEventAttendanceStats(events),
        event_types: this.groupEventsByType(events),
        impact_analysis: this.getEventImpactAnalysis(events),
        feedback_analysis: this.getEventFeedbackAnalysis(events)
      },
      recommendations: this.getEventPerformanceRecommendations(events)
    };
  }

  async generateFinancialReport(periodStart, periodEnd) {
    const startDate = periodStart ? new Date(periodStart) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const endDate = periodEnd ? new Date(periodEnd) : new Date();
    
    return {
      period: { start: startDate.toISOString().split('T')[0], end: endDate.toISOString().split('T')[0] },
      financial_overview: {
        budget_utilization: await this.getBudgetUtilization(startDate, endDate),
        resource_allocation: await this.getResourceAllocation(startDate, endDate),
        cost_analysis: await this.getCostAnalysis(startDate, endDate),
        roi_metrics: await this.getROIMetrics(startDate, endDate)
      },
      recommendations: this.getFinancialRecommendations()
    };
  }

  async generateInsights(ideas, students, events, preIncubatees) {
    const mostActiveDepartment = Object.entries(this.calculateDepartmentDistribution(ideas))
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
    
    const topStudents = ideas
      .filter(idea => idea.student)
      .reduce((acc, idea) => {
        const studentId = idea.student.id;
        if (!acc[studentId]) {
          acc[studentId] = {
            student: idea.student,
            ideaCount: 0,
            acceptedIdeas: 0,
            totalLikes: 0
          };
        }
        acc[studentId].ideaCount++;
        if (idea.status === 'accepted') acc[studentId].acceptedIdeas++;
        acc[studentId].totalLikes += idea.likes_count || 0;
        return acc;
      }, {});

    const topStudent = Object.values(topStudents)
      .sort((a, b) => b.ideaCount - a.ideaCount)[0]?.student?.name || 'N/A';

    return {
      most_active_department: mostActiveDepartment,
      most_productive_student: topStudent,
      idea_acceptance_rate: ideas.length > 0 ? 
        ((ideas.filter(i => i.status === 'accepted').length / ideas.length) * 100).toFixed(2) : 0,
      average_idea_quality: ideas.length > 0 ? 
        (ideas.reduce((sum, idea) => sum + (idea.likes_count || 0), 0) / ideas.length).toFixed(2) : 0,
      key_trends: await this.identifyKeyTrends(ideas, students, events),
      success_indicators: await this.identifySuccessIndicators(ideas, preIncubatees)
    };
  }

  async generateRecommendations(ideas, students, events, preIncubatees) {
    const recommendations = [];
    
    // Idea quality recommendations
    const lowQualityIdeas = ideas.filter(idea => (idea.likes_count || 0) < 2);
    if (lowQualityIdeas.length > ideas.length * 0.3) {
      recommendations.push({
        category: 'Idea Quality',
        priority: 'High',
        title: 'Improve Idea Quality',
        description: `${lowQualityIdeas.length} ideas have low engagement. Consider providing better guidance to students.`,
        action: 'Conduct idea development workshops and provide detailed feedback.'
      });
    }

    // Department engagement recommendations
    const deptDistribution = this.calculateDepartmentDistribution(ideas);
    const totalIdeas = ideas.length;
    const departments = Object.keys(deptDistribution);
    
    departments.forEach(dept => {
      const percentage = (deptDistribution[dept] / totalIdeas) * 100;
      if (percentage < 5) {
        recommendations.push({
          category: 'Department Engagement',
          priority: 'Medium',
          title: `Increase ${dept} Department Participation`,
          description: `${dept} department has only ${percentage.toFixed(1)}% of total ideas.`,
          action: `Organize department-specific awareness sessions and incentives.`
        });
      }
    });

    // Event participation recommendations
    if (events.length < 2) {
      recommendations.push({
        category: 'Events',
        priority: 'Medium',
        title: 'Increase Event Frequency',
        description: 'Only 2 events were organized in the period.',
        action: 'Plan more regular events to maintain student engagement.'
      });
    }

    return recommendations;
  }

  // Additional helper methods would go here...
  async identifyKeyTrends(ideas, students, events) {
    // Implementation for trend analysis
    return ['Increasing idea submissions', 'Growing student engagement', 'Rising event participation'];
  }

  async identifySuccessIndicators(ideas, preIncubatees) {
    // Implementation for success indicators
    return ['High idea acceptance rate', 'Strong mentor engagement', 'Active pre-incubation pipeline'];
  }

  // Placeholder methods for other analyses
  async generateIdeaAnalysis(ideas, startDate, endDate) { return {}; }
  async generateStudentAnalysis(students, ideas) { return {}; }
  async generateEventAnalysis(events) { return {}; }
  async generateDocumentAnalysis(documents) { return {}; }
  async generatePreIncubateeAnalysis(preIncubatees) { return {}; }
  async generateCollegeAnalysis(colleges, ideas) { return {}; }
  async generateTrends(ideas, startDate, endDate) { return {}; }
  async calculateYearOverYearGrowth(startDate, endDate) { return {}; }
  async calculateAnnualTrends(startDate, endDate) { return {}; }
  async identifyKeyAchievements(startDate, endDate) { return []; }
  async identifyChallenges(startDate, endDate) { return []; }
  async calculateEngagementMetrics(ideas) { return {}; }
  async identifyTopPerformers(ideas) { return []; }
  async identifyImprovementAreas(ideas) { return []; }
  async generateDetailedIdeaAnalysis(ideas) { return {}; }
  async generateIdeaRecommendations(ideas) { return []; }
  async calculateIdeaSubmissionRate(students, ideas) { return 0; }
  async calculateIdeaAcceptanceRate(ideas) { return 0; }
  async calculateStudentEngagementRate(students, ideas) { return 0; }
  async calculateEventParticipationRate(students, events) { return 0; }
  async calculateDocumentUtilizationRate(students, documents) { return 0; }
  async calculatePreIncubationSuccessRate(preIncubatees) { return 0; }
  async analyzeDepartmentPerformance(ideas, students) { return {}; }
  async analyzeStudentPerformance(students, ideas) { return {}; }
  async analyzeResourceUtilization(events, documents) { return {}; }
  async generateComparativeAnalysis(ideas, students, events) { return {}; }
  async generatePerformanceRecommendations(ideas, students, events, preIncubatees) { return []; }
  async countActiveMentors(mentors, startDate, endDate) { return 0; }
  async calculateMentorWorkload(mentors, ideas) { return {}; }
  async calculateMentorPerformance(mentors, ideas) { return {}; }
  async calculateStudentSatisfaction(mentors) { return {}; }
  async calculateMentorImpact(mentors, ideas) { return {}; }
  async generateDetailedMentorAnalysis(mentors, ideas) { return {}; }
  async generateMentorRecommendations(mentors, ideas) { return []; }
  async analyzePipelineStages(preIncubatees) { return {}; }
  async calculateConversionRates(ideas, preIncubatees) { return {}; }
  async calculateTimeInPipeline(preIncubatees) { return {}; }
  async identifySuccessFactors(preIncubatees) { return []; }
  async identifyBottlenecks(preIncubatees) { return []; }
  async generateDetailedPipelineAnalysis(preIncubatees, ideas) { return {}; }
  async generatePipelineRecommendations(preIncubatees, ideas) { return []; }
}

module.exports = ReportGenerator;
