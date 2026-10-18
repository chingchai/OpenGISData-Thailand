import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/database/procurement.db');
const DB_DIR = path.dirname(DB_PATH);

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
  console.log('📁 Database directory created');
}

// Initialize database
let db = null;

/**
 * Get database instance (Singleton pattern)
 */
export const getDatabase = () => {
  if (!db) {
    db = new Database(DB_PATH, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : null
    });

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Performance optimizations
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');

    console.log('✅ Database connected successfully');
  }

  return db;
};

/**
 * Initialize database schema
 */
export const initializeDatabase = () => {
  const db = getDatabase();

  try {
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../data/database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    statements.forEach(statement => {
      try {
        db.exec(statement);
      } catch (err) {
        // Ignore "table already exists" errors
        if (!err.message.includes('already exists')) {
          console.error('Error executing statement:', err.message);
        }
      }
    });

    console.log('✅ Database schema initialized');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

/**
 * Seed database with initial data
 */
export const seedDatabase = () => {
  const db = getDatabase();

  try {
    // Check if data already exists
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (userCount.count > 0) {
      console.log('⚠️  Database already seeded. Skipping...');
      return false;
    }

    // Read and execute seed data
    const seedPath = path.join(__dirname, '../data/database/seed.sql');
    const seedData = fs.readFileSync(seedPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = seedData
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    statements.forEach(statement => {
      try {
        db.exec(statement);
      } catch (err) {
        console.error('Error executing seed statement:', err.message);
      }
    });

    console.log('✅ Database seeded successfully');
    return true;
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

/**
 * Reset database (drop all tables and reinitialize)
 */
export const resetDatabase = () => {
  const db = getDatabase();

  try {
    // Get all table names
    const tables = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all();

    // Drop all tables
    tables.forEach(({ name }) => {
      db.exec(`DROP TABLE IF EXISTS ${name}`);
    });

    console.log('✅ All tables dropped');

    // Reinitialize
    initializeDatabase();
    seedDatabase();

    console.log('✅ Database reset complete');
    return true;
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  }
};

/**
 * Close database connection
 */
export const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
    console.log('✅ Database connection closed');
  }
};

/**
 * Execute a query with parameters (SELECT)
 */
export const query = (sql, params = []) => {
  const db = getDatabase();
  try {
    return db.prepare(sql).all(params);
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
};

/**
 * Execute a query and get first result (SELECT)
 */
export const queryOne = (sql, params = []) => {
  const db = getDatabase();
  try {
    return db.prepare(sql).get(params);
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
};

/**
 * Execute a mutation query (INSERT, UPDATE, DELETE)
 */
export const execute = (sql, params = []) => {
  const db = getDatabase();
  try {
    return db.prepare(sql).run(params);
  } catch (error) {
    console.error('❌ Execute error:', error);
    throw error;
  }
};

/**
 * Execute multiple queries in a transaction
 */
export const transaction = (callback) => {
  const db = getDatabase();
  const trans = db.transaction(callback);
  return trans();
};

export default {
  getDatabase,
  initializeDatabase,
  seedDatabase,
  resetDatabase,
  closeDatabase,
  query,
  queryOne,
  execute,
  transaction
};
