const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const emailService = require('../services/emailService');
const { authenticateToken } = require('../middleware/auth');

// @route   POST /api/email/send-otp
// @desc    Send OTP for email verification
// @access  Public
router.post('/send-otp', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').notEmpty().withMessage('Name is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, name } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.',
      });
    }

    // Check if email is already verified
    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified.',
      });
    }

    // Generate OTP
    const otp = emailService.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP
    await user.update({
      email_verification_otp: otp,
      email_verification_otp_expires: otpExpires,
    });

    // Send OTP email
    const emailResult = await emailService.sendOTPEmail(email, otp, name);

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'OTP sent successfully. Please check your email.',
        data: {
          email: email,
          expires_in: 600, // 10 minutes in seconds
        },
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.',
        error: emailResult.error,
      });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// @route   POST /api/email/verify-otp
// @desc    Verify OTP for email verification
// @access  Public
router.post('/verify-otp', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, otp } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Check if email is already verified
    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified.',
      });
    }

    // Check if OTP exists and is not expired
    if (!user.email_verification_otp || !user.email_verification_otp_expires) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new OTP.',
      });
    }

    if (new Date() > user.email_verification_otp_expires) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.',
      });
    }

    // Verify OTP
    if (user.email_verification_otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.',
      });
    }

    // Mark email as verified
    await user.update({
      email_verified: true,
      email_verification_otp: null,
      email_verification_otp_expires: null,
    });

    // Send welcome email
    await emailService.sendWelcomeEmail(email, user.name, user.role);

    res.json({
      success: true,
      message: 'Email verified successfully! Welcome to SGBAU Innovation Hub.',
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// @route   POST /api/email/resend-otp
// @desc    Resend OTP for email verification
// @access  Public
router.post('/resend-otp', [
  body('email').isEmail().withMessage('Valid email is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Check if email is already verified
    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified.',
      });
    }

    // Generate new OTP
    const otp = emailService.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new OTP
    await user.update({
      email_verification_otp: otp,
      email_verification_otp_expires: otpExpires,
    });

    // Send OTP email
    const emailResult = await emailService.sendOTPEmail(email, otp, user.name);

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'New OTP sent successfully. Please check your email.',
        data: {
          email: email,
          expires_in: 600, // 10 minutes in seconds
        },
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.',
        error: emailResult.error,
      });
    }
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// @route   GET /api/email/verification-status
// @desc    Check email verification status
// @access  Private
router.get('/verification-status', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.json({
      success: true,
      data: {
        email_verified: user.email_verified,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error checking verification status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

module.exports = router;
