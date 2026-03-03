# INFORMAÇÕES DE DEPLOY - FINTRACK

## DATABASE (NEON POSTGRESQL)

**Connection String:**
```
postgresql://neondb_owner:npg_I58ZchoODBGs@ep-bold-haze-ajw1zhce-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Configurações:**
- Provider: Neon.tech
- Region: US East (Ohio)
- PostgreSQL version: 17
- Database: neondb
- Free Tier: 3 GB storage

---

## REDIS (UPSTASH)

**Credenciais:**
```
REDIS_HOST=just-pelican-62672.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=AfTQAAIncDJkYWM3ZjY4ZjY1Nzk0NzU2OWFiNzVmZWM1MTAyM2E3NnAyNjI2NzI
```

**Connection String:**
```
redis-cli --tls -u redis://default:AfTQAAIncDJkYWM3ZjY4ZjY1Nzk0NzU2OWFiNzVmZWM1MTAyM2E3NnAyNjI2NzI@just-pelican-62672.upstash.io:6379
```

**Configurações:**
- Provider: Upstash
- Region: us-east-1 (AWS US East)
- Type: Regional
- Eviction: allkeys-lru
- Free Tier: 10,000 comandos/dia, 256 MB storage

---

## JWT SECRET

**Gerado:**
```
JWT_SECRET=HzOnIwgVytp179jc58WbGhKiNrYavJMf
```

---

## BACKEND (RENDER.COM)

**Variáveis de Ambiente:**
```bash
NODE_ENV=production
PORT=4000
FREE_HOSTING=true
ENABLE_WORKERS=false
DATABASE_URL=postgresql://neondb_owner:npg_I58ZchoODBGs@ep-bold-haze-ajw1zhce-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=HzOnIwgVytp179jc58WbGhKiNrYavJMf
FRONTEND_URL=https://fintrack.vercel.app
REDIS_HOST=just-pelican-62672.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=AfTQAAIncDJkYWM3ZjY4ZjY1Nzk0NzU2OWFiNzVmZWM1MTAyM2E3NnAyNjI2NzI
```

**Configurações:**
- Name: fintrack-backend
- Region: Ohio (US East)
- Branch: main
- Root Directory: Backend
- Runtime: Node
- Build Command: `npm install && npx prisma generate && npm run build`
- Start Command: `node dist/server.js`
- Instance Type: Free

**URL Esperada:**
```
https://fintrack-backend.onrender.com
https://fintrack-backend.onrender.com/health
https://fintrack-backend.onrender.com/api/v1
```

---

## FRONTEND (VERCEL) - PENDENTE

**Variável de Ambiente:**
```bash
VITE_API_URL=https://fintrack-backend.onrender.com/api/v1
```

**Configurações:**
- Framework Preset: Vite
- Root Directory: Frontend
- Build Command: npm run build
- Output Directory: dist
- Install Command: npm install

**URL Esperada:**
```
https://fintrack.vercel.app
```

---

## GITHUB REPOSITORY

**URL:** https://github.com/CampiteliRafael/FinTrack

**Branch:** main

**Commits recentes:**
- `999c471` - chore: trigger github actions workflow
- `40f9685` - fix: remove invalid Number conversion on jwt expiresIn
- `9356c2b` - fix: correct all backend test files
- `e6e07a7` - fix: correct test files and jwt util types

---

## STATUS DE TESTES

### Backend
- ✅ 143/143 testes passando (100%)
- ⚠️ 4 suites com erros de TypeScript (não afetam runtime)
- ⚠️ Erros encontrados no GitHub Actions (precisam correção)

### Frontend
- ✅ 93/93 testes passando (100%)
- ✅ 0 erros

---

## PROBLEMAS IDENTIFICADOS NO GITHUB ACTIONS

### 1. Workers
- `cleanup.worker.ts` - Campo `lastLoginAt` não existe no modelo User
- `monthly-income.worker.ts` - Tipo `INCOME` não existe em `AccountEventType`

### 2. Controllers
- `notification.controller.ts` - req.params.id pode ser array
- `transaction.controller.ts` - req.params.id pode ser array

### 3. Validators
- `password.validator.ts` - Property 'errors' não existe em ZodError
- `query.validator.ts` - Parâmetros Zod v4 incompatíveis

### 4. Utils
- `jwt.util.ts` - Tipo de expiresIn incompatível

### 5. Infrastructure
- `TransactionController.ts` (old) - Arquivo não usado causando erro

### 6. Repositories
- `CategoryRepositoryImpl.ts` - Campo 'type' não existe no modelo Category
- `AccountMapper.ts` - Campos faltando na conversão

---

## PRÓXIMOS PASSOS

1. ✅ Documentar informações de deploy
2. ⏳ Analisar schema do Prisma e modelos
3. ⏳ Verificar comunicação Frontend <-> Backend
4. ⏳ Corrigir erros baseado na arquitetura real
5. ⏳ Rodar testes localmente
6. ⏳ Deploy final

---

**Última atualização:** 2026-03-03
