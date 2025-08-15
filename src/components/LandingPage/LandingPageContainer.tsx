'use client';

import { useState, useCallback, useRef } from 'react';
import HeroSection from './HeroSection';
import ExamplePrompts from './ExamplePrompts';
import { SearchEnhancer } from '../../lib/search-enhancer';
import { Advocate } from '../../types/advocate';

export interface LandingPageContainerProps {
  advocates: Advocate[];
  onSearchResults?: (results: Advocate[], query: string) => void;
  onSearchStart?: (query: string) => void;
  onSearchError?: (error: Error, query: string) => void;
  className?: string;
}

interface SearchState {
  isLoading: boolean;
  error: string | null;
  lastQuery: string | null;
  results: Advocate[];
}

export default function LandingPageContainer({
  advocates,
  onSearchResults,
  onSearchStart,
  onSearchError,
  className = ''
}: LandingPageContainerProps) {
  const [searchState, setSearchState] = useState<SearchState>({
    isLoading: false,
    error: null,
    lastQuery: null,
    results: []
  });

  const searchEnhancer = useRef(new SearchEnhancer());
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSearch = useCallback(async (query: string) => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Trim and validate query
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearchState(prev => ({
        ...prev,
        error: 'Please enter a search query',
        isLoading: false
      }));
      return;
    }

    // Check for duplicate search
    if (trimmedQuery === searchState.lastQuery && !searchState.error) {
      return;
    }

    try {
      // Start search
      setSearchState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        lastQuery: trimmedQuery
      }));

      // Notify parent component
      onSearchStart?.(trimmedQuery);

      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      // Perform enhanced search
      const results = searchEnhancer.current.enhanceAdvocateSearch(advocates, trimmedQuery);

      // Update state with results
      setSearchState(prev => ({
        ...prev,
        isLoading: false,
        results,
        error: null
      }));

      // Notify parent component
      onSearchResults?.(results, trimmedQuery);

    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred during search';

      setSearchState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        results: []
      }));

      // Notify parent component
      onSearchError?.(error instanceof Error ? error : new Error(errorMessage), trimmedQuery);
    }
  }, [advocates, searchState.lastQuery, searchState.error, onSearchResults, onSearchStart, onSearchError]);

  const handlePromptSelect = useCallback((prompt: string) => {
    handleSearch(prompt);
  }, [handleSearch]);

  const handleRetrySearch = useCallback(() => {
    if (searchState.lastQuery) {
      handleSearch(searchState.lastQuery);
    }
  }, [searchState.lastQuery, handleSearch]);

  const clearError = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Hero Section */}
      <HeroSection
        onSearch={handleSearch}
        isLoading={searchState.isLoading}
        placeholder="Describe what you need help with..."
      />

      {/* Error Display */}
      {searchState.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 sm:mx-6 lg:mx-8 -mt-8 relative z-10">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg 
                className="h-5 w-5 text-red-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Search Error
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {searchState.error}
              </p>
              <div className="mt-3 flex space-x-3">
                {searchState.lastQuery && (
                  <button
                    onClick={handleRetrySearch}
                    disabled={searchState.isLoading}
                    className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searchState.isLoading ? 'Retrying...' : 'Retry Search'}
                  </button>
                )}
                <button
                  onClick={clearError}
                  className="text-sm text-red-800 hover:text-red-900 focus:outline-none focus:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {searchState.isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mx-4 sm:mx-6 lg:mx-8 -mt-8 relative z-10">
          <div className="flex items-center justify-center">
            <svg 
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" 
              fill="none" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-blue-700 font-medium">
              Searching for advocates that match your needs...
            </span>
          </div>
          {searchState.lastQuery && (
            <p className="mt-2 text-sm text-blue-600 text-center">
              Query: "{searchState.lastQuery}"
            </p>
          )}
        </div>
      )}

      {/* Search Results Summary */}
      {searchState.results.length > 0 && !searchState.isLoading && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mx-4 sm:mx-6 lg:mx-8 -mt-8 relative z-10">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg 
                className="h-5 w-5 text-green-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Search Complete
              </h3>
              <p className="mt-1 text-sm text-green-700">
                Found {searchState.results.length} advocate{searchState.results.length === 1 ? '' : 's'} 
                {searchState.lastQuery && ` matching "${searchState.lastQuery}"`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {searchState.results.length === 0 && searchState.lastQuery && !searchState.isLoading && !searchState.error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mx-4 sm:mx-6 lg:mx-8 -mt-8 relative z-10">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg 
                className="h-5 w-5 text-yellow-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                No Results Found
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                We couldn't find any advocates matching "{searchState.lastQuery}". 
                Try using different keywords or browse the examples below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Example Prompts Section */}
      <ExamplePrompts
        onPromptSelect={handlePromptSelect}
        disabled={searchState.isLoading}
      />

      {/* Search Statistics */}
      {advocates.length > 0 && (
        <div className="bg-white py-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {advocates.length}
                </div>
                <div className="text-sm text-gray-600">
                  Total Advocates
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {searchState.results.length > 0 ? searchState.results.length : '—'}
                </div>
                <div className="text-sm text-gray-600">
                  Search Results
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {searchState.lastQuery ? '1' : '0'}
                </div>
                <div className="text-sm text-gray-600">
                  Searches Performed
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accessibility Announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {searchState.isLoading && `Searching for advocates matching: ${searchState.lastQuery}`}
        {searchState.results.length > 0 && !searchState.isLoading && 
          `Search complete. Found ${searchState.results.length} matching advocates.`
        }
        {searchState.error && `Search error: ${searchState.error}`}
      </div>
    </div>
  );
}