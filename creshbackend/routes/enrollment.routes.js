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
const getEnrollmentStatus = () => {
  const enabledSetting = db.prepare("SELECT value FROM settings WHERE key = 'enrollment_enabled'").get();
  const capacitySetting = db.prepare("SELECT value FROM settings WHERE key = 'enrollment_capacity'").get();
  
  const isEnabled = enabledSetting ? enabledSetting.value === 'true' : true; // Default true
  const capacity = capacitySetting ? parseInt(capacitySetting.value, 10) : 50; // Default 50

  const countRow = db.prepare("SELECT count(*) as count FROM enrollments").get();
  const currentCount = countRow ? countRow.count : 0;

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
router.get('/status', (req, res) => {
  try {
    const status = getEnrollmentStatus();
    res.json(status);
  } catch (error) {
    console.error('Enrollment status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new enrollment (Public)
router.post('/', validateRequest(enrollmentSchema), (req, res) => {
  const data = req.body;
  try {
    const enrollStatus = getEnrollmentStatus();
    if (!enrollStatus.isOpen) {
      const msg = enrollStatus.reason === 'capacity' 
        ? 'Nursery capacity has been reached. We are not accepting new enrollments.' 
        : 'Enrollments are currently closed by the administration.';
      return res.status(403).json({ error: msg });
    }

    const existing = db.prepare('SELECT id FROM enrollments WHERE LOWER(parentEmail) = LOWER(?) AND parentPhone = ? AND LOWER(childName) = LOWER(?)').get(data.parentEmail, data.parentPhone, data.childName);
    if (existing) {
      return res.status(409).json({ error: 'Your child exists in our database. Please contact the administration.' });
    }

    const stmt = db.prepare(`
      INSERT INTO enrollments (
        id, childName, childDob, ageGroup, requestedStartDate, scheduleDays,
        preferredClass, parentName, parentEmail, parentPhone, status,
        specialNeeds, additionalNotes, submissionDate, currentProgressCode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      data.id, data.childName, data.childDob, data.ageGroup, data.requestedStartDate,
      JSON.stringify(data.scheduleDays), data.preferredClass || '', data.parentName,
      data.parentEmail, data.parentPhone, data.status || 'Submitted',
      data.specialNeeds || '', data.additionalNotes || '', data.submissionDate,
      data.currentProgressCode || 0
    );

    res.status(201).json({ message: 'Enrollment successfully submitted', id: data.id });
  } catch (error) {
    console.error('Enrollment creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all enrollments (Protected)
router.get('/', authenticateAdmin, (req, res) => {
  try {
    const enrollments = db.prepare('SELECT * FROM enrollments ORDER BY submissionDate DESC').all();
    // Parse the JSON string back to array
    const mapped = enrollments.map(e => ({
      ...e,
      scheduleDays: JSON.parse(e.scheduleDays)
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Fetch enrollments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update enrollment status (Protected)
router.put('/:id/status', authenticateAdmin, validateRequest(statusUpdateSchema), (req, res) => {
  const { id } = req.params;
  const { status, currentProgressCode } = req.body;
  
  try {
    if (status === 'Rejected') {
      const info = db.prepare('DELETE FROM enrollments WHERE id = ?').run(id);
      if (info.changes === 0) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }
      res.json({ message: 'Enrollment rejected and deleted successfully' });
    } else {
      const info = db.prepare('UPDATE enrollments SET status = ?, currentProgressCode = ? WHERE id = ?').run(status, currentProgressCode, id);
      if (info.changes === 0) {
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
