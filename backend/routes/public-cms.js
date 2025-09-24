const express = require('express');
const router = express.Router();
const { Document, User, Idea, College, PreIncubatee, Mentor, Circular } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// @route   GET /api/public/cms/pages/:slug
// @desc    Get public CMS page content
// @access  Public
router.get('/pages/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // In a real application, this would fetch from database
    // For now, we'll return mock data
    const pages = {
      'home': {
        title: 'SGBAU Pre-Incubation Centre',
        content: `
          <h1>Welcome to SGBAU Pre-Incubation Centre</h1>
          <p>Empowering innovation across Maharashtra's Amravati division. Connect students, colleges, and incubation centres to transform innovative ideas into successful ventures.</p>
          <h2>Our Mission</h2>
          <p>To create a vibrant ecosystem that nurtures innovation and entrepreneurship among students across all affiliated colleges of Sant Gadge Baba Amravati University.</p>
        `,
        meta_title: 'SGBAU Pre-Incubation Centre - Home',
        meta_description: 'Connecting students, colleges, and incubators for innovation excellence',
        is_published: true,
        last_updated: new Date().toISOString()
      },
      'about': {
        title: 'About SGBAU Pre-Incubation Centre',
        content: `
          <h1>About SGBAU Pre-Incubation Centre</h1>
          <p>The SGBAU Pre-Incubation Centre is an initiative of Sant Gadge Baba Amravati University to promote innovation and entrepreneurship among students across all affiliated colleges.</p>
          <h2>Our Vision</h2>
          <p>To establish a network of Pre-Incubation Centres (PICs) across all affiliated colleges of Sant Gadge Baba Amravati University, creating a robust innovation ecosystem that transforms student ideas into successful ventures.</p>
          <h2>Our Approach</h2>
          <ul>
            <li>Identify and nurture innovative ideas from students</li>
            <li>Provide structured mentorship and technical support</li>
            <li>Connect students with industry experts and incubators</li>
            <li>Facilitate the transformation of ideas into Minimum Viable Products (MVPs)</li>
            <li>Create pathways for successful incubation and commercialization</li>
          </ul>
        `,
        meta_title: 'About Us - SGBAU Pre-Incubation Centre',
        meta_description: 'Learn about our mission and vision',
        is_published: true,
        last_updated: new Date().toISOString()
      },
      'contact': {
        title: 'Contact SGBAU Pre-Incubation Centre',
        content: `
          <h1>Contact Us</h1>
          <p>We'd love to hear from you! Please reach out to us with any questions, suggestions, or feedback.</p>
          <h2>Contact Information</h2>
          <ul>
            <li><strong>Address:</strong> Sant Gadge Baba Amravati University, Amravati, Maharashtra 444602</li>
            <li><strong>Email:</strong> pic@sgbau.ac.in</li>
            <li><strong>Phone:</strong> +91-721-2662206</li>
          </ul>
          <h2>Office Hours</h2>
          <p>Monday to Friday: 10:00 AM to 5:00 PM</p>
          <p>Saturday: 10:00 AM to 1:00 PM</p>
          <p>Sunday: Closed</p>
        `,
        meta_title: 'Contact Us - SGBAU Pre-Incubation Centre',
        meta_description: 'Contact information and support',
        is_published: true,
        last_updated: new Date().toISOString()
      }
    };
    
    const page = pages[slug];
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }
    
    res.json({
      success: true,
      data: { page }
    });
  } catch (error) {
    console.error('Error fetching public CMS page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch page content'
    });
  }
});

// @route   GET /api/public/cms/circulars
// @desc    Get latest public circulars
// @access  Public
router.get('/circulars', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    // Fetch circulars from database
    const circulars = await Circular.findAll({
      where: { 
        is_active: true,
        is_public: true
      },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: {
        circulars: circulars
      }
    });
  } catch (error) {
    console.error('Error fetching public circulars:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch circulars'
    });
  }
});

// @route   GET /api/public/cms/circulars/:id/download
// @desc    Download a circular file
// @access  Public
router.get('/circulars/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the circular
    const circular = await Circular.findOne({
      where: { 
        id: id,
        is_active: true,
        is_public: true
      }
    });
    
    if (!circular) {
      return res.status(404).json({
        success: false,
        message: 'Circular not found'
      });
    }
    
    // Check if file exists
    // Handle both absolute and relative paths
    let filePath;
    if (path.isAbsolute(circular.file_path)) {
      filePath = circular.file_path;
    } else {
      filePath = path.join(__dirname, '..', circular.file_path);
    }
    
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Increment download count
    await circular.increment('download_count');
    
    // Set appropriate headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${circular.file_name}"`);
    res.setHeader('Content-Type', circular.mime_type || 'application/octet-stream');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error downloading file'
        });
      }
    });
    
  } catch (error) {
    console.error('Error downloading circular:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download circular'
    });
  }
});

// @route   GET /api/public/cms/announcements
// @desc    Get latest announcements
// @access  Public
router.get('/announcements', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    // In a real application, this would fetch from database
    // For now, we'll return mock data
    const announcements = [
      {
        id: 1,
        title: 'Innovation Challenge 2025',
        content: 'Submit your innovative ideas for the annual Innovation Challenge. Prizes worth ₹5 lakhs to be won!',
        priority: 'high',
        created_at: new Date('2025-08-20').toISOString(),
        valid_until: new Date('2025-09-30').toISOString()
      },
      {
        id: 2,
        title: 'Pre-Incubation Centre Workshop',
        content: 'Join us for a workshop on "Idea to MVP" at the Main Campus on September 5, 2025.',
        priority: 'medium',
        created_at: new Date('2025-08-18').toISOString(),
        valid_until: new Date('2025-09-05').toISOString()
      },
      {
        id: 3,
        title: 'New Mentors Onboarded',
        content: 'We welcome 15 new industry experts as mentors for our Pre-Incubation Centres across all districts.',
        priority: 'medium',
        created_at: new Date('2025-08-15').toISOString(),
        valid_until: new Date('2025-09-15').toISOString()
      },
      {
        id: 4,
        title: 'Funding Opportunity for Student Startups',
        content: 'Government of Maharashtra announces special funding scheme for student startups. Apply before October 10, 2025.',
        priority: 'high',
        created_at: new Date('2025-08-12').toISOString(),
        valid_until: new Date('2025-10-10').toISOString()
      },
      {
        id: 5,
        title: 'Entrepreneurship Seminar Series',
        content: 'Weekly entrepreneurship seminars starting from September 1, 2025. Register now to secure your spot.',
        priority: 'low',
        created_at: new Date('2025-08-10').toISOString(),
        valid_until: new Date('2025-09-01').toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: {
        announcements: announcements.slice(0, parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements'
    });
  }
});

// @route   GET /api/public/cms/statistics
// @desc    Get portal statistics
// @access  Public
router.get('/statistics', async (req, res) => {
  try {
    // Fetch real data from database
    const [
      totalIdeas,
      preIncubateesForwarded,
      ideasIncubated,
      collegesOnboarded,
      activeUsers,
      mentorsRegistered,
      successfulStartups
    ] = await Promise.all([
      // Total ideas count (only count ideas with actual content, not empty ones)
      Idea.count({
        where: {
          title: {
            [Op.ne]: null
          },
          description: {
            [Op.ne]: null
          }
        }
      }),
      
      // Pre-incubatees forwarded (ideas with status 'forwarded' or 'endorsed')
      Idea.count({
        where: {
          status: {
            [Op.in]: ['forwarded', 'endorsed']
          }
        }
      }),
      
      // Ideas incubated (ideas with status 'incubated')
      Idea.count({
        where: {
          status: 'incubated'
        }
      }),
      
      // Colleges onboarded (active colleges)
      College.count({
        where: {
          is_active: true
        }
      }),
      
      // Active users (users with is_active = true)
      User.count({
        where: {
          is_active: true
        }
      }),
      
      // Registered mentors
      Mentor.count({
        where: {
          is_verified: true
        }
      }),
      
      // Successful startups (ideas with status 'incubated')
      Idea.count({
        where: {
          status: 'incubated'
        }
      })
    ]);
    
    // Use realistic numbers - cap at reasonable limits
    const statistics = {
      totalIdeas: Math.min(totalIdeas, 500),
      preIncubateesForwarded: Math.min(preIncubateesForwarded, 200),
      ideasIncubated: Math.min(ideasIncubated, 50),
      collegesOnboarded: Math.min(collegesOnboarded, 100),
      activeUsers: Math.min(activeUsers, 500),
      mentorsRegistered: Math.min(mentorsRegistered, 50),
      successfulStartups: Math.min(successfulStartups, 25)
    };
    
    console.log('📊 Statistics from database:', statistics);
    
    res.json({
      success: true,
      data: { statistics }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// @route   GET /api/public/cms/colleges
// @desc    Get participating colleges
// @access  Public
router.get('/colleges', async (req, res) => {
  try {
    // Fetch real data from database
    const collegesData = await College.findAll({
      where: {
        is_active: true
      },
      attributes: ['id', 'name', 'district', 'website', 'logo_url', 'address', 'contact_email'],
      order: [['district', 'ASC'], ['name', 'ASC']]
    });

    // Group colleges by district
    const collegesByDistrict = {};
    collegesData.forEach(college => {
      const district = college.district || 'Other';
      if (!collegesByDistrict[district]) {
        collegesByDistrict[district] = {
          district: district,
          colleges: [],
          totalColleges: 0,
          activePICs: 0
        };
      }
      
      collegesByDistrict[district].colleges.push({
        id: college.id,
        name: college.name,
        hasPIC: true, // All colleges in database are considered active
        website: college.website,
        logo_url: college.logo_url,
        address: college.address,
        contact_email: college.contact_email,
        contact_phone: null // Will be set from mock data if needed
      });
      
      collegesByDistrict[district].totalColleges++;
      collegesByDistrict[district].activePICs++;
    });

    // Convert to array format
    const colleges = Object.values(collegesByDistrict);

    // If no colleges in database, return mock data with enhanced information
    if (colleges.length === 0) {
      const colleges = [
        {
          district: "Akola",
          colleges: [
            { 
              id: 1,
              name: "Shri Shivaji College", 
              hasPIC: true,
              website: "https://www.shri-shivaji-college.edu.in",
              logo_url: "/logos/shri-shivaji-college.png",
              address: "Akola, Maharashtra",
              contact_email: "info@shri-shivaji-college.edu.in",
              contact_phone: "+91-724-1234567"
            },
            { 
              id: 2,
              name: "Government Polytechnic", 
              hasPIC: true,
              website: "https://www.gp-akola.edu.in",
              logo_url: "/logos/govt-polytechnic-akola.png",
              address: "Akola, Maharashtra",
              contact_email: "principal@gp-akola.edu.in",
              contact_phone: "+91-724-2345678"
            },
            { 
              id: 3,
              name: "Akola College of Engineering", 
              hasPIC: true,
              website: "https://www.ace-akola.edu.in",
              logo_url: "/logos/akola-engineering.png",
              address: "Akola, Maharashtra",
              contact_email: "info@ace-akola.edu.in",
              contact_phone: "+91-724-3456789"
            },
            { 
              id: 4,
              name: "College of Agriculture", 
              hasPIC: true,
              website: "https://www.agriculture-akola.edu.in",
              logo_url: "/logos/agriculture-college.png",
              address: "Akola, Maharashtra",
              contact_email: "dean@agriculture-akola.edu.in",
              contact_phone: "+91-724-4567890"
            },
            { 
              id: 5,
              name: "Arts & Science College", 
              hasPIC: false,
              website: "https://www.arts-science-akola.edu.in",
              logo_url: "/logos/arts-science.png",
              address: "Akola, Maharashtra",
              contact_email: "info@arts-science-akola.edu.in",
              contact_phone: "+91-724-5678901"
            },
            { 
              id: 6,
              name: "College of Pharmacy", 
              hasPIC: true,
              website: "https://www.pharmacy-akola.edu.in",
              logo_url: "/logos/pharmacy-college.png",
              address: "Akola, Maharashtra",
              contact_email: "principal@pharmacy-akola.edu.in",
              contact_phone: "+91-724-6789012"
            }
          ],
          totalColleges: 6,
          activePICs: 4
        },
        {
          district: "Amravati", 
          colleges: [
            { 
              id: 7,
              name: "Government College of Engineering", 
              hasPIC: true,
              website: "https://www.gce-amravati.edu.in",
              logo_url: "/logos/gce-amravati.png",
              address: "Amravati, Maharashtra",
              contact_email: "principal@gce-amravati.edu.in",
              contact_phone: "+91-721-1234567"
            },
            { 
              id: 8,
              name: "Jotiba Fule College", 
              hasPIC: true,
              website: "https://www.jotiba-fule-college.edu.in",
              logo_url: "/logos/jotiba-fule.png",
              address: "Amravati, Maharashtra",
              contact_email: "info@jotiba-fule-college.edu.in",
              contact_phone: "+91-721-2345678"
            },
            { 
              id: 9,
              name: "SGBAU Main Campus", 
              hasPIC: true,
              website: "https://www.sgbau.ac.in",
              logo_url: "/logos/sgbau-main.png",
              address: "Amravati, Maharashtra",
              contact_email: "info@sgbau.ac.in",
              contact_phone: "+91-721-2662206"
            },
            { 
              id: 10,
              name: "Vidyabharti College", 
              hasPIC: true,
              website: "https://www.vidyabharti-college.edu.in",
              logo_url: "/logos/vidyabharti.png",
              address: "Amravati, Maharashtra",
              contact_email: "principal@vidyabharti-college.edu.in",
              contact_phone: "+91-721-3456789"
            },
            { 
              id: 11,
              name: "College of Pharmacy", 
              hasPIC: true,
              website: "https://www.pharmacy-amravati.edu.in",
              logo_url: "/logos/pharmacy-amravati.png",
              address: "Amravati, Maharashtra",
              contact_email: "dean@pharmacy-amravati.edu.in",
              contact_phone: "+91-721-4567890"
            },
            { 
              id: 12,
              name: "Institute of Science", 
              hasPIC: true,
              website: "https://www.science-amravati.edu.in",
              logo_url: "/logos/science-institute.png",
              address: "Amravati, Maharashtra",
              contact_email: "director@science-amravati.edu.in",
              contact_phone: "+91-721-5678901"
            }
          ],
          totalColleges: 6,
          activePICs: 6
        },
        {
          district: "Buldhana",
          colleges: [
            { 
              id: 13,
              name: "Government College", 
              hasPIC: true,
              website: "https://www.govt-college-buldhana.edu.in",
              logo_url: "/logos/govt-college-buldhana.png",
              address: "Buldhana, Maharashtra",
              contact_email: "principal@govt-college-buldhana.edu.in",
              contact_phone: "+91-726-1234567"
            },
            { 
              id: 14,
              name: "Engineering College", 
              hasPIC: true,
              website: "https://www.engineering-buldhana.edu.in",
              logo_url: "/logos/engineering-buldhana.png",
              address: "Buldhana, Maharashtra",
              contact_email: "info@engineering-buldhana.edu.in",
              contact_phone: "+91-726-2345678"
            },
            { 
              id: 15,
              name: "Polytechnic College", 
              hasPIC: true,
              website: "https://www.polytechnic-buldhana.edu.in",
              logo_url: "/logos/polytechnic-buldhana.png",
              address: "Buldhana, Maharashtra",
              contact_email: "principal@polytechnic-buldhana.edu.in",
              contact_phone: "+91-726-3456789"
            },
            { 
              id: 16,
              name: "Institute of Management", 
              hasPIC: true,
              website: "https://www.management-buldhana.edu.in",
              logo_url: "/logos/management-buldhana.png",
              address: "Buldhana, Maharashtra",
              contact_email: "director@management-buldhana.edu.in",
              contact_phone: "+91-726-4567890"
            }
          ],
          totalColleges: 4,
          activePICs: 4
        },
        {
          district: "Washim",
          colleges: [
            { 
              id: 17,
              name: "Washim College", 
              hasPIC: true,
              website: "https://www.washim-college.edu.in",
              logo_url: "/logos/washim-college.png",
              address: "Washim, Maharashtra",
              contact_email: "principal@washim-college.edu.in",
              contact_phone: "+91-725-1234567"
            },
            { 
              id: 18,
              name: "Engineering Institute", 
              hasPIC: true,
              website: "https://www.engineering-washim.edu.in",
              logo_url: "/logos/engineering-washim.png",
              address: "Washim, Maharashtra",
              contact_email: "info@engineering-washim.edu.in",
              contact_phone: "+91-725-2345678"
            },
            { 
              id: 19,
              name: "Polytechnic", 
              hasPIC: true,
              website: "https://www.polytechnic-washim.edu.in",
              logo_url: "/logos/polytechnic-washim.png",
              address: "Washim, Maharashtra",
              contact_email: "principal@polytechnic-washim.edu.in",
              contact_phone: "+91-725-3456789"
            }
          ],
          totalColleges: 3,
          activePICs: 3
        },
        {
          district: "Yavatmal",
          colleges: [
            { 
              id: 20,
              name: "Yavatmal College", 
              hasPIC: true,
              website: "https://www.yavatmal-college.edu.in",
              logo_url: "/logos/yavatmal-college.png",
              address: "Yavatmal, Maharashtra",
              contact_email: "principal@yavatmal-college.edu.in",
              contact_phone: "+91-723-1234567"
            },
            { 
              id: 21,
              name: "Engineering College", 
              hasPIC: true,
              website: "https://www.engineering-yavatmal.edu.in",
              logo_url: "/logos/engineering-yavatmal.png",
              address: "Yavatmal, Maharashtra",
              contact_email: "info@engineering-yavatmal.edu.in",
              contact_phone: "+91-723-2345678"
            },
            { 
              id: 22,
              name: "Polytechnic Institute", 
              hasPIC: true,
              website: "https://www.polytechnic-yavatmal.edu.in",
              logo_url: "/logos/polytechnic-yavatmal.png",
              address: "Yavatmal, Maharashtra",
              contact_email: "principal@polytechnic-yavatmal.edu.in",
              contact_phone: "+91-723-3456789"
            },
            { 
              id: 23,
              name: "College of Agriculture", 
              hasPIC: true,
              website: "https://www.agriculture-yavatmal.edu.in",
              logo_url: "/logos/agriculture-yavatmal.png",
              address: "Yavatmal, Maharashtra",
              contact_email: "dean@agriculture-yavatmal.edu.in",
              contact_phone: "+91-723-4567890"
            }
          ],
          totalColleges: 4,
          activePICs: 4
        }
      ];
    }
    
    res.json({
      success: true,
      data: { colleges }
    });
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch colleges'
    });
  }
});

module.exports = router;
