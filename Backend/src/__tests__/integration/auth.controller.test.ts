import request from 'supertest';
import express, { Express } from 'express';
import authRoutes from '../../modules/auth/auth.routes';
import { errorHandler } from '../../shared/middlewares/error.middleware';
import prisma from '../../config/database';
import { HashUtil } from '../../shared/utils/hash.util';

let app: Express;

describe('Auth Controller - Integration Tests', () => {
  beforeAll(() => {
    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/api/v1/auth', authRoutes);
    app.use(errorHandler);
  });

  afterAll(async () => {
    // Cleanup database
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-',
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: 'Password123!',
        name: 'Test User',
      };

      const response = await request(app).post('/api/v1/auth/register').send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        email: userData.email,
        name: userData.name,
      });
      expect(response.body.user).toHaveProperty('id');

      // Verify user was created in database
      const createdUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(createdUser).toBeTruthy();
      expect(createdUser?.name).toBe(userData.name);

      // Verify notification was created
      const notification = await prisma.notification.findFirst({
        where: { userId: createdUser!.id },
      });
      expect(notification).toBeTruthy();
      expect(notification?.type).toBe('WELCOME');
    });

    it('should return 409 if email already exists', async () => {
      const userData = {
        email: `test-duplicate-${Date.now()}@example.com`,
        password: 'Password123!',
        name: 'Test User',
      };

      // First registration
      await request(app).post('/api/v1/auth/register').send(userData);

      // Duplicate registration
      const response = await request(app).post('/api/v1/auth/register').send(userData);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('já está cadastrado');
    });

    it('should return 422 for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Password123!',
        name: 'Test User',
      };

      const response = await request(app).post('/api/v1/auth/register').send(userData);

      expect(response.status).toBe(422);
    });

    it('should return 422 for weak password', async () => {
      const userData = {
        email: `test-weak-${Date.now()}@example.com`,
        password: '123',
        name: 'Test User',
      };

      const response = await request(app).post('/api/v1/auth/register').send(userData);

      expect(response.status).toBe(422);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const testUser = {
      email: `test-login-${Date.now()}@example.com`,
      password: 'Password123!',
      name: 'Login Test User',
    };

    beforeAll(async () => {
      // Create test user
      const passwordHash = await HashUtil.hash(testUser.password);
      await prisma.user.create({
        data: {
          email: testUser.email,
          passwordHash,
          name: testUser.name,
        },
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);

      // Verify refresh token was stored
      const refreshToken = await prisma.refreshToken.findFirst({
        where: {
          user: { email: testUser.email },
        },
      });
      expect(refreshToken).toBeTruthy();
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'Password123!',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Credenciais inválidas');
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Credenciais inválidas');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let validRefreshToken: string;
    let userId: string;

    beforeAll(async () => {
      // Create test user and get tokens
      const userData = {
        email: `test-refresh-${Date.now()}@example.com`,
        password: 'Password123!',
        name: 'Refresh Test User',
      };

      const registerResponse = await request(app).post('/api/v1/auth/register').send(userData);

      validRefreshToken = registerResponse.body.refreshToken;
      userId = registerResponse.body.user.id;
    });

    it('should refresh tokens successfully with valid refresh token', async () => {
      const response = await request(app).post('/api/v1/auth/refresh').send({
        refreshToken: validRefreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.refreshToken).not.toBe(validRefreshToken); // Should be a new token

      // Verify old token was deleted
      const oldToken = await prisma.refreshToken.findFirst({
        where: { token: validRefreshToken },
      });
      expect(oldToken).toBeNull();

      // Verify new token was created
      const newToken = await prisma.refreshToken.findFirst({
        where: { token: response.body.refreshToken },
      });
      expect(newToken).toBeTruthy();
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app).post('/api/v1/auth/refresh').send({
        refreshToken: 'invalid-refresh-token',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for expired refresh token', async () => {
      // Create an expired token
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1); // Yesterday

      const expiredToken = await prisma.refreshToken.create({
        data: {
          userId,
          token: 'expired-token-123',
          expiresAt: expiredDate,
        },
      });

      const response = await request(app).post('/api/v1/auth/refresh').send({
        refreshToken: expiredToken.token,
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('expirado');

      // Verify token was deleted
      const deletedToken = await prisma.refreshToken.findUnique({
        where: { id: expiredToken.id },
      });
      expect(deletedToken).toBeNull();
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully and delete refresh token', async () => {
      // Create user and login
      const userData = {
        email: `test-logout-${Date.now()}@example.com`,
        password: 'Password123!',
        name: 'Logout Test User',
      };

      const registerResponse = await request(app).post('/api/v1/auth/register').send(userData);

      const { refreshToken } = registerResponse.body;

      // Logout
      const response = await request(app).post('/api/v1/auth/logout').send({
        refreshToken,
      });

      expect(response.status).toBe(204);

      // Verify token was deleted
      const deletedToken = await prisma.refreshToken.findFirst({
        where: { token: refreshToken },
      });
      expect(deletedToken).toBeNull();
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    const testUser = {
      email: `test-forgot-${Date.now()}@example.com`,
      password: 'Password123!',
      name: 'Forgot Password Test',
    };

    beforeAll(async () => {
      const passwordHash = await HashUtil.hash(testUser.password);
      await prisma.user.create({
        data: {
          email: testUser.email,
          passwordHash,
          name: testUser.name,
        },
      });
    });

    it('should generate reset token for existing email', async () => {
      const response = await request(app).post('/api/v1/auth/forgot-password').send({
        email: testUser.email,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verify token was created
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          user: { email: testUser.email },
          used: false,
        },
      });
      expect(resetToken).toBeTruthy();
      expect(resetToken?.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return success even for non-existent email (security)', async () => {
      const response = await request(app).post('/api/v1/auth/forgot-password').send({
        email: 'nonexistent@example.com',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    let resetToken: string;
    let userId: string;

    beforeEach(async () => {
      // Create user and reset token
      const userData = {
        email: `test-reset-${Date.now()}@example.com`,
        password: 'OldPassword123!',
        name: 'Reset Password Test',
      };

      const passwordHash = await HashUtil.hash(userData.password);
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash,
          name: userData.name,
        },
      });

      userId = user.id;

      // Generate reset token
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      const token = await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: `reset-token-${Date.now()}`,
          expiresAt,
          used: false,
        },
      });

      resetToken = token.token;
    });

    it('should reset password successfully with valid token', async () => {
      const newPassword = 'NewPassword123!';

      const response = await request(app).post('/api/v1/auth/reset-password').send({
        token: resetToken,
        newPassword,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verify token was marked as used
      const usedToken = await prisma.passwordResetToken.findFirst({
        where: { token: resetToken },
      });
      expect(usedToken?.used).toBe(true);

      // Verify password was changed
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      const isNewPassword = await HashUtil.compare(newPassword, user!.passwordHash);
      expect(isNewPassword).toBe(true);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app).post('/api/v1/auth/reset-password').send({
        token: 'invalid-token',
        newPassword: 'NewPassword123!',
      });

      expect(response.status).toBe(401);
    });

    it('should return 401 for expired token', async () => {
      // Create expired token
      const expiredDate = new Date();
      expiredDate.setHours(expiredDate.getHours() - 2);

      const expiredToken = await prisma.passwordResetToken.create({
        data: {
          userId,
          token: `expired-token-${Date.now()}`,
          expiresAt: expiredDate,
          used: false,
        },
      });

      const response = await request(app).post('/api/v1/auth/reset-password').send({
        token: expiredToken.token,
        newPassword: 'NewPassword123!',
      });

      expect(response.status).toBe(401);
    });

    it('should return 401 for already used token', async () => {
      // Mark token as used
      await prisma.passwordResetToken.update({
        where: { token: resetToken },
        data: { used: true },
      });

      const response = await request(app).post('/api/v1/auth/reset-password').send({
        token: resetToken,
        newPassword: 'NewPassword123!',
      });

      expect(response.status).toBe(401);
    });
  });
});
