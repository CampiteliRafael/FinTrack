import { Queue, QueueOptions } from 'bullmq';
import redis from '../config/redis';

export const queueConnection = redis;

const queueOptions: QueueOptions = {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600,
    },
    removeOnFail: {
      age: 7 * 24 * 3600,
    },
  },
};

export const cleanupQueue = new Queue('cleanup', queueOptions);
export const monthlyIncomeQueue = new Queue('monthly-income', queueOptions);
