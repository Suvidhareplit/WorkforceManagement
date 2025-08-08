// Production-ready storage factory
import { SqlStorage } from './SqlStorage';
import { IStorage } from '../interfaces/IStorage';

// Single instance for the entire application
let storageInstance: IStorage | null = null;

export function getStorage(): IStorage {
  if (!storageInstance) {
    storageInstance = new SqlStorage();
  }
  return storageInstance;
}

// For testing purposes - allows injection of mock storage
export function setStorage(storage: IStorage): void {
  storageInstance = storage;
}

// Reset storage instance (useful for testing)
export function resetStorage(): void {
  storageInstance = null;
}

// Export types for use in controllers
export type { IStorage } from '../interfaces/IStorage';
export type { 
  CreateOptions, 
  UpdateOptions, 
  StatusUpdateOptions, 
  FilterOptions 
} from '../interfaces/IStorage';
