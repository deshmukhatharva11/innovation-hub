import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { FiPlus, FiTrash2, FiUpload, FiX, FiFileText } from 'react-icons/fi';
import { ideasAPI } from '../../services/api';
import { useSelector } from 'react-redux';

const validationSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(50, 'Description must be at least 50 characters')
    .max(1000, 'Description must not exceed 1000 characters'),
  category: Yup.string().required('Category is required'),
  techStack: Yup.array()
    .of(Yup.string().required('Tech stack item is required'))
    .min(1, 'At least one tech stack item is required'),
  teamMembers: Yup.array()
    .of(
      Yup.object({
        name: Yup.string().required('Name is required'),
        role: Yup.string().required('Role is required'),
        email: Yup.string().email('Invalid email').required('Email is required')
      })
    )
    .min(1, 'At least one team member is required'),
  implementationPlan: Yup.string()
    .required('Implementation plan is required')
    .min(100, 'Implementation plan must be at least 100 characters'),
  marketPotential: Yup.string()
    .required('Market potential is required')
    .min(50, 'Market potential must be at least 50 characters'),
  fundingRequired: Yup.string().required('Funding required is required'),
  timeline: Yup.string().required('Timeline is required')
});

const EditIdea = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [idea, setIdea] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);

  useEffect(() => {
    fetchIdeaDetails();
  }, [id]);

  const fetchIdeaDetails = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first
      let apiIdea = null;
      try {
        const response = await ideasAPI.getById(id);
        if (response.data && response.data.success) {
          apiIdea = response.data.data.idea;
          console.log('✅ API idea data:', apiIdea);
        }
      } catch (apiError) {
        console.log('⚠️ API fetch failed, trying localStorage:', apiError.message);
      }
      
      // Fallback to localStorage
      const possibleKeys = ['submittedIdeas', 'ideas', 'userIdeas', 'myIdeas'];
      let foundIdea = null;
      
      for (const key of possibleKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            let ideas = [];
            
            if (Array.isArray(parsed)) {
              ideas = parsed;
            } else if (parsed && typeof parsed === 'object' && parsed.ideas) {
              ideas = parsed.ideas;
            }
            
            foundIdea = ideas.find(idea => idea.id === parseInt(id));
            if (foundIdea) break;
          } catch (e) {
            console.warn(`Failed to parse localStorage key '${key}':`, e);
          }
        }
      }
      
      // Use localStorage data if found, otherwise use API data
      const sourceIdea = foundIdea || apiIdea;
      
      if (sourceIdea) {
        // Parse JSON fields from database
        const parseJsonField = (field, defaultValue) => {
          if (!field) return defaultValue;
          if (Array.isArray(field)) return field;
          if (typeof field === 'string') {
            try {
              return JSON.parse(field);
            } catch (e) {
              console.warn('Failed to parse JSON field:', field);
              return defaultValue;
            }
          }
          return field;
        };

        // Normalize the data structure
        const normalizedIdea = {
          ...sourceIdea,
          tech_stack: parseJsonField(sourceIdea.tech_stack || sourceIdea.techStack, ['']),
          team_members: parseJsonField(sourceIdea.team_members || sourceIdea.teamMembers, [{ name: '', role: '', email: '' }]),
          implementation_plan: sourceIdea.implementation_plan || sourceIdea.implementationPlan || '',
          market_potential: sourceIdea.market_potential || sourceIdea.marketPotential || '',
          funding_required: sourceIdea.funding_required || sourceIdea.fundingRequired || '',
          timeline: sourceIdea.timeline || ''
        };
        
        setIdea(normalizedIdea);
        
        // Set existing files if any
        if (sourceIdea.files && Array.isArray(sourceIdea.files)) {
          setExistingFiles(sourceIdea.files);
          console.log('✅ Existing files loaded:', sourceIdea.files);
        }
        
        console.log('✅ Idea loaded from source:', foundIdea ? 'localStorage' : 'API', normalizedIdea);
        console.log('✅ Normalized fields:', {
          title: normalizedIdea.title,
          description: normalizedIdea.description,
          category: normalizedIdea.category,
          tech_stack: normalizedIdea.tech_stack,
          team_members: normalizedIdea.team_members,
          implementation_plan: normalizedIdea.implementation_plan,
          market_potential: normalizedIdea.market_potential,
          funding_required: normalizedIdea.funding_required,
          timeline: normalizedIdea.timeline
        });
      } else {
        toast.error('Idea not found');
        navigate('/ideas/my');
      }
      
    } catch (error) {
      console.error('Error fetching idea:', error);
      toast.error('Failed to load idea details');
      navigate('/ideas/my');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const removeExistingFile = (index) => {
    setExistingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      console.log('🔄 Starting idea update process...');
      console.log('📝 Form values:', values);
      console.log('📁 Existing files:', existingFiles);
      console.log('📁 New files:', uploadedFiles);
      
      const ideaData = {
        title: values.title,
        description: values.description,
        category: values.category,
        techStack: values.techStack,
        implementationPlan: values.implementationPlan,
        marketPotential: values.marketPotential,
        fundingRequired: values.fundingRequired,
        timeline: values.timeline,
        teamMembers: values.teamMembers,
        files: uploadedFiles.map(f => f.file),
        existing_files: existingFiles
      };

      console.log('📦 Prepared idea data:', ideaData);

      // Try to update via API first (primary method for production)
      try {
        console.log('🌐 Attempting API update...');
        const response = await ideasAPI.update(id, ideaData);
        console.log('✅ API update response:', response.data);
        
        if (response.data && response.data.success) {
          toast.success('Idea updated successfully!');
          
          // Update localStorage as backup only after successful API update
          const existingIdeas = JSON.parse(localStorage.getItem('submittedIdeas') || '[]');
          const updatedIdeas = existingIdeas.map(idea => 
            idea.id === parseInt(id) ? { 
              ...idea, 
              ...ideaData,
              tech_stack: values.techStack,
              team_members: values.teamMembers,
              implementation_plan: values.implementationPlan,
              market_potential: values.marketPotential,
              funding_required: values.fundingRequired,
              files: [...existingFiles, ...uploadedFiles.map(f => ({
                id: f.id,
                name: f.file.name,
                size: f.file.size,
                type: f.file.type,
                url: f.preview
              }))],
              updated_at: new Date().toISOString() 
            } : idea
          );
          
          console.log('💾 Updating localStorage backup with:', updatedIdeas);
          localStorage.setItem('submittedIdeas', JSON.stringify(updatedIdeas));
          
          // Dispatch custom event to notify other components
          console.log('📡 Dispatching ideaUpdated event for idea ID:', id);
          window.dispatchEvent(new CustomEvent('ideaUpdated', { detail: { ideaId: id } }));
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (apiError) {
        console.log('⚠️ API update failed, falling back to localStorage:', apiError.message);
        
        // Fallback to localStorage only if API fails
        const existingIdeas = JSON.parse(localStorage.getItem('submittedIdeas') || '[]');
        const updatedIdeas = existingIdeas.map(idea => 
          idea.id === parseInt(id) ? { 
            ...idea, 
            ...ideaData,
            tech_stack: values.techStack,
            team_members: values.teamMembers,
            implementation_plan: values.implementationPlan,
            market_potential: values.marketPotential,
            funding_required: values.fundingRequired,
            files: [...existingFiles, ...uploadedFiles.map(f => ({
              id: f.id,
              name: f.file.name,
              size: f.file.size,
              type: f.file.type,
              url: f.preview
            }))],
            updated_at: new Date().toISOString() 
          } : idea
        );
        
        console.log('💾 Updating localStorage fallback with:', updatedIdeas);
        localStorage.setItem('submittedIdeas', JSON.stringify(updatedIdeas));
        
        // Dispatch custom event to notify other components
        console.log('📡 Dispatching ideaUpdated event for idea ID:', id);
        window.dispatchEvent(new CustomEvent('ideaUpdated', { detail: { ideaId: id } }));
        
        toast.success('Idea updated successfully!');
      }
      
      // Navigate back to ideas list
      setTimeout(() => {
        navigate('/ideas/my');
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error updating idea:', error);
      toast.error('Failed to update idea. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
            Idea Not Found
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">
            The idea you're looking for doesn't exist or you don't have permission to edit it.
          </p>
          <button
            onClick={() => navigate('/ideas/my')}
            className="btn btn-primary"
          >
            Back to My Ideas
          </button>
        </div>
      </div>
    );
  }

  // Check if idea can be edited (only if in nurture status and not upgraded)
  const canEdit = (idea.status === 'submitted' || idea.status === 'new_submission' || idea.status === 'nurture') && !idea.is_upgraded;
  
  if (!canEdit) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
            Idea Cannot Be Edited
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">
            {idea.status === 'endorsed' 
              ? 'This idea has been endorsed by a college administrator and is now read-only.'
              : idea.is_upgraded
              ? 'This idea has been upgraded and is now under review. It can no longer be edited.'
              : 'This idea has been evaluated and can no longer be edited.'
            }
            <br />
            Current status: <span className="font-semibold capitalize">{idea.status?.replace('_', ' ')}</span>
            {idea.is_upgraded && (
              <><br />
              <span className="text-purple-600 font-semibold">✨ Upgraded</span>
              </>
            )}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/ideas/my')}
              className="btn btn-secondary"
            >
              Back to My Ideas
            </button>
            <button
              onClick={() => navigate(`/ideas/${idea.id}`)}
              className="btn btn-primary"
            >
              View Idea Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('🔍 EditIdea render - idea data:', idea);
  console.log('🔍 EditIdea render - existingFiles:', existingFiles);
  console.log('🔍 EditIdea render - uploadedFiles:', uploadedFiles);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
          Edit Your Idea
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          Update your innovative idea details
        </p>
        {/* Debug info */}
        {idea && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">Debug Info:</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Title: {idea.title} | Category: {idea.category} | Tech Stack: {JSON.stringify(idea.tech_stack || idea.techStack)} | 
              Team Members: {JSON.stringify(idea.team_members || idea.teamMembers)} | 
              Implementation Plan: {idea.implementation_plan || idea.implementationPlan} | 
              Market Potential: {idea.market_potential || idea.marketPotential}
            </p>
          </div>
        )}
      </div>

      <div className="card p-8">
        <Formik
          enableReinitialize={true}
          initialValues={{
            title: idea?.title || '',
            description: idea?.description || '',
            category: idea?.category || '',
            techStack: idea?.tech_stack || idea?.techStack || [''],
            teamMembers: idea?.team_members || idea?.teamMembers || [{ name: '', role: '', email: '' }],
            implementationPlan: idea?.implementation_plan || idea?.implementationPlan || '',
            marketPotential: idea?.market_potential || idea?.marketPotential || '',
            fundingRequired: idea?.funding_required || idea?.fundingRequired || '',
            timeline: idea?.timeline || ''
          }}
          key={idea?.id || 'loading'} // Force re-render when idea changes
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Idea Title *
                    </label>
                    <Field
                      name="title"
                      type="text"
                      className="input-field"
                      placeholder="Enter your idea title"
                    />
                    {errors.title && touched.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Category *
                    </label>
                    <Field
                      name="category"
                      as="select"
                      className="input-field"
                    >
                      <option value="">Select category</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="finance">Finance</option>
                      <option value="agriculture">Agriculture</option>
                      <option value="environment">Environment</option>
                      <option value="social">Social Impact</option>
                      <option value="other">Other</option>
                    </Field>
                    {errors.category && touched.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Description *
                  </label>
                  <Field
                    name="description"
                    as="textarea"
                    rows={4}
                    className="input-field"
                    placeholder="Describe your idea in detail"
                  />
                  {errors.description && touched.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                  Technology Stack
                </h3>
                <FieldArray name="techStack">
                  {({ push, remove }) => (
                    <div className="space-y-3">
                      {values.techStack.map((tech, index) => (
                        <div key={index} className="flex gap-3">
                          <Field
                            name={`techStack.${index}`}
                            type="text"
                            className="input-field flex-1"
                            placeholder="Enter technology"
                          />
                          {values.techStack.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="btn btn-secondary"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => push('')}
                        className="btn btn-outline"
                      >
                        <FiPlus className="w-4 h-4 mr-2" />
                        Add Technology
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Team Members */}
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                  Team Members
                </h3>
                <FieldArray name="teamMembers">
                  {({ push, remove }) => (
                    <div className="space-y-4">
                      {values.teamMembers.map((member, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                              Name
                            </label>
                            <Field
                              name={`teamMembers.${index}.name`}
                              type="text"
                              className="input-field"
                              placeholder="Full name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                              Role
                            </label>
                            <Field
                              name={`teamMembers.${index}.role`}
                              type="text"
                              className="input-field"
                              placeholder="Role/Position"
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                                Email
                              </label>
                              <Field
                                name={`teamMembers.${index}.email`}
                                type="email"
                                className="input-field"
                                placeholder="email@example.com"
                              />
                            </div>
                            {values.teamMembers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="btn btn-secondary"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => push({ name: '', role: '', email: '' })}
                        className="btn btn-outline"
                      >
                        <FiPlus className="w-4 h-4 mr-2" />
                        Add Team Member
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Implementation Details */}
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                  Implementation Details
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Implementation Plan *
                    </label>
                    <Field
                      name="implementationPlan"
                      as="textarea"
                      rows={4}
                      className="input-field"
                      placeholder="Describe how you plan to implement this idea"
                    />
                    {errors.implementationPlan && touched.implementationPlan && (
                      <p className="text-red-500 text-sm mt-1">{errors.implementationPlan}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Market Potential *
                    </label>
                    <Field
                      name="marketPotential"
                      as="textarea"
                      rows={3}
                      className="input-field"
                      placeholder="Explain the market potential and target audience"
                    />
                    {errors.marketPotential && touched.marketPotential && (
                      <p className="text-red-500 text-sm mt-1">{errors.marketPotential}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                        Funding Required *
                      </label>
                      <Field
                        name="fundingRequired"
                        type="text"
                        className="input-field"
                        placeholder="e.g., ₹50,000 - ₹1,00,000"
                      />
                      {errors.fundingRequired && touched.fundingRequired && (
                        <p className="text-red-500 text-sm mt-1">{errors.fundingRequired}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                        Timeline *
                      </label>
                      <Field
                        name="timeline"
                        type="text"
                        className="input-field"
                        placeholder="e.g., 6 months, 1 year"
                      />
                      {errors.timeline && touched.timeline && (
                        <p className="text-red-500 text-sm mt-1">{errors.timeline}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                  Supporting Documents
                </h3>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <FiUpload className="w-8 h-8 text-secondary-400 mb-2" />
                      <span className="text-sm text-secondary-600 dark:text-secondary-400">
                        Click to upload files or drag and drop
                      </span>
                      <span className="text-xs text-secondary-500 dark:text-secondary-500 mt-1">
                        PDF, DOC, PPT, JPG, PNG up to 10MB each
                      </span>
                    </label>
                  </div>

                  {existingFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                        Existing Files:
                      </h4>
                      {existingFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                        >
                          <div className="flex items-center space-x-3">
                            <FiFileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-secondary-700 dark:text-secondary-300">
                              {file.name || file.file?.name || `File ${index + 1}`}
                            </span>
                            {file.size && (
                              <span className="text-xs text-secondary-500">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExistingFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                        Uploaded Files:
                      </h4>
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg"
                        >
                          <span className="text-sm text-secondary-700 dark:text-secondary-300">
                            {file.file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-secondary-200 dark:border-secondary-700">
                <button
                  type="button"
                  onClick={() => navigate('/ideas/my')}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Updating...' : 'Update Idea'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EditIdea;
