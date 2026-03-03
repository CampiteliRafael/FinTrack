import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { notificationService } from './notification.service';
import { NotFoundError } from '../../shared/errors/AppError';

export class NotificationController {
  /**
   * GET /notifications
   * Lista todas as notificações do usuário
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const onlyUnread = req.query.unread === 'true';

    const notifications = await notificationService.getAll(userId, onlyUnread);

    res.json(notifications);
  });

  /**
   * GET /notifications/unread-count
   * Conta notificações não lidas
   */
  getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const count = await notificationService.countUnread(userId);

    res.json({ count });
  });

  /**
   * PATCH /notifications/:id/read
   * Marca uma notificação como lida
   */
  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;

    const notification = await notificationService.markAsRead(String(id), userId);

    if (!notification) {
      throw new NotFoundError('Notificação');
    }

    res.json(notification);
  });

  /**
   * PATCH /notifications/read-all
   * Marca todas as notificações como lidas
   */
  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const count = await notificationService.markAllAsRead(userId);

    res.json({ message: `${count} notificações marcadas como lidas` });
  });

  /**
   * DELETE /notifications/:id
   * Deleta uma notificação
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;

    const deleted = await notificationService.delete(String(id), userId);

    if (!deleted) {
      throw new NotFoundError('Notificação');
    }

    res.status(204).send();
  });
}

export const notificationController = new NotificationController();
