// User Schema
export interface User {
  id: string;
  username: string;
  password: string; // In a real app, this would be hashed. Storing plain for local demo.
  createdAt: string;
}

// Data Persistence Layer Schema
export interface EvaluationRecord {
  id: number;           // Auto-increment integer
  userId: string;       // Foreign key to User
  timestamp: string;    // ISO string
  model_name: string;   // Model version
  confidence: number;   // Model Confidence Score
  scenario: string;     // Test environment
  
  // Raw Data
  gt_total: number;
  tp: number;
  fp: number;
  fn: number;           // Calculated: GT - TP

  // Core Metrics
  precision: number;
  recall: number;
  f1_score: number;
  far: number;          // False Alarm Rate
}

export interface InputState {
  model_name: string;
  confidence: string;
  scenario: string;
  gt_total: string; // Keep as string for input handling, parse on validation
  tp: string;
  fp: string;
}

export interface ValidationResult {
  isValid: boolean;
  hardError: string | null;
  softWarning: string | null;
}

export interface CalculatedMetrics {
  precision: number;
  recall: number;
  f1_score: number;
  far: number;
  fn: number;
}