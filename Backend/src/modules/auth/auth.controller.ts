import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDTO, LoginDTO, RefreshTokenDTO } from './auth.types';
import { PasswordResetService } from './password-reset.service';
import { logInfo, logError } from '../../config/logger';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { UnauthorizedError, ConflictError, NotFoundError } from '../../shared/errors/AppError';

export class AuthController {
  private passwordResetService: PasswordResetService;

  constructor(private authService: AuthService) {
    this.passwordResetService = new PasswordResetService();
  }

  register = asyncHandler(async (req: Request, res: Response) => {
    const data: RegisterDTO = req.body;

    logInfo('Registration attempt', { email: data.email, ip: req.ip });

    const result = await this.authService.register(data);

    logInfo('Registration successful', { email: data.email, userId: result.user.id });

    res.status(201).json(result);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const data: LoginDTO = req.body;

    logInfo('Login attempt', { email: data.email, ip: req.ip });

    const result = await this.authService.login(data);

    logInfo('Login successful', { email: data.email, userId: result.user.id });

    res.json(result);
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const data: RefreshTokenDTO = req.body;
    const result = await this.authService.refresh(data);
    res.json(result);
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    await this.authService.logout(refreshToken);
    res.status(204).send();
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
      const token = await this.passwordResetService.generateResetToken(email);
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      logInfo('Password reset requested', {
        email,
        ip: req.ip,
        // Em desenvolvimento, logar o link para facilitar testes
        ...(process.env.NODE_ENV === 'development' && { resetLink }),
      });
    } catch (error) {
      // Não revelar se o email existe, apenas logar
      logInfo('Password reset requested for non-existent email', { email, ip: req.ip });
    }

    // Por segurança, sempre retornar a mesma mensagem
    res.json({
      message: 'Se o email existir, um link de recuperação será enviado',
    });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    await this.passwordResetService.resetPassword(token, newPassword);

    logInfo('Password reset successful', { ip: req.ip });

    res.json({ message: 'Senha redefinida com sucesso' });
  });
}
