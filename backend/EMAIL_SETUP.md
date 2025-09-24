# Email Verification Setup Guide

## Overview
This guide explains how to set up email verification for the SGBAU Innovation Hub application.

## Email Service Configuration

### 1. Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use the app password in your environment variables

### 2. Environment Variables
Create a `.env` file in the backend directory with:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_SECRET=your_email_encryption_secret_key
FRONTEND_URL=http://localhost:3000
```

### 3. Alternative Email Providers
You can use other SMTP providers by modifying `backend/services/emailService.js`:

```javascript
// For Outlook/Hotmail
this.transporter = nodemailer.createTransporter({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// For Custom SMTP
this.transporter = nodemailer.createTransporter({
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## Features

### 1. Email Verification Flow
- User registers → OTP sent to email
- User enters OTP → Email verified
- User can now login and access dashboard

### 2. OTP Security
- 6-digit numeric OTP
- 10-minute expiration
- One-time use
- Rate limiting on resend

### 3. Email Templates
- Professional HTML templates
- Responsive design
- Branded with SGBAU colors
- Clear instructions and CTAs

## API Endpoints

### Send OTP
```
POST /api/email/send-otp
{
  "email": "user@example.com",
  "name": "User Name"
}
```

### Verify OTP
```
POST /api/email/verify-otp
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Resend OTP
```
POST /api/email/resend-otp
{
  "email": "user@example.com"
}
```

### Check Verification Status
```
GET /api/email/verification-status
Authorization: Bearer <token>
```

## Testing

### 1. Test Email Configuration
```bash
cd backend
node -e "
const emailService = require('./services/emailService');
emailService.sendOTPEmail('test@example.com', '123456', 'Test User')
  .then(result => console.log('Email test result:', result))
  .catch(err => console.error('Email test error:', err));
"
```

### 2. Test Registration Flow
1. Register a new user
2. Check email for OTP
3. Enter OTP in verification page
4. Verify user can login

## Troubleshooting

### Common Issues

1. **"Email service configuration error"**
   - Check EMAIL_USER and EMAIL_PASS in .env
   - Verify Gmail app password is correct
   - Ensure 2FA is enabled on Gmail

2. **"Failed to send OTP email"**
   - Check internet connection
   - Verify SMTP settings
   - Check email provider limits

3. **"OTP has expired"**
   - OTPs expire after 10 minutes
   - Use resend functionality
   - Check system time synchronization

4. **"Invalid OTP"**
   - Ensure OTP is exactly 6 digits
   - Check for typos
   - Verify OTP hasn't been used already

### Debug Mode
Enable detailed logging by setting:
```env
NODE_ENV=development
```

## Security Considerations

1. **OTP Storage**: OTPs are hashed in database
2. **Rate Limiting**: Prevents spam/abuse
3. **Expiration**: OTPs expire after 10 minutes
4. **One-time Use**: OTPs are invalidated after use
5. **Email Validation**: Only verified emails can login

## Production Deployment

1. Use environment variables for all secrets
2. Configure proper SMTP provider
3. Set up monitoring for email delivery
4. Implement proper error handling
5. Consider using email service providers (SendGrid, AWS SES, etc.)

## Support

For issues or questions:
1. Check the logs in `backend/logs/`
2. Verify environment configuration
3. Test email service independently
4. Contact system administrator
