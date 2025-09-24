import React, { useState } from 'react';
import { FiUpload, FiFileText, FiUser, FiMail, FiPhone, FiMapPin, FiTag, FiDollarSign, FiTarget, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const SubmitIdea = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    targetAudience: '',
    marketSize: '',
    budget: '',
    timeline: '',
    teamSize: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    college: '',
    attachments: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Your idea has been submitted successfully!');
      setFormData({
        title: '', description: '', category: '', targetAudience: '', marketSize: '',
        budget: '', timeline: '', teamSize: '', contactName: '', contactEmail: '',
        contactPhone: '', college: '', attachments: null
      });
    } catch (error) {
      toast.error('Failed to submit idea. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-secondary-900 dark:text-white mb-4">
            Submit Your Innovation Idea
          </h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400">
            Transform your innovative thoughts into reality with SGBAU Pre-Incubation Centre
          </p>
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-secondary-900 dark:text-white flex items-center">
                <FiFileText className="mr-3 text-primary-600" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Idea Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                    placeholder="Enter your innovative idea title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    <option value="technology">Technology</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="environment">Environment</option>
                    <option value="social">Social Impact</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                  placeholder="Describe your idea in detail, including the problem it solves, solution approach, and potential impact"
                />
              </div>
            </div>

            {/* Market Analysis */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-secondary-900 dark:text-white flex items-center">
                <FiTarget className="mr-3 text-primary-600" />
                Market Analysis
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                    placeholder="Who will benefit from your idea?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Market Size
                  </label>
                  <input
                    type="text"
                    name="marketSize"
                    value={formData.marketSize}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                    placeholder="Estimated market size"
                  />
                </div>
              </div>
            </div>

            {/* Implementation Details */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-secondary-900 dark:text-white flex items-center">
                <FiDollarSign className="mr-3 text-primary-600" />
                Implementation Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Budget Required
                  </label>
                  <input
                    type="text"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                    placeholder="₹ 0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Timeline
                  </label>
                  <input
                    type="text"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                    placeholder="e.g., 6 months"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Team Size
                  </label>
                  <input
                    type="text"
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                    placeholder="Number of team members"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-secondary-900 dark:text-white flex items-center">
                <FiUser className="mr-3 text-primary-600" />
                Contact Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    College/Institution
                  </label>
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                    placeholder="Your college name"
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-secondary-900 dark:text-white flex items-center">
                <FiUpload className="mr-3 text-primary-600" />
                Supporting Documents
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Attach Files (Optional)
                </label>
                <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-6 text-center">
                  <FiUpload className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                  <p className="text-secondary-600 dark:text-secondary-400 mb-2">
                    Upload supporting documents, presentations, or prototypes
                  </p>
                  <input
                    type="file"
                    name="attachments"
                    onChange={handleChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 cursor-pointer"
                  >
                    Choose Files
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="mr-3" size={20} />
                    Submit Your Idea
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitIdea;
