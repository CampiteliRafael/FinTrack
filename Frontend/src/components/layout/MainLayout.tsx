import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '../../utils/cn';

interface MainLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_COLLAPSED_KEY = 'fintrack-sidebar-collapsed';

export function MainLayout({ children }: MainLayoutProps) {
  // Initialize from localStorage, default to collapsed on tablet, expanded on desktop
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
    // Default: collapsed on screens < 1280px
    return window.innerWidth < 1280;
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
  }, [isCollapsed]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      // Auto-close mobile menu on desktop
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleToggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleCloseMobile = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={handleCloseMobile}
      />

      {/* Header */}
      <Header onMenuClick={handleToggleMobile} isCollapsed={isCollapsed} />

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          'pt-[64px]', // header-height
          // Adjust left margin based on sidebar state
          'ml-0',
          'md:ml-[64px]', // sidebar-collapsed width
          !isCollapsed && 'md:ml-[240px]' // sidebar-width
        )}
      >
        <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
