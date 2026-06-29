const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM settings');
    const rows = stmt.all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.post('/', (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) {
    return res.status(400).json({ error: 'Key and value required' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO settings (key, value) 
      VALUES (?, ?) 
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);
    stmt.run(key, value);
    res.status(200).json({ key, value });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

module.exports = router;
