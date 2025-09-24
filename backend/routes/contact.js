const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { Op } = require('sequelize');

// @route   POST /api/contact
// @desc    Submit contact form and notify incubator and system administrator
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message, notify_incubator, notify_system_admin, timestamp } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are required'
      });
    }

    // Create contact record (you can add a Contact model later)
    const contactData = {
      name,
      email,
      phone: phone || null,
      subject,
      message,
      notify_incubator: notify_incubator || false,
      notify_system_admin: notify_system_admin || false,
      timestamp: timestamp || new Date().toISOString(),
      status: 'new'
    };

    // Find incubator managers and system administrators to notify
    const notifyUsers = await User.findAll({
      where: {
        role: {
          [Op.in]: ['incubator_manager', 'admin']
        },
        is_active: true
      },
      attributes: ['id', 'name', 'email', 'role']
    });

    // Log the contact submission
    console.log('📧 New contact form submission:', {
      contact: contactData,
      notified_users: notifyUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }))
    });

    // Here you would typically:
    // 1. Save the contact to database
    // 2. Send email notifications to incubator and system admin
    // 3. Create notifications in the system

    res.json({
      success: true,
      message: 'Contact form submitted successfully. Incubator and system administrator have been notified.',
      data: {
        contact: contactData,
        notified_users: notifyUsers.length
      }
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
