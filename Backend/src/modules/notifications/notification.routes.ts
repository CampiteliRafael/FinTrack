import { Router } from 'express';
import { notificationController } from './notification.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * @route GET /notifications
 * @desc Lista todas as notificações do usuário
 * @query unread - Filtrar apenas não lidas (true/false)
 * @access Private
 */
router.get('/', notificationController.getAll);

/**
 * @route GET /notifications/unread-count
 * @desc Conta notificações não lidas
 * @access Private
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * @route PATCH /notifications/read-all
 * @desc Marca todas as notificações como lidas
 * @access Private
 */
router.patch('/read-all', notificationController.markAllAsRead);

/**
 * @route PATCH /notifications/:id/read
 * @desc Marca uma notificação como lida
 * @access Private
 */
router.patch('/:id/read', notificationController.markAsRead);

/**
 * @route DELETE /notifications/:id
 * @desc Deleta uma notificação
 * @access Private
 */
router.delete('/:id', notificationController.delete);

export default router;
