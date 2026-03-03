import dotenv from 'dotenv';
dotenv.config();

import { cleanupWorker } from './cleanup.worker';
import { monthlyIncomeWorker } from './monthly-income.worker';
import { cleanupQueueService } from '../queues/services/cleanup-queue.service';
import { monthlyIncomeQueueService } from '../queues/services/monthly-income-queue.service';

const shutdownWorkers = async () => {
  await Promise.all([
    cleanupWorker.close(),
    monthlyIncomeWorker.close(),
  ]);
  process.exit(0);
};

process.on('SIGTERM', shutdownWorkers);
process.on('SIGINT', shutdownWorkers);
