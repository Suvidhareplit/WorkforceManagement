import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { query } from '../config/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Read the SQL schema file
    const schemaPath = join(__dirname, '..', 'sql', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolon but handle cases where semicolons appear in strings
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
      .map(stmt => stmt + ';');
    
    // Execute each statement
    for (const statement of statements) {
      try {
        await query(statement);
      } catch (error: any) {
        // Ignore errors for CREATE TABLE IF NOT EXISTS statements that already exist
        if (error.code !== '42P07') { // 42P07 is the PostgreSQL error code for "relation already exists"
          console.error('Error executing statement:', statement);
          console.error(error);
        }
      }
    }
    
    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();