/**
 * Business Classifier Provider Interface
 * 
 * Defines the contract for classifying businesses based on their description.
 * This is deliberately provider-agnostic to support multiple implementations:
 * - Rule-based classifier (temporary, current)
 * - OpenAI classifier (future)
 * - Claude classifier (future)
 * - Custom ML model (future)
 * 
 * New implementations must satisfy this interface without modifying existing code.
 */

export interface Classification {
  category: BusinessCategory;
  confidence: 'high' | 'medium' | 'low';
  keywords: string[];
}

export type BusinessCategory =
  | 'Automotive'
  | 'Restaurant'
  | 'Education'
  | 'Healthcare'
  | 'Retail'
  | 'Manufacturing'
  | 'Logistics'
  | 'Professional Services'
  | 'Construction'
  | 'Technology'
  | 'Finance'
  | 'Hospitality'
  | 'Real Estate'
  | 'Agriculture'
  | 'Entertainment'
  | 'Other';

export interface BusinessClassifier {
  classifyBusiness(description: string): Promise<Classification>;
}
