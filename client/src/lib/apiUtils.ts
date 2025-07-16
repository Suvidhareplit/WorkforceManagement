// Utility functions for centralized API data handling

// Convert snake_case to camelCase
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

// Convert object keys from snake_case to camelCase
export function convertToCamelCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertToCamelCase);
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const newObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = toCamelCase(key);
        newObj[newKey] = convertToCamelCase(obj[key]);
      }
    }
    return newObj;
  }
  
  return obj;
}

// Convert camelCase to snake_case
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// Convert object keys from camelCase to snake_case
export function convertToSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertToSnakeCase);
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const newObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = toSnakeCase(key);
        newObj[newKey] = convertToSnakeCase(obj[key]);
      }
    }
    return newObj;
  }
  
  return obj;
}

// Enhanced fetch function that automatically converts response data
export async function fetchWithConversion(url: string, options?: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  
  const data = await response.json();
  return convertToCamelCase(data);
}