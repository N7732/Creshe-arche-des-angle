const express = require('express');
const router = express.Router();
const db = require('../db/database');
const nodemailer = require('nodemailer');

// Helper function to create transporter (uses dummy config if .env missing)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'dummy@example.com',
      pass: process.env.SMTP_PASS || 'dummy_password'
    }
  });
};

router.get('/', async (req, res) => {
  try {
    // Get unique guardians from enrollments. Using DISTINCT ON (parentEmail) could be good,
    // but just selecting everything and grouping by email is fine too.
    const result = await db.query(`
      SELECT 
        "parentName" as name, 
        "parentEmail" as email, 
        "parentPhone" as phone,
        "ageGroup" as child_class,
        "childName" as child_name
      FROM enrollments
      WHERE "parentEmail" IS NOT NULL AND "parentEmail" != ''
    `);
    
    // Group by email to avoid listing the same parent multiple times
    const grouped = {};
    result.rows.forEach(row => {
      const email = row.email.toLowerCase();
      if (!grouped[email]) {
        grouped[email] = {
          name: row.name,
          email: row.email,
          phone: row.phone,
          children: []
        };
      }
      grouped[email].children.push({
        name: row.child_name,
        class: row.child_class
      });
    });

    res.json(Object.values(grouped));
  } catch (error) {
    console.error('Error fetching guardians:', error);
    res.status(500).json({ error: 'Failed to fetch guardians' });
  }
});

router.post('/send-email', async (req, res) => {
  const { emails, subject, message } = req.body;
  if (!emails || !Array.isArray(emails) || emails.length === 0 || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const transporter = createTransporter();
    
    // If it's a dummy config, we just log it and simulate success
    if (transporter.options.auth.user === 'dummy@example.com') {
      console.log('--- SIMULATED EMAIL ---');
      console.log('To:', emails.join(', '));
      console.log('Subject:', subject);
      console.log('Message:', message);
      console.log('-----------------------');
      return res.status(200).json({ message: 'Emails simulated successfully (Configure SMTP to actually send)' });
    }

    // Send actual emails
    // We send them as BCC so parents don't see each other's emails
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com',
      bcc: emails,
      subject: subject,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">${message.replace(/\n/g, '<br/>')}</div>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);

    res.status(200).json({ message: 'Emails sent successfully', info });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ error: 'Failed to send emails' });
  }
});

module.exports = router;
