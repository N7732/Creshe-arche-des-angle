const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { parseDriveLink } = require('../utils/drive');

// Public route to get team profiles
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM team_profiles ORDER BY created_at ASC');
    const mapped = result.rows.map(row => ({
      ...row,
      image_url: parseDriveLink(row.image_url)
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Fetch team error:', error);
    res.status(500).json({ error: 'Failed to fetch team profiles' });
  }
});

// Admin route to create a team profile
router.post('/', async (req, res) => {
  const { name, role, bio, email, phone, image_url } = req.body;
  if (!image_url) {
    return res.status(400).json({ error: 'No image URL provided' });
  }
  
  try {
    const result = await db.query(
      'INSERT INTO team_profiles (name, role, bio, email, phone, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [name, role, bio || '', email || '', phone || '', image_url]
    );
    res.status(201).json({ 
      id: result.rows[0].id, 
      name, role, bio, email, phone, 
      image_url: parseDriveLink(image_url) 
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Failed to save team profile' });
  }
});

// Admin route to delete a team profile
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM team_profiles WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Failed to delete team profile' });
  }
});

// Admin route to update a team profile
router.put('/:id', async (req, res) => {
  const { name, role, bio, email, phone, image_url } = req.body;
  const id = req.params.id;
  
  try {
    if (image_url) {
      await db.query(
        'UPDATE team_profiles SET name = $1, role = $2, bio = $3, email = $4, phone = $5, image_url = $6 WHERE id = $7',
        [name, role, bio || '', email || '', phone || '', image_url, id]
      );
      res.status(200).json({ id, name, role, bio, email, phone, image_url: parseDriveLink(image_url) });
    } else {
      await db.query(
        'UPDATE team_profiles SET name = $1, role = $2, bio = $3, email = $4, phone = $5 WHERE id = $6',
        [name, role, bio || '', email || '', phone || '', id]
      );
      const current = await db.query('SELECT image_url FROM team_profiles WHERE id = $1', [id]);
      res.status(200).json({ 
        id, name, role, bio, email, phone, 
        image_url: current.rows.length > 0 ? parseDriveLink(current.rows[0].image_url) : null 
      });
    }
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ error: 'Failed to update team profile' });
  }
});

module.exports = router;
