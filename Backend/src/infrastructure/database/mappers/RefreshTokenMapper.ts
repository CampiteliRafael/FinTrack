import { RefreshToken as PrismaRefreshToken } from '@prisma/client';
import { RefreshToken } from '../../../core/entities/RefreshToken';

export class RefreshTokenMapper {
  static toDomain(raw: PrismaRefreshToken): RefreshToken {
    return new RefreshToken(
      raw.id,
      raw.userId,
      raw.token,
      raw.expiresAt,
      raw.createdAt
    );
  }

  static toPrisma(domain: RefreshToken): PrismaRefreshToken {
    return {
      id: domain.id,
      userId: domain.userId,
      token: domain.token,
      expiresAt: domain.expiresAt,
      createdAt: domain.createdAt,
    };
  }
}
