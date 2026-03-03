import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  FolderKanban,
  ArrowLeftRight,
  Target,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../features/auth/contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const navigation = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/accounts', label: 'Contas', icon: Wallet },
  { path: '/categories', label: 'Categorias', icon: FolderKanban },
  { path: '/transactions', label: 'Transações', icon: ArrowLeftRight },
  { path: '/goals', label: 'Metas', icon: Target },
  { path: '/installments', label: 'Parcelamentos', icon: CreditCard },
];

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLinkClick = () => {
    onCloseMobile();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onCloseMobile} />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full',
          'bg-background-secondary border-r border-primary',
          'flex flex-col',
          'transition-all duration-300 ease-in-out',
          'md:z-20',
          isCollapsed ? 'md:w-[64px]' : 'md:w-[240px]',
          'w-[240px]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between h-[64px] px-4 border-b border-primary">
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8 text-accent-primary" />
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-foreground-primary">FinTrack</h1>
            )}
          </div>

          <button
            onClick={onCloseMobile}
            className="md:hidden p-2 rounded-lg hover:bg-background-tertiary transition-colors"
          >
            <X className="w-5 h-5 text-foreground-secondary" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={handleLinkClick}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                      'transition-all duration-200',
                      'group relative',
                      active
                        ? 'bg-accent-primary text-white shadow-md'
                        : 'text-foreground-secondary hover:bg-background-tertiary hover:text-foreground-primary'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 flex-shrink-0 transition-transform',
                        active && 'scale-110',
                        !active && 'group-hover:scale-110'
                      )}
                    />
                    {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}

                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-background-secondary border border-primary shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        <span className="text-sm text-foreground-primary">{item.label}</span>
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-primary p-3">
          {!isCollapsed ? (
            <>
              <div className="px-3 py-2 mb-2 bg-background-tertiary rounded-lg">
                <p className="text-sm font-medium text-foreground-primary truncate">{user?.name}</p>
                <p className="text-xs text-foreground-tertiary truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground-secondary hover:bg-background-tertiary hover:text-accent-danger transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium text-sm">Sair</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2.5 rounded-lg text-foreground-secondary hover:bg-background-tertiary hover:text-accent-danger transition-colors group relative"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
              <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-background-secondary border border-primary shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                <span className="text-sm text-foreground-primary">Sair</span>
              </div>
            </button>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex w-full items-center justify-center mt-2 p-2 rounded-lg text-foreground-secondary hover:bg-background-tertiary transition-colors"
            title={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <div className="flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                <span className="text-xs">Recolher</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
