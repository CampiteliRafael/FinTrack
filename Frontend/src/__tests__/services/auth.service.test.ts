import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../../features/auth/services/authService';
import api from '../../services/api';

vi.mock('../../services/api');

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should call API with correct credentials', async () => {
      const mockResponse = {
        data: {
          accessToken: 'token',
          refreshToken: 'refresh',
          user: { id: '1', email: 'test@example.com', name: 'Test' },
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.login(credentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on failed login', async () => {
      const error = new Error('Invalid credentials');
      vi.mocked(api.post).mockRejectedValue(error);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should call API with registration data', async () => {
      const mockResponse = {
        data: {
          accessToken: 'token',
          refreshToken: 'refresh',
          user: { id: '1', email: 'new@example.com', name: 'New User' },
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const data = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };

      const result = await authService.register(data);

      expect(api.post).toHaveBeenCalledWith('/auth/register', data);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('logout', () => {
    it('should call logout endpoint', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: {} });

      await authService.logout('refresh-token');

      expect(api.post).toHaveBeenCalledWith('/auth/logout', {
        refreshToken: 'refresh-token',
      });
    });
  });
});
