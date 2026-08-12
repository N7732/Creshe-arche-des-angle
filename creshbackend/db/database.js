const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin'
      );

      CREATE TABLE IF NOT EXISTS enrollments (
        id VARCHAR(255) PRIMARY KEY,
        childName VARCHAR(255) NOT NULL,
        childDob VARCHAR(255) NOT NULL,
        ageGroup VARCHAR(255) NOT NULL,
        requestedStartDate VARCHAR(255) NOT NULL,
        scheduleDays VARCHAR(255) NOT NULL,
        preferredClass VARCHAR(255),
        parentName VARCHAR(255) NOT NULL,
        parentEmail VARCHAR(255) NOT NULL,
        parentPhone VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'Submitted',
        specialNeeds TEXT,
        additionalNotes TEXT,
        submissionDate VARCHAR(255) NOT NULL,
        currentProgressCode INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        parentName TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS parents (
        id SERIAL PRIMARY KEY,
        "fullName" VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        "googleId" VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS galleries (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS facilities (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(255) NOT NULL,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS team_profiles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        bio TEXT,
        email VARCHAR(255),
        phone VARCHAR(255),
        image_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS daily_attendance (
        id SERIAL PRIMARY KEY,
        enrollment_id VARCHAR(255) NOT NULL,
        date VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'Present',
        arrival_time VARCHAR(255),
        departure_time VARCHAR(255),
        discrepancy_reason TEXT,
        logged_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (enrollment_id) REFERENCES enrollments(id)
      );

      CREATE TABLE IF NOT EXISTS student_incidents (
        id SERIAL PRIMARY KEY,
        enrollment_id VARCHAR(255) NOT NULL,
        date VARCHAR(255) NOT NULL,
        incident_type VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        logged_by VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (enrollment_id) REFERENCES enrollments(id)
      );

      CREATE TABLE IF NOT EXISTS testimonies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        child_class VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        rating INTEGER DEFAULT 5,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Profiles for Supabase Replacement
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255),
        role_title VARCHAR(255),
        phone VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        color VARCHAR(255) DEFAULT 'from-primary to-blue-600',
        role VARCHAR(50) DEFAULT 'teacher',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("PostgreSQL database initialized.");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
};

initializeDatabase();

module.exports = pool;
