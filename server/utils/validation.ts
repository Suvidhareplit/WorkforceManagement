// Simple validation utilities to replace Drizzle schemas

export const validateUser = (data: any) => {
  const errors: string[] = [];
  
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required and must be a string');
  }
  
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Name is required and must be a string');
  }
  
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required and must be a string');
  }
  
  if (!data.userId || typeof data.userId !== 'number') {
    errors.push('User ID is required and must be a number');
  }
  
  if (!data.role || typeof data.role !== 'string') {
    errors.push('Role is required and must be a string');
  }
  
  return errors;
};

export const validateHiringRequest = (data: any) => {
  const errors: string[] = [];
  
  if (!data.cityId || typeof data.cityId !== 'number') {
    errors.push('City ID is required and must be a number');
  }
  
  if (!data.clusterId || typeof data.clusterId !== 'number') {
    errors.push('Cluster ID is required and must be a number');
  }
  
  if (!data.roleId || typeof data.roleId !== 'number') {
    errors.push('Role ID is required and must be a number');
  }
  
  if (!data.numberOfPositions || typeof data.numberOfPositions !== 'number' || data.numberOfPositions < 1) {
    errors.push('Number of positions is required and must be at least 1');
  }
  
  if (!data.priority || typeof data.priority !== 'string') {
    errors.push('Priority is required and must be a string');
  }
  
  if (!data.requestType || typeof data.requestType !== 'string') {
    errors.push('Request type is required and must be a string');
  }
  
  return errors;
};

export const validateCandidate = (data: any) => {
  const errors: string[] = [];
  
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Name is required and must be a string');
  }
  
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required and must be a string');
  }
  
  if (!data.phone || typeof data.phone !== 'string') {
    errors.push('Phone is required and must be a string');
  }
  
  if (!data.hiringRequestId || typeof data.hiringRequestId !== 'number') {
    errors.push('Hiring request ID is required and must be a number');
  }
  
  return errors;
};