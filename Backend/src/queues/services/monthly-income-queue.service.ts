import { Queue } from 'bullmq';
import { queueConnection } from '../queue.config';

/**
 * Serviço para agendar processamento de receitas mensais automáticas
 */
export class MonthlyIncomeQueueService {
  private queue: Queue;

  constructor() {
    this.queue = new Queue('monthly-income', {
      connection: queueConnection,
    });

    this.scheduleRecurringJobs();
  }

  /**
   * Agenda job recorrente de processamento
   */
  private async scheduleRecurringJobs() {
    await this.queue.add(
      'process-monthly-incomes',
      { type: 'process-monthly-incomes' },
      {
        repeat: {
          pattern: '0 6 * * *',
        },
        jobId: 'process-monthly-incomes',
      }
    );
  }

  /**
   * Executa processamento manual de receitas mensais
   */
  async processNow() {
    const job = await this.queue.add(
      'process-monthly-incomes',
      { type: 'process-monthly-incomes' },
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
   * Retorna status da fila
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

export const monthlyIncomeQueueService = new MonthlyIncomeQueueService();
