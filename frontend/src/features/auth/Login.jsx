import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('user'); // 'user' or 'mentor'

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
  });

  const handleSubmit = async (values) => {
    try {
      let response;
      
      // Call the appropriate authentication API based on login type
      if (loginType === 'mentor') {
        response = await authAPI.mentorLogin({
          email: values.email,
          password: values.password
        });
      } else {
        response = await authAPI.login({
          email: values.email,
          password: values.password
        });
      }

      if (response && response.data && response.data.success && response.data.data?.token) {
        const user = loginType === 'mentor' ? response.data.data.mentor : response.data.data.user;
        const token = response.data.data.token;
        
        // Add role to user object for mentor
        if (loginType === 'mentor') {
          user.role = 'mentor';
        }
        
        dispatch(loginSuccess({
          user,
          token
        }));
        
        toast.success(`Welcome back, ${user.name}!`);
        navigate('/dashboard');
      } else {
        console.error('Invalid response structure:', response);
        toast.error('Login failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle email verification error
      if (error.response?.status === 403 && error.response?.data?.data?.email_verification_required) {
        toast.error('Email not verified. Please check your email for verification.');
        navigate('/email-verification', { 
          state: { 
            email: values.email,
            message: error.response.data.message 
          } 
        });
        return;
      }
      
      dispatch(loginFailure(error.response?.data?.message || 'Login failed'));
      toast.error(error.response?.data?.message || 'Invalid email or password');
    }
  };


  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-secondary-900 dark:text-white">
          Welcome Back
        </h2>
        <p className="text-secondary-600 dark:text-secondary-400 mt-2">
          Sign in to your account to continue
        </p>
      </div>

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            {/* Login Type Selector */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Login As
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setLoginType('user')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    loginType === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  User/Admin
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType('mentor')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    loginType === 'mentor'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Mentor
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-secondary-400" />
                </div>
                <Field
                  name="email"
                  type="email"
                  className="input-field pl-10"
                  placeholder="Enter your email"
                />
              </div>
              <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-secondary-400" />
                </div>
                <Field
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-secondary-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-secondary-400" />
                  )}
                </button>
              </div>
              <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <span className="ml-2 text-sm text-secondary-600 dark:text-secondary-400">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

          </Form>
        )}
      </Formik>

      {/* Sign Up Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-secondary-600 dark:text-secondary-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
