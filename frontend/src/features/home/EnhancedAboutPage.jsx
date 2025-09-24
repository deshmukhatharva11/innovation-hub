import React, { useState, useEffect } from 'react';
import {
  FiUsers,
  FiTarget,
  FiAward,
  FiTrendingUp,
  FiLightbulb,
  FiBookOpen,
  FiShield,
  FiHeart,
  FiRocket,
  FiGlobe,
  FiCalendar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiExternalLink,
  FiCheckCircle,
  FiStar,
  FiZap
} from 'react-icons/fi';

const EnhancedAboutPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    const element = document.getElementById('about-content');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const missionPoints = [
    "Foster innovation and entrepreneurship among students",
    "Provide comprehensive support for idea development",
    "Connect students with industry mentors and experts",
    "Create a vibrant ecosystem for startup incubation",
    "Promote research and development in emerging technologies"
  ];

  const values = [
    {
      icon: FiLightbulb,
      title: "Innovation First",
      description: "We believe in the power of innovative thinking to solve real-world problems and create meaningful impact."
    },
    {
      icon: FiUsers,
      title: "Collaboration",
      description: "Success comes through collaboration between students, mentors, industry experts, and academic institutions."
    },
    {
      icon: FiTarget,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from idea validation to successful market implementation."
    },
    {
      icon: FiHeart,
      title: "Empowerment",
      description: "We empower students to take ownership of their ideas and transform them into successful ventures."
    }
  ];

  const timeline = [
    {
      year: "2020",
      title: "Foundation",
      description: "Innovation Hub was established as part of SGBAU's commitment to fostering entrepreneurship and innovation among students."
    },
    {
      year: "2021",
      title: "First Cohort",
      description: "Launched our first mentorship program with 50 students and 10 industry mentors, resulting in 15 successful idea validations."
    },
    {
      year: "2022",
      title: "Expansion",
      description: "Expanded to include 5 colleges across Maharashtra, reaching 500+ students and establishing partnerships with 25+ industry partners."
    },
    {
      year: "2023",
      title: "Digital Platform",
      description: "Launched our comprehensive digital platform, enabling seamless idea submission, mentorship matching, and progress tracking."
    },
    {
      year: "2024",
      title: "Recognition",
      description: "Received recognition from the Government of Maharashtra for outstanding contribution to student entrepreneurship and innovation."
    }
  ];

  const achievements = [
    {
      icon: FiAward,
      title: "500+ Ideas",
      description: "Ideas submitted and evaluated",
      color: "text-yellow-600"
    },
    {
      icon: FiUsers,
      title: "1000+ Students",
      description: "Students actively participating",
      color: "text-blue-600"
    },
    {
      icon: FiTarget,
      title: "50+ Mentors",
      description: "Industry experts and academic mentors",
      color: "text-green-600"
    },
    {
      icon: FiRocket,
      title: "25+ Startups",
      description: "Successful startups launched",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              About
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Innovation Hub
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Empowering the next generation of innovators and entrepreneurs across Maharashtra through comprehensive support, expert mentorship, and cutting-edge resources.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section id="about-content" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                To create a vibrant ecosystem that nurtures innovation, fosters entrepreneurship, and transforms student ideas into successful ventures that contribute to Maharashtra's economic growth and technological advancement.
              </p>
              <ul className="space-y-4">
                {missionPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <FiCheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-lg leading-relaxed">
                  To become Maharashtra's premier innovation hub, recognized nationally for producing world-class entrepreneurs and breakthrough technologies that address global challenges while driving regional economic development.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="inline-flex p-4 bg-blue-100 rounded-full mb-6">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">Key milestones in our growth and development</p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-600 to-purple-600"></div>
            
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-2">{item.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg relative z-10">
                    {index + 1}
                  </div>
                  
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Achievements</h2>
            <p className="text-xl text-blue-100">Numbers that speak for our impact</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={index}
                  className="text-center transform hover:scale-105 transition-all duration-300"
                >
                  <div className="inline-flex p-4 bg-white/20 rounded-full mb-4">
                    <Icon className={`w-8 h-8 ${achievement.color}`} />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{achievement.title}</div>
                  <div className="text-blue-100">{achievement.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-xl text-gray-600">Meet the people behind Innovation Hub</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Rajesh Kumar",
                role: "Director, Innovation Hub",
                description: "Professor of Computer Science with 20+ years of experience in technology innovation and entrepreneurship.",
                image: "/team1.jpg"
              },
              {
                name: "Dr. Priya Sharma",
                role: "Head of Mentorship",
                description: "Industry veteran with expertise in startup incubation and business development across multiple sectors.",
                image: "/team2.jpg"
              },
              {
                name: "Prof. Amit Patel",
                role: "Technical Lead",
                description: "Expert in emerging technologies and innovation management with a focus on student entrepreneurship.",
                image: "/team3.jpg"
              }
            ].map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">{member.name}</h3>
                <p className="text-blue-600 text-center mb-4">{member.role}</p>
                <p className="text-gray-600 text-center leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600">We'd love to hear from you</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <FiMapPin className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Address</h4>
                    <p className="text-gray-600">
                      Sant Gadge Baba Amravati University<br />
                      Amravati, Maharashtra 444602
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <FiPhone className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                    <p className="text-gray-600">+91 721 266 2146</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <FiMail className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-gray-600">innovation@sgbau.ac.in</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <FiGlobe className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Website</h4>
                    <p className="text-gray-600">www.sgbau.ac.in</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h3>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Message subject"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your message here..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnhancedAboutPage;
