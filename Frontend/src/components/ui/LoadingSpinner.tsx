import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  className,
  label,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  const variantClasses = {
    primary: 'border-accent-primary border-t-transparent',
    secondary: 'border-foreground-tertiary border-t-transparent',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div
        className={cn('rounded-full animate-spin', sizeClasses[size], variantClasses[variant])}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && <span className="text-sm text-foreground-secondary">{label}</span>}
    </div>
  );
}
