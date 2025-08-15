'use client';

import { useState, useRef, useEffect } from 'react';

export interface HeroSectionProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function HeroSection({ 
  onSearch, 
  isLoading = false, 
  placeholder = "Describe your situation..." 
}: HeroSectionProps) {
  const [query, setQuery] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const MAX_CHARACTERS = 500;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    if (value.length <= MAX_CHARACTERS) {
      setQuery(value);
      setCharacterCount(value.length);
      setHasError(false);
    } else {
      setHasError(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setHasError(true);
      textareaRef.current?.focus();
      return;
    }

    if (trimmedQuery.length > MAX_CHARACTERS) {
      setHasError(true);
      return;
    }

    setHasError(false);
    onSearch(trimmedQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const isNearLimit = characterCount >= MAX_CHARACTERS * 0.8;
  const isAtLimit = characterCount >= MAX_CHARACTERS;

  return (
    <section 
      className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4 sm:px-6 lg:px-8"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto max-w-4xl text-center">
        {/* Main Heading */}
        <h1 
          id="hero-heading"
          className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
        >
          Find Your Healthcare Advocate
        </h1>
        
        {/* Subheading */}
        <h2 className="mt-6 text-xl font-medium text-gray-600 sm:text-2xl lg:text-3xl">
          What do you need support with?
        </h2>

        {/* Description */}
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          Describe your situation in your own words. We'll help you find the right healthcare advocate 
          to guide you through insurance claims, medical billing, disability support, and more.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mt-10">
          <div className="relative max-w-2xl mx-auto">
            {/* Main Input Container */}
            <div 
              className={`
                relative bg-white rounded-lg shadow-sm border-2 transition-all duration-200
                ${isFocused ? 'border-blue-500 shadow-lg' : 'border-gray-300'}
                ${hasError ? 'border-red-500' : ''}
                ${isLoading ? 'opacity-75' : ''}
              `}
            >
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                disabled={isLoading}
                rows={3}
                className={`
                  w-full px-4 py-3 text-lg resize-none border-0 rounded-lg
                  placeholder-gray-400 focus:outline-none focus:ring-0
                  disabled:bg-white disabled:cursor-not-allowed
                  min-h-[80px] max-h-[200px]
                `}
                aria-label="Describe your healthcare advocacy needs"
                aria-describedby="character-count search-help"
                aria-invalid={hasError}
              />

              {/* Character Counter */}
              <div 
                id="character-count"
                className={`
                  absolute bottom-3 right-3 text-sm
                  ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-400'}
                `}
                aria-live="polite"
              >
                {characterCount}/{MAX_CHARACTERS}
              </div>
            </div>

            {/* Error Message */}
            {hasError && (
              <div 
                className="mt-2 text-sm text-red-600 text-left"
                role="alert"
                aria-live="polite"
              >
                {query.trim() === '' 
                  ? 'Please describe what you need help with'
                  : `Message is too long. Please keep it under ${MAX_CHARACTERS} characters.`
                }
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading || !query.trim() || hasError}
                className={`
                  w-full sm:w-auto px-8 py-3 text-lg font-semibold rounded-lg
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${isLoading || !query.trim() || hasError
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }
                `}
                aria-describedby="search-help"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg 
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" 
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
                    Finding advocates...
                  </span>
                ) : (
                  'Find My Advocate'
                )}
              </button>
            </div>

            {/* Help Text */}
            <p 
              id="search-help"
              className="mt-3 text-sm text-gray-500 text-center"
            >
              Press <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 border border-gray-300 rounded">
                {navigator.platform?.includes('Mac') ? 'Cmd' : 'Ctrl'}
              </kbd> + <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 border border-gray-300 rounded">
                Enter
              </kbd> to search quickly
            </p>
          </div>
        </form>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-8">
          <div className="bg-white bg-opacity-60 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold text-blue-600">500+</div>
            <div className="text-sm text-gray-600">Qualified Advocates</div>
          </div>
          <div className="bg-white bg-opacity-60 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold text-blue-600">15+</div>
            <div className="text-sm text-gray-600">Areas of Expertise</div>
          </div>
          <div className="bg-white bg-opacity-60 rounded-lg p-4 backdrop-blur-sm col-span-2 sm:col-span-1">
            <div className="text-2xl font-bold text-blue-600">24/7</div>
            <div className="text-sm text-gray-600">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  );
}