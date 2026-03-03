import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const baseClasses =
    'rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative inline-flex items-center justify-center';

  const variantClasses = {
    primary:
      'bg-accent-primary text-white hover:bg-accent-primary-hover active:scale-95 shadow-sm hover:shadow-md',
    secondary:
      'bg-background-tertiary text-foreground-primary hover:bg-background-tertiary/80 active:scale-95 border border-primary',
    outline:
      'border border-primary bg-transparent text-foreground-primary hover:bg-background-tertiary active:scale-95',
    ghost:
      'bg-transparent text-foreground-secondary hover:bg-background-tertiary hover:text-foreground-primary active:scale-95',
    danger:
      'bg-accent-danger text-white hover:bg-accent-danger/90 active:scale-95 shadow-sm hover:shadow-md',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      type={type}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
