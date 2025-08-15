import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExamplePrompts from '../ExamplePrompts';

describe('ExamplePrompts', () => {
  const mockOnPromptSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render section heading and description', () => {
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Or choose from common scenarios');
      expect(screen.getByText(/Select a category below to see example situations/)).toBeInTheDocument();
    });

    it('should render all prompt categories', () => {
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      expect(screen.getByText('Insurance & Claims')).toBeInTheDocument();
      expect(screen.getByText('Mental Health')).toBeInTheDocument();
      expect(screen.getByText('Disability Support')).toBeInTheDocument();
      expect(screen.getByText('Medical Care')).toBeInTheDocument();
      expect(screen.getByText('Senior Care')).toBeInTheDocument();
      expect(screen.getByText('Child Healthcare')).toBeInTheDocument();
    });

    it('should show category icons and prompt counts', () => {
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      expect(screen.getByText('🛡️')).toBeInTheDocument();
      expect(screen.getByText('🧠')).toBeInTheDocument();
      expect(screen.getByText('♿')).toBeInTheDocument();
      expect(screen.getByText('🏥')).toBeInTheDocument();
      expect(screen.getByText('👴')).toBeInTheDocument();
      expect(screen.getByText('👶')).toBeInTheDocument();
      
      // Check that prompt counts are displayed
      const promptCounts = screen.getAllByText(/\d+ examples/);
      expect(promptCounts).toHaveLength(6);
    });

    it('should not show expanded prompts initially', () => {
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      expect(screen.queryByText('Help with denied insurance claim')).not.toBeInTheDocument();
      expect(screen.queryByText('Finding mental health support')).not.toBeInTheDocument();
    });

    it('should render tip at the bottom', () => {
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      expect(screen.getByText(/💡/)).toBeInTheDocument();
      expect(screen.getByText(/You can also type your own situation/)).toBeInTheDocument();
    });
  });

  describe('category interactions', () => {
    it('should expand category when clicked', async () => {
      const user = userEvent.setup();
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      const insuranceCategory = screen.getByText('Insurance & Claims').closest('button')!;
      await user.click(insuranceCategory);
      
      expect(screen.getByText('Help with denied insurance claim')).toBeInTheDocument();
      expect(screen.getByText('Understanding my insurance benefits')).toBeInTheDocument();
      expect(screen.getByText('Appeal process for medical coverage')).toBeInTheDocument();
      expect(screen.getByText('Prior authorization issues')).toBeInTheDocument();
      expect(screen.getByText('Out-of-network billing disputes')).toBeInTheDocument();
    });

    it('should collapse category when clicked twice', async () => {
      const user = userEvent.setup();
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      const insuranceCategory = screen.getByText('Insurance & Claims').closest('button')!;
      
      // Expand
      await user.click(insuranceCategory);
      expect(screen.getByText('Help with denied insurance claim')).toBeInTheDocument();
      
      // Collapse
      await user.click(insuranceCategory);
      expect(screen.queryByText('Help with denied insurance claim')).not.toBeInTheDocument();
    });

    it('should switch categories when different category is clicked', async () => {
      const user = userEvent.setup();
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      // Open insurance category
      const insuranceCategory = screen.getByText('Insurance & Claims').closest('button')!;
      await user.click(insuranceCategory);
      expect(screen.getByText('Help with denied insurance claim')).toBeInTheDocument();
      
      // Open mental health category
      const mentalHealthCategory = screen.getByText('Mental Health').closest('button')!;
      await user.click(mentalHealthCategory);
      
      // Insurance prompts should be hidden, mental health prompts should be visible
      expect(screen.queryByText('Help with denied insurance claim')).not.toBeInTheDocument();
      expect(screen.getByText('Finding mental health support')).toBeInTheDocument();
      expect(screen.getByText('Therapy coverage questions')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes for expandable categories', () => {
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      const categories = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-expanded') !== null
      );
      
      categories.forEach(category => {
        expect(category).toHaveAttribute('aria-expanded', 'false');
        expect(category).toHaveAttribute('aria-controls');
      });
    });

    it('should update aria-expanded when category is opened', async () => {
      const user = userEvent.setup();
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      const insuranceCategory = screen.getByText('Insurance & Claims').closest('button')!;
      expect(insuranceCategory).toHaveAttribute('aria-expanded', 'false');
      
      await user.click(insuranceCategory);
      expect(insuranceCategory).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('prompt selection', () => {
    it('should call onPromptSelect when prompt is clicked', async () => {
      const user = userEvent.setup();
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      // Open insurance category
      const insuranceCategory = screen.getByText('Insurance & Claims').closest('button')!;
      await user.click(insuranceCategory);
      
      // Click on a prompt
      const prompt = screen.getByText('Help with denied insurance claim');
      await user.click(prompt);
      
      expect(mockOnPromptSelect).toHaveBeenCalledWith('Help with denied insurance claim');
    });

    it('should call onPromptSelect for different category prompts', async () => {
      const user = userEvent.setup();
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      // Open mental health category
      const mentalHealthCategory = screen.getByText('Mental Health').closest('button')!;
      await user.click(mentalHealthCategory);
      
      // Click on a mental health prompt
      const prompt = screen.getByText('Finding mental health support');
      await user.click(prompt);
      
      expect(mockOnPromptSelect).toHaveBeenCalledWith('Finding mental health support');
    });

    it('should show hover effects on prompts', async () => {
      const user = userEvent.setup();
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      // Open category
      const insuranceCategory = screen.getByText('Insurance & Claims').closest('button')!;
      await user.click(insuranceCategory);
      
      // Hover over prompt
      const promptButton = screen.getByText('Help with denied insurance claim').closest('button')!;
      await user.hover(promptButton);
      
      // Should show hover arrow
      await waitFor(() => {
        expect(promptButton.querySelector('svg[stroke="currentColor"]')).toBeInTheDocument();
      });
    });

    it('should have proper accessibility labels for prompts', async () => {
      const user = userEvent.setup();
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      // Open category
      const insuranceCategory = screen.getByText('Insurance & Claims').closest('button')!;
      await user.click(insuranceCategory);
      
      // Check aria-label on prompt buttons
      const promptButton = screen.getByLabelText('Use prompt: Help with denied insurance claim');
      expect(promptButton).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should disable all buttons when disabled prop is true', () => {
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} disabled={true} />);
      
      const categoryButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-expanded') !== null
      );
      
      categoryButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('should apply disabled styles when disabled', () => {
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} disabled={true} />);
      
      const insuranceCategory = screen.getByText('Insurance & Claims').closest('button')!;
      expect(insuranceCategory).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('should not call onPromptSelect when disabled', async () => {
      const user = userEvent.setup();
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} disabled={true} />);
      
      // Try to click category (should not work)
      const insuranceCategory = screen.getByText('Insurance & Claims').closest('button')!;
      await user.click(insuranceCategory);
      
      // Prompts should not be visible
      expect(screen.queryByText('Help with denied insurance claim')).not.toBeInTheDocument();
      expect(mockOnPromptSelect).not.toHaveBeenCalled();
    });

    it('should disable prompt buttons when expanded and disabled', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      // First expand category while enabled
      const insuranceCategory = screen.getByText('Insurance & Claims').closest('button')!;
      await user.click(insuranceCategory);
      
      // Re-render with disabled prop
      rerender(<ExamplePrompts onPromptSelect={mockOnPromptSelect} disabled={true} />);
      
      // Check that category button is now disabled
      const disabledInsuranceCategory = screen.getByText('Insurance & Claims').closest('button')!;
      expect(disabledInsuranceCategory).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      const mainHeading = screen.getByRole('heading', { level: 3 });
      expect(mainHeading).toHaveAttribute('id', 'prompts-heading');
      
      const section = screen.getByLabelText(/Or choose from common scenarios/);
      expect(section).toHaveAttribute('aria-labelledby', 'prompts-heading');
    });

    it('should have proper region landmarks when expanded', async () => {
      const user = userEvent.setup();
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      const insuranceCategory = screen.getByText('Insurance & Claims').closest('button')!;
      await user.click(insuranceCategory);
      
      const expandedRegion = screen.getByRole('region', { name: /Insurance & Claims Examples/ });
      expect(expandedRegion).toHaveAttribute('aria-labelledby', 'prompts-insurance-title');
      
      const regionTitle = screen.getByText(/Insurance & Claims Examples/);
      expect(regionTitle).toHaveAttribute('id', 'prompts-insurance-title');
    });

    it('should have proper focus management', async () => {
      const user = userEvent.setup();
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      const insuranceCategory = screen.getByText('Insurance & Claims').closest('button')!;
      
      // Focus and activate category
      await user.tab();
      expect(document.activeElement).toBe(insuranceCategory);
      
      await user.keyboard('{Enter}');
      expect(screen.getByText('Help with denied insurance claim')).toBeInTheDocument();
    });

    it('should support keyboard navigation for prompts', async () => {
      const user = userEvent.setup();
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      // Open category
      const insuranceCategory = screen.getByText('Insurance & Claims').closest('button')!;
      await user.click(insuranceCategory);
      
      // Click on the first prompt directly to test interaction
      const firstPrompt = screen.getByText('Help with denied insurance claim').closest('button')!;
      await user.click(firstPrompt);
      
      expect(mockOnPromptSelect).toHaveBeenCalledWith('Help with denied insurance claim');
    });
  });

  describe('responsive design', () => {
    it('should render grid layout classes for responsive design', () => {
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      const categoryGrid = screen.getByText('Insurance & Claims').closest('.grid')!;
      expect(categoryGrid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });

    it('should have responsive prompt grid when expanded', async () => {
      const user = userEvent.setup();
      render(<ExamplePrompts onPromptSelect={mockOnPromptSelect} />);
      
      const insuranceCategory = screen.getByText('Insurance & Claims').closest('button')!;
      await user.click(insuranceCategory);
      
      const promptGrid = screen.getByText('Help with denied insurance claim').closest('.grid')!;
      expect(promptGrid).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
    });
  });
});