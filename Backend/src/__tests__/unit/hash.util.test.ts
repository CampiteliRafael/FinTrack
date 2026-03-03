import { HashUtil } from '../../shared/utils/hash.util';

describe('HashUtil', () => {
  describe('hash', () => {
    it('should hash a password', async () => {
      const password = 'test123';
      const hash = await HashUtil.hash(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'test123';
      const hash1 = await HashUtil.hash(password);
      const hash2 = await HashUtil.hash(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('should return true for matching password', async () => {
      const password = 'test123';
      const hash = await HashUtil.hash(password);
      const result = await HashUtil.compare(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'test123';
      const wrongPassword = 'wrong456';
      const hash = await HashUtil.hash(password);
      const result = await HashUtil.compare(wrongPassword, hash);

      expect(result).toBe(false);
    });
  });
});
