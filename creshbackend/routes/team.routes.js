const express = require('express');
const router = express.Router();
const db = require('../db/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Public route to get team profiles
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM team_profiles ORDER BY created_at ASC');
    const rows = stmt.all();
    res.json(rows);
  } catch (error) {
    console.error('Fetch team error:', error);
    res.status(500).json({ error: 'Failed to fetch team profiles' });
  }
});

// Admin route to create a team profile
router.post('/', upload.single('image'), (req, res) => {
  const { name, role, bio, email, phone } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  
  const image_url = `http://localhost:5000/uploads/${req.file.filename}`;

  try {
    const stmt = db.prepare('INSERT INTO team_profiles (name, role, bio, email, phone, image_url) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(name, role, bio || '', email || '', phone || '', image_url);
    res.status(201).json({ id: info.lastInsertRowid, name, role, bio, email, phone, image_url });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Failed to save team profile' });
  }
});

// Admin route to delete a team profile
// Admin route to delete a team profile
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM team_profiles WHERE id = ?');
    const info = stmt.run(req.params.id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Failed to delete team profile' });
  }
});

// Admin route to update a team profile
router.put('/:id', upload.single('image'), (req, res) => {
  const { name, role, bio, email, phone } = req.body;
  const id = req.params.id;
  
  try {
    if (req.file) {
      const image_url = `http://localhost:5000/uploads/${req.file.filename}`;
      const stmt = db.prepare('UPDATE team_profiles SET name = ?, role = ?, bio = ?, email = ?, phone = ?, image_url = ? WHERE id = ?');
      stmt.run(name, role, bio || '', email || '', phone || '', image_url, id);
      res.status(200).json({ id, name, role, bio, email, phone, image_url });
    } else {
      const stmt = db.prepare('UPDATE team_profiles SET name = ?, role = ?, bio = ?, email = ?, phone = ? WHERE id = ?');
      stmt.run(name, role, bio || '', email || '', phone || '', id);
      // We don't have the original image_url easily here unless we query it, but we can just return what changed.
      // Wait, let's query the image_url to return the complete object.
      const current = db.prepare('SELECT image_url FROM team_profiles WHERE id = ?').get(id);
      res.status(200).json({ id, name, role, bio, email, phone, image_url: current ? current.image_url : null });
    }
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ error: 'Failed to update team profile' });
  }
});

module.exports = router;
