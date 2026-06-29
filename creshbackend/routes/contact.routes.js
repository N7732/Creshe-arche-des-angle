const express = require('express');
const z = require('zod');
const db = require('../db/database');
const { validateRequest } = require('../middleware/validate');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

const contactSchema = z.object({
  parentName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  subject: z.string().min(1),
  message: z.string().min(1)
});

// Submit a contact message (Public)
router.post('/', validateRequest(contactSchema), (req, res) => {
  const { parentName, email, phone, subject, message } = req.body;
  
  try {
    const info = db.prepare(`
      INSERT INTO contacts (parentName, email, phone, subject, message)
      VALUES (?, ?, ?, ?, ?)
    `).run(parentName, email, phone, subject, message);

    res.status(201).json({ message: 'Message sent successfully', id: info.lastInsertRowid });
  } catch (error) {
    console.error('Contact submit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all contact messages (Protected)
router.get('/', authenticateAdmin, (req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM contacts ORDER BY createdAt DESC').all();
    res.json(messages);
  } catch (error) {
    console.error('Fetch contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
