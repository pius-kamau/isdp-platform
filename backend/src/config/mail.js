const { TransactionalEmailsApi, SendSmtpEmail } = require('@sendinblue/client');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

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
      if (!this.apiKey) {
        logger.warn('⚠️ Brevo API key not configured. Emails will be logged.');
        return;
      }

      this.client = new TransactionalEmailsApi();
      this.client.setApiKey(0, this.apiKey);
      this.isConfigured = true;
      logger.info('✅ Brevo email service connected successfully');
    } catch (error) {
      logger.warn('⚠️ Brevo email connection failed:', error.message);
      this.isConfigured = false;
    }
  }

  // Helper to load and render template
  renderTemplate(templateName, variables) {
    const templatePath = path.join(__dirname, '../templates', templateName);
    let html = fs.readFileSync(templatePath, 'utf8');
    
    // Replace all {{key}} with values
    for (const [key, value] of Object.entries(variables)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    return html;
  }

  async sendEmail({ to, subject, html, text }) {
    // If not configured, just log
    if (!this.isConfigured || !this.client) {
      logger.info(`📧 Email would be sent to ${to}: ${subject}`);
      logger.info(`Email content: ${html || text}`);
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

      const response = await this.client.sendTransacEmail(sendSmtpEmail);
      logger.info(`📧 Email sent successfully to ${to}: ${subject}`);
      return response;
    } catch (error) {
      logger.error('Email send error:', error.message);
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
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    
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
      subject: 'Welcome to ISDP ',
      html,
    });
  }
}

module.exports = new MailService();