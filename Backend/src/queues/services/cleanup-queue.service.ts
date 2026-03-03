import { Queue } from 'bullmq';
import { queueConnection } from '../queue.config';

/**
 * Serviço para agendar limpeza automática de dados
 */
export class CleanupQueueService {
  private queue: Queue;

  constructor() {
    this.queue = new Queue('cleanup', {
      connection: queueConnection,
    });

    this.scheduleRecurringJobs();
  }

  /**
   * Agenda jobs recorrentes de limpeza
   */
  private async scheduleRecurringJobs() {
    await this.queue.add(
      'delete-expired-users',
      { type: 'delete-expired-users' },
      {
        repeat: {
          pattern: '0 * * * *',
        },
        jobId: 'cleanup-expired-users',
      }
    );

    await this.queue.add(
      'delete-old-transactions',
      { type: 'delete-old-transactions' },
      {
        repeat: {
          pattern: '0 3 * * 0',
        },
        jobId: 'cleanup-old-transactions',
      }
    );
  }

  /**
   * Executa limpeza manual de usuários expirados
   */
  async cleanupExpiredUsersNow() {
    const job = await this.queue.add(
      'delete-expired-users',
      { type: 'delete-expired-users' },
      {
        priority: 1, // Alta prioridade
      }
    );

    return job;
  }

  /**
   * Executa limpeza manual de transações antigas
   */
  async cleanupOldTransactionsNow() {
    const job = await this.queue.add(
      'delete-old-transactions',
      { type: 'delete-old-transactions' },
      {
        priority: 1,
      }
    );

    return job;
  }

  /**
   * Remove jobs recorrentes agendados
   */
  async removeScheduledJobs() {
    const repeatableJobs = await this.queue.getRepeatableJobs();

    for (const job of repeatableJobs) {
      await this.queue.removeRepeatableByKey(job.key);
    }
  }

  /**
   * Retorna status da fila de limpeza
   */
  async getQueueStatus() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);

    const repeatableJobs = await this.queue.getRepeatableJobs();

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      scheduledJobs: repeatableJobs.map((job) => ({
        name: job.name,
        pattern: job.pattern,
        next: job.next,
      })),
    };
  }
}

export const cleanupQueueService = new CleanupQueueService();
