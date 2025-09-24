# Authentication Guide

## Login Credentials

### System Admin
- **Email:** `admin@innovationhub.com`
- **Password:** `admin123`
- **Role:** `admin`
- **Access:** Full system access

### College Admins
- **Email:** `admin2@college2.edu`
- **Password:** `admin123`
- **Role:** `college_admin`
- **Access:** College-specific data and management

### Incubator Managers
- **Email:** `manager@sgbau.edu.in`
- **Password:** `manager123`
- **Role:** `incubator_manager`
- **Access:** Incubator-specific data and management

## All Available Admin Users

### System Admins
- `admin@innovationhub.com` - Super Admin (admin123)

### College Admins
- `admin1@college1.edu` - Government College of Engineering, Amravati (admin123)
- `admin2@college2.edu` - College 2 (admin123)
- `admin3@college3.edu` - Shri Sant Gajanan Maharaj College of Engineering, Shegaon (admin123)
- `admin@amravaticollege1.edu` - Government College of Engineering - Amravati (admin123)
- `admin@akolacollege1.edu` - Government College of Engineering - Akola (admin123)
- `admin@washimcollege1.edu` - Government College of Engineering - Washim (admin123)
- `admin@yavatmalcollege1.edu` - Government College of Engineering - Yavatmal (admin123)
- `admin@buldhanacollege1.edu` - Government College of Engineering - Buldhana (admin123)

### Incubator Managers
- `manager@sgbau.edu.in` - SGBAU Innovation Hub (manager123)
- `manager2@incubator2.edu` - SGBAU Innovation Hub (manager123)
- `sarah.wilson@incubator.edu` - SGBAU Innovation Hub (manager123)
- `manager@amravatiinnovationhub.com` - SGBAU Innovation Hub (manager123)

## Password Standards

- **Admin users:** `admin123`
- **College Admin users:** `admin123`
- **Incubator Manager users:** `manager123`

## Testing Authentication

Run the test script to verify all logins work:
```bash
node test-logins.js
```

## Fixing Authentication Issues

If authentication issues occur, run the fix script:
```bash
node fix-authentication.js
```

This will reset all admin and incubator user passwords to the standard credentials.

## Security Notes

⚠️ **For Production Deployment:**
1. Change all default passwords
2. Use strong, unique passwords for each user
3. Implement password complexity requirements
4. Enable two-factor authentication
5. Regularly rotate passwords
6. Monitor login attempts and implement rate limiting

## Troubleshooting

### Common Issues:
1. **401 Unauthorized:** Check email and password combination
2. **Invalid credentials:** User may not exist or password is incorrect
3. **Account inactive:** User account may be deactivated
4. **Token expired:** Refresh token or re-login

### Solutions:
1. Verify user exists in database
2. Check password hash in database
3. Ensure user is active (`is_active = true`)
4. Clear browser cache and cookies
5. Restart backend server if needed
