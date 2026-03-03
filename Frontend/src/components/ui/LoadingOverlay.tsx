import { createPortal } from 'react-dom';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '../../utils/cn';

interface LoadingOverlayProps {
  label?: string;
  backdrop?: boolean;
  className?: string;
}

export function LoadingOverlay({
  label = 'Carregando...',
  backdrop = true,
  className,
}: LoadingOverlayProps) {
  const overlay = (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        backdrop && 'bg-background-primary/80 backdrop-blur-sm',
        className
      )}
      role="progressbar"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" variant="primary" />
        {label && <p className="text-sm font-medium text-foreground-secondary">{label}</p>}
      </div>
    </div>
  );

  // Render in portal to ensure it's above everything
  return createPortal(overlay, document.body);
}
