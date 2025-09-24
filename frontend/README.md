# Innovation Hub - Multi-Role Incubation Platform

A complete frontend system for a full-featured multi-role incubation platform where students can submit innovative ideas, colleges can endorse those ideas, and incubation centers can evaluate and track them.

## 🚀 Features

### 👤 Student Features
- **Dashboard**: Overview of idea status and submissions
- **Submit Ideas**: Comprehensive form with file uploads, team management, and technical details
- **My Ideas**: Manage and track submitted ideas with filtering and search
- **Idea Details**: View detailed information, comments, and endorsements
- **Notifications**: Real-time updates on idea status changes

### 🏫 College Features
- **Dashboard**: Student activity overview and pending endorsements
- **Student Management**: View and manage registered students
- **Endorse Ideas**: Review and approve/reject student ideas
- **Idea Referral**: Submit endorsed ideas to incubation centers

### 🧪 Incubation Center Features
- **Dashboard**: Regional overview and idea pipeline
- **Idea Review**: Evaluate endorsed ideas for incubation
- **Analytics**: Comprehensive performance metrics and insights
- **Regional Filtering**: Filter ideas by location and college

## 🛠 Tech Stack

- **Frontend**: React.js 19.1.0
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Forms**: Formik + Yup validation
- **Icons**: React Icons (Feather Icons)
- **Notifications**: React Hot Toast
- **Mock API**: JSON Server

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd incubation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Start the mock API server** (in a separate terminal)
   ```bash
   npm run mock-api
   ```

The application will be available at `http://localhost:3000` and the mock API at `http://localhost:3001`.

## 🎯 Demo Accounts

Use these credentials to test different user roles:

- **Student**: `student@example.com` / `password123`
- **College Admin**: `college@example.com` / `password123`
- **Incubator Manager**: `incubator@example.com` / `password123`

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components
│   └── layout/          # Layout components (Header, Sidebar, etc.)
├── features/
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Role-specific dashboards
│   ├── ideas/           # Idea management components
│   ├── admin/           # Administrative components
│   ├── endorsements/    # Endorsement workflow
│   └── analytics/       # Analytics and reporting
├── store/
│   ├── slices/          # Redux slices
│   └── index.js         # Store configuration
├── services/
│   └── api.js           # API service layer
└── App.js               # Main application component
```

## 🎨 Design System

The application uses a comprehensive design system built with Tailwind CSS:

- **Colors**: Primary (blue), Secondary (gray), Success (green), Warning (yellow), Error (red)
- **Typography**: Inter font family with responsive sizing
- **Components**: Consistent button styles, form inputs, cards, and layouts
- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive**: Mobile-first design with breakpoint-specific layouts

## 🔧 Key Components

### Authentication
- Login/Register forms with validation
- Role-based access control
- Protected routes
- Theme toggle

### Dashboard Layouts
- Role-specific navigation
- Responsive sidebar
- Header with notifications
- User profile dropdown

### Idea Management
- Multi-step idea submission form
- File upload functionality
- Team member management
- Technology stack selection
- Rich text descriptions

### Data Visualization
- Analytics charts and metrics
- Progress tracking
- Regional statistics
- Performance indicators

## 🚀 API Integration Ready

The frontend is structured for seamless API integration:

- **Service Layer**: Centralized API calls in `services/api.js`
- **Redux Integration**: Actions and reducers ready for async operations
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Loading indicators throughout the application
- **Mock Data**: Realistic mock data for development and testing

## 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Tablet Support**: Adapted layouts for tablet screens
- **Desktop**: Full-featured desktop experience
- **Touch-friendly**: Large touch targets and intuitive gestures

## ♿ Accessibility

- **ARIA Labels**: Proper accessibility labels
- **Keyboard Navigation**: Full keyboard support
- **Color Contrast**: WCAG compliant color combinations
- **Screen Reader**: Compatible with screen readers
- **Focus Management**: Proper focus handling

## 🔒 Security Features

- **Input Validation**: Client-side validation with Formik + Yup
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Ready for CSRF token implementation
- **Role-based Access**: Component-level access control

## 🧪 Testing Ready

The project structure supports comprehensive testing:

- **Component Testing**: Jest + React Testing Library setup
- **Integration Testing**: API integration test structure
- **E2E Testing**: Ready for Cypress or Playwright
- **Mock Data**: Comprehensive mock data for testing scenarios

---

Built with ❤️ using React.js and modern web technologies.
