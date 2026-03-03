import { memo } from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../ui/ThemeToggle';
import { NotificationBell } from '../notifications/NotificationBell';
import { cn } from '../../utils/cn';
import { useAuth } from '../../features/auth/contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
  isCollapsed: boolean;
}

function HeaderComponent({ onMenuClick, isCollapsed }: HeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30',
        'h-[64px]',
        'bg-background-primary/90 backdrop-blur-md',
        'border-b border-primary',
        'flex items-center justify-between px-4 md:px-6',
        'transition-all duration-300',
        'left-0',
        'md:left-[64px]',
        !isCollapsed && 'md:left-[240px]'
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-background-tertiary transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-foreground-secondary" />
        </button>

        <div className="hidden sm:block">
          <h2 className="text-lg font-semibold text-foreground-primary"></h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <ThemeToggle />
        <button
          onClick={() => navigate('/profile')}
          className="hidden md:flex items-center gap-2 pl-3 border-l border-primary hover:bg-background-tertiary rounded-lg px-2 py-1 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-foreground-primary max-w-[120px] truncate">
            {user?.name}
          </span>
        </button>
      </div>
    </header>
  );
}

export const Header = memo(HeaderComponent);
