/**
 * Mock Database Module
 * Provides test database functions that work with in-memory SQLite
 */

import { getTestDb } from './testDb.js';

/**
 * Get database instance (mock)
 */
export function getDatabase() {
  return getTestDb();
}

/**
 * Execute SELECT query and return all results
 */
export function query(sql, params = []) {
  const db = getTestDb();
  if (!db) {
    throw new Error('Test database not initialized');
  }
  return db.prepare(sql).all(params);
}

/**
 * Execute SELECT query and return first result
 */
export function queryOne(sql, params = []) {
  const db = getTestDb();
  if (!db) {
    throw new Error('Test database not initialized');
  }
  return db.prepare(sql).get(params);
}

/**
 * Execute INSERT, UPDATE, DELETE
 */
export function execute(sql, params = []) {
  const db = getTestDb();
  if (!db) {
    throw new Error('Test database not initialized');
  }
  return db.prepare(sql).run(params);
}

/**
 * Mock transaction (for testing, just executes the function)
 */
export async function transaction(fn) {
  const db = getTestDb();
  if (!db) {
    throw new Error('Test database not initialized');
  }

  // Simple mock - doesn't actually use transactions for test simplicity
  try {
    const result = await fn();
    return result;
  } catch (error) {
    throw error;
  }
}

export default {
  getDatabase,
  query,
  queryOne,
  execute,
  transaction
};
