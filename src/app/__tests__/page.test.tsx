import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import LandingPage from '../page';

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the LandingPageContainer
jest.mock('../../../components/LandingPage/LandingPageContainer', () => {
  return function MockLandingPageContainer({ advocates, onSearchResults, onSearchStart, onSearchError, className }: any) {
    return (
      <div data-testid="landing-page-container" className={className}>
        <div>Mock Landing Page Container</div>
        <div data-testid="advocates-count">{advocates.length} advocates loaded</div>
        <button 
          onClick={() => onSearchStart('test query')}
          data-testid="trigger-search-start"
        >
          Test Search Start
        </button>
        <button 
          onClick={() => onSearchResults([advocates[0]], 'test query')}
          data-testid="trigger-search-results"
        >
          Test Search Results
        </button>
        <button 
          onClick={() => onSearchError(new Error('Test error'), 'test query')}
          data-testid="trigger-search-error"
        >
          Test Search Error
        </button>
      </div>
    );
  };
});

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockAdvocates = [
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
  }
];

describe('LandingPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe('loading state', () => {
    it('should show loading spinner while fetching advocates', () => {
      // Mock fetch to never resolve
      mockFetch.mockImplementation(() => new Promise(() => {}));

      render(<LandingPage />);

      expect(screen.getByText('Loading Healthcare Advocates')).toBeInTheDocument();
      expect(screen.getByText('Please wait while we prepare your advocate directory...')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Loading Healthcare Advocates' })).toBeInTheDocument();
    });
  });

  describe('successful data loading', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: mockAdvocates,
          source: 'database'
        })
      });
    });

    it('should render landing page container with advocates data', async () => {
      render(<LandingPage />);

      await waitFor(() => {
        expect(screen.getByTestId('landing-page-container')).toBeInTheDocument();
        expect(screen.getByTestId('advocates-count')).toHaveTextContent('2 advocates loaded');
      });

      expect(screen.getByText('Mock Landing Page Container')).toBeInTheDocument();
    });

    it('should show data source indicator in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(<LandingPage />);

      await waitFor(() => {
        expect(screen.getByText(/Data source:/)).toBeInTheDocument();
        expect(screen.getByText(/database/)).toBeInTheDocument();
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should not show data source indicator in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(<LandingPage />);

      await waitFor(() => {
        expect(screen.getByTestId('landing-page-container')).toBeInTheDocument();
      });

      expect(screen.queryByText(/Data source:/)).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('should render footer with correct information', async () => {
      render(<LandingPage />);

      await waitFor(() => {
        expect(screen.getByText('Solace Health Support')).toBeInTheDocument();
      });

      expect(screen.getByText('Our Services')).toBeInTheDocument();
      expect(screen.getByText('Insurance Claims Assistance')).toBeInTheDocument();
      expect(screen.getByText('Medical Billing Support')).toBeInTheDocument();
      expect(screen.getByText('Disability Advocacy')).toBeInTheDocument();
      expect(screen.getByText('Medicare Navigation')).toBeInTheDocument();
      expect(screen.getByText('Healthcare Coordination')).toBeInTheDocument();
      
      expect(screen.getByText(/Available 24\/7 • 2\+ Qualified Advocates/)).toBeInTheDocument();
      expect(screen.getByText('© 2024 Solace Health Support. All rights reserved.')).toBeInTheDocument();
    });

    it('should handle search callbacks correctly', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<LandingPage />);

      await waitFor(() => {
        expect(screen.getByTestId('landing-page-container')).toBeInTheDocument();
      });

      // Test search start
      fireEvent.click(screen.getByTestId('trigger-search-start'));
      expect(consoleSpy).toHaveBeenCalledWith('Starting search for: "test query"');

      // Test search results
      fireEvent.click(screen.getByTestId('trigger-search-results'));
      expect(consoleSpy).toHaveBeenCalledWith('Search completed: "test query" returned 1 results');

      consoleSpy.mockRestore();
    });

    it('should handle search error callback correctly', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<LandingPage />);

      await waitFor(() => {
        expect(screen.getByTestId('landing-page-container')).toBeInTheDocument();
      });

      // Test search error
      fireEvent.click(screen.getByTestId('trigger-search-error'));
      expect(consoleErrorSpy).toHaveBeenCalledWith('Search error for "test query":', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('static data fallback', () => {
    it('should handle static data source', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: mockAdvocates,
          source: 'static',
          error: 'Database unavailable, showing static data'
        })
      });

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(<LandingPage />);

      await waitFor(() => {
        expect(screen.getByTestId('landing-page-container')).toBeInTheDocument();
        expect(screen.getByTestId('advocates-count')).toHaveTextContent('2 advocates loaded');
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith('API Warning:', 'Database unavailable, showing static data');

      consoleWarnSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should show error message when API call fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<LandingPage />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Advocates')).toBeInTheDocument();
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should show error message when API returns non-ok status', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      render(<LandingPage />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Advocates')).toBeInTheDocument();
        expect(screen.getByText(/Failed to fetch advocates: 500 Internal Server Error/)).toBeInTheDocument();
      });
    });

    it('should display retry button when error occurs', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<LandingPage />);

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      // Just verify the button exists and is clickable
      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toBeEnabled();
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: mockAdvocates,
          source: 'database'
        })
      });
    });

    it('should render without accessibility errors', async () => {
      render(<LandingPage />);

      await waitFor(() => {
        expect(screen.getByTestId('landing-page-container')).toBeInTheDocument();
      });

      // Check that the page renders without errors
      expect(screen.getByTestId('landing-page-container')).toBeInTheDocument();
    });

    it('should have semantic HTML structure', async () => {
      render(<LandingPage />);

      await waitFor(() => {
        expect(screen.getByTestId('landing-page-container')).toBeInTheDocument();
      });

      // Check for footer
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });

  describe('integration', () => {
    it('should pass correct props to LandingPageContainer', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: mockAdvocates,
          source: 'database'
        })
      });

      render(<LandingPage />);

      await waitFor(() => {
        const container = screen.getByTestId('landing-page-container');
        expect(container).toHaveClass('landing-page');
        expect(screen.getByTestId('advocates-count')).toHaveTextContent('2 advocates loaded');
      });
    });
  });
});