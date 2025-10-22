import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });

import { pool } from '../config/db';


// Function to execute SQL statements in batches
async function executeStatements(connection: any, statements: string[], batchName: string) {
  console.log(`\n--- Executing ${batchName} ---`);
  for (const statement of statements) {
    if (!statement.trim()) continue;
    
    try {
      console.log(`Executing: ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
      await connection.query(statement);
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
          error.code === 'ER_DUP_KEYNAME' ||
          error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log(`Skipping (already exists): ${error.code}`);
      } else {
        console.error('Error executing statement:', statement);
        console.error('Error details:', error);
        throw error;
      }
    }
  }
}

async function initializeDatabase() {
  let connection;
  try {
    console.log('Starting MySQL database initialization...');
    
    // Read the MySQL schema file
    const schemaPath = join(__dirname, '..', 'sql', 'mysql', 'schema.sql');
    console.log(`Reading schema from: ${schemaPath}`);
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Get a connection from the pool
    connection = await pool.getConnection();
    
    // Disable foreign key checks temporarily to avoid issues with table creation order
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Split the schema into sections
    const schemaSections = schema.split('--');
    const tableStatements: string[] = [];
    const indexStatements: string[] = [];
    const otherStatements: string[] = [];
    
    // Categorize statements
    for (const section of schemaSections) {
      const statements = section
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      for (const stmt of statements) {
        if (stmt.toLowerCase().includes('create table')) {
          tableStatements.push(stmt);
        } else if (stmt.toLowerCase().includes('create index') || 
                  stmt.toLowerCase().includes('alter table') || 
                  stmt.toLowerCase().includes('add constraint')) {
          indexStatements.push(stmt);
        } else if (!stmt.toLowerCase().startsWith('--')) {
          otherStatements.push(stmt);
        }
      }
    }
    
    // 1. First, create all tables
    await executeStatements(connection, tableStatements, 'Table Creation');
    
    // 2. Then, create all indexes and constraints
    await executeStatements(connection, indexStatements, 'Indexes and Constraints');
    
    // 3. Execute any other statements
    await executeStatements(connection, otherStatements, 'Other Statements');
    
    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('\nMySQL database initialization completed successfully!');
  } catch (error) {
    console.error('Failed to initialize MySQL database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.release();
      console.log('Database connection released');
    }
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('Database initialization process completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
