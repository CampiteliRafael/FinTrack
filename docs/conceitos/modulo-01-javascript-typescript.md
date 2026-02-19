# 📘 MÓDULO 1: JavaScript e TypeScript

## 🎯 OBJETIVO

Dominar os fundamentos avançados de JavaScript e TypeScript necessários para desenvolvimento profissional full-stack.

**Tempo estimado**: 8-12 horas de estudo
**Pré-requisitos**: Conhecimento básico de JavaScript

---

## 📑 ÍNDICE

1. [Event Loop e Assincronia](#1-event-loop-e-assincronia)
2. [Closures e Escopo](#2-closures-e-escopo)
3. [This Binding](#3-this-binding)
4. [Promises e Async/Await](#4-promises-e-asyncawait)
5. [TypeScript Generics](#5-typescript-generics)
6. [Utility Types](#6-utility-types)
7. [Type Guards](#7-type-guards)
8. [Discriminated Unions](#8-discriminated-unions)
9. [Módulos ES6](#9-módulos-es6)

---

## 1. EVENT LOOP E ASSINCRONIA

### O QUE É O EVENT LOOP?

O Event Loop é o mecanismo que permite ao JavaScript (single-threaded) executar operações não-bloqueantes.

**Por que é importante no FinTrack?**
- Evitar bloquear o servidor durante consultas ao banco de dados
- Processar múltiplas requisições HTTP simultaneamente
- Manter a UI responsiva no frontend

### COMO FUNCIONA

```
┌───────────────────────────┐
│       Call Stack          │  ← Execução síncrona
│                           │
└───────────────────────────┘
             ↓
┌───────────────────────────┐
│       Web APIs            │  ← setTimeout, fetch, etc
│   (Async operations)      │
└───────────────────────────┘
             ↓
┌───────────────────────────┐
│    Callback Queue         │  ← Callbacks aguardando
│      (Task Queue)         │
└───────────────────────────┘
             ↓
┌───────────────────────────┐
│    Microtask Queue        │  ← Promises (prioridade)
│   (Promise callbacks)     │
└───────────────────────────┘
             ↓
    🔄 Event Loop verifica:
    1. Call Stack vazia?
    2. Processa Microtasks
    3. Processa 1 Task
    4. Repete
```

### EXEMPLO PRÁTICO

```typescript
// ❌ ERRO COMUM: Bloquear o Event Loop
function processarTransacoesSync(transactions: Transaction[]) {
  // Loop síncrono que processa 100.000 transações
  // BLOQUEIA todas outras requisições!
  for (let i = 0; i < transactions.length; i++) {
    calculateBalance(transactions[i]); // operação pesada
  }
  return 'Done';
}

// ✅ CORRETO: Não bloquear o Event Loop
async function processarTransacoesAsync(transactions: Transaction[]) {
  // Processa em lotes, permitindo outras operações
  const BATCH_SIZE = 1000;

  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE);

    // Processa lote
    await Promise.all(batch.map(t => calculateBalance(t)));

    // ⚡ Aqui o Event Loop pode processar outras requisições!
    // setImmediate ou await Promise.resolve() libera o loop
    await new Promise(resolve => setImmediate(resolve));
  }

  return 'Done';
}
```

### ORDEM DE EXECUÇÃO

```typescript
console.log('1'); // Síncrono - executa imediatamente

setTimeout(() => {
  console.log('2'); // Task Queue - executa por último
}, 0);

Promise.resolve().then(() => {
  console.log('3'); // Microtask Queue - executa antes das Tasks
});

console.log('4'); // Síncrono - executa imediatamente

// Saída: 1, 4, 3, 2
// Por quê?
// 1. Call Stack: console.log('1')
// 2. Call Stack: console.log('4')
// 3. Microtask Queue: Promise callback (console.log('3'))
// 4. Task Queue: setTimeout callback (console.log('2'))
```

### APLICAÇÃO NO FINTRACK

```typescript
// src/routes/transactions.ts

// ✅ BOM: Não bloqueia outras requisições
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    // Operação assíncrona - libera o Event Loop
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.userId },
      take: 50 // Limitar resultados para não bloquear
    });

    res.json(transactions);
  } catch (error) {
    // Tratamento de erro assíncrono
    res.status(500).json({ error: 'Database error' });
  }
});

// ❌ ANTI-PATTERN: CPU-intensive síncrono
router.get('/report', (req: Request, res: Response) => {
  // Esta função bloqueia TODAS outras requisições!
  const report = generateComplexReport(); // 5 segundos de CPU
  res.json(report);
});

// ✅ SOLUÇÃO: Usar Worker Threads (Fase 3) ou quebrar em chunks
router.get('/report', async (req: Request, res: Response) => {
  // Delegar para background job (BullMQ - Fase 3)
  const job = await reportQueue.add('generate-report', {
    userId: req.userId
  });

  res.json({ jobId: job.id, status: 'processing' });
});
```

---

## 2. CLOSURES E ESCOPO

### O QUE SÃO CLOSURES?

Uma closure é quando uma função "lembra" das variáveis do escopo onde foi criada, mesmo após esse escopo ter sido executado.

**Por que é importante?**
- Criar funções factory
- Encapsular dados privados
- Implementar currying e partial application
- Criar callbacks que mantém contexto

### COMO FUNCIONA

```
┌────────────────────────────────────┐
│   Global Scope                     │
│   let globalVar = 'global'         │
│                                    │
│   ┌──────────────────────────────┐ │
│   │  Outer Function Scope        │ │
│   │  let outerVar = 'outer'      │ │
│   │                              │ │
│   │  ┌─────────────────────────┐ │ │
│   │  │ Inner Function Scope    │ │ │
│   │  │ let innerVar = 'inner'  │ │ │
│   │  │                         │ │ │
│   │  │ Pode acessar:           │ │ │
│   │  │ ✅ innerVar             │ │ │
│   │  │ ✅ outerVar (closure!)  │ │ │
│   │  │ ✅ globalVar            │ │ │
│   │  └─────────────────────────┘ │ │
│   └──────────────────────────────┘ │
└────────────────────────────────────┘
```

### EXEMPLO BÁSICO

```typescript
// Factory function usando closure
function createCounter(initialValue: number = 0) {
  // Esta variável fica "privada" graças à closure
  let count = initialValue;

  return {
    increment() {
      count++; // Acessa 'count' do escopo externo
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getCount() {
      return count;
    }
  };
}

const counter1 = createCounter(10);
const counter2 = createCounter(0);

console.log(counter1.increment()); // 11
console.log(counter1.increment()); // 12
console.log(counter2.increment()); // 1

// Cada contador mantém seu próprio 'count' privado!
// counter1.count → undefined (não pode acessar diretamente)
```

### ARMADILHA COMUM: CLOSURES EM LOOPS

```typescript
// ❌ ERRO: Todas closures referenciam o mesmo 'i'
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // Vai imprimir: 3, 3, 3
  }, 100);
}
// Por quê? 'var' tem function scope, não block scope
// Quando o setTimeout executa, o loop já terminou (i = 3)

// ✅ SOLUÇÃO 1: Usar 'let' (block scope)
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // Vai imprimir: 0, 1, 2
  }, 100);
}
// Cada iteração tem seu próprio 'i' no block scope

// ✅ SOLUÇÃO 2: IIFE (Immediately Invoked Function Expression)
for (var i = 0; i < 3; i++) {
  (function(capturedI) {
    setTimeout(() => {
      console.log(capturedI); // 0, 1, 2
    }, 100);
  })(i); // Passa 'i' como argumento, criando nova closure
}
```

### APLICAÇÃO NO FINTRACK

```typescript
// src/middlewares/rateLimiter.ts

// ✅ Usar closure para criar rate limiters configuráveis
function createRateLimiter(maxRequests: number, windowMs: number) {
  // Map privado mantido pela closure
  const requests = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();

    // Pega requisições anteriores deste IP
    const userRequests = requests.get(key) || [];

    // Remove requisições antigas (fora da janela)
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < windowMs
    );

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      });
    }

    // Adiciona requisição atual
    validRequests.push(now);
    requests.set(key, validRequests);

    next();
  };
}

// Criar diferentes limitadores
const authLimiter = createRateLimiter(5, 15 * 60 * 1000);  // 5 req / 15min
const apiLimiter = createRateLimiter(100, 60 * 1000);       // 100 req / 1min

// Cada um mantém seu próprio Map de requests via closure!
router.post('/auth/login', authLimiter, loginController);
router.use('/api', apiLimiter);
```

```typescript
// src/utils/createLogger.ts

// ✅ Logger configurável com closure
function createLogger(serviceName: string) {
  // Configuração privada
  const config = {
    service: serviceName,
    environment: process.env.NODE_ENV
  };

  return {
    info(message: string, metadata?: object) {
      console.log(JSON.stringify({
        level: 'info',
        service: config.service, // Acesso via closure
        env: config.environment,
        message,
        ...metadata,
        timestamp: new Date().toISOString()
      }));
    },

    error(message: string, error?: Error) {
      console.error(JSON.stringify({
        level: 'error',
        service: config.service,
        env: config.environment,
        message,
        stack: error?.stack,
        timestamp: new Date().toISOString()
      }));
    }
  };
}

// Cada módulo tem seu próprio logger
const authLogger = createLogger('AuthService');
const txLogger = createLogger('TransactionService');

authLogger.info('User logged in', { userId: 123 });
// { level: 'info', service: 'AuthService', ... }

txLogger.info('Transaction created', { txId: 456 });
// { level: 'info', service: 'TransactionService', ... }
```

---

## 3. THIS BINDING

### O QUE É THIS?

`this` é uma referência ao contexto de execução da função. Seu valor depende de **COMO** a função foi chamada, não onde foi declarada.

**Por que é importante?**
- Entender comportamento de métodos
- Evitar bugs em callbacks
- Usar corretamente em classes
- Trabalhar com event handlers

### 4 REGRAS DE THIS BINDING

```typescript
// 1️⃣ DEFAULT BINDING (chamada simples)
function showThis() {
  console.log(this); // undefined (strict mode) ou window/global
}
showThis(); // Chamada direta

// 2️⃣ IMPLICIT BINDING (método de objeto)
const user = {
  name: 'Alice',
  greet() {
    console.log(this.name); // 'this' é o objeto 'user'
  }
};
user.greet(); // Alice

// ❌ ARMADILHA: Perder binding implícito
const greetFunction = user.greet;
greetFunction(); // undefined! (this não é mais 'user')

// 3️⃣ EXPLICIT BINDING (call, apply, bind)
const user2 = { name: 'Bob' };
user.greet.call(user2); // Bob (força 'this' = user2)

// 4️⃣ NEW BINDING (constructor)
class User {
  constructor(public name: string) {
    // 'this' é a nova instância sendo criada
  }
}
const alice = new User('Alice'); // 'this' dentro do constructor é 'alice'
```

### ARROW FUNCTIONS E THIS LÉXICO

```typescript
// ⚡ DIFERENÇA FUNDAMENTAL:
// Arrow functions NÃO têm seu próprio 'this'
// Elas capturam 'this' do escopo onde foram DECLARADAS (this léxico)

const user = {
  name: 'Alice',

  // ❌ Método regular: 'this' dinâmico
  greetRegular: function() {
    setTimeout(function() {
      console.log(this.name); // undefined! (this = Timeout context)
    }, 100);
  },

  // ✅ Arrow function: 'this' léxico
  greetArrow: function() {
    setTimeout(() => {
      console.log(this.name); // Alice! (this = user)
    }, 100);
  }
};

user.greetRegular(); // undefined
user.greetArrow();   // Alice
```

### APLICAÇÃO NO FINTRACK

```typescript
// src/controllers/transactionController.ts

// ✅ BOM: Arrow functions em Express mantêm contexto
class TransactionController {
  constructor(private transactionService: TransactionService) {}

  // Arrow function: 'this' sempre será a instância de TransactionController
  create = async (req: Request, res: Response) => {
    try {
      // 'this' é sempre a instância, mesmo quando passado como callback!
      const transaction = await this.transactionService.create(req.body);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  // ❌ MÉTODO REGULAR: perderia 'this' quando usado como callback
  // createRegular(req: Request, res: Response) {
  //   this.transactionService... // ❌ 'this' seria undefined!
  // }
}

const controller = new TransactionController(transactionService);

// Passa o método como callback - arrow function mantém 'this'
router.post('/transactions', controller.create);
// Se fosse método regular, precisaríamos: controller.createRegular.bind(controller)
```

```typescript
// src/components/TransactionForm.tsx (React)

// ✅ REACT: Arrow functions em event handlers
class TransactionForm extends React.Component {
  state = { amount: 0 };

  // Arrow function: 'this' sempre será a instância do componente
  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(this.state.amount); // ✅ 'this' é o componente
  };

  // ❌ SE FOSSE MÉTODO REGULAR:
  // handleSubmitRegular(e: React.FormEvent) {
  //   console.log(this.state); // ❌ 'this' seria undefined!
  // }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        {/* Arrow function mantém 'this' automaticamente */}
      </form>

      {/* SE FOSSE MÉTODO REGULAR, precisaria bind:
      <form onSubmit={this.handleSubmitRegular.bind(this)}>
      */}
    );
  }
}
```

```typescript
// ✅ FUNCTIONAL COMPONENTS: Não há 'this'!
function TransactionForm() {
  const [amount, setAmount] = useState(0);

  // Sem 'this' - apenas closures!
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(amount); // Acessa via closure, não via 'this'
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
// Preferir functional components evita problemas com 'this'
```

---

## 4. PROMISES E ASYNC/AWAIT

### O QUE SÃO PROMISES?

Promises são objetos que representam a eventual conclusão (ou falha) de uma operação assíncrona.

**Estados de uma Promise:**
```
┌─────────────┐
│   PENDING   │  ← Estado inicial
│  (aguardando)│
└──────┬──────┘
       │
       ├─────────────┐
       ▼             ▼
┌─────────────┐  ┌─────────────┐
│  FULFILLED  │  │  REJECTED   │
│  (sucesso)  │  │   (erro)    │
└─────────────┘  └─────────────┘
```

### CRIANDO PROMISES

```typescript
// Promise básica
const delay = (ms: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (ms < 0) {
      reject(new Error('Delay deve ser positivo'));
    } else {
      setTimeout(() => resolve(), ms);
    }
  });
};

// Usando
delay(1000)
  .then(() => console.log('1 segundo passou'))
  .catch(error => console.error(error));
```

### ASYNC/AWAIT: SINTAXE SIMPLIFICADA

```typescript
// ❌ PROMISE HELL (callback hell modernizado)
function fetchUserData(userId: number) {
  return fetchUser(userId)
    .then(user => {
      return fetchTransactions(user.id)
        .then(transactions => {
          return fetchCategories(user.id)
            .then(categories => {
              return { user, transactions, categories };
            });
        });
    });
}

// ✅ ASYNC/AWAIT: Código síncrono-like
async function fetchUserData(userId: number) {
  const user = await fetchUser(userId);
  const transactions = await fetchTransactions(user.id);
  const categories = await fetchCategories(user.id);

  return { user, transactions, categories };
}
// Muito mais legível!
```

### PARALLEL VS SEQUENTIAL

```typescript
// ❌ SEQUENTIAL: Espera cada operação terminar (lento)
async function fetchDataSequential() {
  const users = await fetchUsers();        // 1 segundo
  const transactions = await fetchTransactions(); // 1 segundo
  const categories = await fetchCategories();    // 1 segundo

  return { users, transactions, categories };
  // Total: 3 segundos
}

// ✅ PARALLEL: Executa simultaneamente (rápido)
async function fetchDataParallel() {
  const [users, transactions, categories] = await Promise.all([
    fetchUsers(),
    fetchTransactions(),
    fetchCategories()
  ]);

  return { users, transactions, categories };
  // Total: 1 segundo (todas ao mesmo tempo)
}
```

### ERROR HANDLING

```typescript
// ✅ TRY/CATCH com async/await
async function createTransaction(data: TransactionInput) {
  try {
    // Validação
    if (!data.amount || data.amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Operação assíncrona
    const transaction = await prisma.transaction.create({ data });

    return transaction;
  } catch (error) {
    // Tratamento de erro centralizado
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Erro do banco
      throw new Error(`Database error: ${error.message}`);
    }

    // Re-throw outros erros
    throw error;
  }
}

// ✅ PROMISE.CATCH
createTransaction(data)
  .then(tx => console.log('Created:', tx))
  .catch(error => console.error('Failed:', error));
```

### PROMISE COMBINATORS

```typescript
// Promise.all() - Espera TODAS completarem
// Se UMA falhar, rejeita imediatamente
const [user, txs] = await Promise.all([
  fetchUser(id),
  fetchTransactions(id)
]);

// Promise.allSettled() - Espera TODAS, mesmo que falhem
// Retorna array com { status: 'fulfilled' | 'rejected', value ou reason }
const results = await Promise.allSettled([
  fetchUser(id),      // pode falhar
  fetchTransactions(id), // pode falhar
  fetchCategories(id)    // pode falhar
]);

results.forEach(result => {
  if (result.status === 'fulfilled') {
    console.log('Success:', result.value);
  } else {
    console.log('Error:', result.reason);
  }
});

// Promise.race() - Retorna a PRIMEIRA a completar (resolve ou reject)
const fastest = await Promise.race([
  fetchFromCache(id),     // rápido
  fetchFromDatabase(id)   // lento
]);

// Promise.any() - Retorna a PRIMEIRA a RESOLVER
// Só rejeita se TODAS rejeitarem
const firstSuccess = await Promise.any([
  fetchFromServer1(id),  // pode falhar
  fetchFromServer2(id),  // pode falhar
  fetchFromServer3(id)   // pode falhar
]);
```

### APLICAÇÃO NO FINTRACK

```typescript
// src/services/dashboardService.ts

// ✅ Dashboard: Buscar dados em paralelo
async function getDashboardData(userId: number) {
  try {
    // Executa 4 queries simultaneamente (muito mais rápido!)
    const [balance, recentTxs, monthlyStats, categories] = await Promise.all([
      // 1. Saldo atual
      prisma.transaction.aggregate({
        where: { userId },
        _sum: { amount: true }
      }),

      // 2. Últimas 10 transações
      prisma.transaction.findMany({
        where: { userId },
        take: 10,
        orderBy: { date: 'desc' }
      }),

      // 3. Estatísticas do mês
      prisma.transaction.groupBy({
        by: ['type'],
        where: {
          userId,
          date: { gte: startOfMonth() }
        },
        _sum: { amount: true }
      }),

      // 4. Categorias com totais
      prisma.category.findMany({
        where: { userId },
        include: {
          _count: { select: { transactions: true } }
        }
      })
    ]);

    return {
      balance: balance._sum.amount || 0,
      recentTransactions: recentTxs,
      monthlyIncome: monthlyStats.find(s => s.type === 'INCOME')?._sum.amount || 0,
      monthlyExpense: monthlyStats.find(s => s.type === 'EXPENSE')?._sum.amount || 0,
      categories
    };
  } catch (error) {
    throw new Error('Failed to load dashboard data');
  }
}
```

```typescript
// src/services/transactionService.ts

// ✅ Criar transação com validações paralelas
async function createTransaction(userId: number, data: TransactionInput) {
  try {
    // Validar conta e categoria em paralelo
    const [account, category] = await Promise.all([
      prisma.account.findUnique({
        where: { id: data.accountId, userId }
      }),

      prisma.category.findUnique({
        where: { id: data.categoryId, userId }
      })
    ]);

    // Validações
    if (!account) throw new Error('Account not found');
    if (!category) throw new Error('Category not found');

    // Criar transação
    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        userId
      }
    });

    return transaction;
  } catch (error) {
    // Log de erro
    console.error('Transaction creation failed:', error);
    throw error;
  }
}
```

```typescript
// src/utils/retry.ts

// ✅ Utility: Retry com exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn(); // Tenta executar
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        // Espera antes de tentar novamente (exponential backoff)
        const delay = delayMs * Math.pow(2, attempt);
        console.log(`Retry ${attempt + 1}/${maxRetries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!; // Falhou após todas tentativas
}

// Usar
const data = await retryWithBackoff(
  () => fetch('https://api.example.com/data').then(r => r.json()),
  3,  // 3 tentativas
  1000 // 1s, 2s, 4s
);
```

---

## 5. TYPESCRIPT GENERICS

### O QUE SÃO GENERICS?

Generics permitem criar componentes reutilizáveis que funcionam com múltiplos tipos, mantendo type safety.

**Por que usar?**
- Reutilização de código sem perder tipagem
- Funções e classes que funcionam com vários tipos
- Type safety em estruturas de dados genéricas

### SINTAXE BÁSICA

```typescript
// Sem generics: funções duplicadas
function getFirstNumber(arr: number[]): number {
  return arr[0];
}

function getFirstString(arr: string[]): string {
  return arr[0];
}

// ✅ Com generics: uma função para todos os tipos
function getFirst<T>(arr: T[]): T {
  return arr[0];
}

// Uso
const num = getFirst([1, 2, 3]);      // T = number
const str = getFirst(['a', 'b', 'c']); // T = string

// TypeScript infere o tipo automaticamente!
```

### MÚLTIPLOS TYPE PARAMETERS

```typescript
// Função com 2 type parameters
function merge<T, U>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

const result = merge(
  { name: 'Alice' },
  { age: 30 }
);
// result: { name: string; age: number }
```

### CONSTRAINTS (RESTRIÇÕES)

```typescript
// ✅ Constraint: T deve ter propriedade 'id'
interface HasId {
  id: number;
}

function printId<T extends HasId>(item: T): void {
  console.log(item.id); // Seguro! TypeScript sabe que T tem 'id'
}

printId({ id: 1, name: 'Alice' }); // ✅ OK
// printId({ name: 'Bob' });       // ❌ Erro: falta 'id'
```

### APLICAÇÃO NO FINTRACK

```typescript
// src/types/api.ts

// ✅ Resposta genérica de API
interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

// Uso tipado
const txResponse: ApiResponse<Transaction> = {
  data: { id: 1, amount: 100, type: 'INCOME' },
  status: 'success'
};

const txsResponse: ApiResponse<Transaction[]> = {
  data: [/* ... */],
  status: 'success'
};
```

```typescript
// src/types/paginated.ts

// ✅ Paginação genérica
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

// Uso
const txs: PaginatedResponse<Transaction> = {
  data: [/* transactions */],
  pagination: { page: 1, perPage: 50, total: 200, totalPages: 4 }
};
```

```typescript
// src/repositories/baseRepository.ts

// ✅ Repository genérico
class BaseRepository<T extends { id: number }> {
  constructor(private model: any) {} // Prisma model

  async findById(id: number): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  async findAll(): Promise<T[]> {
    return this.model.findMany();
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    return this.model.create({ data });
  }

  async delete(id: number): Promise<void> {
    await this.model.delete({ where: { id } });
  }
}

// Uso tipado
const transactionRepo = new BaseRepository<Transaction>(prisma.transaction);
const accountRepo = new BaseRepository<Account>(prisma.account);

// TypeScript sabe o tipo de retorno!
const tx = await transactionRepo.findById(1); // tx: Transaction | null
```

```typescript
// src/utils/Result.ts

// ✅ Result type (Railway Oriented Programming)
type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

// Funções retornam Result ao invés de throw
async function createTransaction(data: TransactionInput): Promise<Result<Transaction>> {
  try {
    const tx = await prisma.transaction.create({ data });
    return { success: true, value: tx };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// Uso
const result = await createTransaction(data);

if (result.success) {
  console.log('Created:', result.value); // TypeScript sabe que é Transaction
} else {
  console.error('Error:', result.error); // TypeScript sabe que é Error
}
```

---

## 6. UTILITY TYPES

TypeScript fornece tipos utilitários built-in para transformar tipos existentes.

### PARTIAL<T>

Torna todas propriedades opcionais.

```typescript
interface Transaction {
  id: number;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description: string;
}

// Update pode ter apenas alguns campos
function updateTransaction(id: number, data: Partial<Transaction>) {
  // data pode ser: { amount: 100 } ou { description: 'test' }
}

updateTransaction(1, { amount: 150 }); // ✅ OK
updateTransaction(1, { description: 'Updated' }); // ✅ OK
```

### REQUIRED<T>

Torna todas propriedades obrigatórias (oposto de Partial).

```typescript
interface TransactionInput {
  amount?: number;
  description?: string;
}

// Forçar todos campos obrigatórios
type FullTransaction = Required<TransactionInput>;
// { amount: number; description: string } (sem ?)
```

### PICK<T, K>

Seleciona apenas algumas propriedades.

```typescript
interface Transaction {
  id: number;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  date: Date;
  userId: number;
}

// Selecionar apenas campos para listagem
type TransactionListItem = Pick<Transaction, 'id' | 'amount' | 'description'>;
// { id: number; amount: number; description: string }
```

### OMIT<T, K>

Remove propriedades especificadas.

```typescript
// Remover 'id' ao criar (auto-generated)
type TransactionInput = Omit<Transaction, 'id'>;
// { amount, type, description, date, userId }

function createTransaction(data: TransactionInput) {
  // Não precisa passar 'id' - será gerado
}
```

### RECORD<K, T>

Cria objeto com chaves específicas e valores de um tipo.

```typescript
// Mapear tipos de transação para ícones
type TransactionIcons = Record<'INCOME' | 'EXPENSE', string>;

const icons: TransactionIcons = {
  INCOME: '💰',
  EXPENSE: '💸'
};

// TypeScript garante que todos tipos tenham ícone!
// Faltou 'INCOME'? ❌ Erro de compilação
```

### RETURNTYPE<T>

Extrai o tipo de retorno de uma função.

```typescript
function getTransactions() {
  return prisma.transaction.findMany();
}

// Extrair tipo de retorno
type Transactions = ReturnType<typeof getTransactions>;
// Promise<Transaction[]>
```

### APLICAÇÃO NO FINTRACK

```typescript
// src/types/dto.ts

// ✅ DTOs usando utility types
import { Transaction, User } from '@prisma/client';

// Response sem campos sensíveis
export type UserPublic = Omit<User, 'password' | 'refreshToken'>;

// Create input (sem auto-generated)
export type TransactionCreate = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;

// Update input (campos opcionais)
export type TransactionUpdate = Partial<TransactionCreate>;

// List item (campos resumidos)
export type TransactionListItem = Pick<
  Transaction,
  'id' | 'amount' | 'description' | 'date' | 'type'
>;

// Filtros
export type TransactionFilters = Partial<{
  type: Transaction['type'];
  categoryId: number;
  accountId: number;
  dateFrom: Date;
  dateTo: Date;
}>;
```

```typescript
// src/controllers/transactionController.ts

// ✅ Controller com DTOs tipados
class TransactionController {
  async create(req: Request, res: Response) {
    const data: TransactionCreate = req.body;
    // TypeScript valida que 'data' tem campos corretos (sem 'id')

    const transaction = await transactionService.create(data);
    res.status(201).json(transaction);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data: TransactionUpdate = req.body;
    // 'data' pode ter qualquer combinação de campos (Partial)

    const transaction = await transactionService.update(Number(id), data);
    res.json(transaction);
  }

  async list(req: Request, res: Response) {
    const filters: TransactionFilters = req.query;
    // 'filters' é tipado mas todos campos opcionais

    const transactions: TransactionListItem[] =
      await transactionService.findAll(filters);

    res.json(transactions);
  }
}
```

---

## 7. TYPE GUARDS

### O QUE SÃO TYPE GUARDS?

Type guards são funções/expressões que permitem narrowing (estreitar) de tipos em runtime.

**Por que usar?**
- Refinar tipos de union types
- Validar tipos em runtime
- Type safety em código JavaScript dinâmico

### TYPEOF (primitivos)

```typescript
function processValue(value: string | number) {
  if (typeof value === 'string') {
    // TypeScript sabe que aqui é string
    console.log(value.toUpperCase()); // ✅ OK
  } else {
    // TypeScript sabe que aqui é number
    console.log(value.toFixed(2)); // ✅ OK
  }
}
```

### INSTANCEOF (classes)

```typescript
class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

function handleError(error: Error | ApiError) {
  if (error instanceof ApiError) {
    // TypeScript sabe que aqui é ApiError
    console.log(`Status: ${error.statusCode}`); // ✅ OK
  } else {
    console.log(`Error: ${error.message}`);
  }
}
```

### USER-DEFINED TYPE GUARDS

```typescript
// ✅ Type predicate: 'is' keyword
interface Transaction {
  id: number;
  amount: number;
}

interface User {
  id: number;
  name: string;
}

// Type guard customizado
function isTransaction(value: Transaction | User): value is Transaction {
  return 'amount' in value; // Verifica se tem propriedade 'amount'
}

function process(item: Transaction | User) {
  if (isTransaction(item)) {
    // TypeScript sabe que é Transaction
    console.log(item.amount); // ✅ OK
  } else {
    // TypeScript sabe que é User
    console.log(item.name); // ✅ OK
  }
}
```

### IN OPERATOR

```typescript
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; size: number };

function getArea(shape: Shape): number {
  if ('radius' in shape) {
    // TypeScript sabe que é circle
    return Math.PI * shape.radius ** 2;
  } else {
    // TypeScript sabe que é square
    return shape.size ** 2;
  }
}
```

### APLICAÇÃO NO FINTRACK

```typescript
// src/middlewares/errorHandler.ts

// ✅ Error handling com type guards
import { Prisma } from '@prisma/client';

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}

// Type guards
function isPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

// Error handler middleware
function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Type guard: Prisma errors
  if (isPrismaError(error)) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Duplicate entry',
        field: error.meta?.target
      });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Record not found'
      });
    }
  }

  // Type guard: API errors
  if (isApiError(error)) {
    return res.status(error.statusCode).json({
      error: error.message
    });
  }

  // Default error
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
}
```

```typescript
// src/utils/validation.ts

// ✅ Validação com type guards
function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && value > 0;
}

function isValidTransactionType(value: unknown): value is 'INCOME' | 'EXPENSE' {
  return value === 'INCOME' || value === 'EXPENSE';
}

// Usar em validação
function validateTransaction(data: unknown) {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid data');
  }

  const { amount, type } = data as any;

  if (!isPositiveNumber(amount)) {
    throw new Error('Amount must be positive number');
  }

  if (!isValidTransactionType(type)) {
    throw new Error('Type must be INCOME or EXPENSE');
  }

  // TypeScript sabe os tipos aqui!
  return { amount, type }; // { amount: number; type: 'INCOME' | 'EXPENSE' }
}
```

---

## 8. DISCRIMINATED UNIONS

### O QUE SÃO?

Union types com propriedade comum (discriminant) que permite type narrowing automático.

**Por que usar?**
- Modelar estados mutuamente exclusivos
- Pattern matching type-safe
- Evitar invalid states

### EXEMPLO BÁSICO

```typescript
// ✅ Discriminated Union com 'kind' como discriminant
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; size: number }
  | { kind: 'rectangle'; width: number; height: number };

function getArea(shape: Shape): number {
  // TypeScript faz type narrowing automático baseado em 'kind'
  switch (shape.kind) {
    case 'circle':
      // TypeScript sabe que aqui é { kind: 'circle'; radius: number }
      return Math.PI * shape.radius ** 2;

    case 'square':
      // TypeScript sabe que aqui é { kind: 'square'; size: number }
      return shape.size ** 2;

    case 'rectangle':
      // TypeScript sabe que aqui é { kind: 'rectangle'; width, height }
      return shape.width * shape.height;
  }
}
```

### MODELAR ESTADOS

```typescript
// ✅ Estados de loading com discriminated union
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function TransactionList() {
  const [state, setState] = useState<AsyncState<Transaction[]>>({
    status: 'idle'
  });

  // TypeScript garante que só acessa 'data' quando status='success'
  if (state.status === 'loading') {
    return <div>Loading...</div>;
  }

  if (state.status === 'error') {
    // TypeScript sabe que 'error' existe aqui
    return <div>Error: {state.error.message}</div>;
  }

  if (state.status === 'success') {
    // TypeScript sabe que 'data' existe aqui
    return <ul>{state.data.map(tx => <li key={tx.id}>{tx.description}</li>)}</ul>;
  }

  return null; // idle
}
```

### APLICAÇÃO NO FINTRACK

```typescript
// src/types/apiResponse.ts

// ✅ API Response como discriminated union
type ApiResponse<T> =
  | {
      status: 'success';
      data: T;
    }
  | {
      status: 'error';
      error: {
        message: string;
        code?: string;
        statusCode: number;
      };
    };

// Função de fetch tipada
async function fetchTransactions(): Promise<ApiResponse<Transaction[]>> {
  try {
    const response = await fetch('/api/transactions');

    if (!response.ok) {
      return {
        status: 'error',
        error: {
          message: 'Failed to fetch',
          statusCode: response.status
        }
      };
    }

    const data = await response.json();
    return {
      status: 'success',
      data
    };
  } catch (error) {
    return {
      status: 'error',
      error: {
        message: (error as Error).message,
        statusCode: 500
      }
    };
  }
}

// Uso
const response = await fetchTransactions();

if (response.status === 'success') {
  // TypeScript sabe que 'data' existe
  console.log(response.data); // Transaction[]
} else {
  // TypeScript sabe que 'error' existe
  console.error(response.error.message);
}
```

```typescript
// src/types/transaction.ts

// ✅ Transaction types como discriminated union
type TransactionBase = {
  id: number;
  amount: number;
  description: string;
  date: Date;
};

type IncomeTransaction = TransactionBase & {
  type: 'INCOME';
  source: string; // Campo específico de income
};

type ExpenseTransaction = TransactionBase & {
  type: 'EXPENSE';
  categoryId: number; // Campo específico de expense
  isRecurring: boolean;
};

type Transaction = IncomeTransaction | ExpenseTransaction;

// Função que usa discriminated union
function formatTransaction(tx: Transaction): string {
  const baseInfo = `${tx.description}: $${tx.amount}`;

  if (tx.type === 'INCOME') {
    // TypeScript sabe que 'source' existe
    return `${baseInfo} from ${tx.source}`;
  } else {
    // TypeScript sabe que 'categoryId' e 'isRecurring' existem
    return `${baseInfo} (Category: ${tx.categoryId}, Recurring: ${tx.isRecurring})`;
  }
}
```

---

## 9. MÓDULOS ES6

### O QUE SÃO MÓDULOS?

Módulos ES6 permitem organizar código em arquivos separados com imports/exports explícitos.

**Por que usar?**
- Organização e encapsulamento
- Reutilização de código
- Tree-shaking (remover código não usado)
- Dependency management claro

### EXPORTS

```typescript
// utils/math.ts

// Named exports
export function add(a: number, b: number): number {
  return a + b;
}

export const PI = 3.14159;

export class Calculator {
  multiply(a: number, b: number) {
    return a * b;
  }
}

// Default export (um por arquivo)
export default class MathUtils {
  static sum(...numbers: number[]): number {
    return numbers.reduce((acc, n) => acc + n, 0);
  }
}
```

### IMPORTS

```typescript
// main.ts

// Import default
import MathUtils from './utils/math';

// Import named
import { add, PI, Calculator } from './utils/math';

// Import tudo
import * as MathModule from './utils/math';

// Import com alias
import { add as sum } from './utils/math';

// Uso
console.log(add(1, 2));           // 3
console.log(PI);                  // 3.14159
console.log(MathUtils.sum(1,2,3)); // 6
console.log(sum(5, 5));           // 10 (alias)
```

### RE-EXPORTS

```typescript
// utils/index.ts (barrel export)

// Re-exportar tudo de vários arquivos
export * from './math';
export * from './string';
export * from './date';

// main.ts pode importar tudo de um lugar só
import { add, capitalize, formatDate } from './utils';
```

### APLICAÇÃO NO FINTRACK

```typescript
// src/types/index.ts

// ✅ Barrel export para types
export * from './transaction';
export * from './user';
export * from './account';
export * from './category';

// Uso
import { Transaction, User, Account, Category } from './types';
```

```typescript
// src/controllers/index.ts

// ✅ Export de controllers
export { default as authController } from './authController';
export { default as transactionController } from './transactionController';
export { default as accountController } from './accountController';

// src/routes/index.ts
import { authController, transactionController } from './controllers';
```

```typescript
// src/config/index.ts

// ✅ Configuração centralizada
export const config = {
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL!
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: '15m'
  }
} as const; // 'as const' para tipos literais

// Uso
import { config } from './config';
console.log(config.port); // TypeScript sabe que é number | string
```

---

## 🎯 CHECKLIST DE DOMÍNIO

Marque conforme dominar cada conceito:

- [ ] Event Loop
  - [ ] Entendo como funciona o Event Loop
  - [ ] Sei diferenciar Microtasks de Tasks
  - [ ] Evito bloquear o Event Loop em código assíncrono

- [ ] Closures
  - [ ] Entendo como closures funcionam
  - [ ] Uso closures para criar funções factory
  - [ ] Evito armadilhas comuns (loops com var)

- [ ] This Binding
  - [ ] Conheço as 4 regras de this binding
  - [ ] Entendo diferença entre arrow functions e funções regulares
  - [ ] Uso arrow functions em callbacks/event handlers

- [ ] Promises e Async/Await
  - [ ] Entendo estados de Promises (pending, fulfilled, rejected)
  - [ ] Uso async/await ao invés de .then()
  - [ ] Sei quando usar Promise.all vs execução sequencial
  - [ ] Trato erros com try/catch

- [ ] TypeScript Generics
  - [ ] Entendo sintaxe básica de generics
  - [ ] Uso constraints quando necessário
  - [ ] Crio funções/classes genéricas reutilizáveis

- [ ] Utility Types
  - [ ] Uso Partial/Required
  - [ ] Uso Pick/Omit
  - [ ] Uso Record
  - [ ] Uso ReturnType quando apropriado

- [ ] Type Guards
  - [ ] Uso typeof e instanceof
  - [ ] Crio type guards customizados com 'is'
  - [ ] Uso 'in' operator para discriminar types

- [ ] Discriminated Unions
  - [ ] Modelo estados com discriminated unions
  - [ ] Uso type narrowing automático
  - [ ] Evito invalid states

- [ ] Módulos ES6
  - [ ] Uso import/export corretamente
  - [ ] Organizo código em módulos
  - [ ] Uso barrel exports

---

## 📚 PRÓXIMOS PASSOS

Agora que domina JavaScript e TypeScript avançado, prossiga para:

👉 **[Módulo 2: HTTP e Web](./modulo-02-http-web.md)**
- Protocolo HTTP
- CORS
- Cookies vs LocalStorage

---

**Última atualização**: Fevereiro 2026
**Status**: ✅ Completo
