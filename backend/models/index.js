const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const College = require('./College');
const Incubator = require('./Incubator');
const Idea = require('./Idea');
const TeamMember = require('./TeamMember');
const IdeaFile = require('./IdeaFile');
const Comment = require('./Comment');
const Like = require('./Like');
const Notification = require('./Notification');

// Initialize Chat models with sequelize
const Chat = require('./Chat')(sequelize);
const ChatMessage = require('./ChatMessage')(sequelize);

// Initialize Mentor Chat models with sequelize
const MentorChat = require('./MentorChat')(sequelize);
const MentorChatMessage = require('./MentorChatMessage')(sequelize);

// Initialize College Coordinator models with sequelize
const Event = require('./Event')(sequelize);
const Report = require('./Report')(sequelize);
const Document = require('./Document')(sequelize);
const IdeaEvaluation = require('./IdeaEvaluation')(sequelize);
const PreIncubatee = require('./PreIncubatee');
const Mentor = require('./Mentor')(sequelize);
const MentorAssignment = require('./MentorAssignment')(sequelize);
const AuditLog = require('./AuditLog');
const CMSContent = require('./CMSContent');
const CMSNotification = require('./CMSNotification');
const CMSMedia = require('./CMSMedia');
const Circular = require('./Circular');

// Initialize Chat models
const Message = require('./Message');
const Conversation = require('./Conversation');

// Define associations

// User associations
User.belongsTo(College, { foreignKey: 'college_id', as: 'college' });
User.belongsTo(Incubator, { foreignKey: 'incubator_id', as: 'incubator' });
User.hasMany(Idea, { foreignKey: 'student_id', as: 'ideas' });
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
User.hasMany(Like, { foreignKey: 'user_id', as: 'likes' });
User.hasMany(IdeaFile, { foreignKey: 'uploaded_by', as: 'uploadedFiles' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
User.hasMany(Chat, { foreignKey: 'student_id', as: 'studentChats' });
User.hasMany(Chat, { foreignKey: 'coordinator_id', as: 'coordinatorChats' });
User.hasMany(ChatMessage, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Circular, { foreignKey: 'uploaded_by', as: 'uploadedCirculars' });

// Circular associations
Circular.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// College associations
College.hasMany(User, { foreignKey: 'college_id', as: 'users' });
College.hasMany(Idea, { foreignKey: 'college_id', as: 'ideas' });

// Incubator associations
Incubator.hasMany(User, { foreignKey: 'incubator_id', as: 'managers' });
Incubator.hasMany(Idea, { foreignKey: 'incubator_id', as: 'ideas' });

// Idea associations
Idea.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Idea.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });
Idea.belongsTo(College, { foreignKey: 'college_id', as: 'college' });
Idea.belongsTo(Incubator, { foreignKey: 'incubator_id', as: 'incubator' });
Idea.hasMany(TeamMember, { foreignKey: 'idea_id', as: 'teamMembers' });
Idea.hasMany(IdeaFile, { foreignKey: 'idea_id', as: 'files' });
Idea.hasMany(Comment, { foreignKey: 'idea_id', as: 'comments' });
Idea.hasMany(Like, { foreignKey: 'idea_id', as: 'likes' });

// TeamMember associations
TeamMember.belongsTo(Idea, { foreignKey: 'idea_id', as: 'idea' });

// IdeaFile associations
IdeaFile.belongsTo(Idea, { foreignKey: 'idea_id', as: 'idea' });
IdeaFile.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploadedBy' });

// Comment associations
Comment.belongsTo(Idea, { foreignKey: 'idea_id', as: 'idea' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Comment.belongsTo(Comment, { foreignKey: 'parent_id', as: 'parent' });
Comment.hasMany(Comment, { foreignKey: 'parent_id', as: 'replies' });

// Like associations
Like.belongsTo(Idea, { foreignKey: 'idea_id', as: 'idea' });
Like.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Chat associations
Chat.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Chat.belongsTo(User, { foreignKey: 'coordinator_id', as: 'coordinator' });
Chat.belongsTo(Idea, { foreignKey: 'idea_id', as: 'idea' });
Chat.hasMany(ChatMessage, { foreignKey: 'chat_id', as: 'messages' });

// ChatMessage associations
ChatMessage.belongsTo(Chat, { foreignKey: 'chat_id', as: 'chat' });
ChatMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// College Coordinator associations
Event.belongsTo(College, { foreignKey: 'college_id', as: 'college' });
Event.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Report.belongsTo(College, { foreignKey: 'college_id', as: 'college' });
Report.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' });

Document.belongsTo(College, { foreignKey: 'college_id', as: 'college' });
Document.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

IdeaEvaluation.belongsTo(Idea, { foreignKey: 'idea_id', as: 'idea' });
IdeaEvaluation.belongsTo(User, { foreignKey: 'evaluator_id', as: 'evaluator' });

// New Chat associations
Conversation.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Conversation.belongsTo(User, { foreignKey: 'college_admin_id', as: 'college_admin' });
Conversation.hasOne(Message, { foreignKey: 'conversation_id', as: 'lastMessage' });

Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
IdeaEvaluation.belongsTo(User, { foreignKey: 'mentor_assigned', as: 'mentor' });

// College associations for new models
College.hasMany(Event, { foreignKey: 'college_id', as: 'events' });
College.hasMany(Report, { foreignKey: 'college_id', as: 'reports' });
College.hasMany(Document, { foreignKey: 'college_id', as: 'documents' });

// Idea associations for evaluations
Idea.hasMany(IdeaEvaluation, { foreignKey: 'idea_id', as: 'evaluations' });

// PreIncubatee associations
PreIncubatee.belongsTo(Idea, { foreignKey: 'idea_id', as: 'idea' });
PreIncubatee.belongsTo(Incubator, { foreignKey: 'incubator_id', as: 'incubator' });
PreIncubatee.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
PreIncubatee.belongsTo(College, { foreignKey: 'college_id', as: 'college' });
PreIncubatee.belongsTo(Mentor, { foreignKey: 'mentor_id', as: 'mentor' });

// Mentor associations
Mentor.belongsTo(College, { foreignKey: 'college_id', as: 'college' });
Mentor.belongsTo(Incubator, { foreignKey: 'incubator_id', as: 'incubator' });
Mentor.hasMany(PreIncubatee, { foreignKey: 'mentor_id', as: 'mentoredPreIncubatees' });

// Reverse associations
Idea.hasMany(PreIncubatee, { foreignKey: 'idea_id', as: 'preIncubatees' });
Incubator.hasMany(PreIncubatee, { foreignKey: 'incubator_id', as: 'preIncubatees' });
User.hasMany(PreIncubatee, { foreignKey: 'student_id', as: 'preIncubatees' });
College.hasMany(PreIncubatee, { foreignKey: 'college_id', as: 'preIncubatees' });
College.hasMany(Mentor, { foreignKey: 'college_id', as: 'mentors' });
Incubator.hasMany(Mentor, { foreignKey: 'incubator_id', as: 'mentors' });

// Mentor Assignment associations
MentorAssignment.belongsTo(Idea, { foreignKey: 'idea_id', as: 'idea' });
MentorAssignment.belongsTo(Mentor, { foreignKey: 'mentor_id', as: 'mentor' });
MentorAssignment.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
MentorAssignment.belongsTo(User, { foreignKey: 'assigned_by', as: 'assignedBy' });

// Mentor Chat associations
User.hasMany(MentorChat, { foreignKey: 'student_id', as: 'mentorChats' });
Mentor.hasMany(MentorChat, { foreignKey: 'mentor_id', as: 'mentorChats' });
MentorChat.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
MentorChat.belongsTo(Mentor, { foreignKey: 'mentor_id', as: 'mentor' });
MentorChat.belongsTo(Idea, { foreignKey: 'idea_id', as: 'idea' });
MentorChat.belongsTo(MentorAssignment, { foreignKey: 'assignment_id', as: 'assignment' });
MentorChat.hasMany(MentorChatMessage, { foreignKey: 'chat_id', as: 'messages' });
MentorChatMessage.belongsTo(MentorChat, { foreignKey: 'chat_id', as: 'chat' });
MentorChatMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// Reverse associations for mentor assignments
Idea.hasMany(MentorAssignment, { foreignKey: 'idea_id', as: 'mentorAssignments' });
Mentor.hasMany(MentorAssignment, { foreignKey: 'mentor_id', as: 'assignments' });
User.hasMany(MentorAssignment, { foreignKey: 'student_id', as: 'mentorAssignments' });
User.hasMany(MentorAssignment, { foreignKey: 'assigned_by', as: 'assignedMentorAssignments' });

// Add unique constraint for likes (user can only like an idea once)
Like.addHook('beforeCreate', async (like) => {
  const existingLike = await Like.findOne({
    where: {
      idea_id: like.idea_id,
      user_id: like.user_id,
    },
  });
  
  if (existingLike) {
    throw new Error('User has already liked this idea');
  }
});

module.exports = {
  sequelize,
  User,
  College,
  Incubator,
  Idea,
  TeamMember,
  IdeaFile,
  Comment,
  Like,
  Notification,
  Chat,
  ChatMessage,
  MentorChat,
  MentorChatMessage,
  Event,
  Report,
  Document,
  IdeaEvaluation,
  PreIncubatee,
  Mentor,
  MentorAssignment,
  AuditLog,
  CMSContent,
  CMSNotification,
  CMSMedia,
  Circular,
  Message,
  Conversation,
};
