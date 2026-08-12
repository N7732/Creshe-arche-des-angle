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
router.post('/', validateRequest(contactSchema), async (req, res) => {
  const { parentName, email, phone, subject, message } = req.body;
  
  try {
    const result = await db.query(`
      INSERT INTO contacts (parentName, email, phone, subject, message)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [parentName, email, phone, subject, message]);

    res.status(201).json({ message: 'Message sent successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Contact submit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all contact messages (Protected)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM contacts ORDER BY createdAt DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
