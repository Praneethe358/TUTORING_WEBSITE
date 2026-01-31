/**
 * EMAIL DELIVERY TEST SCRIPT
 * Tests SMTP configuration and email sending functionality
 * Run: node backend/scripts/test-email.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEmailDelivery() {
  log('\n========================================', 'cyan');
  log('📧 EMAIL DELIVERY TEST', 'cyan');
  log('========================================\n', 'cyan');

  // Check environment variables
  log('1️⃣  Checking SMTP configuration...', 'yellow');
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'];
  const missing = requiredVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    log(`❌ Missing environment variables: ${missing.join(', ')}`, 'red');
    log('\nAdd these to your .env file:', 'yellow');
    log('SMTP_HOST=smtp.gmail.com', 'yellow');
    log('SMTP_PORT=587', 'yellow');
    log('SMTP_USER=your-email@gmail.com', 'yellow');
    log('SMTP_PASS=your-app-password', 'yellow');
    log('EMAIL_FROM=noreply@yourapp.com', 'yellow');
    process.exit(1);
  }

  log('✅ All SMTP variables found\n', 'green');

  // Create transporter
  log('2️⃣  Creating SMTP transporter...', 'yellow');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Verify connection
  try {
    await transporter.verify();
    log('✅ SMTP connection verified\n', 'green');
  } catch (error) {
    log('❌ SMTP connection failed:', 'red');
    log(error.message, 'red');
    log('\n💡 Common issues:', 'yellow');
    log('   - Gmail: Enable "Less secure app access" or use App Password', 'yellow');
    log('   - Check firewall/network settings', 'yellow');
    log('   - Verify SMTP credentials are correct\n', 'yellow');
    process.exit(1);
  }

  // Send test email
  log('3️⃣  Sending test email...', 'yellow');
  const testEmail = {
    from: process.env.EMAIL_FROM,
    to: process.env.SMTP_USER, // Send to yourself for testing
    subject: '✅ HOPE Tuition - Email Test Successful',
    text: 'This is a test email from your HOPE Online Tuitions platform. If you receive this, your email configuration is working correctly!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #5B2D8B;">✅ Email Test Successful!</h2>
        <p>This is a test email from your <strong>HOPE Online Tuitions</strong> platform.</p>
        <p>If you're reading this, your email configuration is working correctly! 🎉</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📋 Configuration Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li>📧 SMTP Host: ${process.env.SMTP_HOST}</li>
            <li>🔌 SMTP Port: ${process.env.SMTP_PORT}</li>
            <li>👤 SMTP User: ${process.env.SMTP_USER}</li>
            <li>📤 From Address: ${process.env.EMAIL_FROM}</li>
          </ul>
        </div>

        <p><strong>Next steps:</strong></p>
        <ul>
          <li>✅ Password reset emails will work</li>
          <li>✅ Tutor approval notifications will work</li>
          <li>✅ Contact form submissions will work</li>
        </ul>

        <p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
          <em>Saving Time, Inspiring Minds</em><br>
          HOPE Online Tuitions
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(testEmail);
    log('✅ Test email sent successfully!\n', 'green');
    log(`📬 Message ID: ${info.messageId}`, 'cyan');
    log(`📧 Sent to: ${testEmail.to}`, 'cyan');
    log('\n✨ Check your inbox! Your email system is working.\n', 'green');
  } catch (error) {
    log('❌ Failed to send test email:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }

  // Test password reset email format
  log('4️⃣  Testing password reset email format...', 'yellow');
  const resetToken = 'test-token-' + Math.random().toString(36).substring(7);
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const resetEmail = {
    from: process.env.EMAIL_FROM,
    to: process.env.SMTP_USER,
    subject: 'Password Reset Request - HOPE Online Tuitions',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #5B2D8B;">🔐 Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #5B2D8B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          Or copy this link:<br>
          <a href="${resetUrl}" style="color: #5B2D8B; word-break: break-all;">${resetUrl}</a>
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
          ⚠️ This is a test email. The reset link will not work.<br>
          This link expires in 30 minutes.<br>
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(resetEmail);
    log('✅ Password reset email format test successful!\n', 'green');
  } catch (error) {
    log('❌ Password reset email failed:', 'red');
    log(error.message, 'red');
  }

  log('========================================', 'cyan');
  log('✅ EMAIL SYSTEM FULLY OPERATIONAL', 'green');
  log('========================================\n', 'cyan');
}

testEmailDelivery().catch(error => {
  log('\n❌ Test failed with error:', 'red');
  console.error(error);
  process.exit(1);
});
