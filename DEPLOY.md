# 🚀 DEPLOY GRATUITO - FINTRACK

> **Deploy 100% gratuito para portfólio profissional**

---

## 📋 ÍNDICE

1. [Stack Gratuita](#stack-gratuita)
2. [Pré-requisitos](#pré-requisitos)
3. [Passo 1: Database (Neon PostgreSQL)](#passo-1-database-neon-postgresql)
4. [Passo 2: Redis (Upstash)](#passo-2-redis-upstash)
5. [Passo 3: Backend (Render.com)](#passo-3-backend-rendercom)
6. [Passo 4: Frontend (Vercel)](#passo-4-frontend-vercel)
7. [Passo 5: Configuração Final](#passo-5-configuração-final)
8. [Testes e Verificação](#testes-e-verificação)
9. [Otimizações](#otimizações)
10. [Troubleshooting](#troubleshooting)

---

## Stack Gratuita

### Arquitetura

```
┌──────────────┐      ┌──────────────┐
│   Frontend   │      │   Backend    │
│   Vercel     │◄────►│   Render     │
│   (React)    │      │   (Node.js)  │
└──────────────┘      └──────┬───────┘
                             │
                     ┌───────┴───────┐
                     │               │
                ┌────▼────┐    ┌────▼────┐
                │  Neon   │    │ Upstash │
                │Postgres │    │  Redis  │
                └─────────┘    └─────────┘
```

### Componentes

| Serviço | Plataforma | Free Tier | Uso |
|---------|-----------|-----------|-----|
| **Frontend** | Vercel | Ilimitado | React + Vite |
| **Backend** | Render.com | 750h/mês | Node.js API + Workers |
| **Database** | Neon | 3 GB | PostgreSQL 17 |
| **Redis** | Upstash | 10K cmds/dia | Cache + Filas |
| **SSL** | Automático | Ilimitado | HTTPS |
| **Domínio** | Subdomínio | Ilimitado | .vercel.app / .onrender.com |
| **CI/CD** | GitHub Actions | Ilimitado* | Testes + Deploy automático |

**Custo Total: $0/mês** 🎉

\* *Ilimitado para repositórios públicos. Para privados: 2000 min/mês (suficiente para ~40 deploys).*

---

## Pré-requisitos

- [ ] Código no GitHub (público ou privado)
- [ ] Conta GitHub ativa
- [ ] Git instalado localmente
- [ ] Node.js 20+ instalado (para testes locais)

---

## Passo 1: Database (Neon PostgreSQL)

### 1.1. Criar Conta

1. Acesse: https://neon.tech
2. Clique "Sign Up" → **Connect with GitHub**
3. Autorizar acesso
4. Confirmar email

### 1.2. Criar Projeto

1. Dashboard → **"New Project"**
2. Configurações:
   - **Name:** `fintrack`
   - **Region:** `US East (Ohio)` (recomendado)
   - **PostgreSQL version:** `17`
3. Clique **"Create Project"**

### 1.3. Copiar Connection String

1. Na página do projeto, copie a **Connection String**
2. Formato:
   ```
   postgresql://USER:PASSWORD@HOST.neon.tech/DATABASE?sslmode=require
   ```
3. **GUARDAR EM LOCAL SEGURO** (não commitar no Git!)

**Exemplo:**
```
postgresql://fintrack_owner:AbC123XyZ@ep-cool-sea-123456.us-east-2.aws.neon.tech/fintrack?sslmode=require
```

### Características Neon Free
- ✅ 3 GB storage (suficiente para milhares de transações)
- ✅ SSL incluído
- ✅ Backups automáticos (7 dias)
- ✅ 1 projeto

---

## Passo 2: Redis (Upstash)

### 2.1. Criar Conta

1. Acesse: https://upstash.com
2. Clique "Sign Up" → **Connect with GitHub**
3. Verificar email

### 2.2. Criar Database

1. Dashboard → **"Create Database"**
2. Configurações:
   - **Name:** `fintrack-redis`
   - **Type:** `Regional`
   - **Region:** `us-east-1` (mesma do Neon)
   - **Eviction:** `allkeys-lru`
3. Clique **"Create"**

### 2.3. Copiar Credenciais

1. Aba **"Details"**
2. Copiar:
   - **Endpoint** → `REDIS_HOST`
   - **Port** → `REDIS_PORT` (geralmente 6379)
   - **Password** → `REDIS_PASSWORD`
3. **GUARDAR EM LOCAL SEGURO**

**Exemplo:**
```
REDIS_HOST=cosmic-rabbit-12345.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=AXVzLWVhc3QtMToxOjE6YWJjZGVmZ2hpamts
```

### Características Upstash Free
- ✅ 10,000 comandos/dia (~7 cmds/min)
- ✅ 256 MB storage
- ✅ TLS incluído
- ✅ Suficiente para cache básico

---

## Passo 3: Backend (Render.com)

### 3.1. Criar Conta

1. Acesse: https://render.com
2. Clique "Get Started" → **Connect with GitHub**
3. Autorizar acesso aos repositórios

### 3.2. Deploy do Backend

1. Dashboard → **"New +"** → **"Web Service"**
2. Conectar repositório GitHub do **FinTrack**
3. Configurações:

```
Name: fintrack-backend
Region: Ohio (US East)
Branch: main
Root Directory: Backend
Runtime: Node

Build Command: npm install && npx prisma generate && npm run build
Start Command: node dist/server.js

Instance Type: Free
```

### 3.3. Variáveis de Ambiente

Clique **"Environment"** → **"Add Environment Variable"**

Adicionar todas as variáveis abaixo:

```bash
# Application
NODE_ENV=production
PORT=4000

# Free hosting mode (desabilita workers pesados)
FREE_HOSTING=true
ENABLE_WORKERS=false

# Database (Neon) - COLAR SUA CONNECTION STRING
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/DATABASE?sslmode=require

# JWT Secret - GERAR NOVO
# Usar: openssl rand -base64 32
# Ou online: https://generate-secret.vercel.app/32
JWT_SECRET=seu_jwt_secret_com_minimo_32_caracteres_aqui

# Frontend (configurar depois do deploy Vercel)
FRONTEND_URL=https://fintrack.vercel.app

# Redis (Upstash) - COLAR SUAS CREDENCIAIS
REDIS_HOST=seu-endpoint.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=seu_token_upstash_aqui
```

### 3.4. Gerar JWT Secret

```bash
# Terminal (Linux/macOS/Git Bash):
openssl rand -base64 32

# PowerShell (Windows):
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Ou use: https://generate-secret.vercel.app/32
```

### 3.5. Deploy

1. Clicar **"Create Web Service"**
2. Aguardar build (~3-5 min)
3. Verificar logs: sem erros
4. Copiar URL: `https://fintrack-backend.onrender.com`

### 3.6. Executar Migrations

1. Dashboard → **fintrack-backend** → Aba **"Shell"**
2. Executar:
   ```bash
   npx prisma migrate deploy
   ```
3. Verificar: migrations aplicadas com sucesso

### 3.7. Testar Backend

```bash
# Browser ou curl:
https://fintrack-backend.onrender.com/health

# Deve retornar:
{
  "status": "ok",
  "timestamp": "2024-...",
  "database": "connected",
  "redis": "connected"
}
```

### Características Render Free
- ✅ 750 horas/mês (suficiente para 1 app)
- ✅ SSL automático
- ✅ Deploy automático via Git push
- ⚠️ **Sleep após 15 min inatividade** (cold start ~30s)
- **Solução:** Configurar cron job (ver seção Otimizações)

---

## Passo 4: Frontend (Vercel)

### 4.1. Criar Conta

1. Acesse: https://vercel.com
2. Clique "Sign Up" → **Connect with GitHub**
3. Autorizar acesso

### 4.2. Deploy do Frontend

1. Dashboard → **"Add New..."** → **"Project"**
2. Importar repositório GitHub do **FinTrack**
3. Configurações:

```
Framework Preset: Vite
Root Directory: Frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 4.3. Variável de Ambiente

Adicionar:

```bash
VITE_API_URL=https://fintrack-backend.onrender.com/api/v1
```

**⚠️ IMPORTANTE:** Use a URL **exata** do seu backend Render (copiar do dashboard)

### 4.4. Deploy

1. Clicar **"Deploy"**
2. Aguardar build (~2-3 min)
3. Copiar URL: `https://fintrack.vercel.app` (ou similar)

### Características Vercel Free
- ✅ Bandwidth ilimitado
- ✅ SSL automático
- ✅ Deploy automático via Git push
- ✅ CDN global (Edge Network)
- ✅ Preview deploys (PRs)
- ✅ **Sem cold start** (sempre rápido)

---

## Passo 5: Configuração Final

### 5.1. Atualizar FRONTEND_URL no Backend

1. **Render Dashboard** → **fintrack-backend** → **Environment**
2. Editar variável `FRONTEND_URL`
3. Valor: URL do Vercel (ex: `https://fintrack.vercel.app`)
4. **NÃO adicionar `/` no final!**
5. Clicar **"Save Changes"**
6. Aguardar redeploy automático (~2 min)

### 5.2. Verificar CORS

1. Abrir DevTools do navegador (F12)
2. Acessar frontend: `https://fintrack.vercel.app`
3. Console: **sem erros de CORS**
4. Se houver erro CORS: verificar `FRONTEND_URL` no backend

---

## Testes e Verificação

### ✅ Checklist de Testes

#### Frontend
- [ ] Página carrega sem erros
- [ ] Formulário de login visível
- [ ] Console sem erros (F12)
- [ ] Assets carregam (imagens, CSS)

#### Backend API
- [ ] Health check funciona: `/health`
- [ ] Retorna `{"status":"ok"}`
- [ ] Sem erro 500/502/503

#### Funcionalidades Completas
- [ ] **Criar conta** (registro)
- [ ] **Fazer login**
- [ ] **Criar categoria**
- [ ] **Criar conta bancária**
- [ ] **Criar transação** (receita)
- [ ] **Criar transação** (despesa)
- [ ] **Visualizar dashboard**
- [ ] **Listar transações**
- [ ] **Editar transação**
- [ ] **Deletar transação**
- [ ] **Criar meta financeira**
- [ ] **Visualizar notificações**
- [ ] **Logout**

#### Performance
- [ ] Primeiro acesso: pode demorar ~30s (cold start Render - **normal**)
- [ ] Acessos seguintes: rápido (<2s)
- [ ] Transições entre páginas suaves

---

## Otimizações

### 1. Evitar Cold Start (Render)

**Problema:** Render free tier dorme após 15 min inatividade

**Solução:** Ping automático a cada 10 min

#### Usar Cron-Job.org (Gratuito)

1. Acesse: https://cron-job.org
2. Criar conta (gratuito)
3. **"Create cronjob"**
4. Configurações:
   ```
   Title: FinTrack Keep-Alive
   URL: https://fintrack-backend.onrender.com/health
   Schedule: */10 * * * * (Every 10 minutes)
   Enabled: Yes
   ```
5. Salvar

**Resultado:** Backend nunca dorme mais! 🎉

### 2. Monitoring (Opcional)

#### Sentry - Error Tracking

1. Acesse: https://sentry.io (5K eventos/mês grátis)
2. Criar projeto Node.js
3. Copiar DSN
4. Adicionar ao Render:
   ```
   SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   ```

#### UptimeRobot - Uptime Monitoring

1. Acesse: https://uptimerobot.com (50 monitors grátis)
2. Criar monitor:
   ```
   Monitor Type: HTTP(s)
   Friendly Name: FinTrack Backend
   URL: https://fintrack-backend.onrender.com/health
   Monitoring Interval: 5 minutes
   ```
3. Alertas via email se cair

---

## Troubleshooting

### ❌ Frontend não carrega

**Sintomas:** Tela branca, erro no console

**Soluções:**
```bash
1. Verificar build logs no Vercel
   Dashboard → Deployments → Ver logs

2. Verificar variável VITE_API_URL
   Environment → VITE_API_URL deve ser URL do backend

3. Verificar console do navegador (F12)
   Se erro de API: verificar backend

4. Verificar se backend está rodando
   Abrir: https://fintrack-backend.onrender.com/health
```

### ❌ Backend retorna 500

**Sintomas:** Erro 500 Internal Server Error

**Soluções:**
```bash
1. Ver logs no Render
   Dashboard → fintrack-backend → Logs

2. Verificar DATABASE_URL
   Environment → DATABASE_URL deve ser do Neon (com ?sslmode=require)

3. Verificar migrations executadas
   Shell → npx prisma migrate deploy

4. Verificar JWT_SECRET
   Environment → JWT_SECRET deve ter mínimo 32 caracteres
```

### ❌ Erro de CORS

**Sintomas:**
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**Soluções:**
```bash
1. Verificar FRONTEND_URL no backend
   Render → Environment → FRONTEND_URL
   Deve ser EXATAMENTE: https://fintrack.vercel.app
   (sem / no final!)

2. Verificar CORS no código
   Backend/src/app.ts deve ter:
   origin: process.env.FRONTEND_URL

3. Redeploy backend após alterar
   Render → Manual Deploy
```

### ❌ Cold Start Lento

**Sintomas:** Primeira requisição demora ~30s

**Solução:**
```bash
1. É NORMAL no Render free tier
2. Configure cron job (ver seção Otimizações)
3. Ou aguardar (~30s apenas na primeira vez)
```

### ❌ Database connection refused

**Sintomas:** `Error: connect ECONNREFUSED` ou `P1001`

**Soluções:**
```bash
1. Verificar DATABASE_URL no Render
   Deve ter ?sslmode=require no final

2. Testar connection string localmente
   echo $DATABASE_URL (copiar do Render)
   psql "postgresql://..." (testar conexão)

3. Verificar Neon database está ativo
   Dashboard Neon → Projeto deve estar "Active"

4. Verificar IP whitelisting (Neon não tem por padrão)
```

### ❌ Redis não conecta

**Sintomas:** Logs mostram erro Redis

**Soluções:**
```bash
1. Verificar credenciais Upstash
   Render → Environment:
   - REDIS_HOST
   - REDIS_PORT (6379)
   - REDIS_PASSWORD

2. Testar no painel Upstash
   Dashboard → Database → CLI → PING
   Deve retornar PONG

3. Workers desabilitados?
   FREE_HOSTING=true
   ENABLE_WORKERS=false
```

### 🐛 Debug Geral

```bash
# Ver logs em tempo real
Render Dashboard → fintrack-backend → Logs

# Ver variáveis de ambiente
Render Dashboard → Environment → Review

# Ver status de build
Render Dashboard → Events

# Redeployar manualmente
Render Dashboard → Manual Deploy

# Testar API diretamente (Postman/Insomnia)
GET https://fintrack-backend.onrender.com/health
GET https://fintrack-backend.onrender.com/api/v1/categories (com auth)
```

---

## 📱 URLs Finais

Após deploy completo:

```
🌐 Frontend:  https://fintrack.vercel.app
🔧 Backend:   https://fintrack-backend.onrender.com
💚 Health:    https://fintrack-backend.onrender.com/health
📊 Database:  ep-xxx.neon.tech (privado)
🔴 Redis:     xxx.upstash.io (privado)
```

---

## 🚀 Deploy Automático com GitHub Actions

### GitHub Actions - 100% Gratuito

**✅ Incluído no deploy gratuito!**

| Tipo de Repo | Free Tier |
|--------------|-----------|
| **Público** | ✅ **Ilimitado** (recomendado para portfólio) |
| **Privado** | ✅ 2000 minutos/mês (~40 deploys) |

### Workflow Automático

```
┌─────────────────────────────────────────────┐
│  1. Você faz mudança no código              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  2. git push origin main                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  3. GitHub Actions (GRÁTIS) ⚡              │
│     ├── Roda testes backend                 │
│     ├── Roda testes frontend                │
│     ├── Verifica linting                    │
│     └── Build completo                      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  4. Se testes passam ✅                     │
│     ├── Render detecta push → redeploy      │
│     └── Vercel detecta push → redeploy      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  5. ~5-8 minutos depois                     │
│     ✅ Nova versão no ar!                   │
│     https://fintrack.vercel.app             │
└─────────────────────────────────────────────┘
```

### Arquivo de Configuração

O projeto já inclui `.github/workflows/deploy-free.yml` com:

```yaml
✅ Testes automáticos (backend + frontend)
✅ PostgreSQL + Redis como services
✅ Build verificado antes do deploy
✅ Notificações de status
✅ Deploy summary no GitHub
```

### Como Funciona

**Desenvolvimento Local:**
```bash
# 1. Fazer mudanças
npm run dev  # Backend
npm run dev  # Frontend

# 2. Commit e push
git add .
git commit -m "feat: adicionar nova funcionalidade"
git push origin main
```

**GitHub Actions Roda Automaticamente:**
```
🧪 Testa Backend (PostgreSQL + Redis)
🎨 Testa Frontend (Build + Tests)
✅ Se passa, notifica Render + Vercel
📊 Mostra resumo do deploy
```

**Render + Vercel Fazem Deploy:**
```
🚀 Render: redeploy backend (~3-5 min)
🎨 Vercel: redeploy frontend (~2-3 min)
```

### Ver Status do Deploy

1. **GitHub Actions:**
   - Repositório → Aba **"Actions"**
   - Ver workflows rodando em tempo real
   - Logs detalhados de cada step

2. **Render:**
   - Dashboard → **fintrack-backend**
   - Aba **"Events"** ou **"Logs"**

3. **Vercel:**
   - Dashboard → **fintrack**
   - **"Deployments"**
   - Status em tempo real

### Custo do GitHub Actions

```
Repositório Público (Portfólio):
├── Minutos: ILIMITADO
├── Storage: ILIMITADO
├── Deploys: ILIMITADO
└── Custo: $0/mês ✅

Repositório Privado:
├── Minutos: 2000/mês
│   └── ~40 deploys (5 min cada)
│   └── Suficiente para desenvolvimento
├── Storage: 500 MB
└── Custo: $0/mês ✅
```

### Benefícios

✅ **Testes automáticos** - Evita bugs em produção
✅ **Deploy automático** - Push e esquece
✅ **Rollback fácil** - Git revert + push
✅ **Preview deploys** - Testa antes de mergear (Vercel)
✅ **Status badge** - Mostra build status no README
✅ **Logs detalhados** - Debug fácil
✅ **100% gratuito** - Zero custo adicional

---

## 📈 Limites do Free Tier

### Quando Fazer Upgrade?

```
Continuar Free se:
✅ Portfólio pessoal
✅ Poucos usuários (<100)
✅ Uso esporádico
✅ Cold start aceitável (30s)

Fazer Upgrade quando:
⚠️ Muitos usuários (>500)
⚠️ Uso 24/7
⚠️ Cold start inaceitável
⚠️ Precisa de workers rodando sempre
⚠️ Storage > 3 GB
⚠️ Redis > 10K cmds/dia

Upgrade Path:
Render Starter: $7/mês (sem sleep)
Neon Pro: $19/mês (mais storage)
Upstash: Pay-as-you-go
```

---

## ✅ Checklist Final

- [ ] ✅ Database criado (Neon)
- [ ] ✅ Redis criado (Upstash)
- [ ] ✅ Backend deployed (Render)
- [ ] ✅ Frontend deployed (Vercel)
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ CORS configurado (FRONTEND_URL)
- [ ] ✅ Migrations executadas
- [ ] ✅ Todas funcionalidades testadas
- [ ] ✅ Sem erros no console
- [ ] ✅ Health check retorna OK
- [ ] ✅ Cron job configurado (opcional)
- [ ] ✅ Monitoring configurado (opcional)

---

## 🎉 Pronto!

Seu FinTrack está no ar **100% GRATUITO**!

### Próximos Passos

1. ✅ Adicionar ao portfólio
2. ✅ Adicionar ao LinkedIn
3. ✅ Compartilhar no GitHub (README com link)
4. ✅ Mostrar em entrevistas

### Recursos Criados

- `Backend/.env.free-hosting.example` - Template de env vars
- `render.yaml` - Blueprint para Render (deploy via Git)
- `vercel.json` - Configuração otimizada Vercel
- `DEPLOY-FREE-CHECKLIST.md` - Checklist detalhado

---

**Custo Total: $0/mês** 🎊

**Versão:** 1.0.0
**Última atualização:** 2024

---

## 📞 Suporte

**Problemas?** Consulte a seção [Troubleshooting](#troubleshooting)

**Dúvidas?** Abra uma issue no GitHub do projeto

**Melhorias?** Pull requests são bem-vindos!

---

**🚀 Boa sorte com seu portfólio!**
