const { sequelize } = require('../config/database');
const { 
  User, 
  College, 
  Incubator, 
  Idea, 
  TeamMember, 
  IdeaFile, 
  Comment, 
  Like 
} = require('../models');

async function migrate() {
  try {
    console.log('Starting database migration...');

    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models with database
    // This will create tables if they don't exist
    await sequelize.sync({ force: false, alter: false });
    console.log('Database tables synchronized successfully.');

    // Create indexes for better performance
    await createIndexes();
    console.log('Database indexes created successfully.');

    console.log('Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

async function createIndexes() {
  try {
    // User indexes
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_users_college_id ON users(college_id)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_users_incubator_id ON users(incubator_id)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)');

    // College indexes
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_colleges_name ON colleges(name)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_colleges_is_active ON colleges(is_active)');

    // Incubator indexes
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_incubators_name ON incubators(name)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_incubators_is_active ON incubators(is_active)');

    // Idea indexes
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_ideas_student_id ON ideas(student_id)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_ideas_college_id ON ideas(college_id)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_ideas_incubator_id ON ideas(incubator_id)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_ideas_is_public ON ideas(is_public)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at)');

    // TeamMember indexes
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_team_members_idea_id ON team_members(idea_id)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_team_members_is_lead ON team_members(is_lead)');

    // IdeaFile indexes
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_idea_files_idea_id ON idea_files(idea_id)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_idea_files_uploaded_by ON idea_files(uploaded_by)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_idea_files_file_type ON idea_files(file_type)');

    // Comment indexes
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_comments_idea_id ON comments(idea_id)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at)');

    // Like indexes
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_likes_idea_id ON likes(idea_id)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_likes_like_type ON likes(like_type)');

    console.log('All indexes created successfully.');
  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate();
}

module.exports = { migrate, createIndexes };
