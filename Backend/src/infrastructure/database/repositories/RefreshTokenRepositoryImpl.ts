import prisma from '../../../config/database';
import { IRefreshTokenRepository } from '../../../core/interfaces/IRefreshTokenRepository';
import { RefreshToken } from '../../../core/entities/RefreshToken';
import { RefreshTokenMapper } from '../mappers/RefreshTokenMapper';

export class RefreshTokenRepositoryImpl implements IRefreshTokenRepository {
  async create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    const raw = await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return RefreshTokenMapper.toDomain(raw);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const raw = await prisma.refreshToken.findUnique({
      where: { token },
    });

    return raw ? RefreshTokenMapper.toDomain(raw) : null;
  }

  async deleteByToken(token: string): Promise<void> {
    await prisma.refreshToken.delete({
      where: { token },
    });
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async deleteExpired(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
