'use client';

import { useState } from 'react';

export interface ExamplePromptsProps {
  onPromptSelect: (prompt: string) => void;
  disabled?: boolean;
}

interface PromptCategory {
  id: string;
  title: string;
  icon: string;
  prompts: string[];
  color: string;
  bgColor: string;
}

const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: 'insurance',
    title: 'Insurance & Claims',
    icon: '🛡️',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    prompts: [
      'Help with denied insurance claim',
      'Understanding my insurance benefits',
      'Appeal process for medical coverage',
      'Prior authorization issues',
      'Out-of-network billing disputes'
    ]
  },
  {
    id: 'mental-health',
    title: 'Mental Health',
    icon: '🧠',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    prompts: [
      'Finding mental health support',
      'Therapy coverage questions',
      'Crisis intervention resources',
      'Teen counseling services',
      'Support for anxiety and depression'
    ]
  },
  {
    id: 'disability',
    title: 'Disability Support',
    icon: '♿',
    color: 'text-green-700',
    bgColor: 'bg-green-50 hover:bg-green-100',
    prompts: [
      'Disability benefits application',
      'Accommodations at work',
      'Social Security disability',
      'Assistive technology needs',
      'Long-term disability claims'
    ]
  },
  {
    id: 'medical',
    title: 'Medical Care',
    icon: '🏥',
    color: 'text-red-700',
    bgColor: 'bg-red-50 hover:bg-red-100',
    prompts: [
      'Finding specialist care',
      'Medical billing errors',
      'Second opinion support',
      'Prescription medication access',
      'Hospital discharge planning'
    ]
  },
  {
    id: 'elderly',
    title: 'Senior Care',
    icon: '👴',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    prompts: [
      'Medicare navigation help',
      'Long-term care options',
      'Elder care coordination',
      'Medicare supplement plans',
      'Home health services'
    ]
  },
  {
    id: 'pediatric',
    title: 'Child Healthcare',
    icon: '👶',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50 hover:bg-pink-100',
    prompts: [
      'Pediatric specialist referrals',
      'Special needs advocacy',
      'School health services',
      'Childhood development support',
      'Pediatric therapy services'
    ]
  }
];

export default function ExamplePrompts({ onPromptSelect, disabled = false }: ExamplePromptsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredPrompt, setHoveredPrompt] = useState<string | null>(null);

  const handlePromptClick = (prompt: string) => {
    if (disabled) return;
    onPromptSelect(prompt);
  };

  const handleCategoryClick = (categoryId: string) => {
    if (disabled) return;
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  return (
    <section 
      className="py-12 px-4 sm:px-6 lg:px-8 bg-white"
      aria-labelledby="prompts-heading"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h3 
            id="prompts-heading"
            className="text-2xl font-bold text-gray-900 sm:text-3xl"
          >
            Or choose from common scenarios
          </h3>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Select a category below to see example situations. Click any prompt to get started immediately.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {PROMPT_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              disabled={disabled}
              className={`
                p-6 rounded-lg border-2 text-left transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${selectedCategory === category.id 
                  ? `border-blue-500 ${category.bgColor}` 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              aria-expanded={selectedCategory === category.id}
              aria-controls={`prompts-${category.id}`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl" role="img" aria-hidden="true">
                  {category.icon}
                </span>
                <div>
                  <h4 className={`font-semibold ${category.color}`}>
                    {category.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {category.prompts.length} examples
                  </p>
                </div>
              </div>
              
              {/* Expand/Collapse Indicator */}
              <div className="mt-4 flex justify-end">
                <svg 
                  className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                    selectedCategory === category.id ? 'rotate-180' : ''
                  }`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Expanded Prompts */}
        {selectedCategory && (
          <div 
            id={`prompts-${selectedCategory}`}
            className="bg-gray-50 rounded-lg p-6 border border-gray-200"
            role="region"
            aria-labelledby={`prompts-${selectedCategory}-title`}
          >
            {(() => {
              const category = PROMPT_CATEGORIES.find(c => c.id === selectedCategory);
              if (!category) return null;
              
              return (
                <>
                  <h4 
                    id={`prompts-${selectedCategory}-title`}
                    className={`text-lg font-semibold ${category.color} mb-4 flex items-center`}
                  >
                    <span className="mr-2" role="img" aria-hidden="true">
                      {category.icon}
                    </span>
                    {category.title} Examples
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {category.prompts.map((prompt, index) => (
                      <button
                        key={`${category.id}-${index}`}
                        onClick={() => handlePromptClick(prompt)}
                        onMouseEnter={() => setHoveredPrompt(prompt)}
                        onMouseLeave={() => setHoveredPrompt(null)}
                        disabled={disabled}
                        className={`
                          p-4 text-left rounded-md border transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                          ${hoveredPrompt === prompt
                            ? 'border-blue-300 bg-blue-50 shadow-md transform scale-[1.02]'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                          }
                          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        aria-label={`Use prompt: ${prompt}`}
                      >
                        <div className="flex items-start space-x-3">
                          <svg 
                            className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                            />
                          </svg>
                          <span className="text-gray-700 font-medium">
                            {prompt}
                          </span>
                        </div>
                        
                        {/* Hover Arrow */}
                        {hoveredPrompt === prompt && (
                          <div className="mt-2 flex justify-end">
                            <svg 
                              className="h-4 w-4 text-blue-500" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M13 7l5 5m0 0l-5 5m5-5H6" 
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Quick Action Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            💡 <strong>Tip:</strong> You can also type your own situation in the search box above for personalized results.
          </p>
        </div>
      </div>
    </section>
  );
}