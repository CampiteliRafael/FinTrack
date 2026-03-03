import { CacheService } from '../../shared/cache/cache.service';

jest.mock('../../config/redis', () => ({
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
}));

const redis = require('../../config/redis');

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    service = new CacheService();
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return parsed value when key exists', async () => {
      const testData = { id: '1', name: 'Test' };
      redis.get.mockResolvedValue(JSON.stringify(testData));

      const result = await service.get('test-key');

      expect(result).toEqual(testData);
      expect(redis.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null when key does not exist', async () => {
      redis.get.mockResolvedValue(null);

      const result = await service.get('non-existent-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should store value with default TTL', async () => {
      const testData = { id: '1', name: 'Test' };

      await service.set('test-key', testData);

      expect(redis.setex).toHaveBeenCalledWith('test-key', 3600, JSON.stringify(testData));
    });

    it('should store value with custom TTL', async () => {
      const testData = { id: '1', name: 'Test' };

      await service.set('test-key', testData, 600);

      expect(redis.setex).toHaveBeenCalledWith('test-key', 600, JSON.stringify(testData));
    });
  });

  describe('del', () => {
    it('should delete key', async () => {
      await service.del('test-key');

      expect(redis.del).toHaveBeenCalledWith('test-key');
    });
  });

  describe('delPattern', () => {
    it('should delete all keys matching pattern', async () => {
      redis.keys.mockResolvedValue(['key1', 'key2', 'key3']);

      await service.delPattern('test:*');

      expect(redis.keys).toHaveBeenCalledWith('test:*');
      expect(redis.del).toHaveBeenCalledWith('key1', 'key2', 'key3');
    });

    it('should not call del when no keys match', async () => {
      redis.keys.mockResolvedValue([]);

      await service.delPattern('test:*');

      expect(redis.keys).toHaveBeenCalledWith('test:*');
      expect(redis.del).not.toHaveBeenCalled();
    });
  });

  describe('remember', () => {
    it('should return cached value if exists', async () => {
      const cachedData = { id: '1', name: 'Cached' };
      redis.get.mockResolvedValue(JSON.stringify(cachedData));

      const callback = jest.fn();
      const result = await service.remember('test-key', 300, callback);

      expect(result).toEqual(cachedData);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should execute callback and cache result if not exists', async () => {
      redis.get.mockResolvedValue(null);
      const freshData = { id: '1', name: 'Fresh' };
      const callback = jest.fn().mockResolvedValue(freshData);

      const result = await service.remember('test-key', 300, callback);

      expect(result).toEqual(freshData);
      expect(callback).toHaveBeenCalled();
      expect(redis.setex).toHaveBeenCalledWith('test-key', 300, JSON.stringify(freshData));
    });
  });
});
