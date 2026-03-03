import { Request, Response } from 'express';
import { cleanupQueueService } from '../../queues/services/cleanup-queue.service';

export class QueueController {
  getStatus = async (req: Request, res: Response) => {
    try {
      const cleanup = await cleanupQueueService.getQueueStatus();

      res.json({
        queues: {
          cleanup,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
