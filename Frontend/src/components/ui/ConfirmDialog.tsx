import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';
import { cn } from '../../utils/cn';

export type ConfirmVariant = 'danger' | 'warning' | 'info';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
}

const icons = {
  danger: AlertTriangle,
  warning: AlertCircle,
  info: Info,
};

const iconColors = {
  danger: 'text-accent-danger',
  warning: 'text-accent-warning',
  info: 'text-accent-primary',
};

const iconBackgrounds = {
  danger: 'bg-accent-danger/10',
  warning: 'bg-accent-warning/10',
  info: 'bg-accent-primary/10',
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const Icon = icons[variant];

  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center',
              iconBackgrounds[variant]
            )}
          >
            <Icon className={cn('w-8 h-8', iconColors[variant])} />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-foreground-primary mb-2">{title}</h3>
          <p className="text-foreground-secondary">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
