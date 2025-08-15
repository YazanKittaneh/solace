export interface Advocate {
  id?: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: string | number;
  createdAt?: Date;
}

export interface SearchQuery {
  id: string;
  originalText: string;
  processedTerms: string[];
  intent: SearchIntent;
  timestamp: Date;
}

export interface SearchTerms {
  specialties: string[];
  keywords: string[];
  location?: string;
  experience?: number;
  confidence: number;
}

export interface SearchFilters {
  specialtyMatches: string[];
  keywordMatches: string[];
  locationFilter?: string;
  experienceMin?: number;
  textSearch: string;
}

export interface Prompt {
  id: string;
  text: string;
  category: 'insurance' | 'mental-health' | 'disability' | 'general';
  searchTerms: string[];
}

export enum SearchIntent {
  FIND_SPECIALIST = 'find_specialist',
  INSURANCE_HELP = 'insurance_help',
  MENTAL_HEALTH = 'mental_health',
  DISABILITY_SUPPORT = 'disability_support',
  GENERAL_ADVOCACY = 'general_advocacy'
}

export const SPECIALTY_KEYWORDS = {
  'Mental Health': ['mental', 'therapy', 'counseling', 'depression', 'anxiety', 'psychiatric', 'psychological', 'therapist', 'psychologist', 'psychiatrist'],
  'Insurance Claims': ['insurance', 'claim', 'coverage', 'billing', 'reimbursement', 'payment', 'denial', 'appeal', 'copay', 'deductible'],
  'Disability Support': ['disability', 'accommodation', 'ADA', 'accessible', 'special needs', 'disabled', 'wheelchair', 'mobility', 'vision', 'hearing'],
  'Chronic Disease': ['chronic', 'diabetes', 'cancer', 'heart disease', 'ongoing condition', 'long-term', 'permanent', 'autoimmune'],
  'Elderly Care': ['elderly', 'senior', 'aging', 'geriatric', 'medicare', 'retirement', 'nursing home', 'assisted living'],
  'Pediatric Care': ['pediatric', 'children', 'child', 'kids', 'infant', 'adolescent', 'teenager', 'youth'],
  'Women\'s Health': ['women', 'pregnancy', 'maternal', 'gynecological', 'reproductive', 'prenatal', 'postpartum'],
  'Substance Abuse': ['addiction', 'substance', 'alcohol', 'drug', 'recovery', 'rehabilitation', 'detox', 'sobriety'],
  'Physical Therapy': ['physical therapy', 'rehabilitation', 'mobility', 'injury', 'recovery', 'exercise', 'movement'],
  'Occupational Therapy': ['occupational therapy', 'daily activities', 'work', 'job', 'workplace', 'employment']
} as const;

export const INTENT_PATTERNS = {
  INSURANCE_HELP: /\b(insurance|claim|coverage|billing|reimbursement|denial|appeal)\b/i,
  MENTAL_HEALTH: /\b(mental|therapy|counseling|depression|anxiety|psychological)\b/i,
  DISABILITY_SUPPORT: /\b(disability|accommodation|accessible|ADA|special needs)\b/i,
  FIND_SPECIALIST: /\b(specialist|doctor|expert|professional|provider)\b/i,
  GENERAL_ADVOCACY: /\b(help|support|assistance|advocate|guidance|navigate)\b/i
} as const;