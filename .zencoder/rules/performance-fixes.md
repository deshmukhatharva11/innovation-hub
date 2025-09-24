# Performance Issues and Solutions for Innovation Hub

## Identified Issues

1. **Profile Page Excessive API Calls**
   - The Profile component is making redundant API calls
   - Debug console logs are excessive and slowing down performance
   - Duplicate profile_image_url field in the formatted data
   - No debouncing on input changes

2. **Slow Dashboard Loading**
   - Multiple API calls without proper loading state management
   - No caching of frequently accessed data
   - Inefficient data fetching strategy

## Solutions

### 1. Fix Profile Component

#### A. Optimize fetchUserProfile function
```javascript
// In Profile.jsx
const fetchUserProfile = async () => {
  if (!user?.id) return;
  try {
    setLoading(true);
    
    // Use cached data if available and not stale
    const cachedData = sessionStorage.getItem(`user_profile_${user.id}`);
    const cachedTimestamp = sessionStorage.getItem(`user_profile_timestamp_${user.id}`);
    const now = Date.now();
    
    // Use cache if it's less than 5 minutes old
    if (cachedData && cachedTimestamp && (now - parseInt(cachedTimestamp)) < 300000) {
      const userData = JSON.parse(cachedData);
      setProfileData(userData);
      setInitialData(userData);
      setLoading(false);
      return;
    }
    
    const response = await usersAPI.getById(user.id);
    
    if (response.data?.success && response.data?.data?.user) {
      const userData = response.data.data.user;
      
      const formattedData = {
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        department: userData.department || '',
        bio: userData.bio || '',
        date_of_birth: userData.date_of_birth || '',
        linkedin_url: userData.linkedin_url || '',
        github_url: userData.github_url || '',
        portfolio_url: userData.portfolio_url || '',
        skills: userData.skills || [],
        social_links: userData.social_links || {},
        profile_image_url: userData.profile_image_url 
          ? `http://localhost:3001/uploads/${userData.profile_image_url}`
          : '',
        college_name: userData.college?.name || '',
        incubator_name: userData.incubator?.name || '',
        year_of_study: userData.year_of_study || '',
        roll_number: userData.roll_number || '',
        gpa: userData.gpa || '',
        position: userData.position || '',
        experience_years: userData.experience_years || '',
        designation: userData.designation || '',
        expertise_areas: userData.expertise_areas || '',
        joined_date: userData.created_at || new Date().toISOString()
      };
      
      // Cache the profile data
      sessionStorage.setItem(`user_profile_${user.id}`, JSON.stringify(formattedData));
      sessionStorage.setItem(`user_profile_timestamp_${user.id}`, now.toString());
      
      setProfileData(formattedData);
      setInitialData(formattedData);
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    toast.error('Failed to load profile data');
  } finally {
    setLoading(false);
  }
};
```

#### B. Implement debounced input handling
```javascript
// Add this import at the top of Profile.jsx
import { useCallback } from 'react';

// Add this function inside the Profile component
const debouncedHandleInputChange = useCallback(
  (field, value) => {
    // Prevent unnecessary updates if value hasn't changed
    setProfileData(prev => {
      if (prev[field] === value) return prev;
      return {
        ...prev,
        [field]: value
      };
    });
  },
  []
);

// Replace all instances of handleInputChange with this debounced version
// For example:
// onChange={(e) => handleInputChange('name', e.target.value)}
// becomes:
// onChange={(e) => debouncedHandleInputChange('name', e.target.value)}
```

#### C. Fix profile image URL handling
```javascript
// Remove the duplicate profile_image_url field in the formattedData object
// And update the profileImageUrl calculation:

const profileImageUrl = profileData.profile_image_url 
  ? profileData.profile_image_url.includes('http') 
    ? profileData.profile_image_url 
    : `http://localhost:3001/uploads/${profileData.profile_image_url}`
  : '/default-avatar.png';
```

### 2. Optimize Dashboard Loading

#### A. Implement data caching for dashboard
```javascript
// In StudentDashboard.jsx
const fetchDashboardData = useCallback(
  async () => {
    try {
      setLoading(true);
      
      // Check for cached data
      const cachedStats = sessionStorage.getItem('dashboard_stats');
      const cachedIdeas = sessionStorage.getItem('dashboard_ideas');
      const cachedTimestamp = sessionStorage.getItem('dashboard_timestamp');
      const now = Date.now();
      
      // Use cache if it's less than 2 minutes old
      if (cachedStats && cachedIdeas && cachedTimestamp && 
          (now - parseInt(cachedTimestamp)) < 120000) {
        setStats(JSON.parse(cachedStats));
        setRecentIdeas(JSON.parse(cachedIdeas));
        setLoading(false);
        return;
      }
      
      // Use Promise.all to fetch data in parallel
      const [analyticsResponse, ideasResponse] = await Promise.all([
        analyticsAPI.getDashboardStats({ period: '30d' }),
        ideasAPI.getAll({
          student_id: user?.id,
          limit: 5,
          sort_by: 'created_at',
          sort_order: 'desc'
        })
      ]);
      
      // Process analytics data
      if (analyticsResponse.data?.success && analyticsResponse.data?.data?.analytics) {
        const analytics = analyticsResponse.data.data.analytics;
        const newStats = {
          totalIdeas: analytics.ideas?.total || 0,
          pendingIdeas: analytics.ideas?.by_status?.find(s => s.status === 'submitted')?.count || 0,
          endorsedIdeas: analytics.ideas?.by_status?.find(s => s.status === 'endorsed')?.count || 0,
          rejectedIdeas: analytics.ideas?.by_status?.find(s => s.status === 'rejected')?.count || 0
        };
        
        setStats(newStats);
        sessionStorage.setItem('dashboard_stats', JSON.stringify(newStats));
      }
      
      // Process ideas data
      if (ideasResponse.data?.success && ideasResponse.data?.data?.ideas) {
        const newIdeas = ideasResponse.data.data.ideas.map(idea => ({
          id: idea.id,
          title: idea.title,
          status: idea.status,
          submittedAt: idea.created_at,
          views: idea.views_count || 0,
          comments: idea.comments?.length || 0
        }));
        
        setRecentIdeas(newIdeas);
        sessionStorage.setItem('dashboard_ideas', JSON.stringify(newIdeas));
      }
      
      // Update cache timestamp
      sessionStorage.setItem('dashboard_timestamp', now.toString());
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAuthenticated]);
```

### 3. Backend Optimizations

#### A. Optimize user profile endpoint
```javascript
// In backend/routes/users.js - Modify the GET /:id endpoint

// Add caching headers
res.set('Cache-Control', 'private, max-age=300'); // Cache for 5 minutes

// Optimize the query to only fetch necessary fields
const user = await User.findByPk(id, {
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
    // Only include ideas if specifically requested
    ...(req.query.include_ideas ? [{
      model: Idea,
      as: 'ideas',
      attributes: ['id', 'title', 'status', 'created_at'],
      limit: 5,
      order: [['created_at', 'DESC']],
    }] : []),
  ],
  attributes: { exclude: ['password_hash', 'reset_password_token', 'reset_password_expires', 'email_verification_token'] },
});
```

#### B. Remove excessive console logs
```javascript
// In backend/routes/users.js - Update the PUT /:id endpoint
// Remove or comment out these debug logs:

// console.log('=== PROFILE UPDATE DEBUG ===');
// console.log('User before update:', user.toJSON());
// console.log('Request body:', req.body);
// console.log('Fields being updated:');

updateFields.forEach(field => {
  if (req.body[field] !== undefined) {
    // console.log(`${field}: ${user[field]} -> ${req.body[field]}`);
    user[field] = req.body[field];
  }
});

// console.log('User after update, before save:', user.toJSON());
await user.save();
// console.log('User after save:', user.toJSON());
```

### 4. API Service Optimizations

#### A. Add request cancellation to prevent race conditions
```javascript
// In services/api.js - Add this at the top
import axios from 'axios';

// Create a map to store cancellation tokens
const pendingRequests = new Map();

// Function to cancel previous requests with the same key
const cancelPreviousRequest = (key) => {
  if (pendingRequests.has(key)) {
    const controller = pendingRequests.get(key);
    controller.abort();
    pendingRequests.delete(key);
  }
};

// Modify the usersAPI.getById function
export const usersAPI = {
  // ... other methods
  getById: (id) => {
    // Create a request key
    const requestKey = `user_${id}`;
    
    // Cancel any pending request with the same key
    cancelPreviousRequest(requestKey);
    
    // Create a new AbortController
    const controller = new AbortController();
    pendingRequests.set(requestKey, controller);
    
    return api.get(`/users/${id}`, {
      signal: controller.signal
    }).finally(() => {
      // Remove the controller from the map when done
      pendingRequests.delete(requestKey);
    });
  },
  // ... other methods
};
```

## Implementation Plan

1. **First Priority**: Fix the Profile component to prevent excessive API calls
   - Implement caching
   - Add debouncing for input changes
   - Fix the profile image URL handling

2. **Second Priority**: Optimize the Dashboard loading
   - Implement parallel data fetching
   - Add caching for dashboard data
   - Improve loading state management

3. **Third Priority**: Backend optimizations
   - Add caching headers
   - Remove excessive console logs
   - Optimize database queries

4. **Fourth Priority**: API service improvements
   - Implement request cancellation
   - Add error handling improvements

By implementing these changes, you should see significant performance improvements in both the profile page and dashboard loading times.