const express = require('express');
const z = require('zod');
const db = require('../db/database');
const { validateRequest } = require('../middleware/validate');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Validations
const attendanceSchema = z.object({
  enrollment_id: z.string().min(1),
  date: z.string().min(1),
  status: z.string().min(1), // 'Present' or 'Absent'
  arrival_time: z.string().optional().nullable(),
  departure_time: z.string().optional().nullable(),
  discrepancy_reason: z.string().optional().nullable()
});

const incidentSchema = z.object({
  enrollment_id: z.string().min(1),
  date: z.string().min(1),
  incident_type: z.string().min(1), // 'Sick', 'Behavior', 'Other'
  description: z.string().min(1)
});

// --- ATTENDANCE ROUTES ---

// Get today's attendance for all active students
router.get('/attendance', authenticateAdmin, async (req, res) => {
  const { date } = req.query; // format YYYY-MM-DD
  if (!date) return res.status(400).json({ error: 'Date is required' });

  try {
    const activeStudentsResult = await db.query(`
      SELECT id as enrollment_id, childName, additionalNotes, scheduleDays, parentName, parentPhone
      FROM enrollments 
      WHERE status IN ('Enrolled', 'Approved')
    `);
    
    const attendanceLogsResult = await db.query('SELECT * FROM daily_attendance WHERE date = $1', [date]);
    
    // Merge
    const merged = activeStudentsResult.rows.map(student => {
      const log = attendanceLogsResult.rows.find(l => l.enrollment_id === student.enrollment_id);
      return {
        ...student,
        attendance: log || null
      };
    });

    res.json(merged);
  } catch (error) {
    console.error('Fetch attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or Update Attendance
router.post('/attendance', authenticateAdmin, validateRequest(attendanceSchema), async (req, res) => {
  const { enrollment_id, date, status, arrival_time, departure_time, discrepancy_reason } = req.body;
  
  try {
    const existing = await db.query('SELECT id FROM daily_attendance WHERE enrollment_id = $1 AND date = $2', [enrollment_id, date]);
    
    if (existing.rows.length > 0) {
      await db.query(`
        UPDATE daily_attendance 
        SET status = $1, arrival_time = $2, departure_time = $3, discrepancy_reason = $4, logged_by = $5 
        WHERE id = $6
      `, [status, arrival_time || null, departure_time || null, discrepancy_reason || '', req.user.username, existing.rows[0].id]);
    } else {
      await db.query(`
        INSERT INTO daily_attendance (enrollment_id, date, status, arrival_time, departure_time, discrepancy_reason, logged_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [enrollment_id, date, status, arrival_time || null, departure_time || null, discrepancy_reason || '', req.user.username]);
    }
    
    res.json({ message: 'Attendance logged successfully' });
  } catch (error) {
    console.error('Log attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Attendance Analytics
router.get('/attendance/stats', authenticateAdmin, async (req, res) => {
  const { period } = req.query; // 'week', 'semester', 'year'
  
  let daysBack = 7;
  if (period === 'semester') daysBack = 90;
  if (period === 'year') daysBack = 365;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - daysBack);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  try {
    const activeStudentsResult = await db.query(`
      SELECT id as enrollment_id, childName, scheduleDays
      FROM enrollments 
      WHERE status IN ('Enrolled', 'Approved')
    `);

    const attendanceLogsResult = await db.query(`
      SELECT enrollment_id, date, status
      FROM daily_attendance 
      WHERE date >= $1 AND date <= $2
    `, [startStr, endStr]);

    // Calculate dates array
    const dates = [];
    let curr = new Date(startDate);
    while (curr <= endDate) {
      dates.push({
        dateStr: curr.toISOString().split('T')[0],
        dayName: curr.toLocaleDateString('en-US', { weekday: 'short' }) // e.g., 'Mon', 'Tue'
      });
      curr.setDate(curr.getDate() + 1);
    }

    const stats = activeStudentsResult.rows.map(student => {
      let expectedDays = 0;
      let attendedDays = 0;
      
      let schedule = [];
      try {
        schedule = JSON.parse(student.scheduleDays || '[]');
      } catch (e) {
        // invalid schedule json
      }

      dates.forEach(d => {
        // If the day is in their schedule
        if (schedule.includes(d.dayName)) {
          expectedDays++;
          
          // Check if they attended
          const log = attendanceLogsResult.rows.find(l => l.enrollment_id === student.enrollment_id && l.date === d.dateStr);
          if (log && log.status === 'Present') {
            attendedDays++;
          }
        }
      });

      return {
        enrollment_id: student.enrollment_id,
        childName: student.childName,
        expectedDays,
        attendedDays,
        attendanceRate: expectedDays > 0 ? Math.round((attendedDays / expectedDays) * 100) : 0
      };
    });

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- FEEDING MANAGEMENT ROUTES ---

router.get('/feeding', authenticateAdmin, async (req, res) => {
  try {
    const activeStudentsResult = await db.query(`
      SELECT id as enrollment_id, childName, specialNeeds, ageGroup 
      FROM enrollments 
      WHERE status IN ('Enrolled', 'Approved')
    `);
    res.json(activeStudentsResult.rows);
  } catch (error) {
    console.error('Fetch feeding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/feeding/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { specialNeeds } = req.body;
  try {
    await db.query('UPDATE enrollments SET specialNeeds = $1 WHERE id = $2', [specialNeeds || '', id]);
    res.json({ message: 'Dietary restrictions updated successfully' });
  } catch (error) {
    console.error('Update feeding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// --- INCIDENT ROUTES ---

// Get active incidents (e.g. sick room)
router.get('/incidents', authenticateAdmin, async (req, res) => {
  try {
    const incidentsResult = await db.query(`
      SELECT i.*, e.childName 
      FROM student_incidents i
      JOIN enrollments e ON i.enrollment_id = e.id
      ORDER BY i.created_at DESC
    `);
    res.json(incidentsResult.rows);
  } catch (error) {
    console.error('Fetch incidents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new incident
router.post('/incidents', authenticateAdmin, validateRequest(incidentSchema), async (req, res) => {
  const { enrollment_id, date, incident_type, description } = req.body;
  
  try {
    await db.query(`
      INSERT INTO student_incidents (enrollment_id, date, incident_type, description, logged_by)
      VALUES ($1, $2, $3, $4, $5)
    `, [enrollment_id, date, incident_type, description, req.user.username]);
    
    res.status(201).json({ message: 'Incident logged successfully' });
  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resolve an incident
router.put('/incidents/:id/resolve', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE student_incidents SET status = 'Resolved' WHERE id = $1", [id]);
    res.json({ message: 'Incident resolved' });
  } catch (error) {
    console.error('Resolve incident error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Enrolled/Approved Students (for dropdown in incidents)
router.get('/students', authenticateAdmin, async (req, res) => {
  try {
    const activeStudentsResult = await db.query('SELECT id, childName FROM enrollments WHERE status IN ($1, $2)', ['Enrolled', 'Approved']);
    res.json(activeStudentsResult.rows);
  } catch (error) {
    console.error('Fetch active students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
