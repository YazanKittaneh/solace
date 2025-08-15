import { 
  SearchTerms, 
  SearchIntent, 
  SPECIALTY_KEYWORDS, 
  INTENT_PATTERNS 
} from '../types/advocate';

export class NaturalLanguageProcessor {
  /**
   * Processes a natural language query and extracts structured search terms
   * @param query - The raw user input query
   * @returns SearchTerms object with extracted information
   */
  processQuery(query: string): SearchTerms {
    // 1. Normalize input (lowercase, remove punctuation)
    const normalized = this.normalizeText(query);
    
    // 2. Extract keywords using predefined mappings
    const keywords = this.extractKeywords(normalized);
    
    // 3. Map to advocate specialties
    const specialties = this.mapToSpecialties(keywords);
    
    // 4. Detect intent patterns
    const intent = this.detectIntent(normalized);
    
    // 5. Extract location if present
    const location = this.extractLocation(normalized);
    
    // 6. Extract experience requirements if present
    const experience = this.extractExperience(normalized);
    
    // 7. Calculate confidence score
    const confidence = this.calculateConfidence(keywords, specialties, intent);
    
    return {
      specialties,
      keywords,
      location,
      experience,
      confidence
    };
  }

  /**
   * Normalizes text by converting to lowercase and cleaning punctuation
   * @param text - Input text to normalize
   * @returns Normalized text
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
  }

  /**
   * Extracts keywords from normalized text
   * @param normalizedText - Pre-processed text
   * @returns Array of extracted keywords
   */
  private extractKeywords(normalizedText: string): string[] {
    const words = normalizedText.split(' ');
    const keywords: string[] = [];
    
    // Extract individual words
    words.forEach(word => {
      if (word.length > 2) { // Skip very short words
        keywords.push(word);
      }
    });
    
    // Extract common bigrams (two-word phrases)
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      if (this.isRelevantBigram(bigram)) {
        keywords.push(bigram);
      }
    }
    
    return Array.from(new Set(keywords)); // Remove duplicates
  }

  /**
   * Maps extracted keywords to advocate specialties
   * @param keywords - Array of extracted keywords
   * @returns Array of matching specialty names
   */
  mapToSpecialties(keywords: string[]): string[] {
    const matches: string[] = [];
    
    Object.entries(SPECIALTY_KEYWORDS).forEach(([specialty, terms]) => {
      const hasMatch = terms.some(term => 
        keywords.some(keyword => 
          keyword.includes(term) || term.includes(keyword)
        )
      );
      
      if (hasMatch) {
        matches.push(specialty);
      }
    });
    
    return matches;
  }

  /**
   * Detects the primary intent of the user's query
   * @param normalizedText - Pre-processed text
   * @returns Detected search intent
   */
  detectIntent(normalizedText: string): SearchIntent {
    // Check patterns in order of specificity
    if (INTENT_PATTERNS.INSURANCE_HELP.test(normalizedText)) {
      return SearchIntent.INSURANCE_HELP;
    }
    
    if (INTENT_PATTERNS.MENTAL_HEALTH.test(normalizedText)) {
      return SearchIntent.MENTAL_HEALTH;
    }
    
    if (INTENT_PATTERNS.DISABILITY_SUPPORT.test(normalizedText)) {
      return SearchIntent.DISABILITY_SUPPORT;
    }
    
    if (INTENT_PATTERNS.FIND_SPECIALIST.test(normalizedText)) {
      return SearchIntent.FIND_SPECIALIST;
    }
    
    // Default to general advocacy
    return SearchIntent.GENERAL_ADVOCACY;
  }

  /**
   * Extracts location information from query
   * @param normalizedText - Pre-processed text
   * @returns Extracted location or undefined
   */
  private extractLocation(normalizedText: string): string | undefined {
    // Common location patterns
    const locationPatterns = [
      /\bin ([a-z\s]+?)(?:\s+area|\s+city|\s+state|\s+looking|\s+with|\s+for|$)/i,
      /\bnear ([a-z\s]+?)(?:\s+area|\s+city|\s+state|\s+looking|\s+with|\s+for|$)/i,
      /\s([a-z\s]+?)(?:\s+area|\s+city)(?:\s|$)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = normalizedText.match(pattern);
      if (match && match[1]) {
        const location = match[1].trim();
        // Filter out common non-location words
        const nonLocationWords = ['help', 'support', 'insurance', 'claims', 'looking', 'someone', 'experience'];
        if (location.length > 2 && location.length < 30 && 
            !nonLocationWords.some(word => location.includes(word))) {
          return this.capitalizeWords(location);
        }
      }
    }
    
    return undefined;
  }

  /**
   * Extracts experience requirements from query
   * @param normalizedText - Pre-processed text
   * @returns Minimum years of experience or undefined
   */
  private extractExperience(normalizedText: string): number | undefined {
    const experiencePatterns = [
      /(\d+)\s*\+?\s*years?\s+(?:of\s+)?experience/i,
      /experience(?:\s+of)?\s+(\d+)\s*\+?\s*years?/i,
      /at\s+least\s+(\d+)\s*years?/i,
      /minimum\s+(\d+)\s*years?/i
    ];
    
    for (const pattern of experiencePatterns) {
      const match = normalizedText.match(pattern);
      if (match && match[1]) {
        const years = parseInt(match[1], 10);
        if (years > 0 && years <= 50) {
          return years;
        }
      }
    }
    
    return undefined;
  }

  /**
   * Calculates confidence score for the processed query
   * @param keywords - Extracted keywords
   * @param specialties - Matched specialties
   * @param intent - Detected intent
   * @returns Confidence score between 0 and 1
   */
  calculateConfidence(keywords: string[], specialties: string[], intent: SearchIntent): number {
    let confidence = 0.25; // Base confidence
    
    // Boost confidence for matched specialties
    if (specialties.length > 0) {
      confidence += Math.min(specialties.length * 0.15, 0.3);
    }
    
    // Boost confidence for specific intents
    if (intent !== SearchIntent.GENERAL_ADVOCACY) {
      confidence += 0.15;
    }
    
    // Boost confidence for meaningful keywords (but be conservative)
    if (keywords.length >= 2) {
      confidence += Math.min((keywords.length - 1) * 0.03, 0.15);
    }
    
    // Penalize very vague queries (just generic words)
    const vaguWords = ['help', 'support', 'need', 'assistance'];
    const hasOnlyVagueWords = keywords.length <= 2 && 
      keywords.every(keyword => vaguWords.includes(keyword));
    
    if (hasOnlyVagueWords && specialties.length === 0) {
      confidence = Math.min(confidence, 0.4);
    }
    
    // Cap confidence at 1.0
    return Math.min(confidence, 1.0);
  }

  /**
   * Checks if a bigram is relevant for healthcare advocacy
   * @param bigram - Two-word phrase to check
   * @returns True if the bigram is relevant
   */
  private isRelevantBigram(bigram: string): boolean {
    const relevantBigrams = [
      'mental health',
      'insurance claim',
      'insurance claims',
      'disability support',
      'special needs',
      'health insurance',
      'medical bills',
      'chronic disease',
      'elderly care',
      'physical therapy',
      'occupational therapy',
      'substance abuse',
      'women health',
      'pediatric care'
    ];
    
    return relevantBigrams.includes(bigram);
  }

  /**
   * Capitalizes the first letter of each word
   * @param text - Text to capitalize
   * @returns Capitalized text
   */
  private capitalizeWords(text: string): string {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// Export a singleton instance for easy use
export const nlProcessor = new NaturalLanguageProcessor();