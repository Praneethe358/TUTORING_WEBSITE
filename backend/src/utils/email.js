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

module.exports = { sendResetEmail, sendTutorStatusEmail };
