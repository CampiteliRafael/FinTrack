import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';

const THEME_STORAGE_KEY = 'fintrack-theme';

// Component to test the hook
function TestComponent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Remove theme class from document
    document.documentElement.classList.remove('dark', 'preload');
  });

  it('should provide theme context', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toBeInTheDocument();
  });

  it('should toggle theme from light to dark', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByText('Toggle Theme');
    const themeDisplay = screen.getByTestId('current-theme');

    // Initial theme (can be light or dark depending on system preference)
    const initialTheme = themeDisplay.textContent;
    expect(['light', 'dark']).toContain(initialTheme);

    // Toggle theme
    fireEvent.click(toggleButton);

    await waitFor(() => {
      const newTheme = themeDisplay.textContent;
      // Theme should have changed
      expect(newTheme).not.toBe(initialTheme);
      expect(['light', 'dark']).toContain(newTheme);
    });
  });

  it('should toggle theme back and forth', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByText('Toggle Theme');
    const themeDisplay = screen.getByTestId('current-theme');

    const initialTheme = themeDisplay.textContent;

    // Toggle once
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(themeDisplay.textContent).not.toBe(initialTheme);
    });

    // Toggle back
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(themeDisplay.textContent).toBe(initialTheme);
    });
  });

  it('should throw error when useTheme is used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    console.error = originalError;
  });
});
