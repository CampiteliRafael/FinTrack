import { describe, it, expect, vi, beforeEach } from 'vitest';
import { goalService } from '../../features/goals/services/goal.service';
import api from '../../services/api';

vi.mock('../../services/api');

describe('Goal Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getGoals', () => {
    it('should fetch goals with filters', async () => {
      const mockResponse = {
        data: {
          goals: [{ id: '1', name: 'Save $1000', targetAmount: 1000, currentAmount: 500 }],
          total: 1,
        },
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const filters = { completed: false, page: 1 };
      const result = await goalService.getGoals(filters);

      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/goals?'));
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createGoal', () => {
    it('should create goal with correct data', async () => {
      const mockResponse = {
        data: {
          id: '1',
          name: 'New Goal',
          targetAmount: 1000,
          currentAmount: 0,
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const data = {
        name: 'New Goal',
        targetAmount: 1000,
      };

      const result = await goalService.createGoal(data);

      expect(api.post).toHaveBeenCalledWith('/goals', data);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('addProgress', () => {
    it('should add progress to goal', async () => {
      const mockResponse = {
        data: {
          id: '1',
          currentAmount: 600,
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await goalService.addProgress('1', 100);

      expect(api.post).toHaveBeenCalledWith('/goals/1/progress', { amount: 100 });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteGoal', () => {
    it('should delete goal by ID', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: {} });

      await goalService.deleteGoal('1');

      expect(api.delete).toHaveBeenCalledWith('/goals/1');
    });
  });
});
