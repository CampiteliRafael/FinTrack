import api from './api';

export interface Notification {
  id: string;
  userId: string;
  type: 'GOAL_ACHIEVED' | 'REPORT_READY' | 'WELCOME' | 'SYSTEM';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  /**
   * Busca todas as notificações
   */
  async getAll(onlyUnread = false): Promise<Notification[]> {
    const params = onlyUnread ? { unread: 'true' } : {};
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  /**
   * Conta notificações não lidas
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  },

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(id: string): Promise<Notification> {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Marca todas como lidas
   */
  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  /**
   * Deleta uma notificação
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
