import { AuthService } from '../../modules/auth/auth.service';
import { IUserRepository } from '../../core/interfaces/IUserRepository';
import { IRefreshTokenRepository } from '../../core/interfaces/IRefreshTokenRepository';
import { HashUtil } from '../../shared/utils/hash.util';
import { JwtUtil } from '../../shared/utils/jwt.util';
import { notificationService } from '../../modules/notifications/notification.service';
import { UnauthorizedError, ConflictError, NotFoundError } from '../../shared/errors/AppError';
import { NotificationType } from '../../modules/notifications/notification.types';

// Mock dependencies
jest.mock('../../shared/utils/hash.util');
jest.mock('../../shared/utils/jwt.util');
jest.mock('../../modules/notifications/notification.service');
jest.mock('../../config/logger', () => ({
  logDebug: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockRefreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updatePassword: jest.fn(),
    } as jest.Mocked<IUserRepository>;

    mockRefreshTokenRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      deleteByToken: jest.fn(),
      deleteAllByUserId: jest.fn(),
      deleteExpired: jest.fn(),
    } as jest.Mocked<IRefreshTokenRepository>;

    authService = new AuthService(mockUserRepository, mockRefreshTokenRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerData = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    };

    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: registerData.email,
        name: registerData.name,
        passwordHash: 'hashed-password',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      (HashUtil.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUserRepository.create.mockResolvedValue(mockUser as any);
      (JwtUtil.signAccessToken as jest.Mock).mockReturnValue('access-token');
      (JwtUtil.generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');
      mockRefreshTokenRepository.create.mockResolvedValue(undefined as any);
      (notificationService.create as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.register(registerData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registerData.email);
      expect(HashUtil.hash).toHaveBeenCalledWith(registerData.password);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: registerData.email,
        passwordHash: 'hashed-password',
        name: registerData.name,
      });
      expect(notificationService.create).toHaveBeenCalledWith({
        userId: mockUser.id,
        type: NotificationType.WELCOME,
        title: expect.stringContaining('Bem-vindo'),
        message: expect.stringContaining(mockUser.name),
      });
      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
    });

    it('should throw ConflictError if email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'existing-user',
        email: registerData.email,
      } as any);

      await expect(authService.register(registerData)).rejects.toThrow(ConflictError);
      await expect(authService.register(registerData)).rejects.toThrow('Email já está cadastrado');

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(notificationService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: loginData.email,
        name: 'Test User',
        passwordHash: 'hashed-password',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      (HashUtil.compare as jest.Mock).mockResolvedValue(true);
      (JwtUtil.signAccessToken as jest.Mock).mockReturnValue('access-token');
      (JwtUtil.generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');
      mockRefreshTokenRepository.create.mockResolvedValue(undefined as any);

      const result = await authService.login(loginData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(HashUtil.compare).toHaveBeenCalledWith(loginData.password, mockUser.passwordHash);
      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
    });

    it('should throw UnauthorizedError if user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
      await expect(authService.login(loginData)).rejects.toThrow('Credenciais inválidas');

      expect(HashUtil.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError if password is invalid', async () => {
      const mockUser = {
        id: 'user-123',
        email: loginData.email,
        passwordHash: 'hashed-password',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      (HashUtil.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
      await expect(authService.login(loginData)).rejects.toThrow('Credenciais inválidas');
    });
  });

  describe('refresh', () => {
    it('should refresh tokens successfully', async () => {
      const mockStoredToken = {
        id: 'token-123',
        userId: 'user-123',
        token: 'valid-refresh-token',
        expiresAt: new Date(Date.now() + 86400000), // 1 day from now
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(mockStoredToken as any);
      mockUserRepository.findById.mockResolvedValue(mockUser as any);
      mockRefreshTokenRepository.deleteByToken.mockResolvedValue(undefined as any);
      (JwtUtil.signAccessToken as jest.Mock).mockReturnValue('new-access-token');
      (JwtUtil.generateRefreshToken as jest.Mock).mockReturnValue('new-refresh-token');
      mockRefreshTokenRepository.create.mockResolvedValue(undefined as any);

      const result = await authService.refresh({ refreshToken: 'valid-refresh-token' });

      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockStoredToken.userId);
      expect(mockRefreshTokenRepository.deleteByToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
    });

    it('should throw UnauthorizedError if refresh token not found', async () => {
      mockRefreshTokenRepository.findByToken.mockResolvedValue(null);

      await expect(authService.refresh({ refreshToken: 'invalid-token' })).rejects.toThrow(
        UnauthorizedError
      );
      await expect(authService.refresh({ refreshToken: 'invalid-token' })).rejects.toThrow(
        'Refresh token inválido'
      );
    });

    it('should throw UnauthorizedError if refresh token is expired', async () => {
      const mockStoredToken = {
        id: 'token-123',
        userId: 'user-123',
        token: 'expired-refresh-token',
        expiresAt: new Date(Date.now() - 86400000), // 1 day ago
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(mockStoredToken as any);
      mockRefreshTokenRepository.deleteByToken.mockResolvedValue(undefined as any);

      await expect(authService.refresh({ refreshToken: 'expired-refresh-token' })).rejects.toThrow(
        UnauthorizedError
      );
      await expect(authService.refresh({ refreshToken: 'expired-refresh-token' })).rejects.toThrow(
        'Refresh token expirado'
      );

      expect(mockRefreshTokenRepository.deleteByToken).toHaveBeenCalledWith('expired-refresh-token');
    });

    it('should throw NotFoundError if user not found', async () => {
      const mockStoredToken = {
        id: 'token-123',
        userId: 'user-123',
        token: 'valid-refresh-token',
        expiresAt: new Date(Date.now() + 86400000),
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(mockStoredToken as any);
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(authService.refresh({ refreshToken: 'valid-refresh-token' })).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('logout', () => {
    it('should delete refresh token on logout', async () => {
      mockRefreshTokenRepository.deleteByToken.mockResolvedValue(undefined as any);

      await authService.logout('refresh-token-to-delete');

      expect(mockRefreshTokenRepository.deleteByToken).toHaveBeenCalledWith(
        'refresh-token-to-delete'
      );
    });
  });
});
