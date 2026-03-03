import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { JwtUtil } from '../../shared/utils/jwt.util';

// Mock JwtUtil
jest.mock('../../shared/utils/jwt.util');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should return 401 if no authorization header', () => {
      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Token not provided',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header is malformed', () => {
      mockRequest.headers = { authorization: 'InvalidFormat' };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Token malformed',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token is empty', () => {
      mockRequest.headers = { authorization: 'Bearer ' };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Token malformed',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };

      (JwtUtil.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next if token is valid', () => {
      const mockDecoded = {
        userId: '123',
        email: 'test@example.com',
      };

      mockRequest.headers = { authorization: 'Bearer valid-token' };

      (JwtUtil.verify as jest.Mock).mockReturnValue(mockDecoded);

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(JwtUtil.verify).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual(mockDecoded);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should handle expired token', () => {
      mockRequest.headers = { authorization: 'Bearer expired-token' };

      (JwtUtil.verify as jest.Mock).mockImplementation(() => {
        const error = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid token',
      });
    });
  });
});
