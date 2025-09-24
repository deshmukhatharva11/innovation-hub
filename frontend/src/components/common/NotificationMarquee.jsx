import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiBell, FiChevronRight, FiX } from 'react-icons/fi';
import cmsService from '../../services/cmsService';

/**
 * NotificationMarquee component for displaying scrolling announcements
 * @returns {JSX.Element} The NotificationMarquee component
 */
const NotificationMarquee = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await cmsService.getLatestAnnouncements(5);
        if (response.success) {
          setAnnouncements(response.data.announcements);
        } else {
          setError('Failed to load announcements');
        }
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Don't render if there are no announcements or component is hidden
  if (!isVisible || loading || announcements.length === 0) {
    return null;
  }

  // Get announcements with high priority first, then others
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    return 0;
  });

  // Format announcements for marquee display
  const formattedAnnouncements = sortedAnnouncements.map((announcement, index) => {
    const isHighPriority = announcement.priority === 'high';
    
    return (
      <span 
        key={announcement.id} 
        className={`inline-flex items-center ${index !== sortedAnnouncements.length - 1 ? 'mr-16' : ''}`}
      >
        {isHighPriority && (
          <FiAlertCircle className="text-red-500 mr-2 flex-shrink-0" />
        )}
        <span className={`${isHighPriority ? 'font-semibold' : ''}`}>
          {announcement.title}: {announcement.content}
        </span>
        {index !== sortedAnnouncements.length - 1 && (
          <span className="mx-4 text-secondary-400">•</span>
        )}
      </span>
    );
  });

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/30 border-y border-yellow-200 dark:border-yellow-800 py-2 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="flex-shrink-0 mr-4 bg-yellow-100 dark:bg-yellow-800 p-1.5 rounded-full">
          <FiBell className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        
        <div className="overflow-hidden flex-1">
          <div className="marquee-container">
            <div className="marquee">
              {formattedAnnouncements}
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 ml-4 flex items-center space-x-2">
          <Link 
            to="/announcements" 
            className="text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 hidden sm:flex items-center"
          >
            View All
            <FiChevronRight className="ml-1" />
          </Link>
          
          <button 
            onClick={() => setIsVisible(false)}
            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 p-1"
            aria-label="Dismiss"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Add CSS for marquee animation */}
      <style jsx="true">{`
        .marquee-container {
          width: 100%;
          overflow: hidden;
        }
        
        .marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 40s linear infinite;
        }
        
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        /* Pause animation on hover */
        .marquee-container:hover .marquee {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default NotificationMarquee;
