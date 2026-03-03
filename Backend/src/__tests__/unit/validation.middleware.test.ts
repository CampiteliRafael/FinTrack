import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate, validateQuery, validateParams } from '../../shared/middlewares/validation.middleware';

// Mock logger
jest.mock('../../config/logger', () => ({
  logError: jest.fn(),
  logInfo: jest.fn(),
}));

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      method: 'POST',
      path: '/api/test',
      body: {},
      query: {},
      params: {},
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

  describe('validate (body validation)', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      age: z.number().optional(),
    });

    it('should pass validation with valid data', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        age: 25,
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockRequest.body).toEqual({
        email: 'test@example.com',
        password: 'password123',
        age: 25,
      });
    });

    it('should fail validation with invalid email', () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: 'password123',
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: ['email'],
            message: expect.any(String),
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fail validation with missing required field', () => {
      mockRequest.body = {
        email: 'test@example.com',
        // password is missing
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: ['password'],
          }),
        ]),
      });
    });

    it('should fail validation with password too short', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: '123', // too short
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: ['password'],
          }),
        ]),
      });
    });

    it('should strip unknown fields', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        unknownField: 'should be removed',
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.body).not.toHaveProperty('unknownField');
    });

    it('should handle optional fields', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        // age is optional and not provided
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.body).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  describe('validateQuery (query validation)', () => {
    const schema = z.object({
      page: z.string().regex(/^\d+$/).optional(),
      limit: z.string().regex(/^\d+$/).optional(),
      search: z.string().optional(),
    });

    it('should pass validation with valid query params', () => {
      mockRequest.query = {
        page: '1',
        limit: '10',
        search: 'test',
      };

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid page number', () => {
      mockRequest.query = {
        page: 'invalid',
        limit: '10',
      };

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Query validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: ['page'],
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle empty query params', () => {
      mockRequest.query = {};

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateParams (params validation)', () => {
    const schema = z.object({
      id: z.string().uuid(),
      slug: z.string().optional(),
    });

    it('should pass validation with valid params', () => {
      mockRequest.params = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'test-slug',
      };

      const middleware = validateParams(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockRequest.params).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'test-slug',
      });
    });

    it('should fail validation with invalid UUID', () => {
      mockRequest.params = {
        id: 'invalid-uuid',
      };

      const middleware = validateParams(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Params validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: ['id'],
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fail validation with missing required param', () => {
      mockRequest.params = {};

      const middleware = validateParams(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Params validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: ['id'],
          }),
        ]),
      });
    });
  });

  describe('Complex validation scenarios', () => {
    it('should handle nested object validation', () => {
      const schema = z.object({
        user: z.object({
          name: z.string().min(3),
          email: z.string().email(),
          address: z.object({
            city: z.string(),
            zipCode: z.string(),
          }),
        }),
      });

      mockRequest.body = {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          address: {
            city: 'New York',
            zipCode: '10001',
          },
        },
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle array validation', () => {
      const schema = z.object({
        tags: z.array(z.string()).min(1),
        numbers: z.array(z.number()).optional(),
      });

      mockRequest.body = {
        tags: ['tag1', 'tag2', 'tag3'],
        numbers: [1, 2, 3],
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.body.tags).toHaveLength(3);
    });

    it('should fail validation with empty required array', () => {
      const schema = z.object({
        tags: z.array(z.string()).min(1),
      });

      mockRequest.body = {
        tags: [],
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
