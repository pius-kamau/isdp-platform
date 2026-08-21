const brevo = require('@sendinblue/client');

let apiInstance = null;
let isInitialized = false;

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
console.log('📧 Mail service loaded. CLIENT_URL:', CLIENT_URL);

function initializeBrevo() {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ BREVO_API_KEY not set. Email will be disabled.');
      return null;
    }

    const api = new brevo.TransactionalEmailsApi();
    const auth = api.authentications['apiKey'];
    auth.apiKey = apiKey;
    
    apiInstance = api;
    isInitialized = true;
    console.log('✅ Brevo email service initialized successfully');
    return api;
  } catch (error) {
    console.error('❌ Failed to initialize Brevo:', error.message);
    return null;
  }
}

async function sendEmail({ to, subject, htmlContent, textContent }) {
  if (!isInitialized) {
    initializeBrevo();
  }
  
  if (!isInitialized || !apiInstance) {
    console.log('📧 [DEV] Email would be sent to:', to);
    console.log('📧 [DEV] Subject:', subject);
    return { 
      success: true, 
      message: 'Email logged (Brevo not configured)' 
    };
  }

  try {
    const fromEmail = process.env.BREVO_SENDER_EMAIL || 'pitechtechnologies@gmail.com';
    const fromName = process.env.BREVO_SENDER_NAME || 'ISDP Platform';

    const sendSmtpEmail = {
      sender: { email: fromEmail, name: fromName },
      to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
      subject: subject,
      htmlContent: htmlContent,
      textContent: textContent || '',
    };

    console.log('📧 Sending email via Brevo to:', to);
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent successfully! Message ID:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    if (error.response) {
      console.error('❌ Brevo error details:', JSON.stringify(error.response.body, null, 2));
    }
    return { success: false, error: error.message };
  }
}

async function sendVerificationEmail(email, fullName, verificationToken) {
  const verifyLink = `${CLIENT_URL}/verify-email?token=${verificationToken}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Verify Your Email</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f7f8f7; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .logo h1 { color: #00B330; font-size: 28px; text-align: center; }
        h2 { color: #1a202c; margin-top: 0; }
        p { color: #4a5568; line-height: 1.6; }
        .btn { display: inline-block; background: #00B330; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; font-size: 12px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px; }
        .token-box { background: #f7f8f7; padding: 15px; border-radius: 8px; font-size: 12px; word-break: break-all; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo"><h1>🌱 ISDP Platform</h1></div>
        <h2>Verify Your Email Address</h2>
        <p>Hi ${fullName},</p>
        <p>Welcome to ISDP Platform! Please verify your email address to get started.</p>
        <div style="text-align: center;">
          <a href="${verifyLink}" class="btn">Verify Email</a>
        </div>
        <p style="font-size: 14px; color: #718096;">Or copy and paste this link into your browser:</p>
        <div class="token-box">${verifyLink}</div>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <div class="footer">&copy; 2026 ISDP Platform. All rights reserved.</div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to ISDP Platform - Verify Your Email',
    htmlContent,
    textContent: `Welcome to ISDP Platform!\n\nPlease verify your email by clicking this link: ${verifyLink}\n\nThis link expires in 24 hours.`
  });
}

async function sendPasswordResetEmail(email, resetToken) {
  const resetLink = `${CLIENT_URL}/reset-password?token=${resetToken}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reset Password</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f7f8f7; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .logo h1 { color: #00B330; font-size: 28px; text-align: center; }
        h2 { color: #1a202c; margin-top: 0; }
        p { color: #4a5568; line-height: 1.6; }
        .btn { display: inline-block; background: #00B330; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; font-size: 12px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px; }
        .token-box { background: #f7f8f7; padding: 15px; border-radius: 8px; font-size: 12px; word-break: break-all; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo"><h1>🌱 ISDP Platform</h1></div>
        <h2>Reset Your Password</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password.</p>
        <div style="text-align: center;">
          <a href="${resetLink}" class="btn">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #718096;">Or copy and paste this link into your browser:</p>
        <div class="token-box">${resetLink}</div>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <div class="footer">&copy; 2026 ISDP Platform. All rights reserved.</div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - ISDP Platform',
    htmlContent,
    textContent: `Reset Your Password\n\nClick this link to reset your password: ${resetLink}\n\nThis link expires in 1 hour.`
  });
}

module.exports = {
  initializeBrevo,
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail
};
