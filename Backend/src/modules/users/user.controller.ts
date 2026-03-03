import { Request, Response } from 'express';
import { UserRepository } from './user.repository';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { HashUtil } from '../../shared/utils/hash.util';
import { NotFoundError, ConflictError, UnauthorizedError } from '../../shared/errors/AppError';

export class UserController {
  constructor(private userRepository: UserRepository) {}

  getMe = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  });

  updateMe = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { name, email } = req.body;

    // Se email está sendo alterado, verificar se já existe
    if (email) {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError('Email já está em uso');
      }
    }

    const updatedUser = await this.userRepository.update(userId, {
      name,
      email,
    });

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
    });
  });

  updatePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    // Buscar usuário com senha
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // ✅ Usar HashUtil ao invés de bcrypt direto
    const isPasswordValid = await HashUtil.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Senha atual incorreta');
    }

    // ✅ Usar HashUtil ao invés de bcrypt direto
    const newPasswordHash = await HashUtil.hash(newPassword);

    // Atualizar senha
    await this.userRepository.updatePassword(userId, newPasswordHash);

    res.json({ message: 'Senha atualizada com sucesso' });
  });
}
