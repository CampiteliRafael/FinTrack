import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground-primary">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={cn(
              'w-full px-3 sm:px-4 py-3 pr-12 min-h-[48px] text-base border rounded-lg',
              'bg-background-primary text-foreground-primary',
              'placeholder:text-foreground-tertiary',
              'focus:outline-none focus:ring-2 transition-colors',
              error
                ? 'border-accent-danger focus:ring-accent-danger'
                : 'border-primary focus:ring-accent-primary focus:border-accent-primary',
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground-primary transition-colors p-1"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {error && <span className="text-sm text-accent-danger">{error}</span>}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
