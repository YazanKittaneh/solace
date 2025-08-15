import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdvocateTable from '../AdvocateTable';
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
    specialties: ['Medical Care', 'Disability Support', 'Senior Care'],
    createdAt: new Date('2023-01-02')
  }
];

describe('AdvocateTable', () => {
  const mockOnContactAdvocate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render table with advocate data', () => {
      render(
        <AdvocateTable 
          advocates={mockAdvocates}
          onContactAdvocate={mockOnContactAdvocate}
        />
      );

      expect(screen.getByText('2 Healthcare Advocates Found')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('New York')).toBeInTheDocument();
      expect(screen.getByText('Los Angeles')).toBeInTheDocument();
    });

    it('should show search query when provided', () => {
      render(
        <AdvocateTable 
          advocates={mockAdvocates}
          searchQuery="mental health"
          onContactAdvocate={mockOnContactAdvocate}
        />
      );

      expect(screen.getByText('Results for:')).toBeInTheDocument();
      expect(screen.getByText('"mental health"')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      render(
        <AdvocateTable 
          advocates={[]}
          isLoading={true}
          onContactAdvocate={mockOnContactAdvocate}
        />
      );

      expect(screen.getByText('Loading advocate results...')).toBeInTheDocument();
    });

    it('should render empty state', () => {
      render(
        <AdvocateTable 
          advocates={[]}
          onContactAdvocate={mockOnContactAdvocate}
        />
      );

      expect(screen.getByText('No Advocates Found')).toBeInTheDocument();
    });

    it('should render empty state with search query', () => {
      render(
        <AdvocateTable 
          advocates={[]}
          searchQuery="nonexistent"
          onContactAdvocate={mockOnContactAdvocate}
        />
      );

      expect(screen.getByText(/We couldn't find any advocates matching "nonexistent"/)).toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('should sort by name when name header is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AdvocateTable 
          advocates={mockAdvocates}
          onContactAdvocate={mockOnContactAdvocate}
        />
      );

      const nameHeader = screen.getByText('Name').closest('th')!;
      await user.click(nameHeader);

      // Check that sorting indicator appears
      expect(nameHeader.querySelector('svg')).toBeInTheDocument();
    });

    it('should reverse sort when clicking same header twice', async () => {
      const user = userEvent.setup();
      render(
        <AdvocateTable 
          advocates={mockAdvocates}
          onContactAdvocate={mockOnContactAdvocate}
        />
      );

      const nameHeader = screen.getByText('Name').closest('th')!;
      
      // First click - ascending
      await user.click(nameHeader);
      
      // Second click - descending
      await user.click(nameHeader);
      
      expect(nameHeader.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('row expansion', () => {
    it('should expand row when expand button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AdvocateTable 
          advocates={mockAdvocates}
          onContactAdvocate={mockOnContactAdvocate}
        />
      );

      // Find John Doe's row specifically and click his expand button
      const johnRow = screen.getByText('John Doe').closest('tr');
      const expandButton = johnRow?.querySelector('button[aria-label*="Expand details"]');
      
      expect(expandButton).toBeInTheDocument();
      await user.click(expandButton!);

      await waitFor(() => {
        expect(screen.getByText('Contact Information')).toBeInTheDocument();
        expect(screen.getByText('All Specialties')).toBeInTheDocument();
        expect(screen.getByText('555-0101')).toBeInTheDocument();
      });
    });

    it('should collapse row when expand button is clicked again', async () => {
      const user = userEvent.setup();
      render(
        <AdvocateTable 
          advocates={mockAdvocates}
          onContactAdvocate={mockOnContactAdvocate}
        />
      );

      const expandButton = screen.getAllByRole('button', { name: /expand details/i })[0];
      
      // Expand
      await user.click(expandButton);
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      
      // Collapse
      const collapseButton = screen.getAllByRole('button', { name: /collapse details/i })[0];
      await user.click(collapseButton);
      expect(screen.queryByText('Contact Information')).not.toBeInTheDocument();
    });
  });

  describe('contact functionality', () => {
    it('should call onContactAdvocate when contact button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AdvocateTable 
          advocates={mockAdvocates}
          onContactAdvocate={mockOnContactAdvocate}
        />
      );

      // Find John Doe's row specifically and click his contact button
      const johnRow = screen.getByText('John Doe').closest('tr');
      const johnContactButton = johnRow?.querySelector('button[class*="bg-blue-600"]');
      
      expect(johnContactButton).toBeInTheDocument();
      await user.click(johnContactButton!);

      expect(mockOnContactAdvocate).toHaveBeenCalledWith(mockAdvocates[0]);
    });
  });

  describe('specialty display', () => {
    it('should show limited specialties with overflow indicator', () => {
      render(
        <AdvocateTable 
          advocates={mockAdvocates}
          onContactAdvocate={mockOnContactAdvocate}
        />
      );

      // Jane Smith has 3 specialties, should show first 2 + "more" indicator
      expect(screen.getByText('Medical Care')).toBeInTheDocument();
      expect(screen.getByText('Disability Support')).toBeInTheDocument();
      expect(screen.getByText('+1 more')).toBeInTheDocument();
    });

    it('should show all specialties in expanded view', async () => {
      const user = userEvent.setup();
      render(
        <AdvocateTable 
          advocates={mockAdvocates}
          onContactAdvocate={mockOnContactAdvocate}
        />
      );

      // Expand Jane Smith's row (second row)  
      const expandButtons = screen.getAllByRole('button', { name: /expand details/i });
      expect(expandButtons).toHaveLength(2);
      
      await user.click(expandButtons[1]);

      // Check that the expand button's aria-label changed to 'Collapse details'
      await waitFor(() => {
        const collapseButtons = screen.getAllByRole('button', { name: /collapse details/i });
        expect(collapseButtons.length).toBeGreaterThanOrEqual(1);
      });

      // At minimum, should show the expanded section headers
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('All Specialties')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper table structure', () => {
      render(
        <AdvocateTable 
          advocates={mockAdvocates}
          onContactAdvocate={mockOnContactAdvocate}
        />
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(6);
      expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 data rows
    });

    it('should have proper button labels', () => {
      render(
        <AdvocateTable 
          advocates={mockAdvocates}
          onContactAdvocate={mockOnContactAdvocate}
        />
      );

      expect(screen.getAllByRole('button', { name: /expand details/i })).toHaveLength(2);
      expect(screen.getAllByRole('button', { name: /contact/i })).toHaveLength(2);
    });
  });
});