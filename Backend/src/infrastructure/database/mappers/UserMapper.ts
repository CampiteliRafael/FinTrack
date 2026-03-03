import { User as PrismaUser } from '@prisma/client';
import { User } from '../../../core/entities/User';

export class UserMapper {
  static toDomain(raw: PrismaUser): User {
    return new User(raw.id, raw.email, raw.passwordHash, raw.name, raw.createdAt, raw.updatedAt);
  }

  static toPrisma(domain: User): PrismaUser {
    return {
      id: domain.id,
      email: domain.email,
      passwordHash: domain.passwordHash,
      name: domain.name,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    } as PrismaUser;
  }
}
