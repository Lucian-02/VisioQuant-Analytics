
// User Schema - Simplified for Local Mode
export interface User {
  id: string;
  username: string;
  email?: string;
}

// Data Persistence Layer Schema
export interface EvaluationRecord {
  id: number;           // Timestamp-based ID
  timestamp: string;    // ISO string
  model_name: string;   // Model version
  confidence: number;   // Model Confidence Score
  scenario: string;     // Test environment
  
  // Raw Data (New Logic)
  gt_total: number;     // Ground Truth
  tp: number;           // True Positives (Valid Hits)
  pred_total: number;   // AI Count (Total Predicted Boxes)
  fp: number;           // Calculated: pred_total - tp
  fn: number;           // Calculated: gt_total - tp

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
  gt_total: string;
  tp: string;
  pred_total: string;   // Formerly 'fp' input
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
  fp: number;
}
