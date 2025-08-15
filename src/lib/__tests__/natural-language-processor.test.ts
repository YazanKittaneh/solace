import { NaturalLanguageProcessor, nlProcessor } from '../natural-language-processor';
import { SearchIntent } from '../../types/advocate';

describe('NaturalLanguageProcessor', () => {
  let processor: NaturalLanguageProcessor;

  beforeEach(() => {
    processor = new NaturalLanguageProcessor();
  });

  describe('processQuery', () => {
    it('should process insurance-related queries correctly', () => {
      const query = "I need help with my insurance claim denial";
      const result = processor.processQuery(query);

      expect(result.specialties).toContain('Insurance Claims');
      expect(result.keywords).toContain('insurance');
      expect(result.keywords).toContain('claim');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should process mental health queries correctly', () => {
      const query = "Finding a therapist for depression and anxiety";
      const result = processor.processQuery(query);

      expect(result.specialties).toContain('Mental Health');
      expect(result.keywords).toContain('therapist');
      expect(result.keywords).toContain('depression');
      expect(result.keywords).toContain('anxiety');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should process disability support queries correctly', () => {
      const query = "Need help with ADA accommodation at work";
      const result = processor.processQuery(query);

      expect(result.specialties).toContain('Disability Support');
      expect(result.keywords).toContain('ada');
      expect(result.keywords).toContain('accommodation');
      expect(result.keywords).toContain('work');
    });

    it('should extract location information', () => {
      const query = "Looking for mental health support in New York";
      const result = processor.processQuery(query);

      expect(result.location).toBe('New York');
      expect(result.specialties).toContain('Mental Health');
    });

    it('should extract experience requirements', () => {
      const query = "Need a specialist with at least 5 years experience";
      const result = processor.processQuery(query);

      expect(result.experience).toBe(5);
      expect(result.keywords).toContain('specialist');
    });

    it('should handle complex queries with multiple elements', () => {
      const query = "I need help with insurance claims in California, looking for someone with 10+ years experience";
      const result = processor.processQuery(query);

      expect(result.specialties).toContain('Insurance Claims');
      expect(result.location).toBe('California');
      expect(result.experience).toBe(10);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should handle vague queries with low confidence', () => {
      const query = "I need support";
      const result = processor.processQuery(query);

      expect(result.keywords).toContain('support');
      expect(result.confidence).toBeLessThan(0.5);
      expect(result.specialties.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('mapToSpecialties', () => {
    it('should map mental health keywords correctly', () => {
      const keywords = ['mental', 'therapy', 'counseling'];
      const specialties = processor.mapToSpecialties(keywords);

      expect(specialties).toContain('Mental Health');
    });

    it('should map insurance keywords correctly', () => {
      const keywords = ['insurance', 'claim', 'billing'];
      const specialties = processor.mapToSpecialties(keywords);

      expect(specialties).toContain('Insurance Claims');
    });

    it('should map disability keywords correctly', () => {
      const keywords = ['disability', 'accommodation', 'ada'];
      const specialties = processor.mapToSpecialties(keywords);

      expect(specialties).toContain('Disability Support');
    });

    it('should handle partial keyword matches', () => {
      const keywords = ['psychiatric', 'psychological'];
      const specialties = processor.mapToSpecialties(keywords);

      expect(specialties).toContain('Mental Health');
    });

    it('should return empty array for unrelated keywords', () => {
      const keywords = ['banana', 'computer', 'elephant'];
      const specialties = processor.mapToSpecialties(keywords);

      expect(specialties).toHaveLength(0);
    });

    it('should handle multiple specialty matches', () => {
      const keywords = ['mental', 'insurance', 'elderly'];
      const specialties = processor.mapToSpecialties(keywords);

      expect(specialties).toContain('Mental Health');
      expect(specialties).toContain('Insurance Claims');
      expect(specialties).toContain('Elderly Care');
      expect(specialties.length).toBe(3);
    });
  });

  describe('detectIntent', () => {
    it('should detect insurance help intent', () => {
      const queries = [
        "help with insurance claims",
        "insurance coverage denial",
        "billing issues with insurance"
      ];

      queries.forEach(query => {
        const intent = processor.detectIntent(query);
        expect(intent).toBe(SearchIntent.INSURANCE_HELP);
      });
    });

    it('should detect mental health intent', () => {
      const queries = [
        "mental health support",
        "therapy for anxiety",
        "counseling services"
      ];

      queries.forEach(query => {
        const intent = processor.detectIntent(query);
        expect(intent).toBe(SearchIntent.MENTAL_HEALTH);
      });
    });

    it('should detect disability support intent', () => {
      const queries = [
        "disability accommodation",
        "ADA compliance help",
        "special needs support"
      ];

      queries.forEach(query => {
        const intent = processor.detectIntent(query);
        expect(intent).toBe(SearchIntent.DISABILITY_SUPPORT);
      });
    });

    it('should detect find specialist intent', () => {
      const queries = [
        "find a specialist",
        "looking for expert doctor",
        "need professional provider"
      ];

      queries.forEach(query => {
        const intent = processor.detectIntent(query);
        expect(intent).toBe(SearchIntent.FIND_SPECIALIST);
      });
    });

    it('should default to general advocacy intent', () => {
      const queries = [
        "general support needed",
        "just need some guidance",
        "random text without specific intent"
      ];

      queries.forEach(query => {
        const intent = processor.detectIntent(query);
        expect(intent).toBe(SearchIntent.GENERAL_ADVOCACY);
      });
    });

    it('should be case insensitive', () => {
      const upperCaseQuery = "INSURANCE CLAIMS HELP";
      const lowerCaseQuery = "insurance claims help";
      const mixedCaseQuery = "Insurance Claims Help";

      expect(processor.detectIntent(upperCaseQuery)).toBe(SearchIntent.INSURANCE_HELP);
      expect(processor.detectIntent(lowerCaseQuery)).toBe(SearchIntent.INSURANCE_HELP);
      expect(processor.detectIntent(mixedCaseQuery)).toBe(SearchIntent.INSURANCE_HELP);
    });
  });

  describe('calculateConfidence', () => {
    it('should give higher confidence for matched specialties', () => {
      const baseConfidence = processor.calculateConfidence([], [], SearchIntent.GENERAL_ADVOCACY);
      const withSpecialties = processor.calculateConfidence([], ['Mental Health'], SearchIntent.GENERAL_ADVOCACY);

      expect(withSpecialties).toBeGreaterThan(baseConfidence);
    });

    it('should give higher confidence for specific intents', () => {
      const generalIntent = processor.calculateConfidence([], [], SearchIntent.GENERAL_ADVOCACY);
      const specificIntent = processor.calculateConfidence([], [], SearchIntent.INSURANCE_HELP);

      expect(specificIntent).toBeGreaterThan(generalIntent);
    });

    it('should give higher confidence for more keywords', () => {
      const fewKeywords = processor.calculateConfidence(['help'], [], SearchIntent.GENERAL_ADVOCACY);
      const manyKeywords = processor.calculateConfidence(['help', 'insurance', 'claim', 'support'], [], SearchIntent.GENERAL_ADVOCACY);

      expect(manyKeywords).toBeGreaterThan(fewKeywords);
    });

    it('should cap confidence at 1.0', () => {
      const maxConfidence = processor.calculateConfidence(
        ['insurance', 'claim', 'help', 'support', 'coverage'],
        ['Insurance Claims', 'Mental Health'],
        SearchIntent.INSURANCE_HELP
      );

      expect(maxConfidence).toBeLessThanOrEqual(1.0);
    });

    it('should have minimum base confidence', () => {
      const minConfidence = processor.calculateConfidence([], [], SearchIntent.GENERAL_ADVOCACY);

      expect(minConfidence).toBeGreaterThanOrEqual(0.25);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty strings', () => {
      const result = processor.processQuery('');

      expect(result.keywords).toHaveLength(0);
      expect(result.specialties).toHaveLength(0);
      expect(result.confidence).toBeGreaterThanOrEqual(0.25);
    });

    it('should handle strings with only punctuation', () => {
      const result = processor.processQuery('!@#$%^&*()');

      expect(result.keywords).toHaveLength(0);
      expect(result.specialties).toHaveLength(0);
    });

    it('should handle very long queries', () => {
      const longQuery = 'insurance claim help support '.repeat(50);
      const result = processor.processQuery(longQuery);

      expect(result.specialties).toContain('Insurance Claims');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should handle special characters and numbers', () => {
      const query = "Need help with insurance claim #12345 - denied coverage!!!";
      const result = processor.processQuery(query);

      expect(result.specialties).toContain('Insurance Claims');
      expect(result.keywords).toContain('insurance');
      expect(result.keywords).toContain('claim');
    });

    it('should handle misspellings in common words', () => {
      const query = "insuranse clam help"; // Misspelled words
      const result = processor.processQuery(query);

      // Should still detect some keywords even with misspellings
      expect(result.keywords.length).toBeGreaterThan(0);
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(nlProcessor).toBeInstanceOf(NaturalLanguageProcessor);
    });

    it('should work the same as a new instance', () => {
      const query = "mental health therapy support";
      
      const newInstanceResult = new NaturalLanguageProcessor().processQuery(query);
      const singletonResult = nlProcessor.processQuery(query);

      expect(singletonResult.specialties).toEqual(newInstanceResult.specialties);
      expect(singletonResult.keywords).toEqual(newInstanceResult.keywords);
      expect(singletonResult.confidence).toEqual(newInstanceResult.confidence);
    });
  });

  describe('performance considerations', () => {
    it('should process queries quickly', () => {
      const query = "I need help with mental health insurance claims and disability support";
      
      const startTime = performance.now();
      processor.processQuery(query);
      const endTime = performance.now();
      
      const processingTime = endTime - startTime;
      expect(processingTime).toBeLessThan(50); // Should complete within 50ms
    });

    it('should handle multiple queries efficiently', () => {
      const queries = [
        "insurance help",
        "mental health support",
        "disability accommodation",
        "find specialist",
        "general advocacy"
      ];

      const startTime = performance.now();
      queries.forEach(query => processor.processQuery(query));
      const endTime = performance.now();

      const avgTime = (endTime - startTime) / queries.length;
      expect(avgTime).toBeLessThan(20); // Average should be under 20ms per query
    });
  });
});