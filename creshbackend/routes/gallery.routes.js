const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { parseDriveLink } = require('../utils/drive');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM galleries ORDER BY created_at DESC');
    const mapped = result.rows.map(row => ({
      ...row,
      image_url: parseDriveLink(row.image_url)
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch galleries' });
  }
});

router.post('/', async (req, res) => {
  const { title, category, image_url } = req.body;
  if (!image_url) {
    return res.status(400).json({ error: 'No image URL provided' });
  }
  
  try {
    const result = await db.query(
      'INSERT INTO galleries (title, category, image_url) VALUES ($1, $2, $3) RETURNING id',
      [title, category, image_url]
    );
    res.status(201).json({ 
      id: result.rows[0].id, 
      title, category, 
      image_url: parseDriveLink(image_url) 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save gallery' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM galleries WHERE id = $1', [req.params.id]);
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete gallery' });
  }
});

module.exports = router;
