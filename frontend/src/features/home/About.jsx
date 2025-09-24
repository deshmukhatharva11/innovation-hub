import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiZap,
  FiUsers,
  FiTarget,
  FiAward,
  FiTrendingUp,
  FiShield,
  FiHeart,
  FiMapPin,
  FiMail,
  FiPhone,
  FiGlobe,
  FiArrowRight,
  FiCheckCircle
} from 'react-icons/fi';

const About = () => {


  const values = [
    {
      icon: FiHeart,
      title: "Innovation First",
      description: "We believe in the power of innovative ideas to transform society and create lasting impact."
    },
    {
      icon: FiUsers,
      title: "Student-Centric",
      description: "Every decision we make is focused on empowering students to achieve their entrepreneurial dreams."
    },
    {
      icon: FiTarget,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from mentorship to platform development."
    },
    {
      icon: FiShield,
      title: "Integrity",
      description: "We maintain the highest standards of integrity and transparency in all our operations."
    }
  ];

  const milestones = [
    {
      year: "2020",
      title: "Platform Launch",
      description: "Innovation Hub launched with 10 partner colleges and 100 students"
    },
    {
      year: "2021",
      title: "First Unicorn",
      description: "AgriTech Solutions became our first startup to reach ₹50 Cr valuation"
    },
    {
      year: "2022",
      title: "Expansion",
      description: "Expanded to 50+ colleges across Maharashtra with 1000+ active students"
    },
    {
      year: "2023",
      title: "National Recognition",
      description: "Recognized by Ministry of Education as a leading innovation platform"
    },
    {
      year: "2024",
      title: "Future Vision",
      description: "Targeting 100+ colleges and 10,000+ students across India"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              About Innovation Hub
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-primary-100 max-w-4xl mx-auto">
              Maharashtra's premier innovation platform connecting students, colleges, and investors to build the next generation of successful startups
            </p>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 text-lg font-semibold">
                  <FiZap className="mr-2" size={20} />
                  Join Our Community
                </Link>
                <Link to="/success-stories" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg font-semibold">
                  <FiAward className="mr-2" size={20} />
                  View Success Stories
                </Link>
              </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white mb-8">
                Our Mission
              </h2>
              <p className="text-xl text-secondary-600 dark:text-secondary-400 mb-6 leading-relaxed">
                To democratize innovation and entrepreneurship by providing students across Maharashtra with the resources, mentorship, and opportunities they need to transform their ideas into successful businesses.
              </p>
              <p className="text-lg text-secondary-600 dark:text-secondary-400 leading-relaxed">
                We believe that every student has the potential to create something extraordinary. Our platform bridges the gap between academic learning and real-world entrepreneurship, creating a thriving ecosystem where innovation flourishes.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-2xl p-8 lg:p-12">
              <h3 className="text-3xl font-bold text-secondary-900 dark:text-white mb-6">
                Our Vision
              </h3>
              <p className="text-lg text-secondary-600 dark:text-secondary-400 mb-8 leading-relaxed">
                To become India's leading platform for student innovation, fostering a culture of entrepreneurship that drives economic growth and social impact across the nation.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" size={20} />
                  <span className="text-secondary-600 dark:text-secondary-400">Empower 100,000+ students by 2030</span>
                </div>
                <div className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" size={20} />
                  <span className="text-secondary-600 dark:text-secondary-400">Create 1,000+ successful startups</span>
                </div>
                <div className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" size={20} />
                  <span className="text-secondary-600 dark:text-secondary-400">Generate ₹10,000 Cr in economic value</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-secondary-50 dark:bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
              Our Values
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50 transition-colors duration-300">
                    <Icon className="text-primary-600 dark:text-primary-400" size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">
                    {value.title}
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Real Numbers */}
      <section className="py-20 bg-white dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
              Our Impact in Numbers
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Real achievements from SGBAU Pre-Incubation Centre across Maharashtra
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-8 rounded-2xl">
              <div className="text-5xl lg:text-6xl font-bold text-blue-600 mb-4">
                1,247+
              </div>
              <div className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">Ideas Submitted</div>
              <div className="text-secondary-600 dark:text-secondary-400">Innovative concepts from students across 5 districts</div>
            </div>
            <div className="text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-8 rounded-2xl">
              <div className="text-5xl lg:text-6xl font-bold text-green-600 mb-4">
                342+
              </div>
              <div className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">Pre-Incubatees Forwarded</div>
              <div className="text-secondary-600 dark:text-secondary-400">Promising ideas forwarded to incubation centres</div>
            </div>
            <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-8 rounded-2xl">
              <div className="text-5xl lg:text-6xl font-bold text-purple-600 mb-4">
                89+
              </div>
              <div className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">Ideas Incubated</div>
              <div className="text-secondary-600 dark:text-secondary-400">Successful ventures launched through our platform</div>
            </div>
            <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-8 rounded-2xl">
              <div className="text-5xl lg:text-6xl font-bold text-orange-600 mb-4">
                127+
              </div>
              <div className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">Colleges Onboarded</div>
              <div className="text-secondary-600 dark:text-secondary-400">Educational institutions across Amravati division</div>
            </div>
          </div>
        </div>
      </section>




      {/* Contact */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Get in Touch
          </h2>
          <p className="text-xl lg:text-2xl mb-8 text-primary-100">
            Ready to join the innovation revolution? Let's talk about how we can help you succeed.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <FiMail className="text-4xl mb-4" />
              <h3 className="text-xl font-bold mb-2">Email Us</h3>
              <p className="text-primary-100">pic@sgbau.ac.in</p>
            </div>
            <div className="flex flex-col items-center">
              <FiMapPin className="text-4xl mb-4" />
              <h3 className="text-xl font-bold mb-2">Visit Us</h3>
              <p className="text-primary-100">Sant Gadge Baba Amravati University</p>
              <p className="text-primary-100">Amravati - 444602, Maharashtra</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-primary bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 text-lg font-semibold">
              <FiMail className="mr-2" size={20} />
              Contact Us
            </Link>
            <Link to="/register" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg font-semibold">
              <FiZap className="mr-2" size={20} />
              Join Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
