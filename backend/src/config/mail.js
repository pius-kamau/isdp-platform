const { TransactionalEmailsApi, SendSmtpEmail } = require('@sendinblue/client');
const fs = require('fs');
const path = require('path');

// Simple logger that uses console
const logger = {
  info: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
};

class MailService {
  constructor() {
    this.client = null;
    this.apiKey = process.env.BREVO_API_KEY;
    this.senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@isdp.com';
    this.senderName = process.env.BREVO_SENDER_NAME || 'ISDP Platform';
    this.isConfigured = false;
  }

  async connect() {
    try {
      console.log('📧 Initializing Brevo email service...');
      console.log('📧 API Key present:', !!this.apiKey);
      console.log('📧 Sender Email:', this.senderEmail);
      
      if (!this.apiKey) {
        console.log('⚠️ Brevo API key not configured. Emails will be logged.');
        return;
      }

      this.client = new TransactionalEmailsApi();
      this.client.setApiKey(0, this.apiKey);
      this.isConfigured = true;
      console.log('✅ Brevo email service connected successfully');
    } catch (error) {
      console.error('❌ Brevo email connection failed:', error.message);
      this.isConfigured = false;
    }
  }

  renderTemplate(templateName, variables) {
    try {
      const templatePath = path.join(__dirname, '../templates', templateName);
      
      // Check if template exists
      if (!fs.existsSync(templatePath)) {
        console.log('⚠️ Template not found:', templatePath);
        // Return a simple HTML template
        return `
          <h1>Reset Your Password</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${variables.resetUrl}">${variables.resetUrl}</a>
          <p>This link will expire in 1 hour.</p>
        `;
      }
      
      let html = fs.readFileSync(templatePath, 'utf8');
      
      for (const [key, value] of Object.entries(variables)) {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
      
      return html;
    } catch (error) {
      console.error('Template render error:', error);
      return `<p>Reset your password: <a href="${variables.resetUrl}">${variables.resetUrl}</a></p>`;
    }
  }

  async sendEmail({ to, subject, html, text }) {
    console.log('📧 sendEmail called');
    console.log('📧 To:', to);
    console.log('📧 Subject:', subject);
    console.log('📧 Configured:', this.isConfigured);

    // If not configured, just log
    if (!this.isConfigured || !this.client) {
      console.log(`📧 Email would be sent to ${to}: ${subject}`);
      console.log(`📧 Email content preview:`, (html || text || '').substring(0, 200));
      return { messageId: 'mock-id', status: 'logged' };
    }

    try {
      const sendSmtpEmail = new SendSmtpEmail();
      sendSmtpEmail.sender = {
        email: this.senderEmail,
        name: this.senderName,
      };
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html || text || '';
      sendSmtpEmail.textContent = text || html ? html.replace(/<[^>]*>/g, '') : '';

      console.log('📧 Sending email via Brevo...');
      const response = await this.client.sendTransacEmail(sendSmtpEmail);
      console.log(`✅ Email sent successfully to ${to}: ${subject}`);
      console.log('📧 Message ID:', response.messageId);
      return response;
    } catch (error) {
      console.error('❌ Email send error:', error.message);
      if (error.response) {
        console.error('❌ Brevo API error:', error.response.body);
      }
      throw error;
    }
  }

  // Send verification email
  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
    
    const html = this.renderTemplate('verification.html', {
      verificationUrl,
    });

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - ISDP',
      html,
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(email, token) {
    console.log('📧 sendPasswordResetEmail called for:', email);
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    console.log('📧 Reset URL:', resetUrl);
    
    const html = this.renderTemplate('password-reset.html', {
      resetUrl,
    });

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password - ISDP',
      html,
    });
  }

  // Send welcome email
  async sendWelcomeEmail(email, fullName) {
    const platformUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    
    const html = this.renderTemplate('welcome.html', {
      fullName,
      platformUrl,
    });

    return this.sendEmail({
      to: email,
      subject: 'Welcome to ISDP',
      html,
    });
  }
}

// Create singleton instance
const mailService = new MailService();

// Connect immediately
mailService.connect();

module.exports = mailService;
