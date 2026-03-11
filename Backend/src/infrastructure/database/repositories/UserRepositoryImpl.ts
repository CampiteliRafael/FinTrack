import prisma from '../../../config/database';
import { IUserRepository } from '../../../core/interfaces/IUserRepository';
import { User } from '../../../core/entities/User';
import { UserMapper } from '../mappers/UserMapper';
import { v4 as uuidv4 } from 'uuid';

export class UserRepositoryImpl implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({
      where: { id },
    });

    return raw ? UserMapper.toDomain(raw) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({
      where: { email },
    });

    return raw ? UserMapper.toDomain(raw) : null;
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const raw = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
      },
    });

    return UserMapper.toDomain(raw);
  }

  async update(id: string, data: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
    const raw = await prisma.user.update({
      where: { id },
      data,
    });

    return UserMapper.toDomain(raw);
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    const raw = await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    return UserMapper.toDomain(raw);
  }
}
