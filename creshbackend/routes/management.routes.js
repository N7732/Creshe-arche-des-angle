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
router.get('/attendance', authenticateAdmin, (req, res) => {
  const { date } = req.query; // format YYYY-MM-DD
  if (!date) return res.status(400).json({ error: 'Date is required' });

  try {
    // We want all enrolled/approved students and their attendance for the day (if any)
    const activeStudents = db.prepare(`
      SELECT id as enrollment_id, childName, additionalNotes, scheduleDays, parentName, parentPhone 
      FROM enrollments 
      WHERE status IN ('Enrolled', 'Approved')
    `).all();
    
    const attendanceLogs = db.prepare('SELECT * FROM daily_attendance WHERE date = ?').all(date);
    
    // Merge
    const merged = activeStudents.map(student => {
      const log = attendanceLogs.find(l => l.enrollment_id === student.enrollment_id);
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
router.post('/attendance', authenticateAdmin, validateRequest(attendanceSchema), (req, res) => {
  const { enrollment_id, date, status, arrival_time, departure_time, discrepancy_reason } = req.body;
  
  try {
    const existing = db.prepare('SELECT id FROM daily_attendance WHERE enrollment_id = ? AND date = ?').get(enrollment_id, date);
    
    if (existing) {
      db.prepare(`
        UPDATE daily_attendance 
        SET status = ?, arrival_time = ?, departure_time = ?, discrepancy_reason = ?, logged_by = ? 
        WHERE id = ?
      `).run(status, arrival_time || null, departure_time || null, discrepancy_reason || '', req.user.username, existing.id);
    } else {
      db.prepare(`
        INSERT INTO daily_attendance (enrollment_id, date, status, arrival_time, departure_time, discrepancy_reason, logged_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(enrollment_id, date, status, arrival_time || null, departure_time || null, discrepancy_reason || '', req.user.username);
    }
    
    res.json({ message: 'Attendance logged successfully' });
  } catch (error) {
    console.error('Log attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Attendance Analytics
router.get('/attendance/stats', authenticateAdmin, (req, res) => {
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
    const activeStudents = db.prepare(`
      SELECT id as enrollment_id, childName, scheduleDays
      FROM enrollments 
      WHERE status IN ('Enrolled', 'Approved')
    `).all();

    const attendanceLogs = db.prepare(`
      SELECT enrollment_id, date, status
      FROM daily_attendance 
      WHERE date >= ? AND date <= ?
    `).all(startStr, endStr);

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

    const stats = activeStudents.map(student => {
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
          const log = attendanceLogs.find(l => l.enrollment_id === student.enrollment_id && l.date === d.dateStr);
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

router.get('/feeding', authenticateAdmin, (req, res) => {
  try {
    const activeStudents = db.prepare(`
      SELECT id as enrollment_id, childName, specialNeeds, ageGroup 
      FROM enrollments 
      WHERE status IN ('Enrolled', 'Approved')
    `).all();
    res.json(activeStudents);
  } catch (error) {
    console.error('Fetch feeding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/feeding/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { specialNeeds } = req.body;
  try {
    db.prepare('UPDATE enrollments SET specialNeeds = ? WHERE id = ?').run(specialNeeds || '', id);
    res.json({ message: 'Dietary restrictions updated successfully' });
  } catch (error) {
    console.error('Update feeding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// --- INCIDENT ROUTES ---

// Get active incidents (e.g. sick room)
router.get('/incidents', authenticateAdmin, (req, res) => {
  try {
    const incidents = db.prepare(`
      SELECT i.*, e.childName 
      FROM student_incidents i
      JOIN enrollments e ON i.enrollment_id = e.id
      ORDER BY i.created_at DESC
    `).all();
    res.json(incidents);
  } catch (error) {
    console.error('Fetch incidents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new incident
router.post('/incidents', authenticateAdmin, validateRequest(incidentSchema), (req, res) => {
  const { enrollment_id, date, incident_type, description } = req.body;
  
  try {
    db.prepare(`
      INSERT INTO student_incidents (enrollment_id, date, incident_type, description, logged_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(enrollment_id, date, incident_type, description, req.user.username);
    
    res.status(201).json({ message: 'Incident logged successfully' });
  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resolve an incident
router.put('/incidents/:id/resolve', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  try {
    db.prepare("UPDATE student_incidents SET status = 'Resolved' WHERE id = ?").run(id);
    res.json({ message: 'Incident resolved' });
  } catch (error) {
    console.error('Resolve incident error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Enrolled/Approved Students (for dropdown in incidents)
router.get('/students', authenticateAdmin, (req, res) => {
  try {
    const activeStudents = db.prepare('SELECT id, childName FROM enrollments WHERE status IN (?, ?)').all('Enrolled', 'Approved');
    res.json(activeStudents);
  } catch (error) {
    console.error('Fetch active students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
