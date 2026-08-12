const express = require('express');
const z = require('zod');
const db = require('../db/database');
const { validateRequest } = require('../middleware/validate');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Validations
const enrollmentSchema = z.object({
  id: z.string().min(1),
  childName: z.string().min(1),
  childDob: z.string().min(1),
  ageGroup: z.string().min(1),
  requestedStartDate: z.string().min(1),
  scheduleDays: z.array(z.string()).min(1),
  preferredClass: z.string().optional(),
  parentName: z.string().min(1),
  parentEmail: z.string().email(),
  parentPhone: z.string().min(1),
  specialNeeds: z.string().optional(),
  additionalNotes: z.string().optional(),
  submissionDate: z.string().min(1),
  status: z.string().optional(),
  currentProgressCode: z.number().optional()
});

const statusUpdateSchema = z.object({
  status: z.string().min(1),
  currentProgressCode: z.number().min(0).max(4)
});

// Helper function to check enrollment status
const getEnrollmentStatus = async () => {
  const enabledSetting = await db.query("SELECT value FROM settings WHERE key = 'enrollment_enabled'");
  const capacitySetting = await db.query("SELECT value FROM settings WHERE key = 'enrollment_capacity'");
  
  const isEnabled = enabledSetting.rows.length > 0 ? enabledSetting.rows[0].value === 'true' : true; // Default true
  const capacity = capacitySetting.rows.length > 0 ? parseInt(capacitySetting.rows[0].value, 10) : 50; // Default 50

  const countRow = await db.query("SELECT count(*) as count FROM enrollments");
  const currentCount = countRow.rows.length > 0 ? parseInt(countRow.rows[0].count, 10) : 0;

  let isOpen = true;
  let reason = null;

  if (!isEnabled) {
    isOpen = false;
    reason = 'manual';
  } else if (currentCount >= capacity) {
    isOpen = false;
    reason = 'capacity';
  }

  return { isOpen, reason, currentCount, capacity };
};

// Check if enrollments are open (Public)
router.get('/status', async (req, res) => {
  try {
    const status = await getEnrollmentStatus();
    res.json(status);
  } catch (error) {
    console.error('Enrollment status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new enrollment (Public)
router.post('/', validateRequest(enrollmentSchema), async (req, res) => {
  const data = req.body;
  try {
    const enrollStatus = await getEnrollmentStatus();
    if (!enrollStatus.isOpen) {
      const msg = enrollStatus.reason === 'capacity' 
        ? 'Nursery capacity has been reached. We are not accepting new enrollments.' 
        : 'Enrollments are currently closed by the administration.';
      return res.status(403).json({ error: msg });
    }

    const existing = await db.query(
      'SELECT id FROM enrollments WHERE LOWER(parentEmail) = LOWER($1) AND parentPhone = $2 AND LOWER(childName) = LOWER($3)',
      [data.parentEmail, data.parentPhone, data.childName]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Your child exists in our database. Please contact the administration.' });
    }

    await db.query(`
      INSERT INTO enrollments (
        id, childName, childDob, ageGroup, requestedStartDate, scheduleDays,
        preferredClass, parentName, parentEmail, parentPhone, status,
        specialNeeds, additionalNotes, submissionDate, currentProgressCode
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `, [
      data.id, data.childName, data.childDob, data.ageGroup, data.requestedStartDate,
      JSON.stringify(data.scheduleDays), data.preferredClass || '', data.parentName,
      data.parentEmail, data.parentPhone, data.status || 'Submitted',
      data.specialNeeds || '', data.additionalNotes || '', data.submissionDate,
      data.currentProgressCode || 0
    ]);

    res.status(201).json({ message: 'Enrollment successfully submitted', id: data.id });
  } catch (error) {
    console.error('Enrollment creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all enrollments (Protected)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM enrollments ORDER BY submissionDate DESC');
    // Parse the JSON string back to array
    const mapped = result.rows.map(e => ({
      ...e,
      scheduleDays: typeof e.scheduleDays === 'string' ? JSON.parse(e.scheduleDays) : e.scheduleDays
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Fetch enrollments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update enrollment status (Protected)
router.put('/:id/status', authenticateAdmin, validateRequest(statusUpdateSchema), async (req, res) => {
  const { id } = req.params;
  const { status, currentProgressCode } = req.body;
  
  try {
    if (status === 'Rejected') {
      const result = await db.query('DELETE FROM enrollments WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }
      res.json({ message: 'Enrollment rejected and deleted successfully' });
    } else {
      const result = await db.query('UPDATE enrollments SET status = $1, currentProgressCode = $2 WHERE id = $3', [status, currentProgressCode, id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }
      res.json({ message: 'Enrollment updated successfully' });
    }
  } catch (error) {
    console.error('Update enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
