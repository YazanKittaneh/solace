import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HeroSection from '../HeroSection';

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

describe('HeroSection', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render main heading and subheading correctly', () => {
      render(<HeroSection onSearch={mockOnSearch} />);
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Find Your Healthcare Advocate');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('What do you need support with?');
    });

    it('should render description text', () => {
      render(<HeroSection onSearch={mockOnSearch} />);
      
      expect(screen.getByText(/Describe your situation in your own words/)).toBeInTheDocument();
    });

    it('should render search form with textarea and button', () => {
      render(<HeroSection onSearch={mockOnSearch} />);
      
      expect(screen.getByRole('textbox', { name: /describe your healthcare advocacy needs/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /find my advocate/i })).toBeInTheDocument();
    });

    it('should render character counter', () => {
      render(<HeroSection onSearch={mockOnSearch} />);
      
      expect(screen.getByText('0/500')).toBeInTheDocument();
    });

    it('should render quick stats', () => {
      render(<HeroSection onSearch={mockOnSearch} />);
      
      expect(screen.getByText('500+')).toBeInTheDocument();
      expect(screen.getByText('Qualified Advocates')).toBeInTheDocument();
      expect(screen.getByText('15+')).toBeInTheDocument();
      expect(screen.getByText('Areas of Expertise')).toBeInTheDocument();
      expect(screen.getByText('24/7')).toBeInTheDocument();
      expect(screen.getByText('Support Available')).toBeInTheDocument();
    });

    it('should use custom placeholder when provided', () => {
      const customPlaceholder = 'Custom placeholder text';
      render(<HeroSection onSearch={mockOnSearch} placeholder={customPlaceholder} />);
      
      expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should update character count as user types', async () => {
      const user = userEvent.setup();
      render(<HeroSection onSearch={mockOnSearch} />);
      
      const textarea = screen.getByRole('textbox');
      
      await user.type(textarea, 'Hello world');
      
      expect(screen.getByText('11/500')).toBeInTheDocument();
    });

    it('should update character count color when approaching limit', async () => {
      const user = userEvent.setup();
      render(<HeroSection onSearch={mockOnSearch} />);
      
      const textarea = screen.getByRole('textbox');
      const longText = 'a'.repeat(450); // 90% of limit
      
      await user.type(textarea, longText);
      
      const counter = screen.getByText('450/500');
      expect(counter).toHaveClass('text-yellow-600');
    });

    it('should show red color when at character limit', async () => {
      const user = userEvent.setup();
      render(<HeroSection onSearch={mockOnSearch} />);
      
      const textarea = screen.getByRole('textbox');
      const maxText = 'a'.repeat(500);
      
      await user.type(textarea, maxText);
      
      const counter = screen.getByText('500/500');
      expect(counter).toHaveClass('text-red-600');
    });

    it('should prevent typing beyond character limit', async () => {
      const user = userEvent.setup();
      render(<HeroSection onSearch={mockOnSearch} />);
      
      const textarea = screen.getByRole('textbox');
      const tooLongText = 'a'.repeat(501);
      
      await user.type(textarea, tooLongText);
      
      expect(textarea).toHaveValue('a'.repeat(500));
      expect(screen.getByText('500/500')).toBeInTheDocument();
    });

    it('should show focus styles when textarea is focused', async () => {
      const user = userEvent.setup();
      render(<HeroSection onSearch={mockOnSearch} />);
      
      const textarea = screen.getByRole('textbox');
      
      await user.click(textarea);
      
      const container = textarea.closest('div');
      expect(container).toHaveClass('border-blue-500');
    });
  });

  describe('form submission', () => {
    it('should call onSearch with trimmed query when form is submitted', async () => {
      const user = userEvent.setup();
      render(<HeroSection onSearch={mockOnSearch} />);
      
      const textarea = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /find my advocate/i });
      
      await user.type(textarea, '  mental health support  ');
      await user.click(button);
      
      expect(mockOnSearch).toHaveBeenCalledWith('mental health support');
    });

    it('should not submit when query is empty', async () => {
      const user = userEvent.setup();
      render(<HeroSection onSearch={mockOnSearch} />);
      
      const form = screen.getByRole('textbox').closest('form')!;
      fireEvent.submit(form);
      
      expect(mockOnSearch).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByText('Please describe what you need help with')).toBeInTheDocument();
      });
    });

    it('should not submit when query is only whitespace', async () => {
      const user = userEvent.setup();
      render(<HeroSection onSearch={mockOnSearch} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '   ');
      
      const form = screen.getByRole('textbox').closest('form')!;
      fireEvent.submit(form);
      
      expect(mockOnSearch).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByText('Please describe what you need help with')).toBeInTheDocument();
      });
    });

    it('should submit on Ctrl+Enter', async () => {
      const user = userEvent.setup();
      render(<HeroSection onSearch={mockOnSearch} />);
      
      const textarea = screen.getByRole('textbox');
      
      await user.type(textarea, 'insurance claim help');
      await user.keyboard('{Control>}{Enter}{/Control}');
      
      expect(mockOnSearch).toHaveBeenCalledWith('insurance claim help');
    });

    it('should submit on Cmd+Enter on Mac', async () => {
      const user = userEvent.setup();
      render(<HeroSection onSearch={mockOnSearch} />);
      
      const textarea = screen.getByRole('textbox');
      
      await user.type(textarea, 'disability support');
      await user.keyboard('{Meta>}{Enter}{/Meta}');
      
      expect(mockOnSearch).toHaveBeenCalledWith('disability support');
    });
  });

  describe('loading state', () => {
    it('should show loading spinner when isLoading is true', () => {
      render(<HeroSection onSearch={mockOnSearch} isLoading={true} />);
      
      expect(screen.getByText('Finding advocates...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should disable textarea when loading', () => {
      render(<HeroSection onSearch={mockOnSearch} isLoading={true} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('should apply loading styles to container', () => {
      render(<HeroSection onSearch={mockOnSearch} isLoading={true} />);
      
      const textarea = screen.getByRole('textbox');
      const container = textarea.closest('div');
      expect(container).toHaveClass('opacity-75');
    });
  });

  describe('error handling', () => {
    it('should show error message for empty submission', async () => {
      const user = userEvent.setup();
      render(<HeroSection onSearch={mockOnSearch} />);
      
      const form = screen.getByRole('textbox').closest('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText('Please describe what you need help with')).toBeInTheDocument();
      });
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should show error styles when there is an error', async () => {
      const user = userEvent.setup();
      render(<HeroSection onSearch={mockOnSearch} />);
      
      const form = screen.getByRole('textbox').closest('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        const textarea = screen.getByRole('textbox');
        const container = textarea.closest('.border-red-500');
        expect(container).toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing valid input', async () => {
      const user = userEvent.setup();
      render(<HeroSection onSearch={mockOnSearch} />);
      
      // First trigger error
      const form = screen.getByRole('textbox').closest('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText('Please describe what you need help with')).toBeInTheDocument();
      });
      
      // Then type valid input
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'help');
      
      await waitFor(() => {
        expect(screen.queryByText('Please describe what you need help with')).not.toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels and descriptions', () => {
      render(<HeroSection onSearch={mockOnSearch} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', 'Describe your healthcare advocacy needs');
      expect(textarea).toHaveAttribute('aria-describedby', 'character-count search-help');
    });

    it('should have proper heading hierarchy', () => {
      render(<HeroSection onSearch={mockOnSearch} />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      
      expect(h1).toHaveAttribute('id', 'hero-heading');
      expect(h2).toBeInTheDocument();
    });

    it('should have live regions for dynamic content', () => {
      render(<HeroSection onSearch={mockOnSearch} />);
      
      expect(screen.getByText('0/500')).toHaveAttribute('aria-live', 'polite');
    });

    it('should focus textarea when error occurs', async () => {
      const user = userEvent.setup();
      render(<HeroSection onSearch={mockOnSearch} />);
      
      const form = screen.getByRole('textbox').closest('form')!;
      const textarea = screen.getByRole('textbox');
      
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(textarea).toHaveFocus();
      });
    });
  });

  describe('responsive design', () => {
    it('should render keyboard shortcuts with correct platform', () => {
      render(<HeroSection onSearch={mockOnSearch} />);
      
      expect(screen.getByText('Cmd')).toBeInTheDocument();
    });

    it('should show Ctrl on non-Mac platforms', () => {
      Object.defineProperty(navigator, 'platform', {
        writable: true,
        value: 'Win32'
      });
      
      render(<HeroSection onSearch={mockOnSearch} />);
      
      expect(screen.getByText('Ctrl')).toBeInTheDocument();
    });
  });

  describe('auto-resize functionality', () => {
    it('should auto-resize textarea as content grows', async () => {
      const user = userEvent.setup();
      render(<HeroSection onSearch={mockOnSearch} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      
      // Mock scrollHeight to simulate content growth
      Object.defineProperty(textarea, 'scrollHeight', {
        configurable: true,
        value: 120,
      });
      
      // Add multiple lines of content
      const longText = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
      await user.type(textarea, longText);
      
      // The textarea should have height set
      expect(textarea.style.height).toBe('120px');
    });
  });
});