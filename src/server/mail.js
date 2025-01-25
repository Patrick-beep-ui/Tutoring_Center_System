import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "mail.keiseruniversity.edu.ni",
  port: 587,
  secure:false,
  auth: {
      user: "se.student@keiseruniversity.edu.ni",
      pass: "35ChRz)$ieeg"
  }, 

})

export const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: 'se.student@keiseruniversity.edu.ni',
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
