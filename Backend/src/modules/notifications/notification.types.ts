export enum NotificationType {
  GOAL_ACHIEVED = 'GOAL_ACHIEVED',
  REPORT_READY = 'REPORT_READY',
  WELCOME = 'WELCOME',
  SYSTEM = 'SYSTEM',
}

export interface INotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}
