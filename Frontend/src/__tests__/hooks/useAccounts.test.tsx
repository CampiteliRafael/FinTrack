import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { AccountProvider, useAccounts } from '../../features/accounts/contexts/AccountContext';
import { ReactNode } from 'react';

vi.mock('../../services/api');

const wrapper = ({ children }: { children: ReactNode }) => (
  <AccountProvider>{children}</AccountProvider>
);

describe('useAccounts Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty accounts array', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper });

    expect(result.current.accounts).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should throw error when used outside AccountProvider', () => {
    expect(() => {
      renderHook(() => useAccounts());
    }).toThrow('useAccounts must be used within an AccountProvider');
  });

  it('should have fetchAccounts function', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper });

    expect(result.current.fetchAccounts).toBeDefined();
    expect(typeof result.current.fetchAccounts).toBe('function');
  });

  it('should have createAccount function', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper });

    expect(result.current.createAccount).toBeDefined();
    expect(typeof result.current.createAccount).toBe('function');
  });

  it('should have updateAccount function', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper });

    expect(result.current.updateAccount).toBeDefined();
    expect(typeof result.current.updateAccount).toBe('function');
  });

  it('should have deleteAccount function', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper });

    expect(result.current.deleteAccount).toBeDefined();
    expect(typeof result.current.deleteAccount).toBe('function');
  });
});
