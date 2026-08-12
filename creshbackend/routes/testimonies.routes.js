const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { parseDriveLink } = require('../utils/drive');

// Public route to get all testimonies
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM testimonies ORDER BY created_at DESC');
    const mapped = result.rows.map(row => ({
      ...row,
      image_url: parseDriveLink(row.image_url)
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Fetch testimonies error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonies' });
  }
});

// Admin route to create a testimony
router.post('/', async (req, res) => {
  const { name, child_class, message, rating, image_url } = req.body;
  
  if (!image_url) {
    return res.status(400).json({ error: 'No image URL provided' });
  }
  
  const parsedRating = rating ? parseInt(rating, 10) : 5;

  try {
    const result = await db.query(
      'INSERT INTO testimonies (name, child_class, message, rating, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, child_class, message, parsedRating, image_url]
    );
    res.status(201).json({ 
      id: result.rows[0].id, 
      name, child_class, message, rating: parsedRating, 
      image_url: parseDriveLink(image_url) 
    });
  } catch (error) {
    console.error('Create testimony error:', error);
    res.status(500).json({ error: 'Failed to save testimony' });
  }
});

// Admin route to delete a testimony
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM testimonies WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Testimony not found' });
    }
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete testimony error:', error);
    res.status(500).json({ error: 'Failed to delete testimony' });
  }
});

module.exports = router;
