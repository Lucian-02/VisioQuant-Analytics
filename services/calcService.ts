
import { CalculatedMetrics, ValidationResult } from '../types';

// The Algorithm: Refactored Metrics Calculation Engine
export const calculateMetrics = (gt: number, tp: number, pred_total: number): CalculatedMetrics => {
  // Boundary processing: if denominator is 0, set to 0.

  // 1. FP (False Positive): Pred - TP
  // All boxes that are NOT valid hits are noise/waste.
  const fp = Math.max(0, pred_total - tp);

  // 2. FN (False Negative): GT - TP
  // Objects that exist in truth but weren't hit by a valid box.
  const fn = Math.max(0, gt - tp);

  // 3. Precision (Accuracy of boxes): TP / Total Predicted Boxes
  // "How many of the boxes I drew were actually correct?"
  const precision = pred_total === 0 ? 0 : tp / pred_total;

  // 4. Recall (Coverage of truth): TP / GT
  // "How many of the real objects did I catch?"
  const recall = gt === 0 ? 0 : tp / gt;

  // 5. F1-Score: Harmonic mean
  const f1_score = (precision + recall) === 0 ? 0 : (2 * precision * recall) / (precision + recall);

  // 6. FAR (False Alarm Rate): FP / Total Predicted Boxes
  // Reflects the degree of "Noise" in the model's output.
  const far = pred_total === 0 ? 0 : fp / pred_total;

  return {
    precision,
    recall,
    f1_score,
    far,
    fn,
    fp
  };
};

// Validation Gate
export const validateInput = (gt: number, tp: number, pred_total: number): ValidationResult => {
  // Non-negative constraint
  if (gt < 0 || tp < 0 || pred_total < 0) {
    return {
      isValid: false,
      hardError: "errNonNegative",
      softWarning: null
    };
  }

  // Hard Constraint: TP <= GT (You can't catch more unique objects than actually exist)
  if (tp > gt) {
    return {
      isValid: false,
      hardError: "errTpGt",
      softWarning: null
    };
  }

  // Hard Constraint: TP <= Pred (You can't have more hits than boxes drawn)
  if (tp > pred_total) {
    return {
      isValid: false,
      hardError: "errTpPred",
      softWarning: null
    };
  }

  return { isValid: true, hardError: null, softWarning: null };
};
