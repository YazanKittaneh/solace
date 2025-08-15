'use client';

import { useState, useRef, useEffect } from 'react';
import { Advocate } from '../../types/advocate';

export interface SearchFilterBarProps {
  initialQuery?: string;
  advocates: Advocate[];
  onSearch: (query: string) => void;
  onNewSearch: () => void;
  isLoading?: boolean;
  resultCount: number;
}

export default function SearchFilterBar({
  initialQuery = '',
  advocates,
  onSearch,
  onNewSearch,
  isLoading = false,
  resultCount
}: SearchFilterBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Get unique specialties and locations for suggestions
  const uniqueSpecialties = Array.from(new Set(advocates.flatMap(a => a.specialties))).sort();
  const uniqueLocations = Array.from(new Set(advocates.map(a => a.city))).sort();
  const uniqueDegrees = Array.from(new Set(advocates.map(a => a.degree))).sort();

  // Generate search suggestions based on current query
  const suggestions = query.length >= 2 ? [
    ...uniqueSpecialties.filter(s => s.toLowerCase().includes(query.toLowerCase())),
    ...uniqueLocations.filter(l => l.toLowerCase().includes(query.toLowerCase())),
    ...uniqueDegrees.filter(d => d.toLowerCase().includes(query.toLowerCase()))
  ].slice(0, 6) : [];

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length >= 2);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      onSearch(trimmedQuery);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle clear search
  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle new search button
  const handleNewSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    onNewSearch();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Healthcare Advocates
            </h1>
          </div>

          {/* Search Form */}
          <div className="flex-1 max-w-2xl relative">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    className="h-5 w-5 text-gray-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </div>
                
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(query.length >= 2)}
                  placeholder="Refine your search..."
                  disabled={isLoading}
                  className={`
                    block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg
                    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    disabled:bg-white disabled:cursor-not-allowed
                    text-sm
                  `}
                  aria-label="Search for healthcare advocates"
                />

                {/* Clear Button */}
                {query && !isLoading && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label="Clear search"
                  >
                    <svg 
                      className="h-5 w-5 text-gray-400 hover:text-gray-600" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M6 18L18 6M6 6l12 12" 
                      />
                    </svg>
                  </button>
                )}

                {/* Loading Spinner */}
                {isLoading && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20"
                >
                  <div className="py-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <svg 
                            className="h-4 w-4 text-gray-400 mr-3" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                            />
                          </svg>
                          {suggestion}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Results Count and Actions */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 whitespace-nowrap">
              {resultCount} result{resultCount === 1 ? '' : 's'}
            </div>
            
            <button
              onClick={handleNewSearch}
              className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              New Search
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 mr-2">Quick filters:</span>
          
          {['Mental Health', 'Insurance Claims', 'Medical Care', 'Disability Support'].map((filter) => (
            <button
              key={filter}
              onClick={() => handleSuggestionClick(filter)}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              {filter}
            </button>
          ))}
          
          <button
            onClick={() => handleSuggestionClick('5+ years experience')}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Experienced (5+ years)
          </button>
        </div>
      </div>
    </div>
  );
}