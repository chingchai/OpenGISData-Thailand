#!/usr/bin/env node
/**
 * Database Reset Script
 * Deletes existing database and reinitializes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/procurement.db');

console.log('⚠️  WARNING: This will delete all existing data!\n');

// Check if database exists
if (fs.existsSync(DB_PATH)) {
  console.log('🗑️  Deleting existing database:', DB_PATH);
  fs.unlinkSync(DB_PATH);
  console.log('✓ Database deleted\n');
} else {
  console.log('ℹ️  No existing database found\n');
}

// Run init script
console.log('🔄 Running initialization script...\n');
const initScript = path.join(__dirname, 'initDatabase.js');

const child = spawn('node', [initScript], {
  stdio: 'inherit',
  env: process.env
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log('\n✅ Database reset complete!');
  } else {
    console.error('\n❌ Database reset failed!');
    process.exit(1);
  }
});
