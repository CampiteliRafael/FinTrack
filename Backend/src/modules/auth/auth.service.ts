import { IUserRepository } from '../../core/interfaces/IUserRepository';
import { IRefreshTokenRepository } from '../../core/interfaces/IRefreshTokenRepository';
import { HashUtil } from '../../shared/utils/hash.util';
import { JwtUtil } from '../../shared/utils/jwt.util';
import { jwtConfig } from '../../config/jwt';
import { RegisterDTO, LoginDTO, AuthResponse, RefreshTokenDTO } from './auth.types';
import { notificationService } from '../notifications/notification.service';
import { NotificationType } from '../notifications/notification.types';
import { UnauthorizedError, ConflictError, NotFoundError } from '../../shared/errors/AppError';
import { logDebug } from '../../config/logger';

export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private refreshTokenRepository: IRefreshTokenRepository
  ) {}

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictError('Email já está cadastrado');
    }

    const passwordHash = await HashUtil.hash(data.password);

    const user = await this.userRepository.create({
      email: data.email,
      passwordHash,
      name: data.name,
    });

    // Criar notificação de boas-vindas
    await notificationService.create({
      userId: user.id,
      type: NotificationType.WELCOME,
      title: '👋 Bem-vindo ao FinTrack!',
      message: `Olá ${user.name}! Sua conta foi criada com sucesso. Comece criando suas primeiras contas e categorias.`,
    });

    return this.generateTokens(user.id, user.email, user.name);
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    logDebug('Login attempt', { email: data.email });

    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      logDebug('User not found', { email: data.email });
      throw new UnauthorizedError('Credenciais inválidas');
    }

    logDebug('User found, comparing passwords');

    const isPasswordValid = await HashUtil.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      logDebug('Invalid password', { email: data.email });
      throw new UnauthorizedError('Credenciais inválidas');
    }

    logDebug('Password valid, generating tokens');
    return this.generateTokens(user.id, user.email, user.name);
  }

  async refresh(data: RefreshTokenDTO): Promise<AuthResponse> {
    const storedToken = await this.refreshTokenRepository.findByToken(data.refreshToken);

    if (!storedToken) {
      throw new UnauthorizedError('Refresh token inválido');
    }

    if (storedToken.expiresAt < new Date()) {
      await this.refreshTokenRepository.deleteByToken(data.refreshToken);
      throw new UnauthorizedError('Refresh token expirado');
    }

    const user = await this.userRepository.findById(storedToken.userId);

    if (!user) {
      throw new NotFoundError('Usuário');
    }

    await this.refreshTokenRepository.deleteByToken(data.refreshToken);

    return this.generateTokens(user.id, user.email, user.name);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.deleteByToken(refreshToken);
  }

  private async generateTokens(userId: string, email: string, name: string): Promise<AuthResponse> {
    const accessToken = JwtUtil.signAccessToken({ userId, email });
    const refreshToken = JwtUtil.generateRefreshToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.create(userId, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: { id: userId, email, name },
    };
  }
}
