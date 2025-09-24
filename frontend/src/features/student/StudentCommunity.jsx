import React, { useState } from 'react';
import { FiUsers, FiMessageCircle, FiHeart, FiShare2, FiSearch, FiFilter, FiPlus, FiClock, FiMapPin, FiTag, FiUser, FiThumbsUp, FiBookmark } from 'react-icons/fi';

const StudentCommunity = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('discussions');

  const discussions = [
    {
      id: 1,
      title: "Best practices for pitch deck creation",
      author: "Priya Sharma",
      authorRole: "Student",
      college: "Government College of Engineering, Amravati",
      category: "Pitching",
      content: "I'm working on my pitch deck for the upcoming innovation challenge. What are some key elements that should be included? Any templates or examples you'd recommend?",
      likes: 24,
      comments: 8,
      timeAgo: "2 hours ago",
      tags: ["pitch-deck", "presentation", "startup"],
      isLiked: false,
      isBookmarked: false
    },
    {
      id: 2,
      title: "Looking for co-founder for AgriTech startup",
      author: "Rajesh Kumar",
      authorRole: "Student",
      college: "Jotiba Fule College, Amravati",
      category: "Collaboration",
      content: "I have an innovative idea for smart irrigation systems. Looking for someone with technical background to join as co-founder. We can discuss the details and see if we're a good fit.",
      likes: 18,
      comments: 12,
      timeAgo: "5 hours ago",
      tags: ["co-founder", "agritech", "collaboration"],
      isLiked: true,
      isBookmarked: false
    },
    {
      id: 3,
      title: "Funding opportunities for student startups",
      author: "Dr. Sunita Patel",
      authorRole: "Mentor",
      college: "SGBAU Pre-Incubation Centre",
      category: "Funding",
      content: "Here's a comprehensive list of funding opportunities available for student entrepreneurs. I've categorized them by amount and requirements to help you find the right fit.",
      likes: 45,
      comments: 15,
      timeAgo: "1 day ago",
      tags: ["funding", "grants", "startup"],
      isLiked: false,
      isBookmarked: true
    },
    {
      id: 4,
      title: "Success story: From idea to ₹50L funding",
      author: "Amit Deshmukh",
      authorRole: "Alumni",
      college: "Shri Shivaji College, Akola",
      category: "Success Stories",
      content: "Sharing my journey of how I built my EdTech startup from a college project to securing ₹50L in seed funding. Key learnings and mistakes to avoid.",
      likes: 67,
      comments: 23,
      timeAgo: "2 days ago",
      tags: ["success-story", "funding", "edtech"],
      isLiked: true,
      isBookmarked: true
    },
    {
      id: 5,
      title: "Workshop: Digital Marketing for Startups",
      author: "Neha Singh",
      authorRole: "Student",
      college: "Government College of Engineering, Amravati",
      category: "Events",
      content: "Organizing a free workshop on digital marketing strategies for startups. Open to all students. We'll cover social media marketing, SEO, and growth hacking techniques.",
      likes: 32,
      comments: 19,
      timeAgo: "3 days ago",
      tags: ["workshop", "digital-marketing", "learning"],
      isLiked: false,
      isBookmarked: false
    }
  ];

  const events = [
    {
      id: 1,
      title: "Monthly Innovation Meetup",
      date: "2025-02-15",
      time: "6:00 PM - 8:00 PM",
      location: "SGBAU Pre-Incubation Centre, Amravati",
      type: "Meetup",
      attendees: 45,
      maxAttendees: 50,
      description: "Monthly networking event for student entrepreneurs. Share ideas, get feedback, and connect with like-minded individuals.",
      organizer: "SGBAU Pre-Incubation Centre"
    },
    {
      id: 2,
      title: "Pitch Practice Session",
      date: "2025-02-20",
      time: "4:00 PM - 6:00 PM",
      location: "Online (Zoom)",
      type: "Workshop",
      attendees: 28,
      maxAttendees: 30,
      description: "Practice your pitch with experienced mentors and get valuable feedback. Perfect for upcoming competitions.",
      organizer: "Innovation Hub Team"
    },
    {
      id: 3,
      title: "Tech Startup Showcase",
      date: "2025-02-25",
      time: "10:00 AM - 4:00 PM",
      location: "Pune, Maharashtra",
      type: "Showcase",
      attendees: 120,
      maxAttendees: 150,
      description: "Showcase your tech startup to investors and industry experts. Great opportunity for funding and partnerships.",
      organizer: "Maharashtra Innovation Society"
    }
  ];

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = searchTerm === '' ||
      discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = filterCategory === 'all' || discussion.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Pitching': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Collaboration': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Funding': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Success Stories': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Events': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'Meetup': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Workshop': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Showcase': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-secondary-900 dark:text-white mb-4">
            Student Community
          </h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400">
            Connect, collaborate, and learn from fellow student entrepreneurs
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-secondary-800 rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('discussions')}
              className={`px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
                activeTab === 'discussions'
                  ? 'bg-primary-600 text-white'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
              }`}
            >
              Discussions
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
                activeTab === 'events'
                  ? 'bg-primary-600 text-white'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
              }`}
            >
              Events
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-10 pr-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {activeTab === 'discussions' && (
              <div>
                <select
                  className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="Pitching">Pitching</option>
                  <option value="Collaboration">Collaboration</option>
                  <option value="Funding">Funding</option>
                  <option value="Success Stories">Success Stories</option>
                  <option value="Events">Events</option>
                </select>
              </div>
            )}

            <div className="flex justify-end">
              <button className="inline-flex items-center px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200">
                <FiPlus className="mr-2" size={16} />
                New {activeTab === 'discussions' ? 'Discussion' : 'Event'}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'discussions' ? (
          <div className="space-y-6">
            {filteredDiscussions.map((discussion) => (
              <div key={discussion.id} className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiUser className="text-primary-600 dark:text-primary-400" size={20} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-1">
                          {discussion.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-secondary-600 dark:text-secondary-400">
                          <span className="font-medium">{discussion.author}</span>
                          <span>•</span>
                          <span>{discussion.authorRole}</span>
                          <span>•</span>
                          <span>{discussion.college}</span>
                          <span>•</span>
                          <span>{discussion.timeAgo}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(discussion.category)}`}>
                        {discussion.category}
                      </span>
                    </div>

                    <p className="text-secondary-700 dark:text-secondary-300 mb-4">
                      {discussion.content}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {discussion.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 text-xs rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <button className={`flex items-center space-x-2 text-sm ${
                          discussion.isLiked 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-secondary-600 dark:text-secondary-400 hover:text-red-600 dark:hover:text-red-400'
                        }`}>
                          <FiHeart className={discussion.isLiked ? 'fill-current' : ''} size={16} />
                          <span>{discussion.likes}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-sm text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400">
                          <FiMessageCircle size={16} />
                          <span>{discussion.comments}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-sm text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400">
                          <FiShare2 size={16} />
                          <span>Share</span>
                        </button>
                      </div>
                      <button className={`p-2 rounded-lg ${
                        discussion.isBookmarked 
                          ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30' 
                          : 'text-secondary-600 dark:text-secondary-400 hover:text-yellow-600 dark:hover:text-yellow-400'
                      }`}>
                        <FiBookmark className={discussion.isBookmarked ? 'fill-current' : ''} size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredDiscussions.length === 0 && (
              <div className="text-center py-12">
                <FiMessageCircle className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                  No discussions found
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  Try adjusting your search criteria or start a new discussion.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <div className="text-center text-white">
                    <FiUsers size={48} />
                    <p className="mt-2 text-lg font-semibold">{event.title}</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </span>
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">
                      {event.attendees}/{event.maxAttendees} attendees
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-3">
                    {event.title}
                  </h3>

                  <p className="text-secondary-600 dark:text-secondary-400 mb-4 line-clamp-3">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                      <FiClock className="mr-3" size={16} />
                      <span>{formatDate(event.date)} at {event.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                      <FiMapPin className="mr-3" size={16} />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                      <FiUser className="mr-3" size={16} />
                      <span>Organized by {event.organizer}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors duration-200">
                      Register
                    </button>
                    <button className="px-4 py-2 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors duration-200">
                      <FiShare2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Community Stats */}
        <div className="mt-16 bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-6 text-center">
            Community Statistics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">1,250+</div>
              <div className="text-secondary-600 dark:text-secondary-400">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">350+</div>
              <div className="text-secondary-600 dark:text-secondary-400">Discussions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">50+</div>
              <div className="text-secondary-600 dark:text-secondary-400">Events This Month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">25+</div>
              <div className="text-secondary-600 dark:text-secondary-400">Successful Collaborations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCommunity;
