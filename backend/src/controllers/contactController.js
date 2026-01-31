const nodemailer = require('nodemailer');

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'hopetuitionbygd@gmail.com',
      pass: process.env.EMAIL_PASS || '' // Set this in .env file for security
    }
  });
};

// Handle contact form submission
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, message, userType } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Store in database if you have a Contact model
    // const contact = await Contact.create({ name, email, phone, message, userType });

    // Send email notification to admin
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'hopetuitionbygd@gmail.com',
        to: 'hopetuitionbygd@gmail.com',
        subject: `New Contact Form Submission - ${userType || 'General'}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
            <h2 style="color: #3A2F2A; border-bottom: 3px solid #C2956B; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <p><strong style="color: #3A2F2A;">Name:</strong> ${name}</p>
              <p><strong style="color: #3A2F2A;">Email:</strong> <a href="mailto:${email}">${email}</a></p>
              ${phone ? `<p><strong style="color: #3A2F2A;">Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : ''}
              <p><strong style="color: #3A2F2A;">User Type:</strong> ${userType || 'Not specified'}</p>
              <div style="margin-top: 20px;">
                <strong style="color: #3A2F2A;">Message:</strong>
                <p style="background: white; padding: 15px; border-left: 4px solid #C2956B; margin-top: 10px;">
                  ${message}
                </p>
              </div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #fff3e0; border-radius: 8px;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                This message was sent from the HOPE Online Tuitions contact form.
              </p>
            </div>
          </div>
        `
      };

      // Send auto-reply to user
      const autoReplyOptions = {
        from: process.env.EMAIL_USER || 'hopetuitionbygd@gmail.com',
        to: email,
        subject: 'Thank you for contacting HOPE Online Tuitions',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
            <h2 style="color: #3A2F2A;">Thank you for reaching out!</h2>
            <p>Dear ${name},</p>
            <p>We have received your message and will get back to you within 24-48 hours.</p>
            <p>In the meantime, feel free to explore our platform:</p>
            <ul>
              <li><a href="http://localhost:3000/login">Student Login</a></li>
              <li><a href="http://localhost:3000/tutor/login">Tutor Login</a></li>
            </ul>
            <p style="margin-top: 30px; color: #C2956B; font-style: italic;">
              Saving Time, Inspiring Minds
            </p>
            <p style="color: #666; font-size: 14px;">
              <strong>HOPE Online Tuitions</strong><br />
              Email: hopetuitionbygd@gmail.com<br />
              Phone: 8807717477
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      await transporter.sendMail(autoReplyOptions);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Thank you for contacting us! We will respond within 24-48 hours.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again later.'
    });
  }
};
