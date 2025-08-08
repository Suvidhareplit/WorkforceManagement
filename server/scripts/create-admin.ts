import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/db';
import bcrypt from 'bcrypt';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Hash the password
    const password = 'Admin@123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Check if user already exists
    const checkResult = await query(
      'SELECT * FROM users WHERE email = ?',
      ['admin@hrms.com']
    );
    
    if (checkResult.rows.length > 0) {
      console.log('Admin user already exists.');
      process.exit(0);
    }
    
    // Insert the admin user
    const result = await query(
      `INSERT INTO users (
        user_id, 
        email, 
        password_hash, 
        name, 
        role, 
        is_active,
        created_at, 
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        1001, // numeric user_id
        'admin@hrms.com',
        hashedPassword,
        'Admin User',
        'admin',
        true
      ]
    );
    
    console.log('Admin user created successfully with ID:', (result.rows as any).insertId);
    console.log('Login credentials:');
    console.log('Email: admin@hrms.com');
    console.log('Password: Admin@123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
  
  console.log('Admin user setup completed successfully!');
  process.exit(0);
}

// Run the function
createAdminUser();
