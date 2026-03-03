import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transactionService } from '../../features/transactions/services/transactionService';
import api from '../../services/api';

vi.mock('../../services/api');

describe('Transaction Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call API with filters as query params', async () => {
      const mockResponse = {
        data: {
          transactions: [],
          total: 0,
        },
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const filters = {
        type: 'expense' as const,
        accountId: 'acc-1',
        page: 1,
        limit: 20,
      };

      const result = await transactionService.getAll(filters);

      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/transactions?'));
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('type=expense'));
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('accountId=acc-1'));
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle empty filters', async () => {
      const mockResponse = { data: { transactions: [], total: 0 } };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      await transactionService.getAll();

      expect(api.get).toHaveBeenCalledWith('/transactions?');
    });
  });

  describe('create', () => {
    it('should call API with transaction data', async () => {
      const mockResponse = {
        data: {
          id: '1',
          type: 'expense',
          amount: 100,
          description: 'Test',
          date: '2024-01-01',
          accountId: 'acc-1',
          categoryId: 'cat-1',
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const data = {
        type: 'expense' as const,
        amount: 100,
        description: 'Test',
        date: '2024-01-01',
        accountId: 'acc-1',
        categoryId: 'cat-1',
      };

      const result = await transactionService.create(data);

      expect(api.post).toHaveBeenCalledWith('/transactions', data);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('update', () => {
    it('should call API with transaction ID and updated data', async () => {
      const mockResponse = { data: { id: '1', amount: 200 } };
      vi.mocked(api.patch).mockResolvedValue(mockResponse);

      const data = { amount: 200 };
      const result = await transactionService.update('1', data);

      expect(api.patch).toHaveBeenCalledWith('/transactions/1', data);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('delete', () => {
    it('should call DELETE endpoint with transaction ID', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: {} });

      await transactionService.delete('1');

      expect(api.delete).toHaveBeenCalledWith('/transactions/1');
    });
  });
});
