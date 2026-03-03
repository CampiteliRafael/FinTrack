import { Link, useLocation } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { Button } from '../ui/Button';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="border-b border-primary bg-background-primary/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Wallet className="w-8 h-8 text-accent-primary" />
              <span className="ml-2 text-2xl font-bold text-foreground-primary">FinTrack</span>
            </Link>

            {/* Navigation - only show on landing page */}
            {isLanding && (
              <nav className="hidden md:flex items-center gap-6">
                <a
                  href="#features"
                  className="text-foreground-secondary hover:text-foreground-primary transition-colors"
                >
                  Recursos
                </a>
                <a
                  href="#about"
                  className="text-foreground-secondary hover:text-foreground-primary transition-colors"
                >
                  Sobre
                </a>
              </nav>
            )}

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              {location.pathname !== '/login' && (
                <Link to="/login">
                  <Button variant="ghost" size="md">
                    Login
                  </Button>
                </Link>
              )}
              {location.pathname !== '/register' && (
                <Link to="/register">
                  <Button variant="primary" size="md">
                    Criar Conta
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>

      {/* Footer - only show on landing page */}
      {isLanding && (
        <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-primary bg-background-secondary">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center">
              <p className="text-sm text-foreground-secondary text-center">
                © 2026 FinTrack. Sistema de Gerenciamento Financeiro Pessoal.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
