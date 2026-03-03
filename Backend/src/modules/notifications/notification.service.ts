import prisma from '../../config/database';
import { CreateNotificationData, INotification, NotificationType } from './notification.types';

export class NotificationService {
  /**
   * Cria uma nova notificação para o usuário
   */
  async create(data: CreateNotificationData): Promise<INotification> {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
      },
    }) as any;
  }

  /**
   * Busca todas as notificações de um usuário
   */
  async getAll(userId: string, onlyUnread = false): Promise<INotification[]> {
    return prisma.notification.findMany({
      where: {
        userId,
        ...(onlyUnread && { read: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }) as any;
  }

  /**
   * Conta notificações não lidas
   */
  async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(id: string, userId: string): Promise<INotification | null> {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return null;
    }

    return prisma.notification.update({
      where: { id },
      data: { read: true },
    }) as any;
  }

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });

    return result.count;
  }

  /**
   * Deleta uma notificação
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return false;
    }

    await prisma.notification.delete({ where: { id } });
    return true;
  }

  /**
   * Deleta notificações antigas (> 30 dias)
   */
  async deleteOld(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        read: true,
      },
    });

    return result.count;
  }
}

export const notificationService = new NotificationService();
