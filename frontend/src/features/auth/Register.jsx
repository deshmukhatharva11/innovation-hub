import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiHome } from 'react-icons/fi';
import { loginSuccess } from '../../store/slices/authSlice';
import { authAPI, collegesAPI, incubatorManagementAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(false);
  const [collegesError, setCollegesError] = useState(null);
  const [incubators, setIncubators] = useState([]);
  const [incubatorsLoading, setIncubatorsLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // Fetch colleges based on district - simplified and reliable
  const fetchColleges = async (district) => {
    if (!district) {
      setColleges([]);
      return;
    }

    setCollegesLoading(true);
    setCollegesError(null);
    
    try {
      console.log('🔍 Fetching colleges for district:', district);
      console.log('🔍 API call params:', { district });
      const response = await collegesAPI.getPublic({ district });
      console.log('🔍 API response:', response);
      
      if (response.data?.success && response.data?.data?.colleges) {
        setColleges(response.data.data.colleges);
        console.log('✅ Successfully fetched colleges:', response.data.data.colleges.length);
        console.log('Colleges:', response.data.data.colleges.map(c => c.name));
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error('❌ Error fetching colleges:', err);
      setCollegesError('Failed to load colleges');
      setColleges([]);
    } finally {
      setCollegesLoading(false);
    }
  };

  // Handle district selection - immediate and direct
  const handleDistrictChange = (district, setFieldValue) => {
    console.log('🎯 District changed to:', district);
    
    // Update state immediately
    setSelectedDistrict(district);
    
    // Reset college selection
    setFieldValue('college_id', '');
    
    // Fetch colleges immediately
    if (district) {
      fetchColleges(district);
    } else {
      setColleges([]);
    }
  };

  // Auto-fetch colleges when district changes (backup mechanism)
  useEffect(() => {
    if (selectedDistrict) {
      console.log('🔄 useEffect triggered for district:', selectedDistrict);
      fetchColleges(selectedDistrict);
    } else {
      setColleges([]);
    }
  }, [selectedDistrict]);

  // Fetch incubators on component mount
  useEffect(() => {
    const fetchIncubators = async () => {
      setIncubatorsLoading(true);
      try {
        const response = await incubatorManagementAPI.getAll();
        
        if (response.data?.success && response.data?.data?.incubators) {
          setIncubators(response.data.data.incubators);
        } else {
          setIncubators([]);
        }
      } catch (err) {
        console.error('Incubators loading error:', err);
        setIncubators([]);
      } finally {
        setIncubatorsLoading(false);
      }
    };

    fetchIncubators();
  }, []);

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  
  role: Yup.string()
    .oneOf(['student', 'college_admin', 'incubator_manager'], 'Please select a valid role')
    .required('Role is required'),
  
  district: Yup.string()
    .when('role', {
      is: (role) => role === 'student' || role === 'college_admin',
      then: () => Yup.string().required('District is required'),
      otherwise: () => Yup.string().notRequired(),
    }),
  
  college_id: Yup.number()
    .when('role', {
      is: (role) => role === 'student' || role === 'college_admin',
      then: () => Yup.number().typeError('Please select a college').required('College is required'),
      otherwise: () => Yup.number().notRequired(),
    }),
  
  organization: Yup.string()
    .when('role', {
      is: 'incubator_manager',
      then: () => Yup.string().required('Organization name is required'),
      otherwise: () => Yup.string().notRequired(),
    }),
  
  phone: Yup.string()
    .matches(/^[\+]?[\d\s\-()]+$/, 'Invalid phone number')
    .required('Phone number is required'),
});

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        phone: values.phone,
      };
      if (values.role === 'student' || values.role === 'college_admin') {
        payload.college_id = parseInt(values.college_id);
      }
      if (values.role === 'incubator_manager') {
        payload.organization = values.organization;
      }
      const response = await authAPI.register(payload);
      
      if (response.data?.success) {
        if (response.data?.data?.email_verification_required) {
          // Email verification required
          toast.success('Account created! Please check your email for verification.');
          navigate('/email-verification', { 
            state: { 
              email: values.email,
              message: response.data.message 
            } 
          });
        } else if (response.data?.data?.user && response.data?.data?.token) {
          // Direct login (fallback)
          const user = response.data.data.user;
          const token = response.data.data.token;
          dispatch(loginSuccess({ user, token }));
          toast.success('Account created successfully!');
          navigate('/dashboard');
        } else {
          throw new Error('Invalid response from server');
        }
      } else {
        throw new Error(response.data?.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-secondary-900 dark:text-white">
          Create Account
        </h2>
        <p className="text-secondary-600 dark:text-secondary-400 mt-2">
          Join the innovation community today
        </p>
      </div>

      <Formik
        initialValues={{
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: '',
          district: '',
          college_id: '',
          organization: '',
          phone: ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue }) => {

          return (
          <Form className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-secondary-400" />
                </div>
                <Field
                  name="name"
                  type="text"
                  className="input-field pl-10"
                  placeholder="Enter your full name"
                />
              </div>
              <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
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

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Role
              </label>
              <Field
                as="select"
                name="role"
                className="input-field"
              >
                <option value="">Select your role</option>
                <option value="student">Student</option>
                <option value="college_admin">College Administrator</option>
                <option value="incubator_manager">Incubation Center</option>
              </Field>
              <ErrorMessage name="role" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            {/* District Field */}
            {(values.role === 'student' || values.role === 'college_admin') && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  District *
                </label>
                <Field
                  as="select"
                  name="district"
                  className="input-field"
                  onChange={(e) => {
                    const newDistrict = e.target.value;
                    console.log('District field onChange called with:', newDistrict);
                    setFieldValue('district', newDistrict);
                    handleDistrictChange(newDistrict, setFieldValue);
                  }}
                >
                  <option value="">Select your district</option>
                  <option value="Akola">Akola</option>
                  <option value="Amravati">Amravati</option>
                  <option value="Buldhana">Buldhana</option>
                  <option value="Washim">Washim</option>
                  <option value="Yavatmal">Yavatmal</option>
                </Field>
                <ErrorMessage name="district" component="div" className="text-red-500 text-sm mt-1" />
              </div>
            )}

            {/* Organization Field */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                {values.role === 'student' ? 'College/University' : 
                 values.role === 'college_admin' ? 'College Name' : 
                 'Incubation Center'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiHome className="h-5 w-5 text-secondary-400" />
                </div>
                {values.role === 'student' || values.role === 'college_admin' ? (
                  <Field
                    as="select"
                    name="college_id"
                    className="input-field pl-10"
                    disabled={collegesLoading}
                  >
                    <option value="">
                      {collegesLoading 
                        ? 'Loading colleges...' 
                        : selectedDistrict 
                          ? `Select college from ${selectedDistrict}` 
                          : 'Select your college'
                      }
                    </option>
                    {colleges.map((college) => (
                      <option key={college.id} value={college.id}>
                        {college.name}
                      </option>
                    ))}
                  </Field>
                ) : (
                  <Field
                    as="select"
                    name="organization"
                    className="input-field pl-10"
                    disabled={incubatorsLoading}
                  >
                    <option value="">Select incubation center</option>
                    {incubators.map((incubator) => (
                      <option key={incubator.id} value={incubator.name}>
                        {incubator.name}
                      </option>
                    ))}
                  </Field>
                )}
              </div>
              {values.role === 'student' || values.role === 'college_admin' ? (
                <>
                  <ErrorMessage name="college_id" component="div" className="text-red-500 text-sm mt-1" />
                  {collegesLoading && <div className="text-blue-500 text-sm mt-1">Loading colleges...</div>}
                  {collegesError && <div className="text-red-500 text-sm mt-1">{collegesError}</div>}
                </>
              ) : (
                <>
                  <ErrorMessage name="organization" component="div" className="text-red-500 text-sm mt-1" />
                  {incubatorsLoading && <div className="text-blue-500 text-sm mt-1">Loading incubation centers...</div>}
                </>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Phone Number
              </label>
              <Field
                name="phone"
                type="tel"
                className="input-field"
                placeholder="Enter your phone number"
              />
              <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
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
                  placeholder="Create a password"
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-secondary-400" />
                </div>
                <Field
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-secondary-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-secondary-400" />
                  )}
                </button>
              </div>
              <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <span className="ml-2 text-sm text-secondary-600 dark:text-secondary-400">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </Link>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </Form>
          );
        }}
      </Formik>

      {/* Sign In Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-secondary-600 dark:text-secondary-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
