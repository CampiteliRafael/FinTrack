import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { HashUtil } from '../../shared/utils/hash.util';

const prisma = new PrismaClient();

export class PasswordResetService {
  // Gerar token de reset de senha
  async generateResetToken(email: string): Promise<string> {
    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Por segurança, não revelar se o email existe ou não
      throw new Error('If the email exists, a reset link will be sent');
    }

    // Gerar token seguro (32 bytes = 64 caracteres hex)
    const token = crypto.randomBytes(32).toString('hex');

    // Token expira em 1 hora
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Salvar token no banco
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    return token;
  }

  // Validar token de reset
  async validateResetToken(token: string): Promise<boolean> {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return false;
    }

    // Verificar se já foi usado
    if (resetToken.used) {
      return false;
    }

    // Verificar se expirou
    if (resetToken.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  // Resetar senha
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Validar token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    if (resetToken.used) {
      throw new Error('Reset token already used');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new Error('Reset token expired');
    }

    // ✅ Usar HashUtil ao invés de bcrypt direto
    const passwordHash = await HashUtil.hash(newPassword);

    // Atualizar senha e marcar token como usado
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
      // Invalidar todos os refresh tokens do usuário (logout forçado)
      prisma.refreshToken.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);
  }

  // Limpar tokens expirados (pode ser executado periodicamente)
  async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { used: true },
        ],
      },
    });

    return result.count;
  }
}
