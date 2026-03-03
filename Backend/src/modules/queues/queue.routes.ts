import { Router } from 'express';
import { QueueController } from './queue.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';

const router = Router();
const queueController = new QueueController();

router.use(authenticate);

router.get('/status', queueController.getStatus);

export default router;
