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

module.exports = { sendResetEmail };
