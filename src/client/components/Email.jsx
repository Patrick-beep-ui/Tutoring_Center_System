// ------------- Testing Component for Sending Emails -------------

// EmailForm.jsx Testing Component
import { useState } from 'react';
import axios from 'axios';

const EmailForm = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/send-email', { to, subject, text });
      if (response.status === 200) {
        alert('Email sent successfully');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    }
  };

  return (
    <form className = "bg-black" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Recipient Email"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
      />
      <textarea
        placeholder="Message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <button type="submit">Send Email</button>
    </form>
  );
};

export default EmailForm;
