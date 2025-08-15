'use client';

import { useState, useEffect } from 'react';
import LandingPageContainer from '../components/LandingPage/LandingPageContainer';
import SearchFilterBar from '../components/Results/SearchFilterBar';
import AdvocateTable from '../components/Results/AdvocateTable';
import { Advocate } from '../types/advocate';
import { SearchEnhancer } from '../lib/search-enhancer';

interface AdvocateApiResponse {
  data: Advocate[];
  source: 'static' | 'database';
  error?: string;
}

type ViewMode = 'landing' | 'results';

export default function LandingPage() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiSource, setApiSource] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [searchResults, setSearchResults] = useState<Advocate[]>([]);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  
  const searchEnhancer = new SearchEnhancer();

  useEffect(() => {
    const fetchAdvocates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/advocates');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch advocates: ${response.status} ${response.statusText}`);
        }
        
        const result: AdvocateApiResponse = await response.json();
        
        setAdvocates(result.data);
        setApiSource(result.source);
        
        if (result.error) {
          // API returned with warning - data still available
        }
        
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while fetching advocates';
        
        // Error already captured in errorMessage for user display
        setError(errorMessage);
        setAdvocates([]); // Fallback to empty array
        
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdvocates();
  }, []);

  const handleSearchResults = (results: Advocate[], query: string) => {
    setSearchResults(results);
    setCurrentQuery(query);
    setViewMode('results');
    setIsSearching(false); // Reset loading state when search completes
    
    // Scroll to top smoothly when showing results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchStart = (query: string) => {
    setIsSearching(true);
    setCurrentQuery(query);
  };

  const handleSearchError = (_error: Error, _query: string) => {
    setIsSearching(false);
  };

  // Handle new search from filter bar
  const handleNewSearch = () => {
    setViewMode('landing');
    setSearchResults([]);
    setCurrentQuery('');
    setIsSearching(false);
  };

  // Handle refined search from filter bar
  const handleRefinedSearch = (query: string) => {
    setIsSearching(true);
    setCurrentQuery(query);
    
    // Perform search using the search enhancer
    try {
      const results = searchEnhancer.enhanceAdvocateSearch(advocates, query);
      setSearchResults(results);
      setIsSearching(false);
    } catch (error) {
      setIsSearching(false);
    }
  };

  // Handle contact advocate
  const handleContactAdvocate = (advocate: Advocate) => {
    // In a real app, this would open a contact modal or navigate to contact page
    alert(`Contact ${advocate.firstName} ${advocate.lastName} at ${advocate.phoneNumber}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Healthcare Advocates</h2>
          <p className="text-gray-600">Please wait while we prepare your advocate directory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg 
              className="h-12 w-12 text-red-400 mx-auto mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Unable to Load Advocates</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render based on view mode
  if (viewMode === 'results') {
    return (
      <>
        {/* Data Source Indicator (for development) */}
        {process.env.NODE_ENV === 'development' && apiSource && (
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-center">
            <span className="text-sm text-blue-700">
              Data source: <strong>{apiSource}</strong>
              {apiSource === 'static' && ' (database not available)'}
            </span>
          </div>
        )}

        {/* Results View */}
        <div className="min-h-screen bg-gray-50">
          <SearchFilterBar
            initialQuery={currentQuery}
            advocates={advocates}
            onSearch={handleRefinedSearch}
            onNewSearch={handleNewSearch}
            isLoading={isSearching}
            resultCount={searchResults.length}
          />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AdvocateTable
              advocates={searchResults}
              searchQuery={currentQuery}
              isLoading={isSearching}
              onContactAdvocate={handleContactAdvocate}
            />
          </div>
        </div>
      </>
    );
  }

  // Landing view
  return (
    <>
      {/* Data Source Indicator (for development) */}
      {process.env.NODE_ENV === 'development' && apiSource && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-center">
          <span className="text-sm text-blue-700">
            Data source: <strong>{apiSource}</strong>
            {apiSource === 'static' && ' (database not available)'}
          </span>
        </div>
      )}

      {/* Main Landing Page */}
      <LandingPageContainer
        advocates={advocates}
        onSearchResults={handleSearchResults}
        onSearchStart={handleSearchStart}
        onSearchError={handleSearchError}
        className="landing-page"
      />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Solace Health Support</h3>
              <p className="text-gray-300 text-sm">
                Connecting you with qualified healthcare advocates who understand 
                your needs and can guide you through complex medical and insurance processes.
              </p>
            </div>
            
            <div>
              <h4 className="text-md font-semibold mb-4">Our Services</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>Insurance Claims Assistance</li>
                <li>Medical Billing Support</li>
                <li>Disability Advocacy</li>
                <li>Medicare Navigation</li>
                <li>Healthcare Coordination</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-semibold mb-4">Get Started</h4>
              <p className="text-gray-300 text-sm mb-4">
                Ready to find your advocate? Start by describing your situation above.
              </p>
              <div className="text-sm text-gray-400">
                Available 24/7 • {advocates.length}+ Qualified Advocates
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Solace Health Support. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}