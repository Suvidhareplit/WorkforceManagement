import { OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2';

/**
 * Type guard to check if a value is a RowDataPacket
 */
export function isRowDataPacket(value: any): value is RowDataPacket {
  return value && typeof value === 'object' && !Array.isArray(value) && 'constructor' in value;
}

/**
 * Type guard to check if a value is an array of RowDataPacket
 */
export function isRowDataPacketArray(value: any): value is RowDataPacket[] {
  return Array.isArray(value) && value.length > 0 && isRowDataPacket(value[0]);
}

/**
 * Helper function to safely cast MySQL query results to entity types
 * @param result MySQL query result
 * @returns Typed entity or undefined
 */
export function castMySQLResult<T>(result: OkPacket | ResultSetHeader | RowDataPacket | RowDataPacket[]): T | undefined {
  if (!result) return undefined;
  
  // Handle array results
  if (Array.isArray(result)) {
    if (result.length === 0) return undefined;
    return result[0] as unknown as T;
  }
  
  // Handle single row result
  return result as unknown as T;
}

/**
 * Helper function to safely cast MySQL query results to entity array types
 * @param results MySQL query results
 * @returns Array of typed entities
 */
export function castMySQLResultArray<T>(results: OkPacket[] | ResultSetHeader[] | RowDataPacket[] | RowDataPacket[][]): T[] {
  if (!results || !Array.isArray(results)) return [];
  return results as unknown as T[];
}

/**
 * Helper function to safely access rows property from MySQL query results
 * @param result MySQL query result
 * @returns First row as typed entity or undefined
 */
export function getFirstRow<T>(result: any): T | undefined {
  if (!result) return undefined;
  
  // Handle case where rows property exists
  if (result.rows && Array.isArray(result.rows)) {
    if (result.rows.length === 0) return undefined;
    return result.rows[0] as unknown as T;
  }
  
  // Handle case where result itself is an array
  if (Array.isArray(result)) {
    if (result.length === 0) return undefined;
    return result[0] as unknown as T;
  }
  
  // Handle case where result is a single object
  return result as unknown as T;
}

/**
 * Helper function to safely access rows property from MySQL query results as array
 * @param result MySQL query result
 * @returns Array of typed entities
 */
export function getAllRows<T>(result: any): T[] {
  if (!result) return [];
  
  // Handle case where rows property exists
  if (result.rows && Array.isArray(result.rows)) {
    return result.rows as unknown as T[];
  }
  
  // Handle case where result itself is an array
  if (Array.isArray(result)) {
    return result as unknown as T[];
  }
  
  // Handle case where result is a single object
  return [result] as unknown as T[];
}
