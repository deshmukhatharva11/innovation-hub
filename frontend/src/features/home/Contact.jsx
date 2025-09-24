import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiZap,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiClock,
  FiSend,
  FiCheckCircle,
  FiMessageCircle,
  FiUsers,
  FiAward
} from 'react-icons/fi';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Submit contact form and notify incubator and system administrator
      const response = await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          notify_incubator: true,
          notify_system_admin: true,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        
        // Show success message
        alert('Thank you for your message! The incubator and system administrator have been notified.');
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: FiMail,
      title: "Email Us",
      value: "hello@innovationhub.in",
      description: "Send us an email anytime"
    },
    {
      icon: FiPhone,
      title: "Call Us",
      value: "+91 98765 43210",
      description: "Mon-Fri from 9am to 6pm"
    },
    {
      icon: FiMapPin,
      title: "Visit Us",
      value: "Mumbai, Maharashtra",
      description: "Schedule a meeting with us"
    },
    {
      icon: FiClock,
      title: "Business Hours",
      value: "9:00 AM - 6:00 PM",
      description: "Monday to Friday"
    }
  ];

  const faqs = [
    {
      question: "How can I submit my innovative idea?",
      answer: "You can submit your idea by registering on our platform and using the 'Submit Idea' feature. Our team will review your submission and guide you through the next steps."
    },
    {
      question: "What support do you provide to students?",
      answer: "We provide comprehensive support including mentorship, funding opportunities, technical guidance, business development, and access to our network of investors and partners."
    },
    {
      question: "How long does the review process take?",
      answer: "The initial review takes 1-2 weeks. The complete process from submission to incubation typically takes 6-8 weeks depending on the complexity of your idea."
    },
    {
      question: "Can colleges partner with Innovation Hub?",
      answer: "Yes! We actively partner with colleges across Maharashtra. Contact us to discuss partnership opportunities and how we can help your institution foster innovation."
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
              Get in Touch
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-primary-100 max-w-4xl mx-auto">
              Have questions about Innovation Hub? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-secondary-50 dark:bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
              Contact Information
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Reach out to us through any of these channels
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50 transition-colors duration-300">
                    <Icon className="text-primary-600 dark:text-primary-400" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                    {info.title}
                  </h3>
                  <p className="text-primary-600 dark:text-primary-400 font-medium mb-2">
                    {info.value}
                  </p>
                  <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                    {info.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-white dark:bg-secondary-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
              Send Us a Message
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Fill out the form below and we'll get back to you within 24 hours
            </p>
          </div>
          
          {isSubmitted ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle className="text-green-600 dark:text-green-400" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
                Message Sent Successfully!
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400 mb-8">
                Thank you for reaching out to us. We'll get back to you within 24 hours.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="btn-primary"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-secondary-800 dark:text-white"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-secondary-800 dark:text-white"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-secondary-800 dark:text-white"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-secondary-800 dark:text-white"
                    placeholder="What is this about?"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-secondary-800 dark:text-white"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-8 py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiSend className="mr-2" size={20} />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-secondary-50 dark:bg-secondary-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Find answers to common questions about Innovation Hub
            </p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-3 flex items-start">
                  <FiMessageCircle className="text-primary-600 mr-3 mt-1 flex-shrink-0" size={20} />
                  {faq.question}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Location */}
      <section className="py-20 bg-white dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
              Visit Our Office
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Schedule a meeting or drop by for a chat
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-6">
                Innovation Hub Headquarters
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FiMapPin className="text-primary-600 mr-3 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-secondary-900 dark:text-white font-medium">Address</p>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      Innovation Hub Building<br />
                      Tech Park, Andheri East<br />
                      Mumbai, Maharashtra 400069
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiClock className="text-primary-600 mr-3 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-secondary-900 dark:text-white font-medium">Business Hours</p>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiPhone className="text-primary-600 mr-3 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-secondary-900 dark:text-white font-medium">Phone</p>
                    <p className="text-secondary-600 dark:text-secondary-400">+91 98765 43210</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-secondary-200 dark:bg-secondary-700 rounded-2xl h-80 flex items-center justify-center">
              <div className="text-center">
                <FiMapPin className="text-secondary-400 mx-auto mb-4" size={48} />
                <p className="text-secondary-600 dark:text-secondary-400">
                  Interactive Map Coming Soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Start Your Innovation Journey?
          </h2>
          <p className="text-xl lg:text-2xl mb-8 text-primary-100">
            Join thousands of students who are already transforming their ideas into successful startups
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 text-lg font-semibold">
              <FiZap className="mr-2" size={20} />
              Get Started Today
            </Link>
            <Link to="/how-it-works" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg font-semibold">
              <FiUsers className="mr-2" size={20} />
              Learn How It Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
