# SEMANA 17-18: Deploy e Monitoramento

## 🎯 OBJETIVOS

- Deploy em Railway (backend + database)
- Deploy em Vercel (frontend)
- Configurar Neon Postgres
- Structured logging com Winston
- Error tracking com Sentry
- Health checks e uptime monitoring
- Production monitoring dashboard

## 📋 ENTREGAS

- Backend rodando em Railway
- Database Neon Postgres
- Frontend rodando em Vercel
- Logs estruturados com Winston
- Sentry error tracking
- Health monitoring
- Uptime monitoring (Betteruptime)
- Performance monitoring

## 🛠️ TECNOLOGIAS

- Railway (hosting)
- Vercel (hosting frontend)
- Neon (Postgres managed)
- Winston (logging)
- Sentry (error tracking)
- Better Uptime (monitoring)

---

## 📝 PASSO A PASSO

### BACKEND - DEPLOY RAILWAY

#### Passo 1: Instalar Winston Logging

```bash
npm install winston
```

Crie `src/services/logger.ts`:

```typescript
import winston from 'winston';

/**
 * Logger estruturado para produção
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'fintrack-api',
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION || '1.0.0',
  },
  transports: [
    // Console em desenvolvimento
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      ),
    }),

    // Arquivo de erro
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Arquivo geral
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Não deixar aplicação quebrar em caso de erro
logger.on('error', (err) => {
  console.error('Logger error:', err);
});

export default logger;
```

#### Passo 2: Integrar Winston no Server

Edite `src/server.ts`:

```typescript
import logger from './services/logger';

// Usar logger
logger.info('Servidor iniciando', {
  port: PORT,
  environment: process.env.NODE_ENV,
});

// Log de requisições
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request', {
      method: req.method,
      url: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
});

// Log de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.path,
  });

  res.status(500).json({ error: 'Internal server error' });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason,
    promise,
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});
```

#### Passo 3: Instalar e Configurar Sentry

```bash
npm install @sentry/node @sentry/tracing
```

Edite `src/server.ts`:

```typescript
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

// Inicializar Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app: true, request: true }),
    ],
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// ... resto do app

// Sentry error handler (deve ser último)
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}
```

#### Passo 4: Configurar Railway

Crie `railway.json` na raiz do backend:

```json
{
  "variables": {
    "DATABASE_URL": {
      "description": "PostgreSQL connection URL",
      "value": ""
    },
    "REDIS_HOST": {
      "description": "Redis host",
      "value": "localhost"
    },
    "REDIS_PORT": {
      "description": "Redis port",
      "value": "6379"
    },
    "JWT_SECRET": {
      "description": "JWT secret key",
      "value": ""
    },
    "REFRESH_SECRET": {
      "description": "Refresh token secret",
      "value": ""
    },
    "NODE_ENV": {
      "description": "Environment",
      "value": "production"
    },
    "SENTRY_DSN": {
      "description": "Sentry DSN for error tracking",
      "value": ""
    }
  }
}
```

Crie `Procfile` na raiz do backend:

```
web: npm run start
```

Edite `package.json`:

```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc && npx prisma generate"
  }
}
```

**Deploy:**

1. Ir para https://railway.app
2. Criar novo projeto
3. Conectar GitHub
4. Configurar variáveis de ambiente
5. Deploiar

#### Passo 5: Configurar Neon Postgres

1. Ir para https://neon.tech
2. Criar account
3. Criar novo projeto
4. Copiar connection string
5. Adicionar em Railway como DATABASE_URL

---

### FRONTEND - DEPLOY VERCEL

#### Passo 6: Configurar Vercel

Crie `vercel.json` na raiz do frontend:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@api_url"
  },
  "redirects": [
    {
      "source": "/api/(.*)",
      "destination": "https://fintrack-api.railway.app/api/$1"
    }
  ]
}
```

Crie `next.config.js` (se usar Next.js):

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

**Deploy:**

1. Ir para https://vercel.com
2. Criar account
3. Importar repositório Git
4. Configurar variáveis (VITE_API_URL)
5. Deploiar

---

### MONITORAMENTO

#### Passo 7: Configurar Health Checks

Edite `src/routes/health.ts`:

```typescript
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Redis from 'redis';

const router = Router();
const prisma = new PrismaClient();
const redis = Redis.createClient({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

/**
 * GET /health
 * Basic health check
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/deep
 * Deep health check (testa dependências)
 */
router.get('/deep', async (req: Request, res: Response) => {
  try {
    const checks: { [key: string]: boolean } = {};

    // Verificar database
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch (error) {
      checks.database = false;
    }

    // Verificar Redis
    try {
      if (!redis.isOpen) {
        await redis.connect();
      }
      await redis.ping();
      checks.redis = true;
    } catch (error) {
      checks.redis = false;
    }

    const allHealthy = Object.values(checks).every((status) => status);

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      checks,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
```

#### Passo 8: Configurar Better Uptime

1. Ir para https://betteruptime.com
2. Criar account
3. Adicionar monitor HTTP
4. URL: `https://fintrack-api.railway.app/health/deep`
5. Checar a cada 5 minutos
6. Configurar alertas

#### Passo 9: Criar Monitoring Dashboard

Crie `src/routes/metrics.ts`:

```typescript
import { Router, Request, Response } from 'express';
import { authMiddleware, getUserId } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /metrics/system
 * Métricas do sistema
 */
router.get('/system', (req: Request, res: Response) => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  res.json({
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    },
    cpu: {
      user: cpuUsage.user / 1000, // ms to seconds
      system: cpuUsage.system / 1000,
    },
  });
});

/**
 * GET /metrics/database
 * Métricas do banco de dados
 */
router.get('/database', async (req: Request, res: Response) => {
  try {
    const [userCount, accountCount, transactionCount] = await Promise.all([
      prisma.user.count(),
      prisma.account.count(),
      prisma.transaction.count(),
    ]);

    res.json({
      timestamp: new Date().toISOString(),
      users: userCount,
      accounts: accountCount,
      transactions: transactionCount,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching database metrics' });
  }
});

/**
 * GET /metrics/user-activity
 * Atividades de usuários
 */
router.get('/user-activity', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
        amount: true,
        type: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const dailyStats = new Map<string, { income: number; expense: number }>();

    transactions.forEach((t) => {
      const date = new Date(t.createdAt).toISOString().split('T')[0];
      if (!dailyStats.has(date)) {
        dailyStats.set(date, { income: 0, expense: 0 });
      }
      const stat = dailyStats.get(date)!;
      if (t.type === 'income') {
        stat.income += t.amount;
      } else {
        stat.expense += t.amount;
      }
    });

    res.json({
      timestamp: new Date().toISOString(),
      userId,
      transactionCount: transactions.length,
      dailyStats: Array.from(dailyStats.entries()).map(([date, stats]) => ({
        date,
        ...stats,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user activity' });
  }
});

export default router;
```

---

## ✅ TESTES

### Testar Deployment

```bash
# Verificar logs Railway
railway logs

# Testar health check
curl https://fintrack-api.railway.app/health
curl https://fintrack-api.railway.app/health/deep

# Testar frontend
https://fintrack-vercel.vercel.app

# Testar Sentry
curl -X GET https://fintrack-api.railway.app/test-error

# Verificar logs
railway logs -f
```

### Monitoramento

- Better Uptime: https://betteruptime.com/dashboard
- Sentry: https://sentry.io/dashboard/
- Railway: https://railway.app/project

---

## 🐛 TROUBLESHOOTING

**Database não conecta**
- Verificar DATABASE_URL em Railway
- Confirmar IP allowlist no Neon

**Frontend retorna 404**
- Verificar VITE_API_URL em Vercel
- Confirmar CORS em backend

**Sentry não recebe eventos**
- Verificar SENTRY_DSN
- Confirmar token do Sentry

**Health check falha**
- Testar dependências localmente
- Verificar Redis conexão

---

## 📚 CONCEITOS RELACIONADOS

1. **Structured Logging**: Winston para logs estruturados
2. **Error Tracking**: Sentry para errors em produção
3. **Health Checks**: Endpoints para monitorar saúde
4. **Uptime Monitoring**: Better Uptime para alertas
5. **Performance Monitoring**: APM e métricas

---

## ☑️ CHECKLIST

- [x] Winston logging configurado
- [x] Sentry error tracking
- [x] Railway deployment backend
- [x] Neon Postgres configurado
- [x] Vercel deployment frontend
- [x] Health check endpoints
- [x] Better Uptime monitoring
- [x] Métricas do sistema
- [x] Alertas configurados
- [x] Logging estruturado
- [x] Error tracking automático
- [x] Uptime > 99.9%

---

## 🚀 DEPLOY CHECKLIST FINAL

- [x] Banco de dados migrado para Neon
- [x] Backend rodando em Railway
- [x] Frontend rodando em Vercel
- [x] HTTPS habilitado em ambos
- [x] Variáveis de ambiente configuradas
- [x] Logging em produção
- [x] Error tracking com Sentry
- [x] Health monitoring ativo
- [x] Backups automáticos
- [x] CI/CD pipeline funcionando
- [x] Performance otimizada
- [x] Testes cobrindo 80%+ do código

---

## 📊 MÉTRICAS DE SUCESSO

- Uptime: > 99.9%
- Response time: < 200ms p95
- Error rate: < 0.1%
- Test coverage: > 80%
- Lighthouse score: > 90
- Page load time: < 3s
- API response time: < 500ms

