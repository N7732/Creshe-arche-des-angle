const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const z = require('zod');
const { OAuth2Client } = require('google-auth-library');
const db = require('../db/database');
const { validateRequest } = require('../middleware/validate');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const googleSchema = z.object({
  token: z.string()
});

// Register via Email/Password
router.post('/register', validateRequest(registerSchema), async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const existing = await db.query('SELECT id FROM parents WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO parents ("fullName", email, password) VALUES ($1, $2, $3) RETURNING id, "fullName", email',
      [fullName, email, hashedPassword]
    );

    const parent = result.rows[0];
    const token = jwt.sign({ id: parent.id, email: parent.email, role: 'parent' }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ message: 'Registration successful', token, parent: { id: parent.id, fullName: parent.fullName, email: parent.email } });
  } catch (error) {
    console.error('Parent register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login via Email/Password
router.post('/login', validateRequest(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM parents WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const parent = result.rows[0];

    if (!parent.password) {
      return res.status(401).json({ error: 'This account uses Google Sign-In. Please sign in with Google.' });
    }

    const isMatch = await bcrypt.compare(password, parent.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: parent.id, email: parent.email, role: 'parent' }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ message: 'Login successful', token, parent: { id: parent.id, fullName: parent.fullName, email: parent.email } });
  } catch (error) {
    console.error('Parent login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth Login/Registration
router.post('/google', validateRequest(googleSchema), async (req, res) => {
  const { token } = req.body;
  try {
    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name: fullName } = payload;

    // Check if user already exists
    let result = await db.query('SELECT * FROM parents WHERE email = $1', [email]);
    let parent = result.rows[0];

    if (parent) {
      // Update googleId if not present
      if (!parent.googleId) {
        await db.query('UPDATE parents SET "googleId" = $1 WHERE id = $2', [googleId, parent.id]);
      }
    } else {
      // Register new user via Google
      const insertResult = await db.query(
        'INSERT INTO parents ("fullName", email, "googleId") VALUES ($1, $2, $3) RETURNING *',
        [fullName, email, googleId]
      );
      parent = insertResult.rows[0];
    }

    const jwtToken = jwt.sign({ id: parent.id, email: parent.email, role: 'parent' }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ message: 'Google login successful', token: jwtToken, parent: { id: parent.id, fullName: parent.fullName, email: parent.email } });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

module.exports = router;
