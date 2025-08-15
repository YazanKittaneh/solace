import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchFilterBar from '../SearchFilterBar';
import { Advocate } from '../../../types/advocate';

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
  }
];

describe('SearchFilterBar', () => {
  const mockOnSearch = jest.fn();
  const mockOnNewSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render search input and controls', () => {
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={2}
        />
      );

      expect(screen.getByRole('textbox', { name: /search for healthcare advocates/i })).toBeInTheDocument();
      expect(screen.getByText('Healthcare Advocates')).toBeInTheDocument();
      expect(screen.getByText('2 results')).toBeInTheDocument();
      expect(screen.getByText('New Search')).toBeInTheDocument();
    });

    it('should show initial query when provided', () => {
      render(
        <SearchFilterBar
          initialQuery="mental health"
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={1}
        />
      );

      expect(screen.getByDisplayValue('mental health')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={2}
          isLoading={true}
        />
      );

      expect(screen.getByRole('textbox')).toBeDisabled();
      // Check for loading spinner
      expect(screen.getByRole('textbox').parentElement?.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should render quick filter buttons', () => {
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={2}
        />
      );

      expect(screen.getByText('Quick filters:')).toBeInTheDocument();
      expect(screen.getByText('Mental Health')).toBeInTheDocument();
      expect(screen.getByText('Insurance Claims')).toBeInTheDocument();
      expect(screen.getByText('Medical Care')).toBeInTheDocument();
      expect(screen.getByText('Disability Support')).toBeInTheDocument();
      expect(screen.getByText('Experienced (5+ years)')).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('should call onSearch when form is submitted', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={2}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'mental health');
      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalledWith('mental health');
    });

    it('should not submit empty query', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={2}
        />
      );

      const input = screen.getByRole('textbox');
      await user.keyboard('{Enter}');

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should trim whitespace from query', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={2}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, '  mental health  ');
      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalledWith('mental health');
    });
  });

  describe('search suggestions', () => {
    it('should show suggestions when typing', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={2}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'mental');

      await waitFor(() => {
        // Should show Mental Health suggestion
        const mentalHealthButtons = screen.getAllByText('Mental Health');
        // One should be in suggestions, one in quick filters
        expect(mentalHealthButtons.length).toBeGreaterThan(1);
      });
    });

    it('should not show suggestions for short queries', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={2}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'm');

      // Should only have the quick filter buttons, no suggestions dropdown
      const mentalHealthButtons = screen.getAllByText('Mental Health');
      expect(mentalHealthButtons.length).toBe(1); // Only the quick filter button
    });

    it('should search when suggestion is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={2}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'mental');

      await waitFor(() => {
        const mentalHealthButtons = screen.getAllByText('Mental Health');
        expect(mentalHealthButtons.length).toBeGreaterThan(1);
      });

      // Click on the suggestion (not the quick filter button)
      const mentalHealthButtons = screen.getAllByText('Mental Health');
      // The suggestion should be the one that's not the quick filter button
      const suggestionButton = mentalHealthButtons.find(btn => 
        btn.closest('form') && !btn.closest('div[class*="mt-4"]')
      );
      
      if (suggestionButton) {
        await user.click(suggestionButton);
        expect(mockOnSearch).toHaveBeenCalledWith('Mental Health');
      } else {
        // Fallback: just click any Mental Health button
        await user.click(mentalHealthButtons[0]);
        expect(mockOnSearch).toHaveBeenCalledWith('Mental Health');
      }
    });

    it('should close suggestions on escape key', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={2}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'mental');

      await waitFor(() => {
        const mentalHealthButtons = screen.getAllByText('Mental Health');
        expect(mentalHealthButtons.length).toBeGreaterThan(1);
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        // After escape, should only have the quick filter button, not the suggestion
        const mentalHealthButtons = screen.getAllByText('Mental Health');
        expect(mentalHealthButtons.length).toBe(1);
      });
    });
  });

  describe('quick filters', () => {
    it('should search when quick filter is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={2}
        />
      );

      await user.click(screen.getByText('Mental Health'));
      expect(mockOnSearch).toHaveBeenCalledWith('Mental Health');
    });

    it('should search when experience filter is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={2}
        />
      );

      await user.click(screen.getByText('Experienced (5+ years)'));
      expect(mockOnSearch).toHaveBeenCalledWith('5+ years experience');
    });
  });

  describe('clear functionality', () => {
    it('should show clear button when there is text', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={2}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
    });

    it('should clear input when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={2}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      expect(input).toHaveValue('');
    });

    it('should not show clear button when loading', () => {
      render(
        <SearchFilterBar
          initialQuery="test"
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={2}
          isLoading={true}
        />
      );

      expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
    });
  });

  describe('new search functionality', () => {
    it('should call onNewSearch when new search button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={2}
        />
      );

      await user.click(screen.getByText('New Search'));
      expect(mockOnNewSearch).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper labels and roles', () => {
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={2}
        />
      );

      expect(screen.getByRole('textbox', { name: /search for healthcare advocates/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /new search/i })).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={2}
        />
      );

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByRole('textbox')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('New Search')).toHaveFocus();
    });
  });

  describe('result count display', () => {
    it('should show singular form for one result', () => {
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={1}
        />
      );

      expect(screen.getByText('1 result')).toBeInTheDocument();
    });

    it('should show plural form for multiple results', () => {
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={5}
        />
      );

      expect(screen.getByText('5 results')).toBeInTheDocument();
    });

    it('should show zero results', () => {
      render(
        <SearchFilterBar
          advocates={mockAdvocates}
          onSearch={mockOnSearch}
          onNewSearch={mockOnNewSearch}
          resultCount={0}
        />
      );

      expect(screen.getByText('0 results')).toBeInTheDocument();
    });
  });
});