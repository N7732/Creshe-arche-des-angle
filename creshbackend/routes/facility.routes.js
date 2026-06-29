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

router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM facilities ORDER BY created_at DESC');
    const rows = stmt.all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
});

router.post('/', upload.single('image'), (req, res) => {
  const { title, description, category } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  
  const image_url = `http://localhost:5000/uploads/${req.file.filename}`;

  try {
    const stmt = db.prepare('INSERT INTO facilities (title, description, category, image_url) VALUES (?, ?, ?, ?)');
    const info = stmt.run(title, description, category, image_url);
    res.status(201).json({ id: info.lastInsertRowid, title, description, category, image_url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save facility' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM facilities WHERE id = ?');
    stmt.run(req.params.id);
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete facility' });
  }
});

module.exports = router;
