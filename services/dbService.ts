
import { EvaluationRecord } from '../types';

const STORAGE_KEY = 'visioquant_offline_data';

export const dbService = {
  
  // Query: Get all local records
  getAll: async (): Promise<EvaluationRecord[]> => {
    try {
      const json = localStorage.getItem(STORAGE_KEY);
      const data: EvaluationRecord[] = json ? JSON.parse(json) : [];
      // Sort by timestamp descending
      return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (e) {
      console.error("Failed to load local data", e);
      return [];
    }
  },

  // Insert: Save to LocalStorage
  insert: async (record: Omit<EvaluationRecord, 'id' | 'timestamp'>): Promise<{ data: EvaluationRecord | null, error: any }> => {
    try {
        const timestamp = new Date().toISOString();
        const id = Date.now(); // Use timestamp as ID

        const newRecord: EvaluationRecord = {
            id,
            timestamp,
            ...record
        };

        const currentData = await dbService.getAll();
        const updatedData = [newRecord, ...currentData];
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
        
        return { data: newRecord, error: null };
    } catch (e) {
        return { data: null, error: e };
    }
  },

  // Delete: Remove from LocalStorage
  delete: async (id: number): Promise<boolean> => {
    try {
        const currentData = await dbService.getAll();
        const updatedData = currentData.filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
        return true;
    } catch (e) {
        return false;
    }
  },

  // Clear All
  clearAll: async (): Promise<boolean> => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (e) {
        return false;
    }
  },

  // Import/Restore: Replace all data
  replaceData: async (data: EvaluationRecord[]): Promise<boolean> => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (e) {
        return false;
    }
  }
};
