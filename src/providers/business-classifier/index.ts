export type { BusinessClassifier, Classification, BusinessCategory } from './business-classifier.interface';
export { RuleBasedClassifier } from './rule-based-classifier';

import { RuleBasedClassifier } from './rule-based-classifier';
import type { BusinessClassifier } from './business-classifier.interface';

/**
 * Factory function to get the current business classifier implementation.
 * 
 * Replace the instantiation here to swap implementations without changing
 * any consuming code. This is the only place that needs to change when
 * switching to AI-based classification.
 */
export function createBusinessClassifier(): BusinessClassifier {
  return new RuleBasedClassifier();
}
