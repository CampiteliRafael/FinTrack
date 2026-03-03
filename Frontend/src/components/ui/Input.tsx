import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground-primary">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'px-3 sm:px-4 py-3 min-h-[48px] text-base border rounded-lg',
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
        {error && <span className="text-sm text-accent-danger">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
