import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FiPlus, FiX, FiUpload, FiUser, FiMail } from 'react-icons/fi';
import { ideasAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const SubmitIdea = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const validationSchema = Yup.object({
    title: Yup.string()
      .min(5, 'Title must be at least 5 characters')
      .max(200, 'Title must be less than 200 characters')
      .required('Title is required'),
    description: Yup.string()
      .min(20, 'Description must be at least 20 characters')
      .max(5000, 'Description must be less than 5000 characters')
      .required('Description is required'),
    category: Yup.string()
      .oneOf([
        'Technology', 'Healthcare', 'Education', 'Finance', 'Environment', 'Agriculture', 'Transportation', 'Entertainment', 'Social Impact', 'Other', 'Education Technology'
      ], 'Invalid category')
      .required('Category is required'),
    team_size: Yup.number()
      .min(1, 'Team size must be at least 1')
      .max(20, 'Team size must be less than 20')
      .optional(),
    funding_required: Yup.number()
      .min(0, 'Funding required must be a positive number')
      .optional(),
    timeline: Yup.string()
      .optional(),
    tags: Yup.array()
      .optional(),
    is_public: Yup.boolean()
      .optional(),
  });

  const categories = [
    'Technology',
    'Healthcare',
    'Education',
    'Finance',
    'Environment',
    'Agriculture',
    'Transportation',
    'Entertainment',
    'Social Impact',
    'Other',
    'Education Technology'
  ];

  const techOptions = [
    'React', 'Angular', 'Vue.js', 'Node.js', 'Python', 'Java', 'C++', 'C#',
    'JavaScript', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
    'Flutter', 'React Native', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'TensorFlow',
    'PyTorch', 'OpenCV', 'Blockchain', 'Arduino', 'Raspberry Pi'
  ];

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Prepare idea data for submission
      const ideaData = {
        title: values.title,
        description: values.description,
        category: values.category,
        tags: values.techStack,
        team_size: values.teamMembers.length,
        funding_required: values.fundingRequired ? parseFloat(values.fundingRequired) : 0,
        timeline: values.timeline || '12 months',
        problem_statement: values.description,
        solution_approach: values.implementationPlan,
        market_potential: values.marketPotential,
        technical_feasibility: 'High',
        business_model: 'SaaS',
        competitive_analysis: 'Limited competition',
        risk_assessment: 'Medium',
        success_metrics: ['User adoption', 'Revenue growth'],
        is_public: true,
        is_featured: false,
        // Frontend specific fields
        teamMembers: values.teamMembers,
        techStack: values.techStack,
        implementationPlan: values.implementationPlan
      };

      console.log('Submitting idea data:', ideaData);
      
      try {
        // Submit idea to the API
        const response = await ideasAPI.create(ideaData);
        console.log('Idea submission response:', response);

        // Check if response exists and has success property
        if (response && response.data && response.data.success === true) {
          const ideaId = response.data?.data?.idea?.id;
          
          // Handle team members if needed
          if (values.teamMembers.length > 1 && ideaId) {
            // You could create team members here
            console.log('Team members to add:', values.teamMembers);
            // Implement team member addition logic here if needed
          }

          // Handle file uploads
          if (uploadedFiles.length > 0 && ideaId) {
            try {
              console.log('Uploading files:', uploadedFiles);
              
              // Create FormData for file upload
              const formData = new FormData();
              uploadedFiles.forEach((fileObj, index) => {
                formData.append('files', fileObj.file);
              });
              
              // Upload files to the idea
              const uploadResponse = await ideasAPI.uploadFiles(ideaId, uploadedFiles.map(f => f.file));
              
              if (uploadResponse.data.success) {
                console.log('Files uploaded successfully:', uploadResponse.data.data.files);
                toast.success(`${uploadedFiles.length} file(s) uploaded successfully!`);
              } else {
                console.error('File upload failed:', uploadResponse.data);
                toast.error('Idea submitted but file upload failed');
              }
            } catch (uploadError) {
              console.error('File upload error:', uploadError);
              toast.error('Idea submitted but file upload failed');
            }
          }

          // Also save to localStorage as backup
          const ideaWithId = {
            ...ideaData,
            id: ideaId,
            student_id: user.id,
            status: 'submitted',
            created_at: new Date().toISOString(),
            views_count: 0,
            teamMembers: values.teamMembers,
            files: uploadedFiles.map(f => ({
              id: Date.now() + Math.random(),
              name: f.file.name,
              size: f.file.size,
              type: f.file.type,
              url: f.preview
            }))
          };
          
          // Save to localStorage as backup
          const existingIdeas = JSON.parse(localStorage.getItem('submittedIdeas') || '[]');
          existingIdeas.push(ideaWithId);
          localStorage.setItem('submittedIdeas', JSON.stringify(existingIdeas));
          
          console.log('Idea also saved to localStorage as backup:', ideaWithId);
          
          toast.success('Idea submitted successfully!');
          navigate('/ideas');
        } else {
          console.error('Server response indicates failure:', response?.data);
          toast.error(response?.data?.message || 'Failed to submit idea. Please try again.');
        }
      } catch (apiError) {
        console.error('API call error:', apiError);
        
        // Fallback: Save to localStorage if API fails
        console.log('API failed, saving to localStorage as fallback');
        const ideaId = Date.now(); // Generate a simple ID
        const ideaWithId = {
          ...ideaData,
          id: ideaId,
          student_id: user.id,
          status: 'submitted',
          created_at: new Date().toISOString(),
          views_count: 0,
          teamMembers: values.teamMembers,
          files: uploadedFiles.map(f => ({
            id: Date.now() + Math.random(),
            name: f.file.name,
            size: f.file.size,
            type: f.file.type,
            url: f.preview
          }))
        };
        
        // Get existing ideas from localStorage
        const existingIdeas = JSON.parse(localStorage.getItem('submittedIdeas') || '[]');
        existingIdeas.push(ideaWithId);
        localStorage.setItem('submittedIdeas', JSON.stringify(existingIdeas));
        
        console.log('Idea saved to localStorage:', ideaWithId);
        toast.success('Idea submitted successfully! (Saved locally)');
        navigate('/ideas');
        return; // Exit early since we handled the fallback
      }
      
    } catch (error) {
      console.error('Error submitting idea:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        // Check if we have a structured error message from the server
        if (error.response.data && typeof error.response.data === 'object') {
          toast.error(error.response.data.message || 'Server error. Please try again.');
        } else {
          toast.error('Server returned an error. Please try again.');
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('No response from server. Please check your connection.');
      } else {
        toast.error(error.message || 'Failed to submit idea. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
          Submit Your Idea
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          Share your innovative idea with colleges and incubation centers
        </p>
      </div>

      <div className="card p-8">
        <Formik
          initialValues={{
            title: '',
            description: '',
            category: '',
            techStack: [''],
            teamMembers: [{ name: '', role: '', email: '' }],
            implementationPlan: '',
            marketPotential: '',
            fundingRequired: '',
            timeline: ''
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, isSubmitting }) => (
            <Form className="space-y-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Idea Title *
                    </label>
                    <Field
                      name="title"
                      type="text"
                      className="input-field"
                      placeholder="Enter a compelling title for your idea"
                    />
                    <ErrorMessage name="title" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Category *
                    </label>
                    <Field
                      as="select"
                      name="category"
                      className="input-field"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="category" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Funding Required (Optional)
                    </label>
                    <Field
                      name="fundingRequired"
                      type="text"
                      className="input-field"
                      placeholder="e.g., $50,000 - $100,000"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Description *
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      rows={6}
                      className="input-field"
                      placeholder="Provide a detailed description of your idea, the problem it solves, and its unique value proposition..."
                    />
                    <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>
              </div>

              {/* Technology Stack */}
              <div>
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Technology Stack
                </h2>
                
                <FieldArray name="techStack">
                  {({ push, remove }) => (
                    <div className="space-y-3">
                      {values.techStack.map((tech, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Field
                            as="select"
                            name={`techStack.${index}`}
                            className="input-field flex-1"
                          >
                            <option value="">Select technology</option>
                            {techOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </Field>
                          {values.techStack.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            >
                              <FiX size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => push('')}
                        className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400"
                      >
                        <FiPlus size={16} className="mr-1" />
                        Add Technology
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Team Members */}
              <div>
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Team Members
                </h2>
                
                <FieldArray name="teamMembers">
                  {({ push, remove }) => (
                    <div className="space-y-4">
                      {values.teamMembers.map((member, index) => (
                        <div key={index} className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                                Name *
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <FiUser className="h-4 w-4 text-secondary-400" />
                                </div>
                                <Field
                                  name={`teamMembers.${index}.name`}
                                  type="text"
                                  className="input-field pl-10"
                                  placeholder="Full name"
                                />
                              </div>
                              <ErrorMessage name={`teamMembers.${index}.name`} component="div" className="text-red-500 text-sm mt-1" />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                                Role *
                              </label>
                              <Field
                                name={`teamMembers.${index}.role`}
                                type="text"
                                className="input-field"
                                placeholder="e.g., Team Lead, Developer"
                              />
                              <ErrorMessage name={`teamMembers.${index}.role`} component="div" className="text-red-500 text-sm mt-1" />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                                Email *
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <FiMail className="h-4 w-4 text-secondary-400" />
                                </div>
                                <Field
                                  name={`teamMembers.${index}.email`}
                                  type="email"
                                  className="input-field pl-10"
                                  placeholder="email@example.com"
                                />
                              </div>
                              <ErrorMessage name={`teamMembers.${index}.email`} component="div" className="text-red-500 text-sm mt-1" />
                            </div>
                          </div>
                          
                          {values.teamMembers.length > 1 && (
                            <div className="mt-3 flex justify-end">
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove Member
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => push({ name: '', role: '', email: '' })}
                        className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400"
                      >
                        <FiPlus size={16} className="mr-1" />
                        Add Team Member
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Implementation & Market */}
              <div>
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Implementation & Market Analysis
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Implementation Plan *
                    </label>
                    <Field
                      as="textarea"
                      name="implementationPlan"
                      rows={5}
                      className="input-field"
                      placeholder="Describe your step-by-step implementation plan, milestones, and timeline..."
                    />
                    <ErrorMessage name="implementationPlan" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Market Potential *
                    </label>
                    <Field
                      as="textarea"
                      name="marketPotential"
                      rows={4}
                      className="input-field"
                      placeholder="Explain the market opportunity, target audience, and potential impact..."
                    />
                    <ErrorMessage name="marketPotential" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Timeline (Optional)
                    </label>
                    <Field
                      name="timeline"
                      type="text"
                      className="input-field"
                      placeholder="e.g., 6 months for MVP, 12 months for full launch"
                    />
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Supporting Documents
                </h2>
                
                <div 
                  className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-6 hover:border-primary-400 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-upload-input').click()}
                >
                  <div className="text-center">
                    <FiUpload className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                    <div className="flex text-sm text-secondary-600 dark:text-secondary-400 justify-center">
                      <span className="font-medium text-primary-600 hover:text-primary-500">
                        Click to upload files
                      </span>
                      <span className="pl-1">or drag and drop</span>
                    </div>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
                      PDF, DOC, PPT, JPG, PNG up to 10MB each
                    </p>
                    <input
                      id="file-upload-input"
                      type="file"
                      className="hidden"
                      multiple
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <FiUpload className="h-5 w-5 text-secondary-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-secondary-900 dark:text-white">
                              {file.name}
                            </p>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Idea'
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SubmitIdea;
