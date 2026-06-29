const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const z = require('zod');
const db = require('../db/database');
const { validateRequest } = require('../middleware/validate');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6)
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

router.post('/register', validateRequest(registerSchema), async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const info = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, hashedPassword, 'admin');
    
    res.status(201).json({ message: 'Admin user registered successfully', userId: info.lastInsertRowid });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', validateRequest(loginSchema), async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
