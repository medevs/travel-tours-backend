const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      PASS: process.env.EMAIL_PASSWORD
    }
  });

  // define Email options
  const mailOptions = {
    from: 'Ahmed Oublihi <oublihi.a@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  }

  // Send Email
  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;