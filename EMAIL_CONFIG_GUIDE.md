# Email Configuration Guide

## Overview
The auth-service now supports sending emails for:
- Email verification
- Password reset

## Configuration Options

### Option 1: Gmail (Recommended for Development)

#### Step 1: Enable 2FA on your Gmail account
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification

#### Step 2: Generate an App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "Meet-Up Auth Service"
4. Copy the generated 16-character password

#### Step 3: Configure Environment Variables
Set the following environment variables:

```bash
# Windows PowerShell
$env:EMAIL_USERNAME="elbarkoukialae@gmail.com"
$env:EMAIL_PASSWORD="shoj gjvp ddzn jqjk"
$env:EMAIL_FROM="noreply@meetup.com"

# Linux/Mac
export EMAIL_USERNAME="your-email@gmail.com"
export EMAIL_PASSWORD="your-16-char-app-password"
export EMAIL_FROM="noreply@meetup.com"
```

#### Step 4: Update application.yml (Optional)
The configuration is already set up in `auth-service/src/main/resources/application.yml`:

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${EMAIL_USERNAME:your-email@gmail.com}
    password: ${EMAIL_PASSWORD:your-app-password}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
          ssl:
            trust: smtp.gmail.com

app:
  email:
    frontend-url: http://localhost:5173
    from: ${EMAIL_FROM:noreply@meetup.com}
```

### Option 2: Other SMTP Providers

#### SendGrid
```yaml
spring:
  mail:
    host: smtp.sendgrid.net
    port: 587
    username: apikey
    password: ${SENDGRID_API_KEY}
```

#### AWS SES
```yaml
spring:
  mail:
    host: email-smtp.us-east-1.amazonaws.com
    port: 587
    username: ${AWS_SES_USERNAME}
    password: ${AWS_SES_PASSWORD}
```

#### Outlook/Hotmail
```yaml
spring:
  mail:
    host: smtp-mail.outlook.com
    port: 587
    username: ${EMAIL_USERNAME}
    password: ${EMAIL_PASSWORD}
```

## Testing Email Sending

### Using the API

#### Send Verification Email
```bash
curl -X POST http://localhost:8081/api/auth/send-verification-email \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

#### Request Password Reset
```bash
curl -X POST http://localhost:8081/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Using the Frontend

1. Login to your account
2. Go to Profile page
3. Click "Send Verification Email" button
4. Check your email inbox

## Troubleshooting

### Gmail Authentication Failed
- Ensure you're using an App Password, not your regular password
- Check that 2FA is enabled on your Google account
- Verify the email username is correct

### Emails Not Sending
- Check the auth-service logs for error messages
- Verify SMTP settings are correct
- Ensure firewall allows outbound connections on port 587
- Test SMTP connection using telnet: `telnet smtp.gmail.com 587`

### Emails Going to Spam
- Add the sender email to your contacts
- Check SPF/DKIM records for your domain (if using custom domain)
- Use a reputable email service for production

## Production Considerations

1. **Use a dedicated email service** for production (SendGrid, AWS SES, Mailgun)
2. **Set up SPF/DKIM/DMARC records** for your domain
3. **Implement email queueing** to handle high volumes
4. **Add email tracking** (opens, clicks)
5. **Use email templates** with proper branding
6. **Set up rate limiting** to prevent abuse
7. **Implement bounce handling** and retry logic

## Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| EMAIL_USERNAME | SMTP username | your-email@gmail.com |
| EMAIL_PASSWORD | SMTP password or app password | abcd-efgh-ijkl-mnop |
| EMAIL_FROM | From email address | noreply@meetup.com |

## Current Implementation

The email sending is implemented in `AuthServiceImpl.java`:
- `sendEmailVerification()` - Sends verification email with link
- `requestPasswordReset()` - Sends password reset email with link

Both methods:
- Generate tokens and store in database
- Send HTML emails with verification/reset links
- Return tokens for testing purposes
- Gracefully handle email sending failures (logs error but doesn't fail)
