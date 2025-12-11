import { EvaluationRecord, User } from '../types';

const HISTORY_KEY = 'neurometric_history';
const USERS_KEY = 'neurometric_users';

// Simulate the "Init" and "CRUD" operations described in the manifesto
export const dbService = {
  // Init: Self-check (LocalStorage doesn't need explicit init, but we ensure structure)
  init: (): EvaluationRecord[] => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (!stored) {
        return [];
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to load history", e);
      return [];
    }
  },

  // Query: Get full history for specific user, ordered by ID DESC
  getAll: (userId: string): EvaluationRecord[] => {
    const records = dbService.init();
    // Filter by userId and then sort
    return records
      .filter(r => r.userId === userId)
      .sort((a, b) => b.id - a.id);
  },

  // Insert: Pack tuple and write
  insert: (record: Omit<EvaluationRecord, 'id' | 'timestamp'>): EvaluationRecord => {
    const currentHistory = dbService.init();
    
    // Auto-increment ID logic (global ID counter across all users is fine for this scope)
    const maxId = currentHistory.length > 0 ? Math.max(...currentHistory.map(r => r.id)) : 0;
    
    const newRecord: EvaluationRecord = {
      ...record,
      id: maxId + 1,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...currentHistory, newRecord];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    
    return newRecord;
  },

  // Delete: Atomic deletion by ID (User verification should happen at app level, but here we just delete by ID)
  delete: (id: number): boolean => {
    try {
      const currentHistory = dbService.init();
      const filtered = currentHistory.filter(r => r.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error("Delete failed", e);
      return false;
    }
  },

  // Clear All for specific user
  clearAll: (userId: string): boolean => {
    try {
      const currentHistory = dbService.init();
      // Keep records that DO NOT belong to this user
      const remaining = currentHistory.filter(r => r.userId !== userId);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(remaining));
      return true;
    } catch (e) {
      return false;
    }
  },

  // --- Backup & Restore Features ---
  
  // Export all data (Users + History) to a JSON string
  exportBackup: (): string => {
    const users = localStorage.getItem(USERS_KEY);
    const history = localStorage.getItem(HISTORY_KEY);
    
    const backupData = {
      version: 1,
      timestamp: new Date().toISOString(),
      users: users ? JSON.parse(users) : [],
      history: history ? JSON.parse(history) : []
    };
    
    return JSON.stringify(backupData, null, 2);
  },

  // Import data from a JSON object
  importBackup: (jsonContent: string): boolean => {
    try {
      const data = JSON.parse(jsonContent);
      
      // Basic validation
      if (!data.version || !Array.isArray(data.users) || !Array.isArray(data.history)) {
        return false;
      }

      // Restore
      localStorage.setItem(USERS_KEY, JSON.stringify(data.users));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(data.history));
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  }
};