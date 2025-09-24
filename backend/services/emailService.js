const nodemailer = require('nodemailer');
const crypto = require('crypto-js');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Email configuration - using Gmail SMTP as default
    // In production, use environment variables for security
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'dshri3241@gmail.com',
        pass: process.env.EMAIL_PASS || 'kutxnpaijkzsiqkp'
      }
    });

    // Verify transporter configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email service configuration error:', error);
        console.log('📧 Please configure email credentials in .env file');
      } else {
        console.log('✅ Email service ready to send emails');
      }
    });
  }

  // Generate OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  }

  // Generate email verification token
  generateVerificationToken(email) {
    const timestamp = Date.now();
    const data = `${email}-${timestamp}`;
    return crypto.AES.encrypt(data, process.env.EMAIL_SECRET || 'default-secret').toString();
  }

  // Decode verification token
  decodeVerificationToken(token) {
    try {
      const decrypted = crypto.AES.decrypt(token, process.env.EMAIL_SECRET || 'default-secret');
      return decrypted.toString(crypto.enc.Utf8);
    } catch (error) {
      return null;
    }
  }

  // Send OTP email
  async sendOTPEmail(email, otp, userName) {
    const mailOptions = {
      from: `"Sant Gadge Baba Amravati University - Pre-Incubation Centre" <${process.env.EMAIL_USER || 'noreply@sgbau.ac.in'}>`,
      to: email,
      subject: 'Email Verification - Sant Gadge Baba Amravati University Pre-Incubation Centre',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <div style="margin-bottom: 15px;">
              <img src="https://www.sgbau.ac.in/images/logo.png" alt="SGBAU Logo" style="height: 60px; width: auto; max-width: 200px;" onerror="this.style.display='none'">
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Sant Gadge Baba Amravati University</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">Pre-Incubation Centre</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">Email Verification</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #1e40af; margin-top: 0;">Hello ${userName}!</h2>
            
            <p>Thank you for registering with SGBAU Innovation Hub. To complete your registration and start using our platform, please verify your email address.</p>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e40af;">Your Verification Code:</p>
              <div style="font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 5px; font-family: 'Courier New', monospace;">${otp}</div>
            </div>
            
            <p><strong>Instructions:</strong></p>
            <ul style="color: #4b5563;">
              <li>Enter this 6-digit code in the verification form</li>
              <li>The code will expire in 10 minutes</li>
              <li>If you didn't request this verification, please ignore this email</li>
            </ul>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This is an automated message from SGBAU Innovation Hub.<br>
                Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ OTP email sent successfully to:', email);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending OTP email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send welcome email after verification
  async sendWelcomeEmail(email, userName, role) {
    const roleSpecificContent = {
      student: {
        title: 'Welcome to SGBAU Innovation Hub!',
        message: 'You can now submit innovative ideas, connect with mentors, and participate in competitions.',
        features: [
          'Submit your innovative ideas',
          'Get college endorsements',
          'Connect with incubators',
          'Participate in competitions',
          'Access learning resources'
        ]
      },
      college_admin: {
        title: 'Welcome College Administrator!',
        message: 'You can now manage your college\'s innovation activities and endorse student ideas.',
        features: [
          'Manage college profile',
          'Endorse student ideas',
          'Track innovation metrics',
          'Access college dashboard',
          'Communicate with students'
        ]
      },
      incubator_manager: {
        title: 'Welcome Incubation Manager!',
        message: 'You can now manage incubation activities and support innovative ventures.',
        features: [
          'Review submitted ideas',
          'Manage incubation programs',
          'Track startup progress',
          'Access mentor network',
          'Generate reports'
        ]
      }
    };

    const content = roleSpecificContent[role] || roleSpecificContent.student;

    const mailOptions = {
      from: `"Sant Gadge Baba Amravati University - Pre-Incubation Centre" <${process.env.EMAIL_USER || 'noreply@sgbau.ac.in'}>`,
      to: email,
      subject: 'Welcome to Sant Gadge Baba Amravati University Pre-Incubation Centre!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <div style="margin-bottom: 15px;">
              <img src="https://www.sgbau.ac.in/images/logo.png" alt="SGBAU Logo" style="height: 60px; width: auto; max-width: 200px;" onerror="this.style.display='none'">
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Sant Gadge Baba Amravati University</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">Pre-Incubation Centre</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">${content.title}</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #1e40af; margin-top: 0;">Hello ${userName}!</h2>
            
            <p>Congratulations! Your email has been successfully verified and your account is now active.</p>
            
            <p>${content.message}</p>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">What you can do now:</h3>
              <ul style="color: #4b5563; margin: 0;">
                ${content.features.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
                 style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Access Your Dashboard
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                If you have any questions, please contact our support team.<br>
                Thank you for joining SGBAU Innovation Hub!
              </p>
            </div>
          </div>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully to:', email);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, resetToken, userName) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Sant Gadge Baba Amravati University - Pre-Incubation Centre" <${process.env.EMAIL_USER || 'noreply@sgbau.ac.in'}>`,
      to: email,
      subject: 'Password Reset - Sant Gadge Baba Amravati University Pre-Incubation Centre',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <div style="margin-bottom: 15px;">
              <img src="https://www.sgbau.ac.in/images/logo.png" alt="SGBAU Logo" style="height: 60px; width: auto; max-width: 200px;" onerror="this.style.display='none'">
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Sant Gadge Baba Amravati University</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">Pre-Incubation Centre</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">Password Reset Request</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #dc2626; margin-top: 0;">Hello ${userName}!</h2>
            
            <p>We received a request to reset your password for your SGBAU Innovation Hub account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Reset Your Password
              </a>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul style="color: #4b5563;">
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>For security, don't share this link with anyone</li>
            </ul>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This is an automated message from SGBAU Innovation Hub.<br>
                Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully to:', email);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send password change confirmation email
  async sendPasswordChangeConfirmation(email, userName) {
    const mailOptions = {
      from: `"Sant Gadge Baba Amravati University - Pre-Incubation Centre" <${process.env.EMAIL_USER || 'noreply@sgbau.ac.in'}>`,
      to: email,
      subject: 'Password Changed Successfully - Sant Gadge Baba Amravati University Pre-Incubation Centre',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <div style="margin-bottom: 15px;">
              <img src="https://www.sgbau.ac.in/images/logo.png" alt="SGBAU Logo" style="height: 60px; width: auto; max-width: 200px;" onerror="this.style.display='none'">
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Sant Gadge Baba Amravati University</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">Pre-Incubation Centre</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">Password Changed Successfully</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #059669; margin-top: 0;">Hello ${userName}!</h2>
            
            <p>Your password has been successfully changed for your SGBAU Innovation Hub account.</p>
            
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 16px; margin: 20px 0;">
              <h3 style="color: #059669; margin: 0 0 8px 0; font-size: 16px;">✅ Password Changed Successfully</h3>
              <p style="margin: 0; color: #166534;">Your account is now secured with your new password.</p>
            </div>
            
            <p><strong>Security Information:</strong></p>
            <ul style="color: #4b5563;">
              <li>Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</li>
              <li>If you didn't make this change, please contact support immediately</li>
              <li>Your account is now secured with the new password</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                 style="background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Sign In to Your Account
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This is an automated message from SGBAU Innovation Hub.<br>
                Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    try {
      await this.initializeTransporter();
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password change confirmation email sent successfully to:', email);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending password change confirmation email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send idea status update email to student
  async sendIdeaStatusUpdateEmail(email, userName, ideaTitle, newStatus, message, feedback = null) {
    const statusColors = {
      'endorsed': '#059669',
      'rejected': '#dc2626',
      'under_review': '#2563eb',
      'incubated': '#7c3aed',
      'nurture': '#ea580c'
    };

    const statusEmojis = {
      'endorsed': '🎉',
      'rejected': '⚠️',
      'under_review': '👀',
      'incubated': '🚀',
      'nurture': '🌱'
    };

    const statusColor = statusColors[newStatus] || '#2563eb';
    const statusEmoji = statusEmojis[newStatus] || '📝';

    const mailOptions = {
      from: `"Sant Gadge Baba Amravati University - Pre-Incubation Centre" <${process.env.EMAIL_USER || 'noreply@sgbau.ac.in'}>`,
      to: email,
      subject: `Idea Status Update: ${ideaTitle} - SGBAU Innovation Hub`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: ${statusColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <div style="margin-bottom: 15px;">
              <img src="https://www.sgbau.ac.in/images/logo.png" alt="SGBAU Logo" style="height: 60px; width: auto; max-width: 200px;" onerror="this.style.display='none'">
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Sant Gadge Baba Amravati University</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">Pre-Incubation Centre</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">${statusEmoji} Idea Status Update</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: ${statusColor}; margin-top: 0;">Hello ${userName}!</h2>
            
            <div style="background-color: ${statusColor}15; border: 1px solid ${statusColor}40; border-radius: 6px; padding: 16px; margin: 20px 0;">
              <h3 style="color: ${statusColor}; margin: 0 0 8px 0; font-size: 16px;">${statusEmoji} ${message}</h3>
            </div>
            
            <div style="background-color: #f8f9fa; border-radius: 6px; padding: 16px; margin: 20px 0;">
              <h4 style="color: #374151; margin: 0 0 12px 0;">Idea Details:</h4>
              <p style="margin: 5px 0; color: #4b5563;"><strong>Title:</strong> ${ideaTitle}</p>
              <p style="margin: 5px 0; color: #4b5563;"><strong>New Status:</strong> <span style="color: ${statusColor}; font-weight: bold; text-transform: capitalize;">${newStatus.replace('_', ' ')}</span></p>
              <p style="margin: 5px 0; color: #4b5563;"><strong>Updated By:</strong> College Administrator</p>
              <p style="margin: 5px 0; color: #4b5563;"><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            </div>
            
            ${feedback ? `
            <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px; margin: 20px 0;">
              <h4 style="color: #1d4ed8; margin: 0 0 12px 0;">📝 Feedback from Reviewer:</h4>
              <p style="color: #374151; margin: 0; font-style: italic; background-color: white; padding: 12px; border-radius: 4px; border-left: 3px solid #3b82f6;">"${feedback}"</p>
            </div>
            ` : ''}
            
            <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 6px; padding: 16px; margin: 20px 0;">
              <h4 style="color: #92400e; margin: 0 0 8px 0;">💡 Next Steps</h4>
              <p style="color: #92400e; margin: 0; font-size: 14px;">Log into your Innovation Hub account to view detailed feedback and take necessary actions on your idea.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/ideas/my" 
                 style="background-color: ${statusColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View My Ideas
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This is an automated message from SGBAU Innovation Hub.<br>
                Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    try {
      await this.initializeTransporter();
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Idea status update email sent successfully to:', email);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending idea status update email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
