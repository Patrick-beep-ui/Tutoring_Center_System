import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Outlook365', 
  auth: {
    user: 'no-reply-TutoringCenter@outlook.com',
    pass: 'Keiser2024', 
  },
});

export const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: 'no-reply-TutoringCenter@outlook.com',
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
