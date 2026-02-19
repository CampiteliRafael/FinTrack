# SEMANA 15-16: Docker e CI/CD

## 🎯 OBJETIVOS

- Multi-stage Dockerfiles
- docker-compose completo
- GitHub Actions CI/CD
- Build automation
- Environment management
- Container registry

## 📋 ENTREGAS

- Dockerfile backend otimizado
- Dockerfile frontend otimizado
- docker-compose.yml completo
- GitHub Actions workflows
- Automated tests CI
- Build e push automático
- Environment secrets

## 🛠️ TECNOLOGIAS

- Docker & docker-compose
- GitHub Actions
- Multi-stage builds
- Docker Hub / GitHub Registry

---

## 📝 PASSO A PASSO

### DOCKER

#### Passo 1: Criar Dockerfile Backend

Crie `Dockerfile` na raiz do backend:

```dockerfile
# ===== STAGE 1: Build =====
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json e lock
COPY package*.json ./
COPY prisma ./prisma

# Instalar dependências
RUN npm ci

# Compilar TypeScript
RUN npm run build

# Gerar Prisma client
RUN npx prisma generate

# ===== STAGE 2: Runtime =====
FROM node:18-alpine

WORKDIR /app

# Instalar dumb-init para PID 1 handling
RUN apk add --no-cache dumb-init

# Criar usuário non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copiar arquivos do build stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --chown=nodejs:nodejs package*.json ./

# Mudar para usuário non-root
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expor porta
EXPOSE 3000

# Usar dumb-init para executar node
ENTRYPOINT ["dumb-init", "--"]

# Comando
CMD ["node", "dist/server.js"]
```

Crie `.dockerignore` na raiz do backend:

```
node_modules
npm-debug.log
dist
.env.local
.env.example
.git
.gitignore
README.md
.DS_Store
```

#### Passo 2: Criar Dockerfile Frontend

Crie `Dockerfile` na raiz do frontend:

```dockerfile
# ===== STAGE 1: Build =====
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Build com Vite
RUN npm run build

# ===== STAGE 2: Runtime =====
FROM nginx:alpine

# Copiar configuração nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Copiar arquivos built
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Crie `nginx.conf`:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml application/atom+xml image/svg+xml
               text/x-component text/x-cross-domain-policy;

    include /etc/nginx/conf.d/*.conf;
}
```

Crie `nginx-default.conf`:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Servir arquivos estáticos com cache
    location ~* ^/assets/(.*)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff";
    }

    # SPA: redirecionar URLs não encontradas para index.html
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

#### Passo 3: Criar docker-compose.yml

Crie `docker-compose.yml` na raiz do projeto:

```yaml
version: '3.9'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: fintrack-postgres
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-fintrack}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - fintrack-network

  # Redis
  redis:
    image: redis:7-alpine
    container_name: fintrack-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - fintrack-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: fintrack-backend
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@postgres:5432/${DB_NAME:-fintrack}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: ${JWT_SECRET}
      REFRESH_SECRET: ${REFRESH_SECRET}
      EMAIL_USER: ${EMAIL_USER}
      EMAIL_PASSWORD: ${EMAIL_PASSWORD}
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules
      - /app/dist
    command: npm run dev
    networks:
      - fintrack-network
    restart: unless-stopped

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: fintrack-frontend
    environment:
      VITE_API_URL: ${VITE_API_URL:-http://localhost:3000/api}
    ports:
      - "5173:80"
    depends_on:
      - backend
    networks:
      - fintrack-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  fintrack-network:
    driver: bridge
```

Crie `.env.example` na raiz:

```env
# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=fintrack

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Email
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password

# App
NODE_ENV=production
VITE_API_URL=http://localhost:3000/api
```

---

### CI/CD COM GITHUB ACTIONS

#### Passo 4: Criar Workflows CI

Crie `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: fintrack
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: backend
        run: npm ci

      - name: Run migrations
        working-directory: backend
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/fintrack
        run: npx prisma migrate deploy

      - name: Run tests
        working-directory: backend
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/fintrack
          REDIS_HOST: localhost
          REDIS_PORT: 6379
        run: npm test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: backend/coverage

  frontend-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: frontend
        run: npm ci

      - name: Run tests
        working-directory: frontend
        run: npm test

      - name: Build
        working-directory: frontend
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: frontend/coverage

  lint:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install backend deps
        working-directory: backend
        run: npm ci

      - name: Lint backend
        working-directory: backend
        run: npx eslint src --max-warnings 0

      - name: Install frontend deps
        working-directory: frontend
        run: npm ci

      - name: Lint frontend
        working-directory: frontend
        run: npm run lint
```

#### Passo 5: Criar Workflow de Build e Deploy

Crie `.github/workflows/build-deploy.yml`:

```yaml
name: Build & Deploy

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build-backend:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push backend
        uses: docker/build-push-action@v4
        with:
          context: backend
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/fintrack-backend:latest
            ${{ secrets.DOCKER_USERNAME }}/fintrack-backend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  build-frontend:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push frontend
        uses: docker/build-push-action@v4
        with:
          context: frontend
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/fintrack-frontend:latest
            ${{ secrets.DOCKER_USERNAME }}/fintrack-frontend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: [build-backend, build-frontend]
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Railway
        uses: railway-app/deploy-action@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
          service: fintrack-api
          environment: production
```

#### Passo 6: Build Localmente

```bash
# Build images
docker-compose build

# Iniciar containers
docker-compose up -d

# Verificar logs
docker-compose logs -f backend

# Rodar migrações
docker-compose exec backend npx prisma migrate deploy

# Parar containers
docker-compose down
```

---

## ✅ TESTES

### Local

```bash
# Subir stack completa
docker-compose up

# Acessar
- Frontend: http://localhost:5173
- Backend: http://localhost:3000/api
- Postgres: localhost:5432
- Redis: localhost:6379

# Parar
docker-compose down -v  # com -v remove volumes
```

### Verificar Imagens

```bash
# Listar imagens
docker images

# Inspecionar
docker inspect fintrack-backend:latest

# Test build
docker build -f backend/Dockerfile -t fintrack-backend:test backend/

# Run container
docker run -p 3000:3000 fintrack-backend:test
```

---

## 📚 CONCEITOS RELACIONADOS

1. **Multi-stage builds**: Reduzem tamanho de imagens
2. **Docker Compose**: Orquestração local de containers
3. **GitHub Actions**: CI/CD automation
4. **Health checks**: Monitorar saúde de containers
5. **Layer caching**: Otimizar builds

---

## ☑️ CHECKLIST

- [x] Dockerfile backend multi-stage
- [x] Dockerfile frontend otimizado
- [x] docker-compose.yml completo
- [x] Health checks configurados
- [x] GitHub Actions test workflow
- [x] GitHub Actions build/deploy workflow
- [x] Docker Hub integration
- [x] Environment management
