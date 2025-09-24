import React from 'react';
import { FiMapPin, FiClock, FiUsers, FiBriefcase, FiMail, FiCheckCircle } from 'react-icons/fi';

const Careers = () => {
  const jobOpenings = [
    {
      id: 1,
      title: "Innovation Coordinator",
      department: "Pre-Incubation Centre",
      location: "Amravati, Maharashtra",
      type: "Full-time",
      experience: "2-5 years",
      description: "Coordinate innovation programs and mentor students in idea development and implementation."
    },
    {
      id: 2,
      title: "Technology Mentor",
      department: "Incubation Support",
      location: "Remote",
      type: "Part-time",
      experience: "5+ years",
      description: "Provide technical guidance and mentorship to students working on technology-based innovations."
    },
    {
      id: 3,
      title: "Business Development Associate",
      department: "Strategic Partnerships",
      location: "Amravati, Maharashtra",
      type: "Full-time",
      experience: "1-3 years",
      description: "Develop partnerships with industry leaders and facilitate connections for incubated ventures."
    },
    {
      id: 4,
      title: "Marketing Specialist",
      department: "Communications",
      location: "Amravati, Maharashtra",
      type: "Full-time",
      experience: "2-4 years",
      description: "Promote the Pre-Incubation Centre and manage digital marketing campaigns for student ventures."
    }
  ];

  const benefits = [
    "Competitive salary packages",
    "Health insurance coverage",
    "Professional development opportunities",
    "Flexible working hours",
    "Collaborative work environment",
    "Opportunity to shape the future of innovation"
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
            Careers at SGBAU Pre-Incubation Centre
          </h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
            Join our mission to empower innovation and transform ideas into successful ventures across Maharashtra
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-6">
              Why Work With Us?
            </h2>
            <p className="text-lg text-secondary-600 dark:text-secondary-400 mb-8">
              At SGBAU Pre-Incubation Centre, we're building the future of innovation in Maharashtra. 
              Join a dynamic team that's passionate about nurturing the next generation of entrepreneurs 
              and transforming groundbreaking ideas into successful businesses.
            </p>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                What We Offer for Students:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="text-green-500 flex-shrink-0" size={20} />
                  <span className="text-secondary-700 dark:text-secondary-300">Idea submission and evaluation platform</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="text-green-500 flex-shrink-0" size={20} />
                  <span className="text-secondary-700 dark:text-secondary-300">Mentorship from industry experts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="text-green-500 flex-shrink-0" size={20} />
                  <span className="text-secondary-700 dark:text-secondary-300">Access to incubation centres</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="text-green-500 flex-shrink-0" size={20} />
                  <span className="text-secondary-700 dark:text-secondary-300">Networking opportunities</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="text-green-500 flex-shrink-0" size={20} />
                  <span className="text-secondary-700 dark:text-secondary-300">Funding support and guidance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="text-green-500 flex-shrink-0" size={20} />
                  <span className="text-secondary-700 dark:text-secondary-300">Skill development programs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-secondary-800 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-6">
              Get in Touch
            </h3>
            <p className="text-lg text-secondary-600 dark:text-secondary-400 mb-6">
              Ready to join our team? Send us your resume and let us know how you can contribute to our mission.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FiMail className="text-primary-600" size={20} />
                <span className="text-secondary-700 dark:text-secondary-300">
                  pic@sgbau.ac.in
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <FiMapPin className="text-primary-600 mt-1" size={20} />
                <div className="text-secondary-700 dark:text-secondary-300">
                  <div>Sant Gadge Baba Amravati University</div>
                  <div>Pre-Incubation Centre</div>
                  <div>Amravati - 444602, Maharashtra</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Careers;
