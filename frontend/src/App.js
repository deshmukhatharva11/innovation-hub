import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { setTheme } from './store/slices/themeSlice';
import { setUser } from './store/slices/authSlice';
import { authAPI } from './services/api';
import ErrorBoundary from './components/common/ErrorBoundary';
import './styles/animations.css';

// Layout Components
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Components
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import EmailVerification from './features/auth/EmailVerification';
import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword';

// Dashboard Components
import StudentDashboard from './features/dashboard/StudentDashboard';
import IncubatorDashboard from './features/dashboard/IncubatorDashboard';
import MentorDashboard from './features/dashboard/MentorDashboard';

// Feature Components
import SubmitIdea from './features/ideas/SubmitIdea';
import MyIdeas from './features/ideas/MyIdeas';
import IdeaDetail from './features/ideas/IdeaDetail';
import EditIdea from './features/ideas/EditIdea';
import ViewAllIdeas from './features/ideas/ViewAllIdeas';
import NotificationDetail from './features/notifications/NotificationDetail';

// Pre-Incubatee Components
import StudentPreIncubateeProgress from './features/pre-incubatees/StudentPreIncubateeProgress';
import PreIncubateesTracker from './features/pre-incubatees/PreIncubateesTracker';
import NotificationsList from './features/notifications/NotificationsList';
import StudentManagement from './features/admin/StudentManagement';
import CollegeManagement from './features/admin/CollegeManagement';
import ReviewIdeas from './features/review/ReviewIdeas';
import Analytics from './features/analytics/Analytics';
import CollegeDetail from './features/colleges/CollegeDetail';
import AreaDetail from './features/areas/AreaDetail';
import Profile from './features/profile/Profile';
import Settings from './features/profile/Settings';
import SuperAdminDashboard from './features/admin/SuperAdminDashboard';
import UserManagement from './features/admin/UserManagement';
import IncubatorManagement from './features/admin/IncubatorManagement';
import SystemSettings from './features/admin/SystemSettings';
import CollegeRegistration from './features/admin/CollegeRegistration';
import CMSEditor from './features/admin/CMSEditor';
import CircularsManagement from './features/admin/CircularsManagement';
import BackupSecurity from './features/admin/BackupSecurity';
import GlobalAnalytics from './features/admin/GlobalAnalytics';
import IdeaEvaluation from './features/ideas/IdeaEvaluation';
import MentorDatabase from './features/mentors/MentorDatabase';
import CollegeMentorManagement from './features/mentors/CollegeMentorManagement';
import RoleBasedMentorChat from './components/common/RoleBasedMentorChat';
import EventsManagement from './features/events/EventsManagement';
import StudentEventsDashboard from './features/events/StudentEventsDashboard';
import StudentDocuments from './features/documents/StudentDocuments';
import DocumentRepository from './features/documents/DocumentRepository';
import ReportingSystem from './features/reports/ReportingSystem';
import AuditTrail from './features/audit/AuditTrail';
import NotificationSystem from './features/notifications/NotificationSystem';
import HomePage from './features/home/HomePage';
import HowItWorks from './features/home/HowItWorks';
import SuccessStories from './features/home/SuccessStories';
import About from './features/home/About';
import Contact from './features/home/Contact';
import CircularsPage from './features/home/CircularsPage';
import Resources from './features/home/Resources';
import Careers from './features/home/Careers';
import PublicLayout from './components/layout/PublicLayout';

// Student Pages
import SubmitIdeaPage from './features/student/SubmitIdea';
import Mentorship from './features/student/Mentorship';
import LearningResources from './features/student/LearningResources';
import Competitions from './features/student/Competitions';
import FundingOpportunities from './features/student/FundingOpportunities';
import StudentCommunity from './features/student/StudentCommunity';
// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';


function AppContent() {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    // Apply initial theme
    dispatch(setTheme(mode));
  }, [dispatch, mode]);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken && !user) {
        try {
          // Try to fetch user data if token exists but user is not loaded
          const response = await authAPI.getCurrentUser();
          console.log('🔍 Auth initialization - API response:', response.data);
          if (response.data?.data?.user) {
            console.log('🔍 Auth initialization - User data:', response.data.data.user);
            console.log('🔍 Auth initialization - College data:', response.data.data.user.college);
            dispatch(setUser(response.data.data.user));
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          // Clear invalid token
          localStorage.removeItem('token');
        }
      }
    };
    
    initializeAuth();
  }, [dispatch, user, token]);  
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-200">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/how-it-works" element={<PublicLayout><HowItWorks /></PublicLayout>} />
          <Route path="/success-stories" element={<PublicLayout><SuccessStories /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/circulars" element={<PublicLayout><CircularsPage /></PublicLayout>} />
          <Route path="/resources" element={<PublicLayout><Resources /></PublicLayout>} />
          <Route path="/careers" element={<PublicLayout><Careers /></PublicLayout>} />
          
          {/* Student Public Pages */}
          <Route path="/submit-idea" element={<PublicLayout><SubmitIdeaPage /></PublicLayout>} />
          <Route path="/mentorship" element={<PublicLayout><Mentorship /></PublicLayout>} />
          <Route path="/learning-resources" element={<PublicLayout><LearningResources /></PublicLayout>} />
          <Route path="/competitions" element={<PublicLayout><Competitions /></PublicLayout>} />
          <Route path="/funding" element={<PublicLayout><FundingOpportunities /></PublicLayout>} />
          <Route path="/community" element={<PublicLayout><StudentCommunity /></PublicLayout>} />
          
          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <RoleDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/ideas/submit" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><SubmitIdea /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/ideas/my" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><MyIdeas /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/ideas/:id/edit" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><EditIdea /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/ideas/review" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><ReviewIdeas /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/events/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><StudentEventsDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/documents/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><StudentDocuments /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* College Routes */}
          <Route path="/college-coordinator" element={
            <ProtectedRoute allowedRoles={['college_admin']}>
              <DashboardLayout><StudentDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/students" element={
            <ProtectedRoute allowedRoles={['college_admin']}>
              <DashboardLayout><StudentManagement /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/endorse" element={
            <ProtectedRoute allowedRoles={['college_admin']}>
              <DashboardLayout><ReviewIdeas /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Incubator Routes */}
          <Route path="/review" element={
            <ProtectedRoute allowedRoles={['incubator_manager']}>
              <DashboardLayout><ReviewIdeas /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['incubator_manager']}>
              <DashboardLayout><Analytics /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/colleges/:id" element={
            <ProtectedRoute allowedRoles={['incubator_manager']}>
              <DashboardLayout><CollegeDetail /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/areas/:areaName" element={
            <ProtectedRoute allowedRoles={['incubator_manager']}>
              <DashboardLayout><AreaDetail /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Super Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><SuperAdminDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><UserManagement /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><SystemSettings /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/college-registration" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><CollegeRegistration /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/colleges" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><CollegeManagement /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/incubators" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><IncubatorManagement /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/cms" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><CMSEditor /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/circulars" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><CircularsManagement /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/backup" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><BackupSecurity /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><GlobalAnalytics /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Idea Evaluation Routes */}
          <Route path="/ideas/evaluate" element={
            <ProtectedRoute allowedRoles={['college_admin', 'incubator_manager']}>
              <DashboardLayout><IdeaEvaluation /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Mentor Database Routes */}
          <Route path="/mentors" element={
            <ProtectedRoute allowedRoles={['college_admin', 'incubator_manager', 'admin']}>
              <DashboardLayout>
                {user?.role === 'college_admin' ? <CollegeMentorManagement /> : <MentorDatabase />}
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Pre-Incubatee Progress Routes */}
          <Route path="/pre-incubatees" element={
            <ProtectedRoute allowedRoles={['student', 'incubator_manager']}>
              <DashboardLayout>
                {user?.role === 'student' ? <StudentPreIncubateeProgress /> : <PreIncubateesTracker />}
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Mentor Chat Route */}
          <Route path="/mentor-chat" element={
            <ProtectedRoute>
              <DashboardLayout><RoleBasedMentorChat /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Events Management Routes */}
          <Route path="/events" element={
            <ProtectedRoute allowedRoles={['college_admin', 'incubator_manager', 'admin']}>
              <DashboardLayout><EventsManagement /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Document Repository Routes */}
          <Route path="/documents" element={
            <ProtectedRoute allowedRoles={['college_admin', 'incubator_manager', 'admin']}>
              <DashboardLayout><DocumentRepository /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Reporting System Routes */}
          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['college_admin', 'incubator_manager', 'admin']}>
              <DashboardLayout><ReportingSystem /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Audit Trail Routes */}
          <Route path="/audit" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><AuditTrail /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Notification System Routes */}
          <Route path="/notifications/manage" element={
            <ProtectedRoute allowedRoles={['admin', 'incubator_manager']}>
              <DashboardLayout><NotificationSystem /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <DashboardLayout><NotificationsList /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Shared Routes */}
          <Route path="/ideas" element={
            <ProtectedRoute>
              <DashboardLayout><ViewAllIdeas /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/ideas/:id" element={
            <ProtectedRoute>
              <DashboardLayout><IdeaDetail /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/notifications/:id" element={
            <ProtectedRoute>
              <DashboardLayout><NotificationDetail /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <DashboardLayout><Profile /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout><Settings /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Default Routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: mode === 'dark' ? '#1e293b' : '#ffffff',
            color: mode === 'dark' ? '#f1f5f9' : '#1e293b',
          },
        }}
      />
    </div>
  );
}

// Role-based dashboard component
function RoleDashboard() {
  const { user } = useSelector((state) => state.auth);

  switch (user?.role) {
    case 'student':
      return <StudentDashboard />;
    case 'college_admin':
      return <StudentDashboard />;
    case 'incubator_manager':
      return <IncubatorDashboard />;
    case 'mentor':
      return <MentorDashboard />;
    case 'admin':
      return <SuperAdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
