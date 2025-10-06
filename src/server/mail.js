import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ES Module __dirname workaround
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS

  }
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter setup error:', error);
  } else {
    console.log('Server is ready to send email');
  }
});

// Basic email sender
export const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.MAIL_USER, 
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

// Session request email using Handlebars template
export async function sendSessionRequestEmail(to, data) {
  try {
    const templatePath = path.resolve(__dirname, './emails/sessionRequest.hbs');
    console.log('Reading email template from:', templatePath);

    const source = await fs.readFile(templatePath, 'utf8');
    const template = handlebars.compile(source);
    const html = template(data);

    const subject = 'New Session Request';
    const text = `Hello ${data.tutorName}, you have a new session request from ${data.studentName} for ${data.courseName} on ${data.date} at ${data.time}.`;

    const mailOptions = {
      from: process.env.MAIL_USER,
      to,
      subject,
      text,
      html,
      attachments: [
        {
          filename: 'CAE.jpg',
          path: './public/img/CAE.jpg',
          cid: 'logo'  
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;

  } catch (e) {
    console.error('Error sending email:', e.message, e.stack);
    throw e;
  }
}

export async function sendFeedbackEmail(to, data) {
  try {
    const templatePath = path.resolve(__dirname, './emails/feedback.hbs');

    const source = await fs.readFile(templatePath, 'utf8');
    const template = handlebars.compile(source);
    const html = template(data);
  
    const subject = 'Provide Feedback to your Session!';
    const text = `Hello ${data.studentName}, Thank you for attending the session. Please provide feedback.`;
  
    const mailOptions = {
      from: process.env.MAIL_USER,
      to,
      subject,
      text,
      html,
      attachments: [
        {
          filename: 'CAE.jpg',
          path: './public/img/CAE.jpg',
          cid: 'logo'  
        }
      ]
    };
  
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  }
  catch(e) {
    console.error('Error sending email:', e.message, e.stack);
    throw e;
  }
}

export async function sendSessionCancelationEmail(to, data) {
  try {
    const templatePath = path.resolve(__dirname, './emails/cancelSession.hbs');

    const source = await fs.readFile(templatePath, 'utf8');
    const template = handlebars.compile(source);
    const html = template(data);
  
    const subject = 'Session Canceled';
    const text = `Hello ${data.studentName}, your session for ${data.courseName} on ${data.date} at ${data.time} has been canceled.`;
  
    const mailOptions = {
      from: process.env.MAIL_USER,
      to,
      subject,
      text,
      html,
      attachments: [
        {
          filename: 'CAE.jpg',
          path: './public/img/CAE.jpg',
          cid: 'logo'  
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
    
  }
  catch(e) {
    console.error('Error sending email:', e.message, e.stack);
    throw e;
  }
}