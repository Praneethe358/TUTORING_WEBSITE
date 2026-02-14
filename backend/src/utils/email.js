const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendResetEmail(to, token) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'no-reply@example.com',
    to,
    subject: 'Password Reset',
    text: `Reset your password: ${resetUrl}`,
    html: `<p>Click to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`
  });
}

async function sendTutorStatusEmail(to, name, status, reason) {
  const statusLabel = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Blocked';
  const subject = `Your Tutor Application Has Been ${statusLabel}`;
  const reasonText = reason ? `<p><strong>Reason:</strong> ${reason}</p>` : '';
  const loginUrl = `${process.env.CLIENT_URL}/tutor/login`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'no-reply@example.com',
    to,
    subject,
    text: `Hello ${name}, your tutor application has been ${statusLabel}. ${reason ? `Reason: ${reason}.` : ''} Login: ${loginUrl}`,
    html: `
      <p>Hello ${name},</p>
      <p>Your tutor application has been <strong>${statusLabel}</strong>.</p>
      ${reasonText}
      <p>Login here: <a href="${loginUrl}">${loginUrl}</a></p>
    `
  });
}

async function sendPasswordResetEmail(to, resetToken) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request - HOPE Online Tuitions';
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'hopetuitionbygd@gmail.com',
    to,
    subject,
    text: `Click the link below to reset your password. This link will expire in 1 hour. ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #5B2D8B;">🔐 Password Reset Request</h2>
        <p>Your admin has approved your password reset request. Click the button below to reset your password:</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #5B2D8B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
        <p style="color: #999; font-size: 12px;">⏱️ This link will expire in 1 hour.</p>
        <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">HOPE Online Tuitions | hopetuitionbygd@gmail.com</p>
      </div>
    `
  });
}

module.exports = { sendResetEmail, sendTutorStatusEmail, sendPasswordResetEmail };
