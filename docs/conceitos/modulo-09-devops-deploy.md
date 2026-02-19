# Módulo 9: DevOps e Deployment

## Objetivos deste Módulo

- Containerizar aplicação com Docker
- Orquestrar com docker-compose
- CI/CD com GitHub Actions
- Deploy em cloud (Railway, Vercel, Neon)
- Logging estruturado com Winston
- Monitoramento com Sentry
- Variáveis de ambiente em produção

## Índice

1. [Docker](#docker)
2. [docker-compose](#docker-compose)
3. [CI/CD com GitHub Actions](#cicd-com-github-actions)
4. [Cloud Deployment](#cloud-deployment)
5. [Logging Estruturado](#logging-estruturado)
6. [Monitoramento com Sentry](#monitoramento-com-sentry)
7. [Checklist de Conhecimentos](#checklist-de-conhecimentos)

---

## Docker

### O que é Docker?

```
┌─────────────────────────────────────┐
│   Problema: "Funciona no meu PC"    │
├─────────────────────────────────────┤
│ Dev PC:  Windows, Node 18, npm 9   │
│ Staging: Ubuntu, Node 16, npm 8    │
│ Prod:    CentOS, Node 20, npm 10   │
└─────────────────────────────────────┘

Docker solução:
┌─────────────────────────────────────┐
│    Containerize a aplicação!        │
│  Mesmo ambiente: dev, staging, prod │
└─────────────────────────────────────┘
```

### Dockerfile

```dockerfile
# Dockerfile - Receita para criar container
# ============================================

# 1. Base image - Começar com imagem do Node
FROM node:18-alpine

# 2. Metadados
LABEL maintainer="seu@email.com"
LABEL version="1.0"

# 3. Diretório de trabalho
WORKDIR /app

# 4. Copiar arquivos de dependência
COPY package*.json ./

# 5. Instalar dependências
RUN npm ci --only=production

# 6. Copiar código
COPY src ./src
COPY prisma ./prisma

# 7. Gerar prisma client
RUN npx prisma generate

# 8. Expor porta
EXPOSE 3000

# 9. Variáveis de ambiente
ENV NODE_ENV=production

# 10. Comando para iniciar
CMD ["node", "src/index.js"]

# ============================================
# Construir imagem:
# docker build -t fintrack:1.0 .

# Executar container:
# docker run -p 3000:3000 fintrack:1.0
```

### Multi-stage Build (Otimizado)

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Runtime (menor imagem)
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY src ./src
COPY prisma ./prisma

RUN npx prisma generate
EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "src/index.js"]

# Resultado: Imagem muito menor (remove node-gyp, build tools)
```

### Docker Ignore

```dockerfile
# .dockerignore - O que NÃO incluir na imagem
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.*
.docker
.dockerignore
dist
build
```

### Executar com Docker

```bash
# Construir imagem
docker build -t fintrack:1.0 .

# Listar imagens
docker images

# Executar container
docker run -p 3000:3000 --name fintrack-app fintrack:1.0

# Executar em background
docker run -d -p 3000:3000 --name fintrack-app fintrack:1.0

# Ver logs
docker logs fintrack-app
docker logs -f fintrack-app  # Follow (em tempo real)

# Parar container
docker stop fintrack-app

# Remover container
docker rm fintrack-app

# Executar comando dentro do container
docker exec -it fintrack-app bash

# Ver recursos usados
docker stats
```

---

## docker-compose

### Setup Completo - Backend + BD

```yaml
# docker-compose.yml
version: '3.8'

services:
  # ✅ Backend Node.js
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: fintrack-api
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://fintrack:senha123@db:5432/fintrack_db
      JWT_SECRET: sua-chave-secreta-aqui
      REDIS_URL: redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    volumes:
      - ./src:/app/src  # Hot reload de código
    networks:
      - fintrack-network
    restart: unless-stopped

  # ✅ PostgreSQL
  db:
    image: postgres:15-alpine
    container_name: fintrack-db
    environment:
      POSTGRES_USER: fintrack
      POSTGRES_PASSWORD: senha123
      POSTGRES_DB: fintrack_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - fintrack-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fintrack"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # ✅ Redis Cache
  cache:
    image: redis:7-alpine
    container_name: fintrack-cache
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - fintrack-network
    restart: unless-stopped

  # ✅ PgAdmin (visualizar BD)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: fintrack-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - db
    networks:
      - fintrack-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  fintrack-network:
    driver: bridge

# ============================================
# Comandos:
# docker-compose up                 # Iniciar
# docker-compose up -d              # Background
# docker-compose down               # Parar
# docker-compose logs -f api        # Logs
# docker-compose exec api bash      # Shell
```

### Production docker-compose

```yaml
version: '3.8'

services:
  api:
    image: fintrack:1.0  # Usar imagem pronta, não build
    container_name: fintrack-api-prod
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://fintrack:${DB_PASSWORD}@db:5432/fintrack_db
      JWT_SECRET: ${JWT_SECRET}
      SENTRY_DSN: ${SENTRY_DSN}
    depends_on:
      db:
        condition: service_healthy
    networks:
      - fintrack-network
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    container_name: fintrack-db-prod
    environment:
      POSTGRES_USER: fintrack
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: fintrack_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - fintrack-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fintrack"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always

networks:
  fintrack-network:
    driver: bridge

volumes:
  postgres_data:
```

---

## CI/CD com GitHub Actions

### Setup Initial

```bash
# Criar workflows
mkdir -p .github/workflows
```

### Workflow - Tests

```yaml
# .github/workflows/tests.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: fintrack
          POSTGRES_PASSWORD: test
          POSTGRES_DB: fintrack_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      # 1. Checkout código
      - uses: actions/checkout@v3

      # 2. Setup Node
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      # 3. Instalar dependências
      - run: npm ci

      # 4. Setup BD
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://fintrack:test@localhost:5432/fintrack_test

      # 5. Rodar testes
      - run: npm test -- --coverage

      # 6. Upload coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

      # 7. Verificar linting
      - run: npm run lint
```

### Workflow - Deploy

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      # Build e push de imagem Docker
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/fintrack:latest

      # Deploy em Railway
      - name: Deploy to Railway
        run: |
          npm install -g railway
          railway link ${{ secrets.RAILWAY_PROJECT_ID }}
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## Cloud Deployment

### Railway (Recomendado para Iniciantes)

```bash
# 1. Instalar Railway CLI
npm install -g railway

# 2. Fazer login
railway login

# 3. Criar projeto
railway init

# 4. Adicionar variáveis de ambiente
railway variables set JWT_SECRET "sua_chave"
railway variables set DATABASE_URL "postgresql://..."

# 5. Deploy
railway up

# 6. Ver logs
railway logs

# Ver URL pública
railway status
```

### Railway com Banco de Dados

```bash
# 1. Criar projeto no painel
# railway.app

# 2. Adicionar PostgreSQL via UI
# Add Service → PostgreSQL

# 3. CLI pega DATABASE_URL automaticamente
railway variables get DATABASE_URL

# 4. Deploy
git push  # Webhook automático após conectar GitHub
```

### Vercel (para Frontend)

```bash
npm install -g vercel

vercel login
vercel deploy

# Com ambiente
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel deploy --prod
```

### Neon (PostgreSQL Serverless)

```bash
# 1. Ir para https://console.neon.tech
# 2. Criar projeto
# 3. Copiar connection string
# DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require

# 4. Usar em Railway/Vercel
railway variables set DATABASE_URL "postgresql://..."
```

### Estrutura de Deploy - Resumo

```
┌─────────────────────────────────────┐
│  GitHub Repository                  │
│  (main branch push)                 │
└────────────────┬────────────────────┘
                 │
        ┌────────▼────────┐
        │  GitHub Actions │
        │  (Tests + Build)│
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │   Docker Image  │
        │  (Buildx push)  │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │   Railway       │
        │   (Deploy)      │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  Neon Database  │
        │  (Migrations)   │
        └─────────────────┘
```

---

## Logging Estruturado

### Winston Setup

```bash
npm install winston
```

```javascript
// src/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'fintrack-api' },
  transports: [
    // ✅ Arquivo de erros
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    // ✅ Arquivo combinado
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// ✅ Console em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
}

module.exports = logger;

// src/middleware/logging.js
const logger = require('../config/logger');

// ✅ Middleware para logar requisições
function requestLogger(req, res, next) {
  logger.info('Requisição recebida', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id
  });

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Requisição concluída', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
}

module.exports = requestLogger;

// src/app.js
const app = require('express')();
const requestLogger = require('./middleware/logging');
const logger = require('./config/logger');

app.use(requestLogger);

// ✅ Usar logger em routes
app.post('/api/login', async (req, res, next) => {
  try {
    logger.info('Tentativa de login', { email: req.body.email });

    const usuario = await autenticar(req.body.email, req.body.senha);

    logger.info('Login bem-sucedido', { userId: usuario.id });
    res.json({ token: gerarToken(usuario.id) });
  } catch (erro) {
    logger.error('Erro no login', {
      email: req.body.email,
      error: erro.message,
      stack: erro.stack
    });
    next(erro);
  }
});

// ✅ Usar logger em services
class TransacaoService {
  async criar(dados) {
    logger.debug('Criando transação', dados);

    try {
      const transacao = await this.repository.criar(dados);
      logger.info('Transação criada', { transacaoId: transacao.id });
      return transacao;
    } catch (erro) {
      logger.error('Erro ao criar transação', {
        dados,
        error: erro.message
      });
      throw erro;
    }
  }
}
```

### Estrutura de Logs

```json
{
  "level": "error",
  "message": "Erro ao criar transação",
  "timestamp": "2025-02-19T14:30:00.000Z",
  "service": "fintrack-api",
  "userId": 42,
  "dados": {
    "contaId": 1,
    "valor": 100
  },
  "error": "Saldo insuficiente",
  "stack": "Error: Saldo insuficiente\n    at ..."
}
```

---

## Monitoramento com Sentry

### Setup

```bash
npm install @sentry/node @sentry/tracing
```

```javascript
// src/config/sentry.js
const Sentry = require('@sentry/node');
const { CaptureConsole } = require('@sentry/integrations');

function initSentry(app) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new CaptureConsole({
        levels: ['error']
      })
    ]
  });

  // Middleware antes de rotas
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  return Sentry;
}

module.exports = { initSentry };

// src/app.js
const express = require('express');
const { initSentry } = require('./config/sentry');
const logger = require('./config/logger');

const app = express();

// ✅ Inicializar Sentry ANTES de rotas
initSentry(app);

app.use(express.json());

// ✅ Suas rotas
app.post('/api/login', async (req, res, next) => {
  try {
    // ...
  } catch (erro) {
    logger.error('Erro no login', { erro: erro.message });
    // ✅ Enviar para Sentry
    Sentry.captureException(erro);
    next(erro);
  }
});

// ✅ Middleware de erro Sentry (por último)
app.use(Sentry.Handlers.errorHandler());

app.listen(3000);

// ✅ Capturar erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason });
  Sentry.captureException(reason);
});
```

### Dashboard Sentry

```
sentry.io
├── Projetos
│   └── fintrack-api
│       ├── Issues (Erros agrupados)
│       │   ├── "Error: Saldo insuficiente"
│       │   │   ├── Ocorrências: 142
│       │   │   ├── Usuários afetados: 8
│       │   │   └── Stack trace
│       │   └── "ReferenceError: xxx is not defined"
│       ├── Releases
│       ├── Performance
│       └── Alerts
```

---

## Checklist de Conhecimentos

- [ ] Docker - Dockerfile e imagens
- [ ] Multi-stage builds
- [ ] docker-compose - orquestração local
- [ ] .dockerignore
- [ ] Docker commands (build, run, exec, logs)
- [ ] GitHub Actions workflows
- [ ] CI/CD pipeline
- [ ] Railway deployment
- [ ] PostgreSQL em Neon
- [ ] Variáveis de ambiente seguras
- [ ] Winston logging
- [ ] Structured logging
- [ ] Sentry error tracking
- [ ] Health checks
- [ ] Monitoring e alertas

---

## Próximo Módulo

Agora que sua aplicação está em produção e monitorada, explore **Módulo 10: Documentação** para facilitar manutenção e onboarding.
