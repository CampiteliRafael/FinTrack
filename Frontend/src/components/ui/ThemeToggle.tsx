import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative flex items-center justify-center',
        'w-10 h-10 rounded-lg',
        'bg-background-tertiary hover:bg-background-tertiary/80',
        'border border-primary',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2',
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-foreground-secondary transition-transform duration-200 hover:rotate-12" />
      ) : (
        <Sun className="w-5 h-5 text-foreground-secondary transition-transform duration-200 hover:rotate-45" />
      )}
    </button>
  );
}
