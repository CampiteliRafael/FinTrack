import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../features/auth/contexts/AuthContext';
import { ToastProvider } from '../../contexts/ToastContext';
import { ReactNode } from 'react';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>
    <AuthProvider>{children}</AuthProvider>
  </ToastProvider>
);

describe('useAuth Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with null user and not loading', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should have defined context methods', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.login).toBeDefined();
    expect(result.current.logout).toBeDefined();
    expect(result.current.register).toBeDefined();
  });

  it('should have login function', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.login).toBeDefined();
    expect(typeof result.current.login).toBe('function');
  });

  it('should have logout function', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.logout).toBeDefined();
    expect(typeof result.current.logout).toBe('function');
  });

  it('should have register function', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.register).toBeDefined();
    expect(typeof result.current.register).toBe('function');
  });

  it('should clear tokens on logout', async () => {
    // Set tokens first
    sessionStorage.setItem('accessToken', 'test-token');
    sessionStorage.setItem('refreshToken', 'test-refresh');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    // Verify tokens were removed
    expect(sessionStorage.getItem('accessToken')).toBeNull();
    expect(sessionStorage.getItem('refreshToken')).toBeNull();
    expect(result.current.user).toBeNull();
  });
});
