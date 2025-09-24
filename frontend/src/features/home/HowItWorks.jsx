import React from 'react';
import { FiArrowRight, FiCheckCircle, FiUsers, FiTarget, FiAward } from 'react-icons/fi';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "Submit Your Idea",
      description: "Students submit innovative ideas through our platform with detailed descriptions, feasibility studies, and market analysis.",
      icon: FiUsers,
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "College Review",
      description: "College coordinators review and evaluate submitted ideas, providing feedback and recommendations for improvement.",
      icon: FiCheckCircle,
      color: "bg-green-500"
    },
    {
      id: 3,
      title: "Forward to Incubator",
      description: "Promising ideas are forwarded to incubation centres for professional evaluation and potential incubation support.",
      icon: FiArrowRight,
      color: "bg-purple-500"
    },
    {
      id: 4,
      title: "Incubation Process",
      description: "Selected ideas receive mentorship, funding support, and resources to transform into successful ventures.",
      icon: FiTarget,
      color: "bg-yellow-500"
    },
    {
      id: 5,
      title: "Success & Growth",
      description: "Incubated ventures grow into successful businesses, contributing to economic development and innovation.",
      icon: FiAward,
      color: "bg-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
            How It Works
          </h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
            Our Pre-Incubation Centre follows a structured 5-step process to transform innovative ideas into successful ventures
          </p>
        </div>

        <div className="space-y-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex flex-col lg:flex-row items-center gap-8">
                <div className={`flex-shrink-0 w-20 h-20 ${step.color} rounded-full flex items-center justify-center text-white`}>
                  <Icon size={32} />
                </div>
                
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                    <span className="text-6xl font-bold text-gray-200 dark:text-gray-700">
                      {step.id}
                    </span>
                    <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-lg text-secondary-600 dark:text-secondary-400">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block">
                    <FiArrowRight size={24} className="text-gray-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gray-50 dark:bg-secondary-800 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
              Ready to Start Your Innovation Journey?
            </h3>
            <p className="text-lg text-secondary-600 dark:text-secondary-400 mb-6">
              Join thousands of students who are transforming their ideas into reality
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/register" className="btn-primary bg-primary-600 text-white hover:bg-primary-700 px-8 py-4 text-lg font-semibold rounded-lg">
                Get Started Today
              </a>
              <a href="/contact" className="btn-outline border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-4 text-lg font-semibold rounded-lg">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;