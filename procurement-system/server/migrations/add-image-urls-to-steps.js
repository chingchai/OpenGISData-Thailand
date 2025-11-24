/**
 * Migration: Add image_urls column to project_steps table
 * This allows storing multiple image URLs for each project step
 */

import { getDatabase } from '../config/database.js';

const db = getDatabase();

console.log('🔄 Running migration: Add image_urls to project_steps...\n');

try {
  // Add image_urls column (stores JSON array of image URLs)
  db.exec(`
    ALTER TABLE project_steps
    ADD COLUMN image_urls TEXT;
  `);

  console.log('✅ Successfully added image_urls column to project_steps table');
  console.log('   - Column type: TEXT (stores JSON array)');
  console.log('   - Usage: Stores array of image URL strings');

  // Verify the column was added
  const columns = db.prepare('PRAGMA table_info(project_steps)').all();
  const imageUrlsColumn = columns.find(col => col.name === 'image_urls');

  if (imageUrlsColumn) {
    console.log('\n✅ Migration completed successfully!');
    console.log('Column details:');
    console.table([imageUrlsColumn]);
  } else {
    console.log('\n⚠️  Warning: Column might not have been added properly');
  }

} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('ℹ️  Column image_urls already exists - skipping migration');
  } else {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

process.exit(0);
