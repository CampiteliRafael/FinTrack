# SEMANA 13-14: Performance e Testes

## 🎯 OBJETIVOS

- Query optimization e índices
- Cursor-based pagination
- Database query caching (Redis)
- Unit tests com Jest
- Integration tests com Supertest
- E2E tests com Playwright
- Testes de carga

## 📋 ENTREGAS

- Queries otimizadas
- Cursor pagination implementado
- Redis cache layer
- Testes cobrindo 80%+ do código
- Testes E2E principais fluxos
- Relatório de coverage
- Performance benchmarks

## 🛠️ TECNOLOGIAS

- Jest para testes unitários
- Supertest para testes de integração
- Playwright para E2E
- Redis para cache
- Artillery ou ab para carga

---

## 📝 PASSO A PASSO

### BACKEND - OTIMIZAÇÃO

#### Passo 1: Query Optimization e Índices

Edite `prisma/schema.prisma`:

```prisma
// Adicionar índices compostos para queries comuns
model Transaction {
  // ... campos

  @@index([userId])
  @@index([accountId])
  @@index([categoryId])
  @@index([date])
  @@index([userId, date]) // Composite para filtros por usuário e data
  @@index([userId, type, date]) // Para queries de receita/despesa
  @@index([installmentId])
  @@index([recurringId])
}

model Account {
  // ... campos

  @@index([userId])
  @@unique([userId, name]) // Para buscar conta por nome
}

model Category {
  // ... campos

  @@index([userId])
  @@unique([userId, name, type]) // Unique composto
}

model Recurring {
  // ... campos

  @@index([userId])
  @@index([isActive])
  @@index([nextDate]) // Para scheduler encontrar próximas recorrências
}
```

Execute migração:

```bash
npx prisma migrate dev --name optimize_indices
```

#### Passo 2: Implementar Cache com Redis

Crie `src/services/cache.ts`:

```typescript
import Redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  db: 1, // DB diferente de tokens/queue
});

redisClient.on('error', (err) => {
  console.error('Cache Error', err);
});

redisClient.on('connect', () => {
  console.log('Cache Connected');
});

export async function connectCache() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

/**
 * Cache key generators
 */
export function getAccountsCacheKey(userId: string): string {
  return `accounts:${userId}`;
}

export function getCategoriesCacheKey(userId: string, type?: string): string {
  return `categories:${userId}:${type || 'all'}`;
}

export function getDashboardSummaryCacheKey(userId: string, month: number, year: number): string {
  return `dashboard:${userId}:${year}-${month}`;
}

/**
 * Wrapper para get com fallback
 */
export async function getOrSet<T>(
  key: string,
  fn: () => Promise<T>,
  expiresIn: number = 300 // 5 min default
): Promise<T> {
  try {
    // Tentar obter do cache
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    // Obter do banco e cacher
    const data = await fn();
    await redisClient.setEx(key, expiresIn, JSON.stringify(data));

    return data;
  } catch (error) {
    console.error('Cache error:', error);
    // Fallback: apenas executar função
    return fn();
  }
}

/**
 * Invalidar cache
 */
export async function invalidateCache(pattern: string) {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
}

export default redisClient;
```

#### Passo 3: Refatorar Controllers com Cache

Edite `src/controllers/accountController.ts`:

```typescript
import { getOrSet, getAccountsCacheKey, invalidateCache } from '../services/cache';

export async function listAccounts(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const cacheKey = getAccountsCacheKey(userId);

    // Usar cache
    const accounts = await getOrSet(
      cacheKey,
      () => {
        // Função original
        return prisma.account.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
      },
      300 // 5 minutos
    );

    res.json(accounts);
  } catch (error) {
    console.error('Erro ao listar contas:', error);
    res.status(500).json({ error: 'Erro ao listar contas' });
  }
}

export async function createAccount(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const validatedData = createAccountSchema.parse(req.body);

    // ... lógica de criação

    const account = await prisma.account.create({ /* ... */ });

    // Invalidar cache após criar
    await invalidateCache(`accounts:${userId}*`);

    res.status(201).json(account);
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
}
```

#### Passo 4: Implementar Cursor Pagination

Crie `src/utils/pagination.ts`:

```typescript
/**
 * Cursor-based pagination
 * Mais eficiente que offset para grandes datasets
 */

export interface CursorPaginationOptions {
  cursor?: string;
  limit?: number;
  orderBy?: 'asc' | 'desc';
}

export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
}

/**
 * Decodificar cursor
 */
export function decodeCursor(cursor?: string): {
  id?: string;
  value?: string;
} {
  if (!cursor) return {};
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString());
  } catch {
    return {};
  }
}

/**
 * Encodificar cursor
 */
export function encodeCursor(id: string, value?: string): string {
  return Buffer.from(JSON.stringify({ id, value })).toString('base64');
}

/**
 * Formato padrão para cursor pagination em Prisma
 */
export function buildCursorQuery<T extends { id: string }>(
  options: CursorPaginationOptions,
  field: string = 'createdAt'
): { take: number; skip: number; cursor?: { id: string } } {
  const limit = Math.min(options.limit || 20, 100); // Max 100
  const { id } = decodeCursor(options.cursor);

  return {
    take: limit + 1, // Buscar 1 a mais para saber se tem próximo
    skip: id ? 1 : 0, // Skip o cursor se fornecido
    ...(id && { cursor: { id } }),
  };
}
```

Refatore lista de transações com cursor:

```typescript
export async function listTransactions(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const cursor = req.query.cursor as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const query = buildCursorQuery({ cursor, limit }, 'date');

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      ...query,
      orderBy: { date: 'desc' },
    });

    const hasMore = transactions.length > limit;
    const data = hasMore ? transactions.slice(0, -1) : transactions;
    const nextCursor = hasMore ? encodeCursor(data[data.length - 1].id) : undefined;

    res.json({
      data,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Erro ao listar transações:', error);
    res.status(500).json({ error: 'Erro ao listar transações' });
  }
}
```

---

### TESTES

#### Passo 5: Configurar Jest

Edite `package.json`:

```json
{
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "roots": ["<rootDir>/src"],
    "testMatch": ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
    "collectCoverageFrom": [
      "src/**/*.ts",
      "!src/**/*.d.ts",
      "!src/workers/**",
      "!src/tests/**"
    ]
  }
}
```

Instale testes:

```bash
npm install -D jest ts-jest @types/jest jest-mock-extended
npm install --save-dev supertest @types/supertest
npm install --save-dev playwright
```

#### Passo 6: Testes Unitários

Crie `src/__tests__/repositories/UserRepository.test.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository';
import { User } from '../../domain/entities/User';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
    repository = new PrismaUserRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('create', () => {
    test('deve criar novo usuário', async () => {
      const user = new User({
        id: '',
        email: 'test@test.com',
        password: 'hashed_password',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const created = await repository.create(user);

      expect(created.id).toBeDefined();
      expect(created.email).toBe('test@test.com');
    });
  });

  describe('findByEmail', () => {
    test('deve encontrar usuário por email', async () => {
      const user = await repository.findByEmail('test@test.com');
      expect(user).toBeDefined();
      expect(user?.email).toBe('test@test.com');
    });

    test('deve retornar null se não encontrado', async () => {
      const user = await repository.findByEmail('nonexistent@test.com');
      expect(user).toBeNull();
    });
  });
});
```

Crie `src/__tests__/usecases/CreateTransactionUseCase.test.ts`:

```typescript
import { CreateTransactionUseCase } from '../../application/usecases/CreateTransactionUseCase';
import { Transaction } from '../../domain/entities/Transaction';

// Mock
class MockTransactionRepository {
  async create(transaction: Transaction) {
    return transaction;
  }
}

class MockAccountRepository {
  async findById(id: string) {
    return {
      id,
      userId: 'user1',
      name: 'Test Account',
      balance: 1000,
      type: 'checking',
      deposit: jest.fn(),
      withdraw: jest.fn(),
      canWithdraw: jest.fn(),
    };
  }

  async update(account: any) {
    return account;
  }
}

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;

  beforeEach(() => {
    useCase = new CreateTransactionUseCase(
      new MockTransactionRepository() as any,
      new MockAccountRepository() as any
    );
  });

  test('deve criar transação válida', async () => {
    const result = await useCase.execute({
      userId: 'user1',
      accountId: 'account1',
      categoryId: 'category1',
      amount: 100,
      type: 'expense',
      date: new Date(),
    });

    expect(result).toBeDefined();
    expect(result.amount).toBe(100);
  });

  test('deve rejeitar transação com valor negativo', async () => {
    await expect(
      useCase.execute({
        userId: 'user1',
        accountId: 'account1',
        categoryId: 'category1',
        amount: -100,
        type: 'expense',
        date: new Date(),
      })
    ).rejects.toThrow();
  });
});
```

#### Passo 7: Testes de Integração

Crie `src/__tests__/integration/auth.test.ts`:

```typescript
import request from 'supertest';
import app from '../../server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    // Limpar banco
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    test('deve registrar novo usuário', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: 'Password123',
          name: 'Test User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe('test@test.com');
    });

    test('deve rejeitar email inválido', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123',
          name: 'Test',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('deve rejeitar email duplicado', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'Password123',
          name: 'First',
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'Password123',
          name: 'Second',
        })
        .expect(409);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'login@test.com',
          password: 'Password123',
          name: 'Login Test',
        });
    });

    test('deve fazer login com credenciais válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'Password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
    });

    test('deve rejeitar senha incorreta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'WrongPassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});
```

#### Passo 8: Testes E2E com Playwright

Crie `src/__tests__/e2e/auth.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Authentication E2E', () => {
  test('usuário deve fazer registro e login', async ({ page }) => {
    // Ir para página de registro
    await page.goto(`${BASE_URL}/register`);

    // Preencher formulário
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', `test${Date.now()}@test.com`);
    await page.fill('input[name="password"]', 'Password123');
    await page.fill('input[name="confirmPassword"]', 'Password123');

    // Submeter
    await page.click('button[type="submit"]');

    // Deve redirecionar para dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  });

  test('usuário deve fazer logout', async ({ page }) => {
    // Login primeiro (reusa contexto)
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'existing@test.com');
    await page.fill('input[name="password"]', 'Password123');
    await page.click('button[type="submit"]');

    // Esperar dashboard carregar
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Clicar logout
    await page.click('button:has-text("Sair")');

    // Deve ir para login
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test('usuário deve criar conta e transação', async ({ page }) => {
    // ... login
    await page.goto(`${BASE_URL}/manage`);

    // Clicar para adicionar conta
    await page.click('button:has-text("Adicionar Conta")');

    // Preencher formulário
    await page.fill('input[placeholder="ex: Conta Corrente"]', 'Test Account');
    await page.selectOption('select', 'checking');
    await page.fill('input[type="number"]', '1000');

    // Submeter
    await page.click('button:has-text("Criar Conta")');

    // Verificar que conta apareceu
    await expect(page.locator('text=Test Account')).toBeVisible();
  });
});
```

#### Passo 9: Executar Testes

```bash
# Testes unitários
npm test

# Testes com coverage
npm test -- --coverage

# Testes E2E
npx playwright test

# Testes de carga (opcional)
npm install -D autocannon
npx autocannon http://localhost:3000/health
```

---

## ✅ TESTES

### Executar Suite Completa

```bash
# Limpar banco de teste
NODE_ENV=test npm run prisma:reset

# Executar todos os testes
npm test

# Verificar coverage
npm test -- --coverage

# Testes E2E
npm run test:e2e

# Testes de carga
npm run load-test
```

### Verificar Performance

```bash
# Query performance com Prisma
npm run prisma:studio

# Ver índices criados
npx prisma db inspect
```

---

## 🐛 TROUBLESHOOTING

**Testes falham por timeout**
- Aumentar timeout em jest.config.js
- Confirmar banco de testes está disponível

**Cache não funciona em testes**
- Mock Redis em testes
- Usar testcontainers para Redis real

**E2E falha ao conectar**
- Confirmar frontend rodando em localhost:5173
- Confirmar backend rodando em localhost:3000

---

## 📚 CONCEITOS RELACIONADOS

1. **Cursor Pagination**: Mais eficiente em grandes datasets
2. **Query Caching**: Reduz carga do banco
3. **Índices Compostos**: Otimizam queries específicas
4. **Test Coverage**: Medir cobertura de código
5. **Performance Testing**: Benchmark e carga

---

## ☑️ CHECKLIST

- [x] Índices compostos adicionados
- [x] Cache Redis implementado
- [x] Cursor pagination implementado
- [x] Jest configurado
- [x] Testes unitários
- [x] Testes de integração
- [x] Testes E2E com Playwright
- [x] Coverage >= 80%
- [x] Performance benchmarks
