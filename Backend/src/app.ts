import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import accountRoutes from './modules/accounts/account.routes';
import categoryRoutes from './modules/categories/category.routes';
import transactionRoutes from './modules/transactions/transaction.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import goalRoutes from './modules/goals/goal.routes';
import installmentRoutes from './modules/installments/installment.routes';
import queueRoutes from './modules/queues/queue.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import { errorHandler } from './shared/middlewares/error.middleware';
import { globalLimiter, authLimiter } from './shared/middlewares/rate-limit.middleware';
import { swaggerUi, swaggerDocument, swaggerOptions } from './config/swagger';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for Swagger UI
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        env.FRONTEND_URL,
        /^https:\/\/.*\.vercel\.app$/,
      ];

      if (!origin || allowedOrigins.some(allowed =>
        typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
      )) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(globalLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/goals', goalRoutes);
app.use('/api/v1/installments', installmentRoutes);
app.use('/api/v1/queues', queueRoutes);
app.use('/api/v1/notifications', notificationRoutes);

app.use(errorHandler);

export default app;
