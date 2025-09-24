import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FiMapPin, FiUsers, FiCalendar, FiSave, FiCheck, FiX, FiSearch } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { collegeManagementAPI } from '../../services/api';

const CollegeRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingCollege, setIsCheckingCollege] = useState(false);
  const [collegeExists, setCollegeExists] = useState(null);
  const [existingCollegeInfo, setExistingCollegeInfo] = useState(null);

  // Function to check if college already exists
  const checkCollegeExists = async (name, email) => {
    if (!name || !email) {
      setCollegeExists(null);
      setExistingCollegeInfo(null);
      return;
    }

    setIsCheckingCollege(true);
    try {
      // Get all colleges and check for duplicates
      const response = await collegeManagementAPI.getAll({ search: name });
      
      if (response.data?.success && response.data?.data?.colleges) {
        const colleges = response.data.data.colleges;
        
        // Check for exact name match or email match
        const existingCollege = colleges.find(college => 
          college.name.toLowerCase() === name.toLowerCase() || 
          college.contact_email.toLowerCase() === email.toLowerCase()
        );
        
        if (existingCollege) {
          setCollegeExists(true);
          setExistingCollegeInfo(existingCollege);
          toast.error(`College already exists! Name: ${existingCollege.name}, Email: ${existingCollege.contact_email}`);
        } else {
          setCollegeExists(false);
          setExistingCollegeInfo(null);
          toast.success('College name and email are available for registration');
        }
      }
    } catch (error) {
      console.error('Error checking college existence:', error);
      setCollegeExists(null);
      setExistingCollegeInfo(null);
    } finally {
      setIsCheckingCollege(false);
    }
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'College name must be at least 2 characters')
      .required('College name is required'),
    
    district: Yup.string()
      .oneOf(['Akola', 'Amravati', 'Buldhana', 'Washim', 'Yavatmal'], 'Please select a valid district')
      .required('District is required'),
    
    location: Yup.string()
      .min(2, 'Location must be at least 2 characters')
      .required('Location is required'),
    
    established_year: Yup.number()
      .min(1800, 'Established year must be after 1800')
      .max(new Date().getFullYear(), 'Established year cannot be in the future')
      .required('Established year is required'),
    
    
    contact_email: Yup.string()
      .email('Invalid email address')
      .required('Contact email is required'),
    
    contact_phone: Yup.string()
      .matches(/^[\+]?[\d\s\-()]+$/, 'Invalid phone number')
      .required('Contact phone is required'),
    
    website: Yup.string()
      .url('Invalid website URL')
      .notRequired(),
    
    description: Yup.string()
      .min(10, 'Description must be at least 10 characters')
      .required('Description is required')
  });

  const handleSubmit = async (values, { resetForm }) => {
    // Prevent submission if college already exists
    if (collegeExists) {
      toast.error('Cannot register college - it already exists in the system!');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Call the actual API to register college
      const response = await collegeManagementAPI.create({
        name: values.name,
        city: values.location, // Map location to city
        state: 'Maharashtra', // Default state
        district: values.district,
        established_year: parseInt(values.established_year),
        contact_email: values.contact_email,
        contact_phone: values.contact_phone,
        website: values.website || null,
        description: values.description,
        address: values.location // Use location as address
      });
      
      if (response.data?.success) {
        toast.success('College registered successfully!');
        resetForm();
        setCollegeExists(null);
        setExistingCollegeInfo(null);
      } else {
        throw new Error(response.data?.message || 'Failed to register college');
      }
      
    } catch (error) {
      console.error('College registration error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        const existingCollege = error.response?.data?.data?.existing;
        setCollegeExists(true);
        setExistingCollegeInfo(existingCollege);
        toast.error(`College already exists! Name: ${existingCollege?.name}, Email: ${existingCollege?.email}`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to register college. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          College Registration
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Register new colleges to be added to the SGBAU Pre-Incubation Centre network
        </p>
      </div>

      <div className="card p-6">
        <Formik
          initialValues={{
            name: '',
            district: '',
            location: '',
            established_year: '',
            contact_email: '',
            contact_phone: '',
            website: '',
            description: ''
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting: formSubmitting, values, setFieldValue }) => (
            <Form className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    College Name *
                  </label>
                  <div className="relative">
                    <Field
                      name="name"
                      type="text"
                      className={`input-field pr-10 ${collegeExists === true ? 'border-red-500' : collegeExists === false ? 'border-green-500' : ''}`}
                      placeholder="Enter college name"
                      onChange={(e) => {
                        setFieldValue('name', e.target.value);
                        // Check college existence when both name and email are available
                        if (e.target.value && values.contact_email) {
                          checkCollegeExists(e.target.value, values.contact_email);
                        }
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {isCheckingCollege ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      ) : collegeExists === true ? (
                        <FiX className="h-5 w-5 text-red-500" />
                      ) : collegeExists === false ? (
                        <FiCheck className="h-5 w-5 text-green-500" />
                      ) : null}
                    </div>
                  </div>
                  <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                  {collegeExists === true && existingCollegeInfo && (
                    <div className="text-red-600 text-sm mt-1 bg-red-50 p-2 rounded">
                      <strong>College already exists:</strong><br />
                      Name: {existingCollegeInfo.name}<br />
                      Email: {existingCollegeInfo.contact_email}<br />
                      District: {existingCollegeInfo.district}
                    </div>
                  )}
                  {collegeExists === false && (
                    <div className="text-green-600 text-sm mt-1 bg-green-50 p-2 rounded">
                      ✓ College name and email are available for registration
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    District *
                  </label>
                  <Field
                    as="select"
                    name="district"
                    className="input-field"
                  >
                    <option value="">Select district</option>
                    <option value="Akola">Akola</option>
                    <option value="Amravati">Amravati</option>
                    <option value="Buldhana">Buldhana</option>
                    <option value="Washim">Washim</option>
                    <option value="Yavatmal">Yavatmal</option>
                  </Field>
                  <ErrorMessage name="district" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <Field
                      name="location"
                      type="text"
                      className="input-field pl-10"
                      placeholder="Enter location"
                    />
                  </div>
                  <ErrorMessage name="location" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Established Year *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <Field
                      name="established_year"
                      type="number"
                      className="input-field pl-10"
                      placeholder="e.g., 1990"
                    />
                  </div>
                  <ErrorMessage name="established_year" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>


              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Email *
                  </label>
                  <Field
                    name="contact_email"
                    type="email"
                    className={`input-field ${collegeExists === true ? 'border-red-500' : collegeExists === false ? 'border-green-500' : ''}`}
                    placeholder="Enter contact email"
                    onChange={(e) => {
                      setFieldValue('contact_email', e.target.value);
                      // Check college existence when both name and email are available
                      if (e.target.value && values.name) {
                        checkCollegeExists(values.name, e.target.value);
                      }
                    }}
                  />
                  <ErrorMessage name="contact_email" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Phone *
                  </label>
                  <Field
                    name="contact_phone"
                    type="tel"
                    className="input-field"
                    placeholder="Enter contact phone"
                  />
                  <ErrorMessage name="contact_phone" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website URL
                  </label>
                  <Field
                    name="website"
                    type="url"
                    className="input-field"
                    placeholder="https://www.college.edu"
                  />
                  <ErrorMessage name="website" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <Field
                  as="textarea"
                  name="description"
                  rows={4}
                  className="input-field"
                  placeholder="Describe the college, its programs, and innovation initiatives..."
                />
                <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => checkCollegeExists(values.name, values.contact_email)}
                  disabled={!values.name || !values.contact_email || isCheckingCollege}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isCheckingCollege ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Checking...
                    </>
                  ) : (
                    <>
                      <FiSearch className="mr-2" size={16} />
                      Check College
                    </>
                  )}
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting || formSubmitting || collegeExists === true}
                  className={`btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                    collegeExists === true ? 'bg-red-500 hover:bg-red-600' : ''
                  }`}
                >
                  {isSubmitting || formSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Registering College...
                    </>
                  ) : collegeExists === true ? (
                    <>
                      <FiX className="mr-2" size={16} />
                      College Already Exists
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" size={16} />
                      Register College
                    </>
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {/* Information Panel */}
      <div className="mt-8 card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Registration Information
        </h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>• Registered colleges will be automatically added to the student registration dropdown</p>
          <p>• Colleges will be categorized by district for easy filtering</p>
          <p>• Innovation rating helps in prioritizing support and resources</p>
          <p>• Contact information will be used for official communications</p>
          <p>• All registered colleges will be visible in the district-wise listings on the homepage</p>
        </div>
      </div>
    </div>
  );
};

export default CollegeRegistration;
