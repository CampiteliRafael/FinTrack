import { JwtUtil } from '../../shared/utils/jwt.util';

describe('JwtUtil', () => {
  describe('signAccessToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { userId: '123', email: 'test@example.com' };
      const token = JwtUtil.signAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid token', () => {
      const payload = { userId: '123', email: 'test@example.com' };
      const token = JwtUtil.signAccessToken(payload);
      const decoded = JwtUtil.verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        JwtUtil.verifyAccessToken(invalidToken);
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      const expiredToken = JwtUtil.signAccessToken(
        { userId: '123', email: 'test@example.com' },
        '0s'
      );

      setTimeout(() => {
        expect(() => {
          JwtUtil.verifyAccessToken(expiredToken);
        }).toThrow();
      }, 100);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a random refresh token', () => {
      const token1 = JwtUtil.generateRefreshToken();
      const token2 = JwtUtil.generateRefreshToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(0);
    });
  });
});
