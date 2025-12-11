import { CalculatedMetrics, ValidationResult } from '../types';

// The Algorithm: Metrics Calculation Engine
export const calculateMetrics = (gt: number, tp: number, fp: number): CalculatedMetrics => {
  // Boundary processing: if denominator is 0, set to 0.

  // Precision: P = TP / (TP + FP)
  const precision = (tp + fp) === 0 ? 0 : tp / (tp + fp);

  // Recall: R = TP / GT
  const recall = gt === 0 ? 0 : tp / gt;

  // F1-Score: F1 = 2 * (P * R) / (P + R)
  const f1_score = (precision + recall) === 0 ? 0 : (2 * precision * recall) / (precision + recall);

  // FAR: FP / (TP + FP) - Engineering definition per prompt
  const far = (tp + fp) === 0 ? 0 : fp / (tp + fp);

  // FN: GT - TP
  const fn = Math.max(0, gt - tp);

  return {
    precision,
    recall,
    f1_score,
    far,
    fn
  };
};

// Validation Gate
export const validateInput = (gt: number, tp: number, fp: number): ValidationResult => {
  // Non-negative constraint
  if (gt < 0 || tp < 0 || fp < 0) {
    return {
      isValid: false,
      hardError: "errNonNegative",
      softWarning: null
    };
  }

  // Hard Constraint: TP <= GT
  if (tp > gt) {
    return {
      isValid: false, // System Fuse Triggered
      hardError: "errTpGt",
      softWarning: null
    };
  }

  // Soft Constraint Warning removed per user request

  return { isValid: true, hardError: null, softWarning: null };
};