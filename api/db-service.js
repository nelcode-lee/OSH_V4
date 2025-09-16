/**
 * Database Service for Neon DB Connection
 * Lightweight service to handle database operations
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to Neon DB successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Create tables if they don't exist
async function createTables() {
  try {
    const client = await pool.connect();
    
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(50) DEFAULT 'student',
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Courses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        duration_hours INTEGER,
        difficulty_level VARCHAR(50),
        status VARCHAR(50) DEFAULT 'draft',
        instructor_id INTEGER REFERENCES users(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Course enrollments
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_enrollments (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id),
        student_id INTEGER REFERENCES users(id),
        enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        progress_percentage INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        UNIQUE(course_id, student_id)
      )
    `);

    // Content generations (for AI/RAG)
    await client.query(`
      CREATE TABLE IF NOT EXISTS content_generations (
        id SERIAL PRIMARY KEY,
        prompt TEXT NOT NULL,
        generated_content TEXT NOT NULL,
        model_used VARCHAR(100) NOT NULL,
        content_type VARCHAR(50) NOT NULL,
        course_id INTEGER REFERENCES courses(id),
        is_approved BOOLEAN DEFAULT false,
        approved_by INTEGER REFERENCES users(id),
        approved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables created successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    return false;
  }
}

// User operations
async function createUser(userData) {
  try {
    const { email, password, first_name, last_name, role, phone } = userData;
    const password_hash = await bcrypt.hash(password, 10);
    const client = await pool.connect();
    
    const result = await client.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, role, phone, created_at
    `, [email, password_hash, first_name, last_name, role, phone]);
    
    client.release();
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  }
}

async function authenticateUser(email, password) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return null;
    }
    
    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error authenticating user:', error.message);
    throw error;
  }
}

async function getUserByEmail(email) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    client.release();
    return result.rows[0];
  } catch (error) {
    console.error('Error getting user:', error.message);
    throw error;
  }
}

// Course operations
async function getCourses() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT c.*, 
             COUNT(ce.student_id) as student_count,
             u.first_name || ' ' || u.last_name as instructor_name
      FROM courses c
      LEFT JOIN course_enrollments ce ON c.id = ce.course_id
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.is_active = true
      GROUP BY c.id, u.first_name, u.last_name
      ORDER BY c.created_at DESC
    `);
    client.release();
    return result.rows;
  } catch (error) {
    console.error('Error getting courses:', error.message);
    throw error;
  }
}

async function createCourse(courseData) {
  try {
    const { title, description, category, duration_hours, difficulty_level, instructor_id } = courseData;
    const client = await pool.connect();
    
    const result = await client.query(`
      INSERT INTO courses (title, description, category, duration_hours, difficulty_level, instructor_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, description, category, duration_hours, difficulty_level, instructor_id]);
    
    client.release();
    return result.rows[0];
  } catch (error) {
    console.error('Error creating course:', error.message);
    throw error;
  }
}

// Content generation operations
async function saveContentGeneration(generationData) {
  try {
    const { prompt, generated_content, model_used, content_type, course_id } = generationData;
    const client = await pool.connect();
    
    const result = await client.query(`
      INSERT INTO content_generations (prompt, generated_content, model_used, content_type, course_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [prompt, generated_content, model_used, content_type, course_id]);
    
    client.release();
    return result.rows[0];
  } catch (error) {
    console.error('Error saving content generation:', error.message);
    throw error;
  }
}

// Initialize database on module load
async function initializeDatabase() {
  const connected = await testConnection();
  if (connected) {
    await createTables();
  }
  return connected;
}

module.exports = {
  testConnection,
  createTables,
  createUser,
  authenticateUser,
  getUserByEmail,
  getCourses,
  createCourse,
  saveContentGeneration,
  initializeDatabase,
  pool
};
