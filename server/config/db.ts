import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'hrms_user',
  password: process.env.DB_PASSWORD || 'hrms_password',
  database: process.env.DB_NAME || 'hrms_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
  // Connection keep-alive settings
  idleTimeout: 300000, // 5 minutes
  maxIdle: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create a connection pool
export const pool = mysql.createPool(dbConfig);

// For debugging
console.log('Database Config:', {
  host: dbConfig.host,
  database: dbConfig.database,
  user: dbConfig.user
});

// Convert PostgreSQL-style parameter placeholders ($1, $2, ...) to MySQL (? , ?)
function convertPgPlaceholders(sql: string): string {
  // Matches $1, $2 ... not inside quotes – simple approximation
  return sql.replace(/\$(\d+)/g, '?');
}

// Helper function to execute queries (accepts either $n or ? placeholders)
export async function query(text: string, params: any[] = []) {
  const start = Date.now();
  const connection = await pool.getConnection();
  try {
    const convertedSql = convertPgPlaceholders(text);
    const [rows] = await connection.query(convertedSql, params);
    const duration = Date.now() - start;
    console.log('Executed query', {
      sql: convertedSql,
      originalSql: text,
      duration,
      rows: Array.isArray(rows) ? rows.length : (rows as any).affectedRows
    });
    return {
      rows: Array.isArray(rows) ? rows : [],
      rowCount: Array.isArray(rows) ? rows.length : (rows as any).affectedRows,
      insertId: Array.isArray(rows) ? undefined : (rows as any).insertId
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Helper function for transactions
export async function transaction(callback: (client: any) => Promise<any>) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}