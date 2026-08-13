// Dummy email service - replace with real implementation later
async function initializeBrevo() {
  console.log('⚠️ Email service disabled (placeholder)');
  return null;
}

async function sendEmail({ to, subject, htmlContent, textContent }) {
  console.log(`📧 Email would be sent to: ${to}`);
  console.log(`📧 Subject: ${subject}`);
  console.log(`📧 Content: ${htmlContent?.substring(0, 100)}...`);
  return { success: true, message: 'Email disabled (placeholder)' };
}

module.exports = {
  initializeBrevo,
  sendEmail
};
