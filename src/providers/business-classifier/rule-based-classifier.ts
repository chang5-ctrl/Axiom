import type { BusinessClassifier, Classification, BusinessCategory } from './business-classifier.interface';

/**
 * Temporary Rule-Based Business Classifier
 * 
 * Simple keyword-based classification that will be replaced with AI later.
 * This implementation is intentionally stateless and pure-functional.
 * 
 * To replace with AI:
 * 1. Create a new file implementing BusinessClassifier interface
 * 2. Update the factory function in index.ts
 * 3. No other code needs to change
 */

interface ClassificationRule {
  category: BusinessCategory;
  keywords: string[];
  aliases?: string[];
}

const CLASSIFICATION_RULES: ClassificationRule[] = [
  {
    category: 'Automotive',
    keywords: ['vehicle', 'car', 'dealership', 'garage', 'automobile', 'mechanic', 'service', 'repair', 'dealer'],
    aliases: ['automotive', 'car dealership', 'auto repair'],
  },
  {
    category: 'Restaurant',
    keywords: ['restaurant', 'food', 'chef', 'kitchen', 'cafe', 'bar', 'dining', 'catering', 'menu', 'pizza', 'burger', 'sushi'],
    aliases: ['food service', 'eatery', 'bistro'],
  },
  {
    category: 'Education',
    keywords: ['school', 'student', 'teacher', 'university', 'college', 'course', 'training', 'academy', 'learning', 'education'],
    aliases: ['educational', 'academic', 'institute'],
  },
  {
    category: 'Healthcare',
    keywords: ['hospital', 'clinic', 'medical', 'doctor', 'patient', 'health', 'pharmacy', 'dentist', 'therapy', 'wellness'],
    aliases: ['healthcare', 'medical practice', 'care facility'],
  },
  {
    category: 'Retail',
    keywords: ['retail', 'store', 'shop', 'boutique', 'mall', 'shopping', 'customer', 'product', 'inventory', 'supplier'],
    aliases: ['retail business', 'storefront'],
  },
  {
    category: 'Manufacturing',
    keywords: ['manufacturing', 'factory', 'production', 'machinery', 'equipment', 'supplier', 'industrial', 'component'],
    aliases: ['manufacturer', 'factory operation'],
  },
  {
    category: 'Logistics',
    keywords: ['logistics', 'shipping', 'delivery', 'warehouse', 'transport', 'freight', 'supply chain', 'distribution', 'carrier'],
    aliases: ['supply chain', 'delivery service'],
  },
  {
    category: 'Professional Services',
    keywords: ['consulting', 'accounting', 'legal', 'law firm', 'attorney', 'consultant', 'advisor', 'audit', 'tax'],
    aliases: ['professional services', 'consulting firm'],
  },
  {
    category: 'Construction',
    keywords: ['construction', 'builder', 'contractor', 'building', 'project', 'site', 'renovation', 'architect', 'engineer'],
    aliases: ['construction company', 'building contractor'],
  },
  {
    category: 'Technology',
    keywords: ['software', 'technology', 'tech', 'app', 'developer', 'it', 'web', 'digital', 'saas', 'platform'],
    aliases: ['tech company', 'software development'],
  },
  {
    category: 'Finance',
    keywords: ['finance', 'bank', 'investment', 'loan', 'insurance', 'insurance broker', 'financial', 'trading'],
    aliases: ['financial services', 'bank'],
  },
  {
    category: 'Hospitality',
    keywords: ['hotel', 'resort', 'hostel', 'accommodation', 'inn', 'lodge', 'motel', 'hospitality'],
    aliases: ['hotel chain', 'lodging'],
  },
  {
    category: 'Real Estate',
    keywords: ['real estate', 'property', 'realty', 'agent', 'broker', 'developer', 'landlord', 'rental'],
    aliases: ['property management', 'real estate agency'],
  },
  {
    category: 'Agriculture',
    keywords: ['farm', 'agriculture', 'crop', 'livestock', 'agricultural', 'farmer', 'ranch', 'harvest'],
    aliases: ['farming', 'agricultural business'],
  },
  {
    category: 'Entertainment',
    keywords: ['entertainment', 'event', 'movie', 'cinema', 'theater', 'music', 'concert', 'production', 'venue'],
    aliases: ['entertainment company', 'event management'],
  },
];

export class RuleBasedClassifier implements BusinessClassifier {
  async classifyBusiness(description: string): Promise<Classification> {
    const normalized = description.toLowerCase().trim();
    
    if (!normalized) {
      return {
        category: 'Other',
        confidence: 'low',
        keywords: [],
      };
    }

    const matches: Map<BusinessCategory, { count: number; keywords: string[] }> = new Map();

    // Score each category based on keyword matches
    for (const rule of CLASSIFICATION_RULES) {
      const foundKeywords: string[] = [];
      let matchCount = 0;

      for (const keyword of rule.keywords) {
        if (normalized.includes(keyword)) {
          foundKeywords.push(keyword);
          matchCount++;
        }
      }

      if (matchCount > 0) {
        matches.set(rule.category, { count: matchCount, keywords: foundKeywords });
      }
    }

    // Find the best match
    if (matches.size === 0) {
      return {
        category: 'Other',
        confidence: 'low',
        keywords: [],
      };
    }

    let bestCategory: BusinessCategory = 'Other';
    let bestScore = 0;
    let bestKeywords: string[] = [];

    for (const [category, { count, keywords }] of matches) {
      if (count > bestScore) {
        bestScore = count;
        bestCategory = category;
        bestKeywords = keywords;
      }
    }

    // Determine confidence based on match quality
    const confidence = bestScore >= 3 ? 'high' : bestScore >= 2 ? 'medium' : 'low';

    return {
      category: bestCategory,
      confidence,
      keywords: [...new Set(bestKeywords)], // Remove duplicates
    };
  }
}
