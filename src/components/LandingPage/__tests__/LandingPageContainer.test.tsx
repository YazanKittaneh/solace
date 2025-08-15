import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LandingPageContainer from '../LandingPageContainer';
import { Advocate } from '../../../types/advocate';

// Mock the search enhancer
const mockEnhanceAdvocateSearch = jest.fn();
jest.mock('../../../lib/search-enhancer', () => {
  return {
    SearchEnhancer: jest.fn().mockImplementation(() => ({
      enhanceAdvocateSearch: mockEnhanceAdvocateSearch
    }))
  };
});

// Mock ResizeObserver for textarea auto-resize
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock navigator.platform for keyboard shortcut display
Object.defineProperty(navigator, 'platform', {
  writable: true,
  value: 'MacIntel'
});

const mockAdvocates: Advocate[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    city: 'New York',
    phoneNumber: '555-0101',
    degree: 'MSW',
    yearsOfExperience: 5,
    specialties: ['Mental Health', 'Insurance Claims'],
    createdAt: new Date('2023-01-01')
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    city: 'Los Angeles',
    phoneNumber: '555-0102',
    degree: 'MD',
    yearsOfExperience: 10,
    specialties: ['Medical Care', 'Disability Support'],
    createdAt: new Date('2023-01-02')
  },
  {
    id: '3',
    firstName: 'Bob',
    lastName: 'Johnson',
    city: 'Chicago',
    phoneNumber: '555-0103',
    degree: 'PhD',
    yearsOfExperience: 15,
    specialties: ['Senior Care', 'Medicare Navigation'],
    createdAt: new Date('2023-01-03')
  }
];

describe('LandingPageContainer', () => {
  const mockOnSearchResults = jest.fn();
  const mockOnSearchStart = jest.fn();
  const mockOnSearchError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
    
    // Set up default mock behavior
    mockEnhanceAdvocateSearch.mockImplementation((advocates, query) => {
      return advocates.filter(advocate => 
        advocate.firstName.toLowerCase().includes(query.toLowerCase()) ||
        advocate.lastName.toLowerCase().includes(query.toLowerCase()) ||
        advocate.specialties.some(specialty => 
          specialty.toLowerCase().includes(query.toLowerCase())
        )
      );
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('should render hero section and example prompts', () => {
      render(
        <LandingPageContainer 
          advocates={mockAdvocates}
          onSearchResults={mockOnSearchResults}
        />
      );
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Find Your Healthcare Advocate');
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Or choose from common scenarios');
    });

    it('should render search statistics', () => {
      render(
        <LandingPageContainer 
          advocates={mockAdvocates}
          onSearchResults={mockOnSearchResults}
        />
      );
      
      expect(screen.getByText('3')).toBeInTheDocument(); // Total advocates
      expect(screen.getByText('Total Advocates')).toBeInTheDocument();
      expect(screen.getByText('Search Results')).toBeInTheDocument();
      expect(screen.getByText('Searches Performed')).toBeInTheDocument();
    });

    it('should apply custom className when provided', () => {
      const { container } = render(
        <LandingPageContainer 
          advocates={mockAdvocates}
          className="custom-class"
        />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should not show search statistics when no advocates provided', () => {
      render(
        <LandingPageContainer 
          advocates={[]}
          onSearchResults={mockOnSearchResults}
        />
      );
      
      expect(screen.queryByText('Total Advocates')).not.toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('should perform search when text is entered in hero section', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <LandingPageContainer 
          advocates={mockAdvocates}
          onSearchResults={mockOnSearchResults}
          onSearchStart={mockOnSearchStart}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /find my advocate/i });
      
      await user.type(textarea, 'mental health');
      await user.click(submitButton);
      
      // Fast-forward through the simulated delay
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(mockOnSearchStart).toHaveBeenCalledWith('mental health');
        expect(mockOnSearchResults).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ firstName: 'John' })]),
          'mental health'
        );
      });
    });

    it('should show loading state during search', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <LandingPageContainer 
          advocates={mockAdvocates}
          onSearchResults={mockOnSearchResults}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /find my advocate/i });
      
      await user.type(textarea, 'test search');
      await user.click(submitButton);
      
      expect(screen.getByText('Searching for advocates that match your needs...')).toBeInTheDocument();
      expect(screen.getByText('Query: "test search"')).toBeInTheDocument();
      
      // Complete the search
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Searching for advocates that match your needs...')).not.toBeInTheDocument();
      });
    });

    it('should show search results summary when results found', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <LandingPageContainer 
          advocates={mockAdvocates}
          onSearchResults={mockOnSearchResults}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /find my advocate/i });
      
      await user.type(textarea, 'John');
      await user.click(submitButton);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Search Complete')).toBeInTheDocument();
        // Just check that some success message appears, regardless of exact text
        expect(screen.getByText(/Found \d+ advocate/)).toBeInTheDocument();
      });
    });

    it('should show no results message when no advocates match', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <LandingPageContainer 
          advocates={mockAdvocates}
          onSearchResults={mockOnSearchResults}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /find my advocate/i });
      
      await user.type(textarea, 'nonexistent');
      await user.click(submitButton);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('No Results Found')).toBeInTheDocument();
        expect(screen.getByText(/We couldn't find any advocates matching "nonexistent"/)).toBeInTheDocument();
      });
    });

    it('should not perform duplicate searches', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <LandingPageContainer 
          advocates={mockAdvocates}
          onSearchResults={mockOnSearchResults}
          onSearchStart={mockOnSearchStart}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /find my advocate/i });
      
      // First search
      await user.type(textarea, 'test');
      await user.click(submitButton);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(mockOnSearchStart).toHaveBeenCalledTimes(1);
      });
      
      // Attempt duplicate search
      await user.click(submitButton);
      
      // Should not trigger another search
      expect(mockOnSearchStart).toHaveBeenCalledTimes(1);
    });

    it('should handle empty search query', async () => {
      const user = userEvent.setup();
      render(
        <LandingPageContainer 
          advocates={mockAdvocates}
          onSearchResults={mockOnSearchResults}
        />
      );
      
      const form = screen.getByRole('textbox').closest('form')!;
      fireEvent.submit(form);
      
      expect(screen.getByText('Please describe what you need help with')).toBeInTheDocument();
    });
  });

  describe('prompt selection', () => {
    it('should perform search when prompt is selected', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <LandingPageContainer 
          advocates={mockAdvocates}
          onSearchResults={mockOnSearchResults}
          onSearchStart={mockOnSearchStart}
        />
      );
      
      // Open insurance category
      const insuranceCategory = screen.getByText('Insurance & Claims').closest('button')!;
      await user.click(insuranceCategory);
      
      // Click on a prompt
      const prompt = screen.getByText('Help with denied insurance claim');
      await user.click(prompt);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(mockOnSearchStart).toHaveBeenCalledWith('Help with denied insurance claim');
      });
    });

    it('should disable prompts during search', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <LandingPageContainer 
          advocates={mockAdvocates}
          onSearchResults={mockOnSearchResults}
        />
      );
      
      // Start a search to trigger loading state
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /find my advocate/i });
      
      await user.type(textarea, 'test');
      await user.click(submitButton);
      
      // Check that category buttons are disabled during loading
      await waitFor(() => {
        const categoryButtons = screen.getAllByRole('button').filter(btn => 
          btn.getAttribute('aria-expanded') !== null
        );
        
        categoryButtons.forEach(button => {
          expect(button).toBeDisabled();
        });
      }, { timeout: 1000 });
    });
  });

  describe('error handling', () => {
    it('should show error message when search fails', async () => {
      // Mock search enhancer to throw error
      mockEnhanceAdvocateSearch.mockImplementation(() => {
        throw new Error('Search service unavailable');
      });
      
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <LandingPageContainer 
          advocates={mockAdvocates}
          onSearchError={mockOnSearchError}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /find my advocate/i });
      
      await user.type(textarea, 'test');
      await user.click(submitButton);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Search Error')).toBeInTheDocument();
        expect(screen.getByText('Search service unavailable')).toBeInTheDocument();
        expect(mockOnSearchError).toHaveBeenCalledWith(
          expect.any(Error),
          'test'
        );
      });
    });

    it('should allow retry after error', async () => {
      // Mock search enhancer to throw error first, then succeed
      let shouldThrow = true;
      mockEnhanceAdvocateSearch.mockImplementation((advocates, query) => {
        if (shouldThrow) {
          shouldThrow = false;
          throw new Error('Network error');
        }
        return advocates.filter(a => a.firstName.includes(query));
      });
      
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <LandingPageContainer 
          advocates={mockAdvocates}
          onSearchResults={mockOnSearchResults}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /find my advocate/i });
      
      // Initial search that fails
      await user.type(textarea, 'John');
      await user.click(submitButton);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
      
      // Retry search
      const retryButton = screen.getByText('Retry Search');
      await user.click(retryButton);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(mockOnSearchResults).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ firstName: 'John' })]),
          'John'
        );
      });
    });

    it('should allow dismissing error message', async () => {
      // Mock search enhancer to throw error
      mockEnhanceAdvocateSearch.mockImplementation(() => {
        throw new Error('Test error');
      });
      
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <LandingPageContainer 
          advocates={mockAdvocates}
        />
      );
      
      // Trigger error with valid search that throws
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /find my advocate/i });
      
      await user.type(textarea, 'test');
      await user.click(submitButton);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Search Error')).toBeInTheDocument();
      });
      
      // Dismiss error
      const dismissButton = screen.getByText('Dismiss');
      await user.click(dismissButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Search Error')).not.toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('should have live region for search announcements', () => {
      render(
        <LandingPageContainer 
          advocates={mockAdvocates}
        />
      );
      
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('should announce search progress to screen readers', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <LandingPageContainer 
          advocates={mockAdvocates}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /find my advocate/i });
      
      await user.type(textarea, 'John');
      await user.click(submitButton);
      
      // Check initial loading announcement
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent('Searching for advocates matching: John');
      
      // Complete the search
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Check for completion announcement
      await waitFor(() => {
        expect(liveRegion.textContent).toMatch(/Search complete.*found.*matching advocates/i);
      });
    });

    it('should announce errors to screen readers', async () => {
      // Mock search enhancer to throw error
      mockEnhanceAdvocateSearch.mockImplementation(() => {
        throw new Error('Test error');
      });
      
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <LandingPageContainer 
          advocates={mockAdvocates}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /find my advocate/i });
      
      await user.type(textarea, 'test');
      await user.click(submitButton);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        const liveRegion = screen.getByRole('status');
        expect(liveRegion).toHaveTextContent('Search error: Test error');
      });
    });
  });

  describe('statistics display', () => {
    it('should update search results count after successful search', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <LandingPageContainer 
          advocates={mockAdvocates}
        />
      );
      
      // Initially should show dash for no results
      expect(screen.getByText('—')).toBeInTheDocument();
      
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /find my advocate/i });
      
      await user.type(textarea, 'John');
      await user.click(submitButton);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument(); // Results count
      });
    });

    it('should update searches performed count', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <LandingPageContainer 
          advocates={mockAdvocates}
        />
      );
      
      // Initially should show 0 searches
      const searchCountElements = screen.getAllByText('0');
      expect(searchCountElements.length).toBeGreaterThanOrEqual(1);
      
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /find my advocate/i });
      
      await user.type(textarea, 'test');
      await user.click(submitButton);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument(); // Searches performed
      });
    });
  });

  describe('integration', () => {
    it('should properly integrate hero section and example prompts', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <LandingPageContainer 
          advocates={mockAdvocates}
          onSearchResults={mockOnSearchResults}
        />
      );
      
      // Search via hero section
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'mental health');
      await user.keyboard('{Control>}{Enter}{/Control}');
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(mockOnSearchResults).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ firstName: 'John' })]),
          'mental health'
        );
      });
      
      // Search via example prompt
      const insuranceCategory = screen.getByText('Insurance & Claims').closest('button')!;
      await user.click(insuranceCategory);
      
      const prompt = screen.getByText('Help with denied insurance claim');
      await user.click(prompt);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(mockOnSearchResults).toHaveBeenCalledWith(
          expect.any(Array),
          'Help with denied insurance claim'
        );
      });
    });
  });
});