import { SearchEnhancer, searchEnhancer } from '../search-enhancer';
import { Advocate, SearchTerms, SearchIntent } from '../../types/advocate';

// Mock advocates for testing
const mockAdvocates: Advocate[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Smith',
    city: 'New York',
    degree: 'MD',
    specialties: ['Mental Health', 'Anxiety Disorders'],
    yearsOfExperience: 10,
    phoneNumber: '555-0101'
  },
  {
    id: 2,
    firstName: 'Sarah',
    lastName: 'Johnson',
    city: 'Los Angeles',
    degree: 'MSW',
    specialties: ['Insurance Claims', 'Medical Billing'],
    yearsOfExperience: 7,
    phoneNumber: '555-0102'
  },
  {
    id: 3,
    firstName: 'Michael',
    lastName: 'Brown',
    city: 'Chicago',
    degree: 'PhD',
    specialties: ['Disability Support', 'ADA Compliance'],
    yearsOfExperience: 15,
    phoneNumber: '555-0103'
  },
  {
    id: 4,
    firstName: 'Emily',
    lastName: 'Davis',
    city: 'San Francisco',
    degree: 'LCSW',
    specialties: ['Mental Health', 'Substance Abuse'],
    yearsOfExperience: 5,
    phoneNumber: '555-0104'
  },
  {
    id: 5,
    firstName: 'David',
    lastName: 'Wilson',
    city: 'Boston',
    degree: 'JD',
    specialties: ['Insurance Claims', 'Legal Advocacy'],
    yearsOfExperience: 12,
    phoneNumber: '555-0105'
  }
];

describe('SearchEnhancer', () => {
  let enhancer: SearchEnhancer;

  beforeEach(() => {
    enhancer = new SearchEnhancer();
    enhancer.clearCache(); // Clear cache before each test
  });

  describe('enhanceAdvocateSearch', () => {
    it('should return all advocates for empty query', () => {
      const results = enhancer.enhanceAdvocateSearch(mockAdvocates, '');
      expect(results).toEqual(mockAdvocates);
    });

    it('should find mental health advocates', () => {
      const results = enhancer.enhanceAdvocateSearch(mockAdvocates, 'mental health therapy');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(a => a.specialties.includes('Mental Health'))).toBe(true);
    });

    it('should find insurance claims advocates', () => {
      const results = enhancer.enhanceAdvocateSearch(mockAdvocates, 'insurance claims help');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(a => a.specialties.includes('Insurance Claims'))).toBe(true);
    });

    it('should find disability support advocates', () => {
      const results = enhancer.enhanceAdvocateSearch(mockAdvocates, 'disability accommodation ADA');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(a => a.specialties.includes('Disability Support'))).toBe(true);
    });

    it('should handle location-specific searches', () => {
      const results = enhancer.enhanceAdvocateSearch(mockAdvocates, 'mental health in New York');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.city).toBe('New York');
    });

    it('should handle experience requirements', () => {
      const results = enhancer.enhanceAdvocateSearch(mockAdvocates, 'advocate with at least 10 years experience');
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(advocate => {
        expect(advocate.yearsOfExperience).toBeGreaterThanOrEqual(10);
      });
    });

    it('should rank results by relevance', () => {
      const results = enhancer.enhanceAdvocateSearch(mockAdvocates, 'mental health');
      
      expect(results.length).toBeGreaterThan(1);
      // First result should have mental health specialty
      expect(results[0]?.specialties.some(s => s.includes('Mental Health'))).toBe(true);
    });

    it('should fallback to basic search when no specialty matches', () => {
      const results = enhancer.enhanceAdvocateSearch(mockAdvocates, 'john smith');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.firstName).toBe('John');
      expect(results[0]?.lastName).toBe('Smith');
    });
  });

  describe('calculateRelevanceScore', () => {
    const mockSearchTerms: SearchTerms = {
      specialties: ['Mental Health'],
      keywords: ['mental', 'health'],
      confidence: 0.8
    };

    it('should give higher scores for exact specialty matches', () => {
      const mentalHealthAdvocate = mockAdvocates.find(a => a.specialties.includes('Mental Health'))!;
      const insuranceAdvocate = mockAdvocates.find(a => a.specialties.includes('Insurance Claims'))!;
      
      const mentalHealthScore = enhancer.calculateRelevanceScore(mentalHealthAdvocate, mockSearchTerms);
      const insuranceScore = enhancer.calculateRelevanceScore(insuranceAdvocate, mockSearchTerms);
      
      expect(mentalHealthScore).toBeGreaterThan(insuranceScore);
    });

    it('should consider location matches', () => {
      const searchTermsWithLocation: SearchTerms = {
        ...mockSearchTerms,
        location: 'New York'
      };
      
      const nyAdvocate = mockAdvocates.find(a => a.city === 'New York')!;
      const laAdvocate = mockAdvocates.find(a => a.city === 'Los Angeles')!;
      
      const nyScore = enhancer.calculateRelevanceScore(nyAdvocate, searchTermsWithLocation);
      const laScore = enhancer.calculateRelevanceScore(laAdvocate, searchTermsWithLocation);
      
      expect(nyScore).toBeGreaterThan(laScore);
    });

    it('should consider experience requirements', () => {
      const searchTermsWithExperience: SearchTerms = {
        ...mockSearchTerms,
        experience: 10
      };
      
      const experiencedAdvocate = mockAdvocates.find(a => a.yearsOfExperience >= 10)!;
      const lessExperiencedAdvocate = mockAdvocates.find(a => a.yearsOfExperience < 10)!;
      
      const experiencedScore = enhancer.calculateRelevanceScore(experiencedAdvocate, searchTermsWithExperience);
      const lessExperiencedScore = enhancer.calculateRelevanceScore(lessExperiencedAdvocate, searchTermsWithExperience);
      
      expect(experiencedScore).toBeGreaterThan(lessExperiencedScore);
    });

    it('should apply confidence multiplier', () => {
      const highConfidenceTerms: SearchTerms = { ...mockSearchTerms, confidence: 1.0 };
      const lowConfidenceTerms: SearchTerms = { ...mockSearchTerms, confidence: 0.3 };
      
      const advocate = mockAdvocates[0]!;
      
      const highConfidenceScore = enhancer.calculateRelevanceScore(advocate, highConfidenceTerms);
      const lowConfidenceScore = enhancer.calculateRelevanceScore(advocate, lowConfidenceTerms);
      
      expect(highConfidenceScore).toBeGreaterThan(lowConfidenceScore);
    });
  });

  describe('rankByRelevance', () => {
    const mockSearchTerms: SearchTerms = {
      specialties: ['Mental Health'],
      keywords: ['mental', 'health'],
      confidence: 0.8
    };

    it('should rank advocates by relevance score', () => {
      const results = enhancer.rankByRelevance(mockAdvocates, mockSearchTerms);
      
      expect(results.length).toBe(mockAdvocates.length);
      
      // Check that scores are in descending order
      for (let i = 0; i < results.length - 1; i++) {
        const currentScore = enhancer.calculateRelevanceScore(results[i]!, mockSearchTerms);
        const nextScore = enhancer.calculateRelevanceScore(results[i + 1]!, mockSearchTerms);
        expect(currentScore).toBeGreaterThanOrEqual(nextScore);
      }
    });

    it('should put exact specialty matches first', () => {
      const results = enhancer.rankByRelevance(mockAdvocates, mockSearchTerms);
      
      // First result should have Mental Health specialty
      expect(results[0]?.specialties.some(s => s.includes('Mental Health'))).toBe(true);
    });
  });

  describe('generateSearchFilters', () => {
    it('should create proper search filters from search terms', () => {
      const searchTerms: SearchTerms = {
        specialties: ['Mental Health', 'Insurance Claims'],
        keywords: ['help', 'support'],
        location: 'New York',
        experience: 5,
        confidence: 0.7
      };

      const filters = enhancer.generateSearchFilters(searchTerms);

      expect(filters.specialtyMatches).toEqual(['Mental Health', 'Insurance Claims']);
      expect(filters.keywordMatches).toEqual(['help', 'support']);
      expect(filters.locationFilter).toBe('New York');
      expect(filters.experienceMin).toBe(5);
      expect(filters.textSearch).toBe('help support');
    });
  });

  describe('caching functionality', () => {
    it('should cache search results', () => {
      const query = 'mental health support';
      
      // First search
      const results1 = enhancer.enhanceAdvocateSearchCached(mockAdvocates, query);
      
      // Second search (should be cached)
      const results2 = enhancer.enhanceAdvocateSearchCached(mockAdvocates, query);
      
      expect(results1).toEqual(results2);
    });

    it('should clear cache when requested', () => {
      const query = 'mental health support';
      
      enhancer.enhanceAdvocateSearchCached(mockAdvocates, query);
      expect(enhancer['searchCache'].size).toBeGreaterThan(0);
      
      enhancer.clearCache();
      expect(enhancer['searchCache'].size).toBe(0);
    });

    it('should limit cache size', () => {
      // Fill cache beyond limit
      for (let i = 0; i < 60; i++) {
        enhancer.enhanceAdvocateSearchCached(mockAdvocates, `query ${i}`);
      }
      
      expect(enhancer['searchCache'].size).toBeLessThanOrEqual(50);
    });
  });

  describe('getSearchStats', () => {
    it('should return proper search statistics', () => {
      const searchTerms: SearchTerms = {
        specialties: ['Mental Health'],
        keywords: ['mental', 'health'],
        location: 'New York',
        experience: 5,
        confidence: 0.8
      };

      const results = mockAdvocates.slice(0, 2); // Mock results
      const stats = enhancer.getSearchStats(mockAdvocates, results, searchTerms);

      expect(stats.totalAdvocates).toBe(5);
      expect(stats.resultsCount).toBe(2);
      expect(stats.matchPercentage).toBe(40);
      expect(stats.confidence).toBe(0.8);
      expect(stats.specialtiesSearched).toEqual(['Mental Health']);
      expect(stats.keywordsUsed).toEqual(['mental', 'health']);
      expect(stats.locationFilter).toBe('New York');
      expect(stats.experienceFilter).toBe(5);
    });
  });

  describe('edge cases', () => {
    it('should handle empty advocate array', () => {
      const results = enhancer.enhanceAdvocateSearch([], 'mental health');
      expect(results).toEqual([]);
    });

    it('should handle whitespace-only query', () => {
      const results = enhancer.enhanceAdvocateSearch(mockAdvocates, '   ');
      expect(results).toEqual(mockAdvocates);
    });

    it('should handle special characters in query', () => {
      const results = enhancer.enhanceAdvocateSearch(mockAdvocates, 'mental health!!! @#$');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle queries with no matches', () => {
      const results = enhancer.enhanceAdvocateSearch(mockAdvocates, 'quantum physics');
      // Should return all advocates as fallback
      expect(results).toEqual(mockAdvocates);
    });

    it('should remove duplicate advocates', () => {
      const duplicateAdvocates = [...mockAdvocates, ...mockAdvocates];
      const results = enhancer.enhanceAdvocateSearch(duplicateAdvocates, 'mental health');
      
      // Check for duplicates
      const ids = results.map(a => a.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });

  describe('performance', () => {
    it('should search within reasonable time', () => {
      const startTime = performance.now();
      enhancer.enhanceAdvocateSearch(mockAdvocates, 'mental health insurance claims disability');
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle large advocate lists efficiently', () => {
      // Create a larger advocate list
      const largeAdvocateList = Array.from({ length: 1000 }, (_, i) => ({
        ...mockAdvocates[i % mockAdvocates.length]!,
        id: i,
        firstName: `Advocate${i}`
      }));

      const startTime = performance.now();
      const results = enhancer.enhanceAdvocateSearch(largeAdvocateList, 'mental health');
      const endTime = performance.now();

      expect(results.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(searchEnhancer).toBeInstanceOf(SearchEnhancer);
    });

    it('should work the same as a new instance', () => {
      const query = 'mental health support';
      
      const newInstanceResult = new SearchEnhancer().enhanceAdvocateSearch(mockAdvocates, query);
      const singletonResult = searchEnhancer.enhanceAdvocateSearch(mockAdvocates, query);

      expect(singletonResult.length).toBe(newInstanceResult.length);
      expect(singletonResult[0]?.id).toBe(newInstanceResult[0]?.id);
    });
  });
});