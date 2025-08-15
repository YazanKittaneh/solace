import { 
  SearchQuery, 
  SearchTerms, 
  SearchFilters, 
  Prompt, 
  SearchIntent, 
  SPECIALTY_KEYWORDS, 
  INTENT_PATTERNS 
} from '../advocate';

describe('Search Types', () => {
  describe('SearchQuery interface', () => {
    it('should create a valid SearchQuery object', () => {
      const searchQuery: SearchQuery = {
        id: '123',
        originalText: 'I need help with insurance claims',
        processedTerms: ['insurance', 'claims', 'help'],
        intent: SearchIntent.INSURANCE_HELP,
        timestamp: new Date()
      };

      expect(searchQuery.id).toBe('123');
      expect(searchQuery.originalText).toBe('I need help with insurance claims');
      expect(searchQuery.processedTerms).toHaveLength(3);
      expect(searchQuery.intent).toBe(SearchIntent.INSURANCE_HELP);
      expect(searchQuery.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('SearchTerms interface', () => {
    it('should create a valid SearchTerms object with all properties', () => {
      const searchTerms: SearchTerms = {
        specialties: ['Insurance Claims'],
        keywords: ['insurance', 'help'],
        location: 'New York',
        experience: 5,
        confidence: 0.8
      };

      expect(searchTerms.specialties).toContain('Insurance Claims');
      expect(searchTerms.keywords).toContain('insurance');
      expect(searchTerms.location).toBe('New York');
      expect(searchTerms.experience).toBe(5);
      expect(searchTerms.confidence).toBe(0.8);
    });

    it('should create a valid SearchTerms object with optional properties undefined', () => {
      const searchTerms: SearchTerms = {
        specialties: ['Mental Health'],
        keywords: ['therapy'],
        confidence: 0.6
      };

      expect(searchTerms.location).toBeUndefined();
      expect(searchTerms.experience).toBeUndefined();
      expect(searchTerms.confidence).toBe(0.6);
    });
  });

  describe('SearchFilters interface', () => {
    it('should create a valid SearchFilters object', () => {
      const searchFilters: SearchFilters = {
        specialtyMatches: ['Mental Health', 'Insurance Claims'],
        keywordMatches: ['therapy', 'insurance'],
        locationFilter: 'California',
        experienceMin: 3,
        textSearch: 'mental health therapy'
      };

      expect(searchFilters.specialtyMatches).toHaveLength(2);
      expect(searchFilters.keywordMatches).toContain('therapy');
      expect(searchFilters.locationFilter).toBe('California');
      expect(searchFilters.experienceMin).toBe(3);
      expect(searchFilters.textSearch).toBe('mental health therapy');
    });
  });

  describe('Prompt interface', () => {
    it('should create a valid Prompt object for each category', () => {
      const insurancePrompt: Prompt = {
        id: 'ins-1',
        text: 'Help with insurance claims and denials',
        category: 'insurance',
        searchTerms: ['insurance', 'claims', 'denials']
      };

      const mentalHealthPrompt: Prompt = {
        id: 'mh-1',
        text: 'Finding mental health support',
        category: 'mental-health',
        searchTerms: ['mental', 'health', 'support']
      };

      expect(insurancePrompt.category).toBe('insurance');
      expect(mentalHealthPrompt.category).toBe('mental-health');
      expect(insurancePrompt.searchTerms).toContain('insurance');
      expect(mentalHealthPrompt.searchTerms).toContain('mental');
    });
  });

  describe('SearchIntent enum', () => {
    it('should have all required intent values', () => {
      expect(SearchIntent.FIND_SPECIALIST).toBe('find_specialist');
      expect(SearchIntent.INSURANCE_HELP).toBe('insurance_help');
      expect(SearchIntent.MENTAL_HEALTH).toBe('mental_health');
      expect(SearchIntent.DISABILITY_SUPPORT).toBe('disability_support');
      expect(SearchIntent.GENERAL_ADVOCACY).toBe('general_advocacy');
    });

    it('should allow assignment of enum values', () => {
      const intent: SearchIntent = SearchIntent.MENTAL_HEALTH;
      expect(intent).toBe('mental_health');
    });
  });
});

describe('Search Constants', () => {
  describe('SPECIALTY_KEYWORDS', () => {
    it('should contain all required specialty categories', () => {
      const expectedSpecialties = [
        'Mental Health',
        'Insurance Claims',
        'Disability Support',
        'Chronic Disease',
        'Elderly Care',
        'Pediatric Care',
        'Women\'s Health',
        'Substance Abuse',
        'Physical Therapy',
        'Occupational Therapy'
      ];

      expectedSpecialties.forEach(specialty => {
        expect(SPECIALTY_KEYWORDS[specialty as keyof typeof SPECIALTY_KEYWORDS]).toBeDefined();
      });
    });

    it('should have keyword arrays for each specialty', () => {
      expect(SPECIALTY_KEYWORDS['Mental Health']).toContain('mental');
      expect(SPECIALTY_KEYWORDS['Mental Health']).toContain('therapy');
      expect(SPECIALTY_KEYWORDS['Insurance Claims']).toContain('insurance');
      expect(SPECIALTY_KEYWORDS['Insurance Claims']).toContain('claim');
      expect(SPECIALTY_KEYWORDS['Disability Support']).toContain('disability');
      expect(SPECIALTY_KEYWORDS['Disability Support']).toContain('ADA');
    });

    it('should have non-empty keyword arrays for all specialties', () => {
      Object.values(SPECIALTY_KEYWORDS).forEach(keywords => {
        expect(keywords.length).toBeGreaterThan(0);
      });
    });
  });

  describe('INTENT_PATTERNS', () => {
    it('should contain all required intent patterns', () => {
      expect(INTENT_PATTERNS.INSURANCE_HELP).toBeInstanceOf(RegExp);
      expect(INTENT_PATTERNS.MENTAL_HEALTH).toBeInstanceOf(RegExp);
      expect(INTENT_PATTERNS.DISABILITY_SUPPORT).toBeInstanceOf(RegExp);
      expect(INTENT_PATTERNS.FIND_SPECIALIST).toBeInstanceOf(RegExp);
      expect(INTENT_PATTERNS.GENERAL_ADVOCACY).toBeInstanceOf(RegExp);
    });

    it('should match relevant text patterns case-insensitively', () => {
      expect(INTENT_PATTERNS.INSURANCE_HELP.test('I need help with insurance claims')).toBe(true);
      expect(INTENT_PATTERNS.INSURANCE_HELP.test('INSURANCE COVERAGE')).toBe(true);
      expect(INTENT_PATTERNS.MENTAL_HEALTH.test('mental health support')).toBe(true);
      expect(INTENT_PATTERNS.MENTAL_HEALTH.test('THERAPY AND COUNSELING')).toBe(true);
      expect(INTENT_PATTERNS.DISABILITY_SUPPORT.test('disability accommodation')).toBe(true);
      expect(INTENT_PATTERNS.FIND_SPECIALIST.test('find a specialist')).toBe(true);
      expect(INTENT_PATTERNS.GENERAL_ADVOCACY.test('need help and support')).toBe(true);
    });

    it('should not match unrelated text patterns', () => {
      expect(INTENT_PATTERNS.INSURANCE_HELP.test('mental health therapy')).toBe(false);
      expect(INTENT_PATTERNS.MENTAL_HEALTH.test('insurance claims')).toBe(false);
      expect(INTENT_PATTERNS.DISABILITY_SUPPORT.test('general support')).toBe(false);
    });
  });
});

describe('Type Safety and TypeScript Compatibility', () => {
  it('should enforce strict typing for enum values', () => {
    const validIntent: SearchIntent = SearchIntent.MENTAL_HEALTH;
    expect(typeof validIntent).toBe('string');
    expect(validIntent).toBe('mental_health');
  });

  it('should enforce strict typing for prompt categories', () => {
    const validCategories: Array<Prompt['category']> = [
      'insurance',
      'mental-health', 
      'disability',
      'general'
    ];

    validCategories.forEach(category => {
      const prompt: Prompt = {
        id: 'test',
        text: 'Test prompt',
        category,
        searchTerms: ['test']
      };
      expect(prompt.category).toBe(category);
    });
  });

  it('should handle optional properties correctly', () => {
    const minimalSearchTerms: SearchTerms = {
      specialties: [],
      keywords: [],
      confidence: 0.5
    };

    expect(minimalSearchTerms.location).toBeUndefined();
    expect(minimalSearchTerms.experience).toBeUndefined();
    expect(minimalSearchTerms.confidence).toBe(0.5);
  });
});