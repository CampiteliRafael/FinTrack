import { ReactNode, useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Trigger animation after render
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 flex items-center justify-center z-50',
        'transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className={cn(
          'bg-background-primary rounded-lg shadow-xl max-w-md w-full mx-4 relative z-10',
          'border-2 border-primary',
          'max-h-[90vh] flex flex-col',
          'transform transition-all duration-300',
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
      >
        {/* Header - Fixo */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b-2 border-primary flex-shrink-0 bg-background-secondary rounded-t-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground-primary">{title}</h2>
          <button
            onClick={onClose}
            className="text-foreground-tertiary hover:text-foreground-primary transition-colors p-1 hover:bg-background-tertiary rounded"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
