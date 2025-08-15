import { Advocate, SearchTerms, SearchFilters } from '../types/advocate';
import { NaturalLanguageProcessor } from './natural-language-processor';

export class SearchEnhancer {
  private nlProcessor: NaturalLanguageProcessor;

  constructor() {
    this.nlProcessor = new NaturalLanguageProcessor();
  }

  /**
   * Enhanced advocate search using natural language processing
   * @param advocates - Array of all advocates to search through
   * @param query - User's natural language query
   * @returns Filtered and ranked array of advocates
   */
  enhanceAdvocateSearch(advocates: Advocate[], query: string): Advocate[] {
    if (!query.trim()) {
      return advocates;
    }

    // Process the query using NLP
    const searchTerms = this.nlProcessor.processQuery(query);
    
    // Multi-tier matching strategy
    const exactMatches = this.findExactMatches(advocates, searchTerms);
    const partialMatches = this.findPartialMatches(advocates, searchTerms);
    const fallbackMatches = this.findFallbackMatches(advocates, query, searchTerms);
    
    // Combine results (avoid duplicates)
    const allMatches = this.removeDuplicates([
      ...exactMatches,
      ...partialMatches,
      ...fallbackMatches
    ]);
    
    // If we have no matches but have location/experience filters, apply those filters to all advocates
    if (allMatches.length === 0 && (searchTerms.location || searchTerms.experience)) {
      const filteredAdvocates = advocates.filter(advocate => {
        const locationMatch = !searchTerms.location || 
          advocate.city.toLowerCase().includes(searchTerms.location.toLowerCase());
        const experienceMatch = !searchTerms.experience ||
          advocate.yearsOfExperience >= searchTerms.experience;
        return locationMatch && experienceMatch;
      });
      
      return filteredAdvocates.length > 0 ? 
        this.rankByRelevance(filteredAdvocates, searchTerms) : 
        advocates;
    }
    
    // If we have no matches and no filters, return all advocates
    if (allMatches.length === 0) {
      return advocates;
    }
    
    // Rank by relevance
    return this.rankByRelevance(allMatches, searchTerms);
  }

  /**
   * Ranks advocates by relevance to the search terms
   * @param advocates - Advocates to rank
   * @param searchTerms - Processed search terms
   * @returns Advocates sorted by relevance (most relevant first)
   */
  rankByRelevance(advocates: Advocate[], searchTerms: SearchTerms): Advocate[] {
    return advocates
      .map(advocate => ({
        advocate,
        score: this.calculateRelevanceScore(advocate, searchTerms)
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.advocate);
  }

  /**
   * Finds advocates with exact specialty matches
   * @param advocates - All advocates
   * @param searchTerms - Processed search terms
   * @returns Advocates with exact specialty matches
   */
  private findExactMatches(advocates: Advocate[], searchTerms: SearchTerms): Advocate[] {
    if (searchTerms.specialties.length === 0) {
      return [];
    }

    return advocates.filter(advocate => {
      // Check location if specified (must match)
      const locationMatch = !searchTerms.location || 
        advocate.city.toLowerCase().includes(searchTerms.location.toLowerCase());

      // Check experience if specified (must match)
      const experienceMatch = !searchTerms.experience ||
        advocate.yearsOfExperience >= searchTerms.experience;

      // Must pass location and experience filters first
      if (!locationMatch || !experienceMatch) {
        return false;
      }

      return searchTerms.specialties.some(searchSpecialty =>
        advocate.specialties.some(advocateSpecialty =>
          advocateSpecialty.toLowerCase() === searchSpecialty.toLowerCase()
        )
      );
    });
  }

  /**
   * Finds advocates with partial matches (keywords in specialties, partial specialty matches)
   * @param advocates - All advocates
   * @param searchTerms - Processed search terms
   * @returns Advocates with partial matches
   */
  private findPartialMatches(advocates: Advocate[], searchTerms: SearchTerms): Advocate[] {
    return advocates.filter(advocate => {
      // Check location if specified (must match)
      const locationMatch = !searchTerms.location || 
        advocate.city.toLowerCase().includes(searchTerms.location.toLowerCase());

      // Check experience if specified (must match)
      const experienceMatch = !searchTerms.experience ||
        advocate.yearsOfExperience >= searchTerms.experience;

      // Must pass location and experience filters first
      if (!locationMatch || !experienceMatch) {
        return false;
      }

      // Check for keyword matches in specialties
      const hasKeywordMatch = searchTerms.keywords.some(keyword =>
        advocate.specialties.some(specialty =>
          specialty.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      // Check for partial specialty matches
      const hasPartialSpecialtyMatch = searchTerms.specialties.some(searchSpecialty =>
        advocate.specialties.some(advocateSpecialty =>
          advocateSpecialty.toLowerCase().includes(searchSpecialty.toLowerCase()) ||
          searchSpecialty.toLowerCase().includes(advocateSpecialty.toLowerCase())
        )
      );

      return hasKeywordMatch || hasPartialSpecialtyMatch;
    });
  }

  /**
   * Fallback search using basic text matching
   * @param advocates - All advocates
   * @param query - Original query text
   * @param searchTerms - Processed search terms for filtering
   * @returns Advocates matching basic text search
   */
  private findFallbackMatches(advocates: Advocate[], query: string, searchTerms?: SearchTerms): Advocate[] {
    const queryLower = query.toLowerCase();
    
    return advocates.filter(advocate => {
      // Apply experience and location filters if searchTerms provided
      if (searchTerms) {
        const locationMatch = !searchTerms.location || 
          advocate.city.toLowerCase().includes(searchTerms.location.toLowerCase());
        const experienceMatch = !searchTerms.experience ||
          advocate.yearsOfExperience >= searchTerms.experience;
        
        if (!locationMatch || !experienceMatch) {
          return false;
        }
      }

      const searchableText = [
        advocate.firstName,
        advocate.lastName,
        advocate.city,
        advocate.degree,
        ...advocate.specialties,
        advocate.yearsOfExperience.toString()
      ].join(' ').toLowerCase();

      return searchableText.includes(queryLower);
    });
  }

  /**
   * Calculates a relevance score for an advocate based on search terms
   * @param advocate - Advocate to score
   * @param searchTerms - Processed search terms
   * @returns Relevance score (higher is more relevant)
   */
  calculateRelevanceScore(advocate: Advocate, searchTerms: SearchTerms): number {
    let score = 0;

    // Exact specialty matches (highest weight)
    const exactSpecialtyMatches = searchTerms.specialties.filter(searchSpecialty =>
      advocate.specialties.some(advocateSpecialty =>
        advocateSpecialty.toLowerCase() === searchSpecialty.toLowerCase()
      )
    ).length;
    score += exactSpecialtyMatches * 100;

    // Partial specialty matches (medium weight)
    const partialSpecialtyMatches = searchTerms.specialties.filter(searchSpecialty =>
      advocate.specialties.some(advocateSpecialty =>
        advocateSpecialty.toLowerCase().includes(searchSpecialty.toLowerCase()) ||
        searchSpecialty.toLowerCase().includes(advocateSpecialty.toLowerCase())
      )
    ).length - exactSpecialtyMatches; // Subtract exact matches to avoid double counting
    score += partialSpecialtyMatches * 50;

    // Keyword matches in specialties
    const keywordMatches = searchTerms.keywords.filter(keyword =>
      advocate.specialties.some(specialty =>
        specialty.toLowerCase().includes(keyword.toLowerCase())
      )
    ).length;
    score += keywordMatches * 25;

    // Keyword matches in other fields
    const otherFieldMatches = searchTerms.keywords.filter(keyword => {
      const otherFields = [
        advocate.firstName,
        advocate.lastName,
        advocate.degree,
        advocate.city
      ].join(' ').toLowerCase();
      return otherFields.includes(keyword.toLowerCase());
    }).length;
    score += otherFieldMatches * 10;

    // Location match bonus
    if (searchTerms.location && 
        advocate.city.toLowerCase().includes(searchTerms.location.toLowerCase())) {
      score += 30;
    }

    // Experience match bonus
    if (searchTerms.experience && advocate.yearsOfExperience >= searchTerms.experience) {
      score += 20;
      // Extra bonus for significantly more experience
      if (advocate.yearsOfExperience >= searchTerms.experience * 1.5) {
        score += 10;
      }
    }

    // Confidence-based multiplier
    score *= searchTerms.confidence;

    return score;
  }

  /**
   * Removes duplicate advocates from an array
   * @param advocates - Array potentially containing duplicates
   * @returns Array with unique advocates
   */
  private removeDuplicates(advocates: Advocate[]): Advocate[] {
    const seen = new Set<string>();
    return advocates.filter(advocate => {
      const key = `${advocate.firstName}-${advocate.lastName}-${advocate.phoneNumber}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Creates search filters from processed search terms
   * @param searchTerms - Processed search terms
   * @returns SearchFilters object
   */
  generateSearchFilters(searchTerms: SearchTerms): SearchFilters {
    return {
      specialtyMatches: searchTerms.specialties,
      keywordMatches: searchTerms.keywords,
      locationFilter: searchTerms.location,
      experienceMin: searchTerms.experience,
      textSearch: searchTerms.keywords.join(' ')
    };
  }

  /**
   * Memoized search for performance optimization
   */
  private searchCache = new Map<string, Advocate[]>();
  private readonly CACHE_SIZE_LIMIT = 50;

  /**
   * Enhanced search with caching for repeated queries
   * @param advocates - All advocates
   * @param query - Search query
   * @returns Cached or newly computed results
   */
  enhanceAdvocateSearchCached(advocates: Advocate[], query: string): Advocate[] {
    const cacheKey = `${query.toLowerCase().trim()}-${advocates.length}`;
    
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!;
    }

    const results = this.enhanceAdvocateSearch(advocates, query);
    
    // Simple cache size management
    if (this.searchCache.size >= this.CACHE_SIZE_LIMIT) {
      const firstKey = this.searchCache.keys().next().value;
      this.searchCache.delete(firstKey);
    }
    
    this.searchCache.set(cacheKey, results);
    return results;
  }

  /**
   * Clears the search cache
   */
  clearCache(): void {
    this.searchCache.clear();
  }

  /**
   * Gets search result statistics
   * @param advocates - Original advocate list
   * @param results - Search results
   * @param searchTerms - Search terms used
   * @returns Statistics about the search
   */
  getSearchStats(advocates: Advocate[], results: Advocate[], searchTerms: SearchTerms) {
    return {
      totalAdvocates: advocates.length,
      resultsCount: results.length,
      matchPercentage: Math.round((results.length / advocates.length) * 100),
      confidence: searchTerms.confidence,
      specialtiesSearched: searchTerms.specialties,
      keywordsUsed: searchTerms.keywords,
      locationFilter: searchTerms.location,
      experienceFilter: searchTerms.experience
    };
  }
}

// Export a singleton instance for easy use
export const searchEnhancer = new SearchEnhancer();