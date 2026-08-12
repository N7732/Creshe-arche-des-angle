const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const z = require('zod');
const db = require('../db/database');
const { validateRequest } = require('../middleware/validate');
const { JWT_SECRET, authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  role: z.string().optional()
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

router.post('/register', validateRequest(registerSchema), async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const existing = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id',
      [username, hashedPassword, role || 'admin']
    );
    
    res.status(201).json({ message: 'User registered successfully', userId: result.rows[0].id });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', validateRequest(loginSchema), async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log('Login attempt for username:', username);
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      console.log('User not found in DB');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match?', isMatch);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    console.log('Login successful');
    res.json({ message: 'Login successful', token, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes for managing staff (users)
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, role FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id', authenticateAdmin, async (req, res) => {
  const { role, username } = req.body;
  try {
    await db.query('UPDATE users SET role = $1, username = $2 WHERE id = $3', [role, username, req.params.id]);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
