import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { ConfirmDialogProvider } from './contexts/ConfirmDialogContext';
import { AuthProvider, useAuth } from './features/auth/contexts/AuthContext';
import { AccountProvider } from './features/accounts/contexts/AccountContext';
import { CategoryProvider } from './features/categories/contexts/CategoryContext';
import { GoalProvider } from './features/goals/contexts/GoalContext';
import { InstallmentProvider } from './features/installments/contexts/InstallmentContext';
import { MainLayout } from './components/layout/MainLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { LoadingOverlay } from './components/ui/LoadingOverlay';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import CategoriesPage from './pages/CategoriesPage';
import TransactionsPage from './pages/TransactionsPage';
import { GoalsPage } from './pages/GoalsPage';
import { InstallmentsPage } from './pages/InstallmentsPage';
import ProfilePage from './pages/ProfilePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingOverlay label="Autenticando..." />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <MainLayout>{children}</MainLayout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingOverlay label="Verificando autenticação..." />;
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <ConfirmDialogProvider>
            <AuthProvider>
              <AccountProvider>
                <CategoryProvider>
                  <GoalProvider>
                    <InstallmentProvider>
                      <Routes>
                        {/* Public Routes with PublicLayout */}
                        <Route
                          path="/"
                          element={
                            <PublicLayout>
                              <LandingPage />
                            </PublicLayout>
                          }
                        />
                        <Route
                          path="/login"
                          element={
                            <PublicRoute>
                              <PublicLayout>
                                <LoginPage />
                              </PublicLayout>
                            </PublicRoute>
                          }
                        />
                        <Route
                          path="/register"
                          element={
                            <PublicRoute>
                              <PublicLayout>
                                <RegisterPage />
                              </PublicLayout>
                            </PublicRoute>
                          }
                        />
                        <Route
                          path="/forgot-password"
                          element={
                            <PublicRoute>
                              <ForgotPasswordPage />
                            </PublicRoute>
                          }
                        />
                        <Route
                          path="/reset-password"
                          element={
                            <PublicRoute>
                              <ResetPasswordPage />
                            </PublicRoute>
                          }
                        />

                        {/* Protected Routes with MainLayout */}
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <DashboardPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/accounts"
                          element={
                            <ProtectedRoute>
                              <AccountsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/categories"
                          element={
                            <ProtectedRoute>
                              <CategoriesPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/transactions"
                          element={
                            <ProtectedRoute>
                              <TransactionsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/goals"
                          element={
                            <ProtectedRoute>
                              <GoalsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/installments"
                          element={
                            <ProtectedRoute>
                              <InstallmentsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <ProfilePage />
                            </ProtectedRoute>
                          }
                        />
                      </Routes>
                    </InstallmentProvider>
                  </GoalProvider>
                </CategoryProvider>
              </AccountProvider>
            </AuthProvider>
          </ConfirmDialogProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
