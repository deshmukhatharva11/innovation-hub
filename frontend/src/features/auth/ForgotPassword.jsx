import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { authAPI } from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.forgotPassword(email);
      
      if (response.data.success) {
        setEmailSent(true);
        toast.success('Password reset link sent to your email!');
      } else {
        setError(response.data.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword(email);
      toast.success('Reset email sent again!');
    } catch (error) {
      console.error('Resend error:', error);
      setError('Failed to resend email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
              <FiCheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white">
              Check Your Email
            </h2>
            <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
              We've sent a password reset link to
            </p>
            <p className="font-medium text-primary-600 dark:text-primary-400">
              {email}
            </p>
          </div>

          <div className="bg-white dark:bg-secondary-800 shadow-xl rounded-lg p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                  What's Next?
                </h3>
                <div className="space-y-3 text-sm text-secondary-600 dark:text-secondary-400">
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-primary-600 dark:text-primary-400 text-xs font-bold">1</span>
                    </span>
                    <span>Check your email inbox (and spam folder)</span>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-primary-600 dark:text-primary-400 text-xs font-bold">2</span>
                    </span>
                    <span>Click the "Reset Your Password" button in the email</span>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-primary-600 dark:text-primary-400 text-xs font-bold">3</span>
                    </span>
                    <span>Create a new password for your account</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex">
                  <FiAlertCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                      Didn't receive the email?
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                      The reset link expires in 1 hour. Check your spam folder or try again.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleResendEmail}
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    'Resend Reset Email'
                  )}
                </button>

                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-secondary-300 dark:border-secondary-600 rounded-md shadow-sm text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-white dark:bg-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <FiArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/20 mb-4">
            <FiMail className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-3xl font-bold text-secondary-900 dark:text-white">
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
            No worries! Enter your email address and we'll send you a reset link.
          </p>
        </div>

        <div className="bg-white dark:bg-secondary-800 shadow-xl rounded-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="input-field pl-10"
                  placeholder="Enter your email address"
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <FiAlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 flex items-center justify-center"
              >
                <FiArrowLeft className="mr-1 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-secondary-500 dark:text-secondary-400">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-500">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
