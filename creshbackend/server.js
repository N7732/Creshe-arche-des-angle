require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Route imports
const authRoutes = require('./routes/auth.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const contactRoutes = require('./routes/contact.routes');
const galleryRoutes = require('./routes/gallery.routes');
const facilityRoutes = require('./routes/facility.routes');
const settingsRoutes = require('./routes/settings.routes');
const teamRoutes = require('./routes/team.routes');
const managementRoutes = require('./routes/management.routes');
const path = require('path');
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow frontend to load images from the backend
}));
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'https://creshe.vercel.app', 'https://creshe.vercel.app/'],
  credentials: true
}));

// Rate Limiting (Prevent Brute-force & DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Body Parser
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/galleries', galleryRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/management', managementRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Automated Cleanup Tasks
const cleanupContacts = () => {
  try {
    const setting = db.prepare("SELECT value FROM settings WHERE key = 'contact_retention_days'").get();
    const retentionDays = setting ? parseInt(setting.value, 10) : 30;
    
    if (retentionDays > 0) {
      const info = db.prepare(`DELETE FROM contacts WHERE createdAt <= datetime('now', ?)`).run(`-${retentionDays} days`);
      if (info.changes > 0) {
        console.log(`Cleaned up ${info.changes} old contact message(s).`);
      }
    }
  } catch (error) {
    console.error('Error during automated cleanup:', error);
  }
};

// Run cleanup immediately on startup, then every 24 hours
cleanupContacts();
setInterval(cleanupContacts, 24 * 60 * 60 * 1000);

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Secure Server running on http://localhost:${PORT}`);
  });
}
module.exports = app;
