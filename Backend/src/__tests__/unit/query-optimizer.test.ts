import { QueryOptimizer } from '../../shared/database/query-optimizer';

describe('QueryOptimizer', () => {
  describe('getPagination', () => {
    it('should return default values when no params provided', () => {
      const result = QueryOptimizer.getPagination();

      expect(result).toEqual({
        skip: 0,
        take: 20,
        page: 1,
        limit: 20,
      });
    });

    it('should calculate skip correctly for page 2', () => {
      const result = QueryOptimizer.getPagination(2, 10);

      expect(result).toEqual({
        skip: 10,
        take: 10,
        page: 2,
        limit: 10,
      });
    });

    it('should enforce max limit', () => {
      const result = QueryOptimizer.getPagination(1, 200);

      expect(result.limit).toBe(100);
      expect(result.take).toBe(100);
    });

    it('should enforce minimum page of 1', () => {
      const result = QueryOptimizer.getPagination(-5, 10);

      expect(result.page).toBe(1);
      expect(result.skip).toBe(0);
    });

    it('should enforce minimum limit of 1', () => {
      const result = QueryOptimizer.getPagination(1, -10);

      expect(result.limit).toBe(1);
      expect(result.take).toBe(1);
    });
  });

  describe('selectFields', () => {
    it('should convert array to select object', () => {
      const fields = ['id', 'name', 'email'];
      const result = QueryOptimizer.selectFields(fields);

      expect(result).toEqual({
        id: true,
        name: true,
        email: true,
      });
    });

    it('should return empty object for empty array', () => {
      const result = QueryOptimizer.selectFields([]);

      expect(result).toEqual({});
    });
  });

  describe('buildDateRangeFilter', () => {
    it('should return undefined when no dates provided', () => {
      const result = QueryOptimizer.buildDateRangeFilter();

      expect(result).toBeUndefined();
    });

    it('should build filter with only start date', () => {
      const startDate = new Date('2024-01-01');
      const result = QueryOptimizer.buildDateRangeFilter(startDate);

      expect(result).toEqual({
        gte: startDate,
      });
    });

    it('should build filter with only end date', () => {
      const endDate = new Date('2024-12-31');
      const result = QueryOptimizer.buildDateRangeFilter(undefined, endDate);

      expect(result).toEqual({
        lte: endDate,
      });
    });

    it('should build filter with both dates', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const result = QueryOptimizer.buildDateRangeFilter(startDate, endDate);

      expect(result).toEqual({
        gte: startDate,
        lte: endDate,
      });
    });
  });

  describe('softDeleteFilter', () => {
    it('should return deletedAt null filter by default', () => {
      const result = QueryOptimizer.softDeleteFilter();

      expect(result).toEqual({ deletedAt: null });
    });

    it('should return undefined when includeDeleted is true', () => {
      const result = QueryOptimizer.softDeleteFilter(true);

      expect(result).toBeUndefined();
    });
  });
});
