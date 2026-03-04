import './config/env'; // Valida env vars na inicialização
import { env } from './config/env';
import app from './app';
import logger, { logInfo } from './config/logger';

const PORT = env.PORT;

app.listen(PORT, () => {
  logInfo('Server started successfully', {
    port: PORT,
    environment: env.NODE_ENV,
    healthCheck: `http://localhost:${PORT}/api/v1/health`,
  });

  if (env.NODE_ENV === 'development') {
    logger.info(`📊 API Docs: http://localhost:${PORT}/api-docs`);
  }
});
