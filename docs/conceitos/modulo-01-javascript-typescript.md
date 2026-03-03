# 📘 MÓDULO 1: JavaScript e TypeScript

## 🎯 OBJETIVO

Dominar os fundamentos avançados de JavaScript e TypeScript necessários para desenvolvimento profissional full-stack.

**Tempo estimado**: 8-12 horas de estudo
**Pré-requisitos**: Conhecimento básico de JavaScript

---

## 📑 ÍNDICE

1. [Event Loop e Assincronia](#1-event-loop-e-assincronia)
2. [Estruturas de Dados em JavaScript](#2-estruturas-de-dados-em-javascript)
3. [Closures e Escopo](#3-closures-e-escopo)
4. [This Binding](#4-this-binding)
5. [Promises e Async/Await](#5-promises-e-asyncawait)
6. [TypeScript Generics](#6-typescript-generics)
7. [Utility Types](#7-utility-types)
8. [Type Guards](#8-type-guards)
9. [Discriminated Unions](#9-discriminated-unions)
10. [Módulos ES6](#10-módulos-es6)
11. [Programação Orientada a Objetos (POO)](#11-programação-orientada-a-objetos-poo)

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

## 2. ESTRUTURAS DE DADOS EM JAVASCRIPT

### POR QUE DOMINAR ESTRUTURAS DE DADOS?

Escolher a estrutura de dados correta impacta:
- ✅ **Performance**: Operações mais rápidas
- ✅ **Legibilidade**: Código mais claro
- ✅ **Manutenibilidade**: Menos bugs

**No FinTrack:**
- Arrays para listas de transações
- Objects para dados estruturados (usuário, transação)
- Maps para cache de dados
- Sets para tags únicas

```
┌────────────────────────────────────────────────┐
│  ESTRUTURAS DE DADOS EM JAVASCRIPT             │
├────────────────────────────────────────────────┤
│  1. ARRAY    - Lista ordenada                  │
│  2. OBJECT   - Coleção de chave-valor          │
│  3. MAP      - Chave-valor com qualquer tipo   │
│  4. SET      - Valores únicos                  │
└────────────────────────────────────────────────┘
```

---

### 1. ARRAYS

#### O QUE SÃO ARRAYS?

Arrays são **listas ordenadas** de valores. Cada elemento tem um **índice numérico** começando em 0.

```typescript
// Criar arrays
const transactions: Transaction[] = [];
const numbers = [1, 2, 3, 4, 5];
const mixed = [1, 'text', true, { id: 1 }]; // Tipos mistos (evitar)
```

---

#### ACESSAR ELEMENTOS

```typescript
const fruits = ['apple', 'banana', 'orange'];

// Acesso por índice
console.log(fruits[0]);  // 'apple'
console.log(fruits[1]);  // 'banana'
console.log(fruits[2]);  // 'orange'
console.log(fruits[3]);  // undefined (não existe)

// Último elemento
console.log(fruits[fruits.length - 1]);  // 'orange'
console.log(fruits.at(-1));  // 'orange' (ES2022)

// Primeiro elemento
console.log(fruits[0]);
console.log(fruits.at(0));
```

---

#### MÉTODOS MAIS USADOS

**1. ADICIONAR/REMOVER ELEMENTOS**

```typescript
const transactions: Transaction[] = [];

// ✅ push() - adicionar no final
transactions.push(transaction1);
transactions.push(transaction2, transaction3); // Múltiplos
console.log(transactions.length); // 3

// ✅ unshift() - adicionar no início
transactions.unshift(transaction0);

// ✅ pop() - remover do final
const last = transactions.pop();

// ✅ shift() - remover do início
const first = transactions.shift();

// ✅ splice() - adicionar/remover em qualquer posição
transactions.splice(1, 0, newTransaction); // Inserir na posição 1
transactions.splice(2, 1); // Remover 1 elemento da posição 2
transactions.splice(1, 1, replacement); // Substituir posição 1
```

**2. BUSCAR ELEMENTOS**

```typescript
const transactions = [
  { id: 1, amount: 100, type: 'income' },
  { id: 2, amount: 50, type: 'expense' },
  { id: 3, amount: 200, type: 'income' }
];

// ✅ find() - primeiro elemento que atende condição
const found = transactions.find(t => t.id === 2);
// { id: 2, amount: 50, type: 'expense' }

// ✅ findIndex() - índice do elemento
const index = transactions.findIndex(t => t.id === 2);
// 1

// ✅ filter() - todos elementos que atendem condição
const incomes = transactions.filter(t => t.type === 'income');
// [{ id: 1, ... }, { id: 3, ... }]

// ✅ includes() - verifica se existe
const hasExpense = transactions.some(t => t.type === 'expense');
// true

// ✅ indexOf() - índice de valor primitivo
const numbers = [1, 2, 3, 4, 5];
const idx = numbers.indexOf(3); // 2
```

**3. TRANSFORMAR ARRAYS**

```typescript
const transactions = [
  { id: 1, amount: 100 },
  { id: 2, amount: 50 },
  { id: 3, amount: 200 }
];

// ✅ map() - transformar cada elemento (retorna novo array)
const amounts = transactions.map(t => t.amount);
// [100, 50, 200]

const formatted = transactions.map(t => ({
  ...t,
  amountFormatted: `R$ ${t.amount.toFixed(2)}`
}));

// ✅ reduce() - reduzir a um único valor
const total = transactions.reduce((sum, t) => sum + t.amount, 0);
// 350

const grouped = transactions.reduce((acc, t) => {
  acc[t.type] = acc[t.type] || [];
  acc[t.type].push(t);
  return acc;
}, {} as Record<string, Transaction[]>);
// { income: [...], expense: [...] }

// ✅ flat() - achatar arrays aninhados
const nested = [[1, 2], [3, 4], [5]];
const flattened = nested.flat(); // [1, 2, 3, 4, 5]

// ✅ flatMap() - map + flat
const users = [
  { name: 'Alice', transactions: [1, 2] },
  { name: 'Bob', transactions: [3, 4] }
];
const allTransactionIds = users.flatMap(u => u.transactions);
// [1, 2, 3, 4]
```

**4. ORDENAR E REVERTER**

```typescript
const transactions = [
  { id: 1, amount: 100, date: new Date('2025-01-15') },
  { id: 2, amount: 50, date: new Date('2025-01-10') },
  { id: 3, amount: 200, date: new Date('2025-01-20') }
];

// ✅ sort() - ordenar (modifica array original!)
transactions.sort((a, b) => a.amount - b.amount); // Crescente
transactions.sort((a, b) => b.amount - a.amount); // Decrescente

// Ordenar por data
transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

// Ordenar por string
const names = ['Carlos', 'Ana', 'Bruno'];
names.sort(); // ['Ana', 'Bruno', 'Carlos']
names.sort((a, b) => a.localeCompare(b)); // Mais robusto

// ✅ reverse() - inverter ordem (modifica original!)
transactions.reverse();

// ✅ toSorted() / toReversed() - versões que não modificam (ES2023)
const sorted = transactions.toSorted((a, b) => a.amount - b.amount);
```

**5. VERIFICAR CONDIÇÕES**

```typescript
const transactions = [
  { id: 1, amount: 100, type: 'income' },
  { id: 2, amount: 50, type: 'expense' },
  { id: 3, amount: 200, type: 'income' }
];

// ✅ some() - pelo menos um atende condição
const hasExpense = transactions.some(t => t.type === 'expense');
// true

// ✅ every() - todos atendem condição
const allPositive = transactions.every(t => t.amount > 0);
// true

const allIncome = transactions.every(t => t.type === 'income');
// false
```

**6. ITERAR**

```typescript
const transactions = [
  { id: 1, amount: 100 },
  { id: 2, amount: 50 },
  { id: 3, amount: 200 }
];

// ✅ forEach() - executar função para cada elemento (não retorna nada)
transactions.forEach((t, index) => {
  console.log(`Transaction ${index}: ${t.amount}`);
});

// ✅ for...of - loop moderno
for (const transaction of transactions) {
  console.log(transaction.amount);
}

// ✅ for - loop tradicional
for (let i = 0; i < transactions.length; i++) {
  console.log(transactions[i].amount);
}
```

**7. OUTROS ÚTEIS**

```typescript
// ✅ slice() - copiar parte do array (não modifica original)
const transactions = [1, 2, 3, 4, 5];
const first3 = transactions.slice(0, 3); // [1, 2, 3]
const last2 = transactions.slice(-2); // [4, 5]
const copy = transactions.slice(); // cópia completa

// ✅ concat() - juntar arrays
const arr1 = [1, 2];
const arr2 = [3, 4];
const combined = arr1.concat(arr2); // [1, 2, 3, 4]
const combined2 = [...arr1, ...arr2]; // Spread (preferível)

// ✅ join() - converter em string
const tags = ['food', 'lunch', 'restaurant'];
const tagString = tags.join(', '); // 'food, lunch, restaurant'

// ✅ fill() - preencher com valor
const arr = new Array(5).fill(0); // [0, 0, 0, 0, 0]

// ✅ Array.from() - criar array de iterável
const range = Array.from({ length: 5 }, (_, i) => i + 1);
// [1, 2, 3, 4, 5]

const uniqueArray = Array.from(new Set([1, 2, 2, 3]));
// [1, 2, 3]
```

---

#### EXEMPLO FINTRACK: PROCESSAR TRANSAÇÕES

```typescript
// src/utils/transactionUtils.ts

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  tags: string[];
}

const transactions: Transaction[] = [
  { id: '1', amount: 100, type: 'income', category: 'salary', date: new Date('2025-01-15'), tags: ['work'] },
  { id: '2', amount: 50, type: 'expense', category: 'food', date: new Date('2025-01-10'), tags: ['lunch', 'restaurant'] },
  { id: '3', amount: 200, type: 'expense', category: 'shopping', date: new Date('2025-01-20'), tags: ['clothes'] },
  { id: '4', amount: 150, type: 'income', category: 'freelance', date: new Date('2025-01-18'), tags: ['work', 'extra'] }
];

// ✅ Calcular total de receitas
const totalIncome = transactions
  .filter(t => t.type === 'income')
  .reduce((sum, t) => sum + t.amount, 0);
// 250

// ✅ Agrupar por categoria
const byCategory = transactions.reduce((acc, t) => {
  if (!acc[t.category]) {
    acc[t.category] = [];
  }
  acc[t.category].push(t);
  return acc;
}, {} as Record<string, Transaction[]>);
// { salary: [...], food: [...], shopping: [...], freelance: [...] }

// ✅ Buscar transações de um mês específico
const january2025 = transactions.filter(t => {
  const month = t.date.getMonth();
  const year = t.date.getFullYear();
  return month === 0 && year === 2025; // Janeiro = 0
});

// ✅ Ordenar por data (mais recente primeiro)
const sorted = [...transactions].sort((a, b) =>
  b.date.getTime() - a.date.getTime()
);

// ✅ Top 5 maiores despesas
const topExpenses = transactions
  .filter(t => t.type === 'expense')
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 5);

// ✅ Todas tags únicas
const allTags = transactions.flatMap(t => t.tags);
const uniqueTags = [...new Set(allTags)];
// ['work', 'lunch', 'restaurant', 'clothes', 'extra']

// ✅ Verificar se há alguma despesa > 100
const hasLargeExpense = transactions.some(
  t => t.type === 'expense' && t.amount > 100
);
// true (shopping = 200)
```

---

#### QUANDO USAR ARRAYS?

✅ **USE ARRAYS para:**
- Listas ordenadas (transações, usuários, produtos)
- Quando ordem importa
- Quando precisa iterar em sequência
- Quando precisa índices numéricos

❌ **NÃO USE ARRAYS para:**
- Buscar por chave (use Object ou Map)
- Garantir valores únicos (use Set)
- Muitas inserções/remoções no meio (performance ruim)

---

### 2. OBJECTS

#### O QUE SÃO OBJECTS?

Objects são **coleções de pares chave-valor**. Chaves são sempre strings (ou Symbols).

```typescript
// Criar objects
const user = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
};

// Tipo TypeScript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // opcional
}
```

---

#### ACESSAR PROPRIEDADES

```typescript
const transaction = {
  id: '123',
  amount: 100,
  description: 'Lunch',
  tags: ['food', 'lunch']
};

// ✅ Dot notation (preferível quando possível)
console.log(transaction.id);         // '123'
console.log(transaction.amount);     // 100

// ✅ Bracket notation (quando chave é dinâmica ou tem espaços)
console.log(transaction['id']);      // '123'

const key = 'amount';
console.log(transaction[key]);       // 100 (dinâmico)

const objWithSpaces = {
  'full name': 'John Doe'
};
console.log(objWithSpaces['full name']); // 'John Doe'

// ✅ Optional chaining (?.) - evita erros
console.log(transaction.category?.name); // undefined (não erro)
console.log(transaction.user?.email);    // undefined

// ✅ Nullish coalescing (??) - valor padrão
const category = transaction.category ?? 'Uncategorized';
```

---

#### MÉTODOS MAIS USADOS

**1. ADICIONAR/MODIFICAR/REMOVER**

```typescript
const user = {
  id: 1,
  name: 'John'
};

// ✅ Adicionar propriedade
user.email = 'john@example.com';
user['age'] = 30;

// ✅ Modificar propriedade
user.name = 'John Doe';

// ✅ Remover propriedade
delete user.age;

// ✅ Copiar propriedades (spread)
const updatedUser = {
  ...user,
  name: 'Jane Doe', // Sobrescreve
  premium: true      // Adiciona
};
```

**2. ITERAR SOBRE OBJECT**

```typescript
const transaction = {
  id: '123',
  amount: 100,
  description: 'Lunch',
  type: 'expense'
};

// ✅ Object.keys() - array de chaves
const keys = Object.keys(transaction);
// ['id', 'amount', 'description', 'type']

keys.forEach(key => {
  console.log(`${key}: ${transaction[key]}`);
});

// ✅ Object.values() - array de valores
const values = Object.values(transaction);
// ['123', 100, 'Lunch', 'expense']

// ✅ Object.entries() - array de [chave, valor]
const entries = Object.entries(transaction);
// [['id', '123'], ['amount', 100], ...]

entries.forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

// ✅ for...in - iterar chaves (menos usado)
for (const key in transaction) {
  console.log(`${key}: ${transaction[key]}`);
}
```

**3. MESCLAR/COPIAR OBJECTS**

```typescript
const defaults = {
  theme: 'light',
  notifications: true,
  language: 'en'
};

const userPreferences = {
  theme: 'dark',
  language: 'pt-BR'
};

// ✅ Object.assign() - mesclar
const config = Object.assign({}, defaults, userPreferences);
// { theme: 'dark', notifications: true, language: 'pt-BR' }

// ✅ Spread (preferível)
const config2 = { ...defaults, ...userPreferences };

// ✅ Cópia profunda (deep copy)
const original = { a: 1, nested: { b: 2 } };

// Shallow copy (apenas nível superior)
const shallow = { ...original };
shallow.nested.b = 999; // ❌ Modifica original também!

// Deep copy
const deep = JSON.parse(JSON.stringify(original)); // Simples, mas remove funções
shallow.nested.b = 999; // ✅ Não afeta original

// Ou usar structuredClone (moderno)
const deep2 = structuredClone(original);
```

**4. VERIFICAR PROPRIEDADES**

```typescript
const transaction = {
  id: '123',
  amount: 100,
  description: 'Lunch'
};

// ✅ in operator - verifica se chave existe
console.log('amount' in transaction);      // true
console.log('category' in transaction);    // false

// ✅ hasOwnProperty - verifica propriedade própria (não herdada)
console.log(transaction.hasOwnProperty('amount')); // true

// ✅ Object.hasOwn() - versão moderna (recomendada)
console.log(Object.hasOwn(transaction, 'amount')); // true

// ✅ Verificar se é vazio
const isEmpty = Object.keys(transaction).length === 0; // false
```

**5. CONGELAR/SELAR OBJECTS**

```typescript
const config = {
  apiUrl: 'https://api.fintrack.com',
  timeout: 5000
};

// ✅ Object.freeze() - torna imutável
Object.freeze(config);
config.timeout = 10000; // ❌ Não tem efeito (strict mode: erro)
delete config.apiUrl;   // ❌ Não tem efeito

// ✅ Object.seal() - previne adicionar/remover, mas permite modificar
Object.seal(config);
config.timeout = 10000;     // ✅ Funciona
config.newProp = 'value';   // ❌ Não funciona
delete config.apiUrl;       // ❌ Não funciona

// ✅ Verificar status
console.log(Object.isFrozen(config));  // true/false
console.log(Object.isSealed(config));  // true/false
```

---

#### EXEMPLO FINTRACK: MANIPULAR DADOS

```typescript
// src/utils/userUtils.ts

interface User {
  id: string;
  name: string;
  email: string;
  settings: {
    theme: string;
    notifications: boolean;
    currency: string;
  };
}

const user: User = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  settings: {
    theme: 'light',
    notifications: true,
    currency: 'BRL'
  }
};

// ✅ Atualizar settings mantendo resto
const updatedUser = {
  ...user,
  settings: {
    ...user.settings,
    theme: 'dark' // Só muda theme
  }
};

// ✅ Extrair apenas campos necessários
function sanitizeUser(user: User) {
  const { id, name, email } = user; // Destructuring
  return { id, name, email }; // Não retorna settings
}

// ✅ Transformar object em query string
function objectToQueryString(params: Record<string, any>): string {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
}

const filters = { type: 'expense', category: 'food', minAmount: 50 };
const queryString = objectToQueryString(filters);
// 'type=expense&category=food&minAmount=50'

// ✅ Filtrar propriedades undefined/null
function removeEmpty(obj: Record<string, any>) {
  return Object.entries(obj)
    .filter(([_, value]) => value != null) // Remove null/undefined
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
}

const data = { name: 'John', age: null, email: 'john@example.com', city: undefined };
const cleaned = removeEmpty(data);
// { name: 'John', email: 'john@example.com' }
```

---

#### QUANDO USAR OBJECTS?

✅ **USE OBJECTS para:**
- Dados estruturados (usuário, transação, configuração)
- Chaves são strings conhecidas
- Acesso rápido por chave
- JSON (APIs, armazenamento)

❌ **NÃO USE OBJECTS para:**
- Chaves dinâmicas ou não-string (use Map)
- Precisa de ordem garantida de inserção (use Map)
- Muitas adições/remoções de propriedades (use Map)

---

### 3. MAP

#### O QUE É MAP?

Map é uma **coleção de chave-valor** onde **chaves podem ser de qualquer tipo** (não apenas strings).

```typescript
// Criar Map
const cache = new Map<string, any>();

// Com valores iniciais
const userRoles = new Map([
  ['user-1', 'admin'],
  ['user-2', 'user'],
  ['user-3', 'moderator']
]);
```

---

#### OPERAÇÕES BÁSICAS

```typescript
const cache = new Map<string, Transaction[]>();

// ✅ set() - adicionar/atualizar
cache.set('user-123', [transaction1, transaction2]);
cache.set('user-456', [transaction3]);

// ✅ get() - buscar
const transactions = cache.get('user-123');
// [transaction1, transaction2]

const notFound = cache.get('user-999');
// undefined

// ✅ has() - verificar se existe
if (cache.has('user-123')) {
  console.log('Existe no cache');
}

// ✅ delete() - remover
cache.delete('user-123');

// ✅ clear() - limpar tudo
cache.clear();

// ✅ size - quantidade de entradas
console.log(cache.size); // 0
```

---

#### ITERAR SOBRE MAP

```typescript
const userRoles = new Map([
  ['user-1', 'admin'],
  ['user-2', 'user'],
  ['user-3', 'moderator']
]);

// ✅ forEach()
userRoles.forEach((role, userId) => {
  console.log(`${userId}: ${role}`);
});

// ✅ for...of com entries()
for (const [userId, role] of userRoles.entries()) {
  console.log(`${userId}: ${role}`);
}

// ✅ for...of direto (mesma coisa que entries())
for (const [userId, role] of userRoles) {
  console.log(`${userId}: ${role}`);
}

// ✅ keys() - apenas chaves
for (const userId of userRoles.keys()) {
  console.log(userId);
}

// ✅ values() - apenas valores
for (const role of userRoles.values()) {
  console.log(role);
}

// ✅ Converter para Array
const entries = Array.from(userRoles.entries());
// [['user-1', 'admin'], ...]

const keys = Array.from(userRoles.keys());
// ['user-1', 'user-2', 'user-3']
```

---

#### MAP VS OBJECT

```typescript
// ❌ Object: chaves são sempre strings
const objCache: Record<string, any> = {};
objCache[123] = 'value';  // Chave vira '123' (string)
objCache[{ id: 1 }] = 'value'; // Chave vira '[object Object]' ❌

// ✅ Map: chaves podem ser qualquer tipo
const mapCache = new Map();
mapCache.set(123, 'value');           // ✅ Chave é number
mapCache.set({ id: 1 }, 'value');     // ✅ Chave é object
mapCache.set(Symbol('key'), 'value'); // ✅ Chave é Symbol

// Objeto como chave (útil!)
const user1 = { id: 1, name: 'Alice' };
const user2 = { id: 2, name: 'Bob' };

const userCache = new Map();
userCache.set(user1, [transaction1, transaction2]);
userCache.set(user2, [transaction3]);

console.log(userCache.get(user1)); // [transaction1, transaction2]
```

**Comparação:**

| Característica | Object | Map |
|----------------|--------|-----|
| **Chaves** | String/Symbol | Qualquer tipo |
| **Ordem** | Não garantida (ES5) | Garantida (inserção) |
| **Tamanho** | `Object.keys(obj).length` | `map.size` |
| **Iterar** | `Object.entries(obj)` | `map.entries()` |
| **Performance** | Mais lento para add/remove | Mais rápido |
| **JSON** | `JSON.stringify` funciona | Não funciona |

---

#### EXEMPLO FINTRACK: CACHE DE TRANSAÇÕES

```typescript
// src/services/TransactionCacheService.ts

export class TransactionCacheService {
  private cache = new Map<string, {
    data: Transaction[];
    timestamp: number;
  }>();

  private TTL = 5 * 60 * 1000; // 5 minutos

  set(userId: string, transactions: Transaction[]): void {
    this.cache.set(userId, {
      data: transactions,
      timestamp: Date.now()
    });
  }

  get(userId: string): Transaction[] | null {
    const cached = this.cache.get(userId);

    if (!cached) return null;

    // Verificar se expirou
    const age = Date.now() - cached.timestamp;
    if (age > this.TTL) {
      this.cache.delete(userId);
      return null;
    }

    return cached.data;
  }

  clear(userId: string): void {
    this.cache.delete(userId);
  }

  clearAll(): void {
    this.cache.clear();
  }

  // Limpar caches expirados
  cleanup(): void {
    const now = Date.now();

    for (const [userId, cached] of this.cache.entries()) {
      const age = now - cached.timestamp;
      if (age > this.TTL) {
        this.cache.delete(userId);
      }
    }
  }
}
```

---

#### QUANDO USAR MAP?

✅ **USE MAP para:**
- Chaves não são strings (numbers, objects, etc)
- Muitas adições/remoções de entradas
- Precisa de ordem de inserção garantida
- Cache temporário de dados
- Contadores/frequências

❌ **NÃO USE MAP para:**
- Dados que precisam ser JSON (use Object)
- Dados estruturados fixos (use Object)
- Chaves são apenas strings simples (Object é suficiente)

---

### 4. SET

#### O QUE É SET?

Set é uma **coleção de valores únicos**. Não permite duplicatas.

```typescript
// Criar Set
const tags = new Set<string>();

// Com valores iniciais
const categories = new Set(['food', 'transport', 'housing']);

// Automaticamente remove duplicatas
const numbers = new Set([1, 2, 2, 3, 3, 3, 4]);
console.log(numbers); // Set { 1, 2, 3, 4 }
```

---

#### OPERAÇÕES BÁSICAS

```typescript
const tags = new Set<string>();

// ✅ add() - adicionar (ignora duplicatas)
tags.add('food');
tags.add('lunch');
tags.add('food'); // Ignorado (já existe)

console.log(tags.size); // 2

// ✅ has() - verificar se existe
console.log(tags.has('food'));    // true
console.log(tags.has('dinner'));  // false

// ✅ delete() - remover
tags.delete('lunch');
console.log(tags.size); // 1

// ✅ clear() - limpar tudo
tags.clear();
console.log(tags.size); // 0
```

---

#### ITERAR SOBRE SET

```typescript
const categories = new Set(['food', 'transport', 'housing']);

// ✅ forEach()
categories.forEach(category => {
  console.log(category);
});

// ✅ for...of
for (const category of categories) {
  console.log(category);
}

// ✅ values() (mesma coisa que keys() em Set)
for (const category of categories.values()) {
  console.log(category);
}

// ✅ Converter para Array
const array = Array.from(categories);
// ['food', 'transport', 'housing']

const array2 = [...categories]; // Spread
```

---

#### SET VS ARRAY

```typescript
// ❌ Array: permite duplicatas
const arrayTags = ['food', 'lunch', 'food', 'dinner'];
console.log(arrayTags.length); // 4 (duplicata)

// ✅ Set: não permite duplicatas
const setTags = new Set(['food', 'lunch', 'food', 'dinner']);
console.log(setTags.size); // 3 (sem duplicata)

// ✅ Remover duplicatas de array
const duplicates = [1, 2, 2, 3, 3, 3, 4];
const unique = [...new Set(duplicates)];
// [1, 2, 3, 4]
```

**Comparação:**

| Característica | Array | Set |
|----------------|-------|-----|
| **Duplicatas** | Permite | Não permite |
| **Ordem** | Mantém | Mantém (inserção) |
| **Índices** | Sim `arr[0]` | Não |
| **Busca** | `includes()` O(n) | `has()` O(1) |
| **Performance add** | `push()` O(1) | `add()` O(1) |
| **Performance search** | O(n) | O(1) ✅ |

---

#### OPERAÇÕES DE CONJUNTOS

```typescript
// União (union) - combinar dois sets
const set1 = new Set([1, 2, 3]);
const set2 = new Set([3, 4, 5]);

const union = new Set([...set1, ...set2]);
// Set { 1, 2, 3, 4, 5 }

// Intersecção (intersection) - elementos em ambos
const intersection = new Set(
  [...set1].filter(x => set2.has(x))
);
// Set { 3 }

// Diferença (difference) - elementos em set1 mas não em set2
const difference = new Set(
  [...set1].filter(x => !set2.has(x))
);
// Set { 1, 2 }

// Diferença simétrica - elementos que estão em um mas não em ambos
const symmetricDiff = new Set([
  ...[...set1].filter(x => !set2.has(x)),
  ...[...set2].filter(x => !set1.has(x))
]);
// Set { 1, 2, 4, 5 }
```

---

#### EXEMPLO FINTRACK: GERENCIAR TAGS

```typescript
// src/utils/tagUtils.ts

export class TagManager {
  private tags = new Set<string>();

  // ✅ Adicionar tag (ignora duplicatas)
  addTag(tag: string): void {
    this.tags.add(tag.toLowerCase().trim());
  }

  // ✅ Adicionar múltiplas tags
  addTags(tags: string[]): void {
    tags.forEach(tag => this.addTag(tag));
  }

  // ✅ Remover tag
  removeTag(tag: string): void {
    this.tags.delete(tag.toLowerCase());
  }

  // ✅ Verificar se tag existe
  hasTag(tag: string): boolean {
    return this.tags.has(tag.toLowerCase());
  }

  // ✅ Obter todas tags
  getAllTags(): string[] {
    return Array.from(this.tags).sort();
  }

  // ✅ Contar tags
  getCount(): number {
    return this.tags.size;
  }

  // ✅ Limpar tudo
  clear(): void {
    this.tags.clear();
  }
}

// Uso
const tagManager = new TagManager();
tagManager.addTags(['food', 'lunch', 'FOOD', 'restaurant']);
console.log(tagManager.getAllTags()); // ['food', 'lunch', 'restaurant']
console.log(tagManager.getCount());   // 3 (sem duplicata 'FOOD')
```

```typescript
// src/services/TransactionService.ts

// ✅ Obter todas tags únicas de transações
async function getAllUniqueTags(userId: string): Promise<string[]> {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: { tags: true }
  });

  // Achatar arrays de tags e remover duplicatas
  const allTags = transactions.flatMap(t => t.tags);
  const uniqueTags = [...new Set(allTags)];

  return uniqueTags.sort();
}

// ✅ Filtrar transações com tags específicas (intersecção)
function filterByTags(
  transactions: Transaction[],
  requiredTags: string[]
): Transaction[] {
  const requiredSet = new Set(requiredTags);

  return transactions.filter(transaction => {
    const transactionTags = new Set(transaction.tags);

    // Verificar se tem todas as tags requeridas (intersecção)
    return [...requiredSet].every(tag => transactionTags.has(tag));
  });
}

// Uso
const filtered = filterByTags(transactions, ['food', 'lunch']);
// Retorna apenas transações que têm AMBAS tags
```

---

#### QUANDO USAR SET?

✅ **USE SET para:**
- Garantir valores únicos (tags, categorias)
- Verificar existência rápida (`has()` é O(1))
- Remover duplicatas de arrays
- Operações de conjuntos (união, intersecção)

❌ **NÃO USE SET para:**
- Precisa de acesso por índice (use Array)
- Precisa de ordem específica diferente de inserção (use Array + sort)
- Precisa de chave-valor (use Map ou Object)

---

### RESUMO: QUANDO USAR CADA ESTRUTURA?

```
┌────────────────────────────────────────────────────────────┐
│  ARRAY                                                     │
│  ✅ Lista ordenada de valores                              │
│  ✅ Precisa iterar em sequência                            │
│  ✅ Operações: map, filter, reduce                         │
│  Exemplo: Lista de transações                             │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  OBJECT                                                    │
│  ✅ Dados estruturados (propriedades conhecidas)           │
│  ✅ Acesso rápido por chave string                         │
│  ✅ JSON (APIs, storage)                                   │
│  Exemplo: Dados do usuário { id, name, email }           │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  MAP                                                       │
│  ✅ Chaves de qualquer tipo (não só string)                │
│  ✅ Muitas adições/remoções                                │
│  ✅ Ordem de inserção garantida                            │
│  Exemplo: Cache de dados, contadores                      │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  SET                                                       │
│  ✅ Valores únicos (sem duplicatas)                        │
│  ✅ Verificação rápida de existência                       │
│  ✅ Operações de conjunto                                  │
│  Exemplo: Tags únicas, categorias                         │
└────────────────────────────────────────────────────────────┘
```

---

## 3. CLOSURES E ESCOPO

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

## 4. THIS BINDING

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

## 5. PROMISES E ASYNC/AWAIT

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

## 6. ERROR HANDLING AVANÇADO

### POR QUE ERROR HANDLING É CRÍTICO?

90% dos bugs em produção são causados por **erros não tratados**. Error handling profissional é essencial.

**No FinTrack:**
- ❌ Transação falha mas usuário não sabe por quê
- ❌ Aplicação trava sem mensagem útil
- ❌ Logs não ajudam a debugar
- ✅ Erros claros, logs estruturados, recuperação elegante

```
SEM ERROR HANDLING:
User action → Error → App crashes ❌

COM ERROR HANDLING:
User action → Error → Catch → Show message → Log → Continue ✅
```

---

### TIPOS DE ERROS EM JAVASCRIPT

```typescript
// 1. SyntaxError - erro de sintaxe
eval('const x ='); // SyntaxError: Unexpected token

// 2. ReferenceError - variável não existe
console.log(nonExistentVar); // ReferenceError

// 3. TypeError - tipo errado
null.toString(); // TypeError: Cannot read property 'toString' of null

// 4. RangeError - valor fora do range
new Array(-1); // RangeError: Invalid array length

// 5. Error - erro genérico
throw new Error('Something went wrong');
```

---

### TRY/CATCH BÁSICO

```typescript
// ❌ SEM TRY/CATCH: Aplicação trava
function divide(a: number, b: number): number {
  return a / b; // Não valida b === 0
}

const result = divide(10, 0); // Infinity (não erro, mas problemático)

// ✅ COM VALIDAÇÃO E ERROR
function divideSafe(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}

try {
  const result = divideSafe(10, 0);
  console.log(result);
} catch (error) {
  console.error('Error:', error.message); // 'Cannot divide by zero'
}
```

---

### CUSTOM ERROR CLASSES

```typescript
// ✅ CRIAR CUSTOM ERRORS para diferentes cenários

// 1. ValidationError - dados inválidos
class ValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// 2. NotFoundError - recurso não existe
class NotFoundError extends Error {
  constructor(
    public resource: string,
    public id: string
  ) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

// 3. UnauthorizedError - sem permissão
class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// 4. BusinessError - regra de negócio violada
class BusinessError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}
```

---

### EXEMPLO FINTRACK: APLICAR CUSTOM ERRORS

```typescript
// src/services/TransactionService.ts

export class TransactionService {
  async createTransaction(
    userId: string,
    data: CreateTransactionDTO
  ): Promise<Transaction> {
    // 1. Validação de dados
    if (data.amount <= 0) {
      throw new ValidationError('amount', 'Amount must be positive');
    }

    if (!data.description || data.description.length < 3) {
      throw new ValidationError('description', 'Description too short');
    }

    // 2. Verificar se conta existe
    const account = await prisma.account.findUnique({
      where: { id: data.accountId }
    });

    if (!account) {
      throw new NotFoundError('Account', data.accountId);
    }

    // 3. Verificar permissão
    if (account.userId !== userId) {
      throw new UnauthorizedError('You cannot access this account');
    }

    // 4. Regra de negócio: não pode gastar mais que o saldo
    if (data.type === 'expense' && account.balance < data.amount) {
      throw new BusinessError(
        'INSUFFICIENT_FUNDS',
        `Insufficient funds. Balance: ${account.balance}, Required: ${data.amount}`
      );
    }

    // 5. Criar transação
    try {
      const transaction = await prisma.transaction.create({
        data: {
          ...data,
          userId
        }
      });

      return transaction;
    } catch (error) {
      // Erro do banco (Prisma)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BusinessError('DUPLICATE', 'Transaction already exists');
        }
      }

      // Erro desconhecido
      throw error;
    }
  }
}
```

---

### MIDDLEWARE DE ERROR HANDLING (EXPRESS)

```typescript
// src/middlewares/errorHandler.ts

import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', error);

  // 1. ValidationError → 400 Bad Request
  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation failed',
      field: error.field,
      message: error.message
    });
  }

  // 2. NotFoundError → 404 Not Found
  if (error instanceof NotFoundError) {
    return res.status(404).json({
      error: 'Not found',
      resource: error.resource,
      id: error.id
    });
  }

  // 3. UnauthorizedError → 401 Unauthorized
  if (error instanceof UnauthorizedError) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message
    });
  }

  // 4. BusinessError → 422 Unprocessable Entity
  if (error instanceof BusinessError) {
    return res.status(422).json({
      error: 'Business rule violation',
      code: error.code,
      message: error.message
    });
  }

  // 5. Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json({
      error: 'Database error',
      code: error.code
    });
  }

  // 6. Generic error → 500 Internal Server Error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}

// Usar no Express
app.use(errorHandler); // Sempre por último!
```

---

### ERROR HANDLING EM ASYNC/AWAIT

```typescript
// ❌ PROBLEMA: Erro não capturado
async function fetchUser(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  const user = await response.json(); // Pode falhar!
  return user;
}

// Se fetch falhar, erro não é tratado e aplicação trava

// ✅ SOLUÇÃO 1: Try/Catch
async function fetchUserSafe(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new NotFoundError('User', userId);
  }
}

// ✅ SOLUÇÃO 2: Wrapper function
async function safeAsync<T>(
  promise: Promise<T>
): Promise<[T | null, Error | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error as Error];
  }
}

// Usar
const [user, error] = await safeAsync(fetchUser('123'));

if (error) {
  console.error('Error:', error.message);
  return;
}

console.log('User:', user);
```

---

### PATTERN: RESULT TYPE (GO-STYLE)

```typescript
// ✅ PATTERN: Retornar resultado ou erro (sem throw)

type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

async function createTransaction(
  data: CreateTransactionDTO
): Promise<Result<Transaction>> {
  // Validação
  if (data.amount <= 0) {
    return {
      ok: false,
      error: new ValidationError('amount', 'Amount must be positive')
    };
  }

  // Criar
  try {
    const transaction = await prisma.transaction.create({ data });
    return { ok: true, value: transaction };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}

// Usar
const result = await createTransaction(data);

if (!result.ok) {
  console.error('Failed:', result.error.message);
  return;
}

const transaction = result.value; // Type-safe!
console.log('Created:', transaction.id);
```

---

### LOGGING DE ERROS

```typescript
// src/utils/logger.ts

import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// ✅ Logar erros estruturados
export function logError(error: Error, context?: Record<string, any>) {
  logger.error({
    message: error.message,
    name: error.name,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString()
  });
}

// Usar
try {
  await createTransaction(data);
} catch (error) {
  logError(error as Error, {
    userId: req.userId,
    action: 'createTransaction',
    data
  });
  throw error;
}
```

---

### ERROR BOUNDARIES (REACT)

```typescript
// src/components/ErrorBoundary.tsx

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Logar erro
    console.error('Error caught by boundary:', error, errorInfo);

    // Enviar para serviço de tracking (Sentry, etc)
    // trackError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-container">
          <h1>Algo deu errado</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usar
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

---

### BOAS PRÁTICAS ERROR HANDLING

```typescript
// ✅ 1. Sempre capturar erros em funções async
async function fetchData() {
  try {
    const data = await api.get('/data');
    return data;
  } catch (error) {
    // Tratar ou re-throw
    throw error;
  }
}

// ✅ 2. Erros específicos para cenários específicos
throw new ValidationError('email', 'Invalid email format');
// Melhor que:
throw new Error('Invalid email format');

// ✅ 3. Incluir contexto útil no erro
throw new Error(`Failed to create transaction for user ${userId}`);
// Melhor que:
throw new Error('Failed to create transaction');

// ✅ 4. Não engolir erros silenciosamente
try {
  await operation();
} catch (error) {
  // ❌ NÃO FAZER: ignorar erro
  // console.log('Error:', error);

  // ✅ FAZER: logar e re-throw ou tratar
  logger.error('Operation failed', { error });
  throw error;
}

// ✅ 5. Finally para cleanup
let connection;
try {
  connection = await db.connect();
  await connection.query('...');
} catch (error) {
  logger.error('Query failed', { error });
  throw error;
} finally {
  // ✅ Sempre fecha conexão (mesmo com erro)
  if (connection) {
    await connection.close();
  }
}

// ✅ 6. Validar cedo (fail fast)
function processPayment(amount: number) {
  // Validar no início
  if (amount <= 0) {
    throw new ValidationError('amount', 'Amount must be positive');
  }

  // Resto da lógica...
}

// ✅ 7. Mensagens de erro para humanos
throw new Error('Transaction amount must be positive'); // ✅ Claro
// Vs
throw new Error('ERR_AMT_POS'); // ❌ Críptico
```

---

### EXEMPLO COMPLETO: SERVICE COM ERROR HANDLING

```typescript
// src/services/PaymentService.ts

export class PaymentService {
  constructor(
    private prisma: PrismaClient,
    private logger: Logger
  ) {}

  async processPayment(
    userId: string,
    amount: number,
    method: string
  ): Promise<Result<Payment>> {
    const context = { userId, amount, method };

    try {
      // 1. Validação
      if (amount <= 0) {
        throw new ValidationError('amount', 'Amount must be positive');
      }

      if (!['credit_card', 'pix', 'boleto'].includes(method)) {
        throw new ValidationError('method', 'Invalid payment method');
      }

      // 2. Buscar usuário
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundError('User', userId);
      }

      // 3. Verificar saldo
      if (user.balance < amount) {
        throw new BusinessError(
          'INSUFFICIENT_FUNDS',
          `Insufficient funds. Balance: ${user.balance}`
        );
      }

      // 4. Processar pagamento em transação
      const payment = await this.prisma.$transaction(async (tx) => {
        // Deduzir saldo
        await tx.user.update({
          where: { id: userId },
          data: { balance: { decrement: amount } }
        });

        // Criar registro de pagamento
        const payment = await tx.payment.create({
          data: { userId, amount, method }
        });

        return payment;
      });

      this.logger.info('Payment processed', { ...context, paymentId: payment.id });

      return { ok: true, value: payment };

    } catch (error) {
      this.logger.error('Payment failed', { ...context, error });

      // Re-throw custom errors
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof BusinessError
      ) {
        return { ok: false, error };
      }

      // Wrap generic errors
      return {
        ok: false,
        error: new Error(`Payment processing failed: ${(error as Error).message}`)
      };
    }
  }
}
```

---

### QUANDO USAR CADA ABORDAGEM?

| Abordagem | Quando Usar |
|-----------|-------------|
| **try/catch** | Erros esperados em operações específicas |
| **Custom Errors** | Diferentes tipos de erro precisam tratamento diferente |
| **Result Type** | Evitar throws, controle de fluxo explícito |
| **Error Boundaries** | Capturar erros de renderização no React |
| **Middleware** | Tratamento centralizado de erros HTTP |
| **Logging** | Sempre! Para debugging em produção |

---

## 7. DEBUGGING TÉCNICAS

### O QUE É DEBUGGING?

Debugging é o **processo de identificar, analisar e corrigir bugs (erros) no código**. É uma habilidade essencial para qualquer desenvolvedor.

**Tipos comuns de bugs:**
- **Syntax Errors**: Erro de sintaxe (código não compila)
- **Runtime Errors**: Erro durante execução (crash)
- **Logic Errors**: Código roda, mas resultado incorreto
- **Performance Issues**: Código lento ou consome muita memória

---

### CONSOLE METHODS

O objeto `console` oferece muito mais que `console.log()`:

#### console.log() - Logging Básico

```typescript
// ✅ Logging simples
console.log('Iniciando aplicação...');
console.log('Usuário:', user);
console.log('Transações:', transactions);

// ✅ Multiple arguments
console.log('Total:', total, '| Moeda:', currency);

// ✅ Template strings
console.log(`Processando ${transactions.length} transações`);

// ✅ Destructuring para debug
const transaction = { id: 1, amount: 100, type: 'INCOME' };
console.log({ transaction }); // { transaction: { id: 1, ... } }
```

---

#### console.table() - Visualizar Arrays/Objects

```typescript
// ✅ Array de objetos
const transactions = [
  { id: 1, amount: 100, type: 'INCOME', description: 'Salário' },
  { id: 2, amount: 50, type: 'EXPENSE', description: 'Almoço' },
  { id: 3, amount: 200, type: 'INCOME', description: 'Freelance' }
];

console.table(transactions);
// ┌─────────┬────┬────────┬──────────┬─────────────┐
// │ (index) │ id │ amount │   type   │ description │
// ├─────────┼────┼────────┼──────────┼─────────────┤
// │    0    │ 1  │  100   │ 'INCOME' │  'Salário'  │
// │    1    │ 2  │   50   │'EXPENSE' │  'Almoço'   │
// │    2    │ 3  │  200   │ 'INCOME' │ 'Freelance' │
// └─────────┴────┴────────┴──────────┴─────────────┘

// ✅ Selecionar colunas específicas
console.table(transactions, ['amount', 'type']);
```

---

#### console.error() e console.warn()

```typescript
// ✅ console.error() - erros críticos
try {
  await paymentService.processPayment(transactionId);
} catch (error) {
  console.error('❌ Erro ao processar pagamento:', error);
  // Aparece em vermelho no console
}

// ✅ console.warn() - avisos
if (balance < 0) {
  console.warn('⚠️ Saldo negativo detectado:', balance);
  // Aparece em amarelo no console
}
```

---

#### console.time() e console.timeEnd() - Medir Performance

```typescript
// ✅ Medir tempo de execução
console.time('fetch-transactions');

const transactions = await prisma.transaction.findMany({
  where: { userId },
  include: { category: true, account: true }
});

console.timeEnd('fetch-transactions');
// fetch-transactions: 45.234ms

// ✅ Múltiplos timers
console.time('database-query');
console.time('data-processing');

const data = await fetchData();
console.timeEnd('database-query');

const processed = processData(data);
console.timeEnd('data-processing');
```

---

#### console.trace() - Stack Trace

```typescript
// ✅ Ver de onde a função foi chamada
function calculateBalance(transactions: Transaction[]) {
  console.trace('calculateBalance foi chamado');

  return transactions.reduce((sum, t) => {
    return t.type === 'INCOME' ? sum + t.amount : sum - t.amount;
  }, 0);
}

// Mostra toda a pilha de chamadas:
// console.trace
//   calculateBalance @ utils.ts:42
//   getAccountSummary @ service.ts:89
//   handleRequest @ controller.ts:23
//   ...
```

---

#### console.group() - Agrupar Logs

```typescript
// ✅ Agrupar logs relacionados
async function processMonthlyReport(userId: string) {
  console.group('📊 Processando Relatório Mensal');

  console.log('Usuário:', userId);
  console.log('Período:', new Date());

  console.group('Transações');
  const transactions = await getTransactions(userId);
  console.log('Total:', transactions.length);
  console.table(transactions.slice(0, 3));
  console.groupEnd();

  console.group('Categorias');
  const categories = await getCategories(userId);
  console.log('Total:', categories.length);
  console.groupEnd();

  console.groupEnd();
}

// Saída:
// 📊 Processando Relatório Mensal
//   Usuário: user-123
//   Período: Mon Feb 19 2025
//   Transações
//     Total: 45
//     [table data]
//   Categorias
//     Total: 8
```

---

#### console.assert() - Assertions

```typescript
// ✅ Verificar condições durante desenvolvimento
function withdraw(account: Account, amount: number) {
  console.assert(amount > 0, 'Valor deve ser positivo', amount);
  console.assert(account.balance >= amount, 'Saldo insuficiente', {
    balance: account.balance,
    amount
  });

  // Continua execução...
}

// Se assertion falhar, mostra erro no console:
// Assertion failed: Saldo insuficiente
// {balance: 50, amount: 100}
```

---

### BROWSER DEVTOOLS

#### Breakpoints

```typescript
// ✅ Usar debugger statement
async function processPayment(transactionId: string) {
  const transaction = await getTransaction(transactionId);

  debugger; // Pausa execução aqui quando DevTools aberto

  const result = await paymentGateway.charge({
    amount: transaction.amount,
    currency: 'BRL'
  });

  return result;
}
```

**Como usar:**
1. Abra Chrome DevTools (F12)
2. Vá para Sources tab
3. Execute código com `debugger`
4. Use Step Over (F10), Step Into (F11), Step Out (Shift+F11)
5. Inspecione variáveis no Scope panel

---

#### Network Tab

```typescript
// ✅ Debugar chamadas API
async function fetchTransactions() {
  console.log('🌐 Iniciando fetch...');

  const response = await fetch('/api/transactions', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  console.log('📥 Response status:', response.status);
  console.log('📥 Response headers:', response.headers);

  const data = await response.json();
  console.log('📦 Data:', data);

  return data;
}
```

**Inspecionar no Network Tab:**
- Request Headers
- Response Headers
- Request Payload
- Response Data
- Timing (quanto tempo levou)
- Status code

---

#### Application Tab

```typescript
// ✅ Debugar localStorage/sessionStorage
// Abra Application > Local Storage no DevTools

// Salvar
localStorage.setItem('user', JSON.stringify(user));
console.log('💾 Saved to localStorage');

// Verificar
const stored = localStorage.getItem('user');
console.log('📂 Retrieved from localStorage:', JSON.parse(stored));

// Limpar
localStorage.removeItem('user');
console.log('🗑️ Removed from localStorage');
```

---

### NODE.JS DEBUGGING

#### VS Code Debugger

**launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/Backend/src/server.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/Backend/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

---

#### Node Inspector

```bash
# Iniciar com inspector
node --inspect src/server.js

# Ou com break no início
node --inspect-brk src/server.js

# Abrir chrome://inspect no Chrome
# Clicar em "inspect" no processo
```

---

#### Debug Logs Estruturados

```typescript
// src/utils/logger.ts

import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// Em desenvolvimento, também logar no console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}
```

```typescript
// Usar em controllers

export class TransactionController {
  async create(req: Request, res: Response) {
    logger.info('Creating transaction', {
      userId: req.user.id,
      amount: req.body.amount,
      type: req.body.type
    });

    try {
      const transaction = await this.service.create(req.body);

      logger.info('Transaction created successfully', {
        transactionId: transaction.id
      });

      return res.json(transaction);
    } catch (error) {
      logger.error('Failed to create transaction', {
        userId: req.user.id,
        error: error.message,
        stack: error.stack
      });

      throw error;
    }
  }
}
```

---

### DEBUGGING REACT

#### React DevTools

**Instalar extensão:**
- Chrome: React Developer Tools
- Firefox: React Developer Tools

**Features:**
1. **Components Tab**: Inspecionar component tree
2. **Props e State**: Ver valores atuais
3. **Profiler**: Medir performance de renders
4. **Highlighted Updates**: Ver quando componente re-renderiza

---

#### Debug Hooks

```typescript
// ✅ useDebugValue (para custom hooks)
function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  // Mostra no React DevTools
  useDebugValue(user ? `Logged in: ${user.name}` : 'Not logged in');

  return { user, setUser };
}

// ✅ Debug useEffect
useEffect(() => {
  console.log('🔄 Effect running');
  console.log('Dependencies:', { userId, filter });

  fetchTransactions(userId, filter);

  return () => {
    console.log('🧹 Cleanup running');
  };
}, [userId, filter]);

// ✅ Debug re-renders excessivos
function TransactionList({ transactions }: Props) {
  console.log('🎨 TransactionList render', {
    count: transactions.length,
    timestamp: Date.now()
  });

  // Se logar muito, investigar:
  // - Dependências incorretas
  // - Estado sendo recriado
  // - Props mudando sem necessidade

  return <ul>...</ul>;
}
```

---

#### Why Did You Render

```bash
npm install @welldone-software/why-did-you-render
```

```typescript
// src/wdyr.ts (importar ANTES do React)

import React from 'react';

if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackHooks: true,
    logOnDifferentValues: true,
  });
}
```

```typescript
// Marcar componentes para tracking
TransactionList.whyDidYouRender = true;

function TransactionList({ transactions }: Props) {
  // whyDidYouRender vai logar re-renders desnecessários
  return <ul>...</ul>;
}
```

---

### PERFORMANCE PROFILING

#### Browser Performance Tab

1. Abra DevTools > Performance
2. Clique Record (⚫)
3. Interaja com aplicação
4. Stop recording
5. Analise:
   - **Scripting**: Tempo em JS
   - **Rendering**: Tempo calculando layouts
   - **Painting**: Tempo pintando pixels
   - **Loading**: Tempo carregando recursos

---

#### React Profiler API

```typescript
import { Profiler, ProfilerOnRenderCallback } from 'react';

const onRenderCallback: ProfilerOnRenderCallback = (
  id, // id do Profiler
  phase, // "mount" | "update"
  actualDuration, // tempo do render
  baseDuration, // tempo estimado sem memoization
  startTime,
  commitTime,
  interactions
) => {
  console.log(`${id} (${phase}):`, {
    actualDuration,
    baseDuration
  });
};

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <TransactionList />
      <Dashboard />
    </Profiler>
  );
}
```

---

#### Node.js Performance Hooks

```typescript
import { performance, PerformanceObserver } from 'perf_hooks';

// Observer para medições
const obs = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});
obs.observe({ entryTypes: ['measure'] });

// Marcar pontos
performance.mark('start-fetch');
await fetchData();
performance.mark('end-fetch');

// Medir duração
performance.measure('fetch-duration', 'start-fetch', 'end-fetch');
```

---

### DEBUGGING SISTEMÁTICO

#### 1. REPRODUZIR O BUG

```typescript
// ✅ Criar cenário reproduzível
describe('Bug: Saldo incorreto após transferência', () => {
  it('should calculate correct balance after transfer', async () => {
    // Setup: estado inicial conhecido
    const account = await createAccount({ balance: 1000 });

    // Action: reproduzir bug
    await transferService.transfer({
      fromAccountId: account.id,
      toAccountId: otherAccount.id,
      amount: 500
    });

    // Assert: verificar resultado esperado
    const updated = await getAccount(account.id);
    expect(updated.balance).toBe(500);
  });
});
```

---

#### 2. ISOLAR O PROBLEMA

```typescript
// ❌ Difícil debugar (muita lógica junta)
async function processPayment(data: PaymentData) {
  const user = await getUser(data.userId);
  const account = await getAccount(user.accountId);
  const balance = calculateBalance(account.transactions);

  if (balance < data.amount) throw new Error('Insufficient funds');

  await chargePaymentGateway(data);
  await createTransaction(data);
  await updateBalance(account.id, balance - data.amount);
  await sendEmailNotification(user.email, data);

  return { success: true };
}

// ✅ Fácil debugar (separado em funções)
async function processPayment(data: PaymentData) {
  const user = await getUser(data.userId);
  console.log('1. User:', user);

  const account = await getAccountWithBalance(user.accountId);
  console.log('2. Account:', account);

  validateSufficientFunds(account.balance, data.amount);
  console.log('3. Validation passed');

  await executePayment(data);
  console.log('4. Payment executed');

  await recordTransaction(data);
  console.log('5. Transaction recorded');

  await notifyUser(user, data);
  console.log('6. User notified');

  return { success: true };
}

// Agora é fácil ver em qual passo falhou!
```

---

#### 3. HIPÓTESES E TESTES

```typescript
// Hipótese: "Balance está incorreto porque não considera pending transactions"

// Teste 1: Logar todas as transações
console.log('All transactions:', await getTransactions(accountId));

// Teste 2: Logar cálculo passo a passo
const transactions = await getTransactions(accountId);
let balance = 0;

for (const t of transactions) {
  const before = balance;

  if (t.type === 'INCOME') {
    balance += t.amount;
  } else {
    balance -= t.amount;
  }

  console.log(`${t.type} ${t.amount}: ${before} → ${balance}`);
}

// Teste 3: Verificar transações pending
const pending = transactions.filter(t => t.status === 'PENDING');
console.log('Pending transactions:', pending);

// EUREKA! As transações PENDING estão sendo incluídas no cálculo!
```

---

#### 4. RUBBER DUCK DEBUGGING

**Técnica:** Explicar o código linha por linha para um "pato de borracha" (ou colega).

```typescript
// "Ok, pato, vou explicar este código..."

function calculateBalance(transactions: Transaction[]): number {
  // "Começamos com reduce, que vai acumular o saldo"
  return transactions.reduce((balance, transaction) => {
    // "Para cada transação, verificamos o tipo"
    if (transaction.type === 'INCOME') {
      // "Se for INCOME, somamos ao saldo"
      return balance + transaction.amount;
    } else {
      // "Senão, subtraímos... ESPERA!"
      // "E se type não for nem INCOME nem EXPENSE?"
      // "E se for TRANSFER? Vai entrar no else e subtrair!"
      // BUG ENCONTRADO! 🦆
      return balance - transaction.amount;
    }
  }, 0);
}

// ✅ Correção
function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((balance, transaction) => {
    switch (transaction.type) {
      case 'INCOME':
        return balance + transaction.amount;
      case 'EXPENSE':
        return balance - transaction.amount;
      case 'TRANSFER':
        // Não afeta saldo (já contabilizado em ambas contas)
        return balance;
      default:
        throw new Error(`Unknown transaction type: ${transaction.type}`);
    }
  }, 0);
}
```

---

### DEBUGGING COMMON ISSUES

#### Async/Await Bugs

```typescript
// ❌ BUG: Promise não esperado
async function getBalance(userId: string) {
  const transactions = getTransactions(userId); // Faltou await!
  return calculateBalance(transactions); // transactions é Promise, não array!
}

// ✅ FIX
async function getBalance(userId: string) {
  const transactions = await getTransactions(userId);
  return calculateBalance(transactions);
}

// ❌ BUG: Promises em série (lento)
async function loadDashboard(userId: string) {
  const transactions = await getTransactions(userId); // 100ms
  const accounts = await getAccounts(userId); // 100ms
  const categories = await getCategories(userId); // 100ms
  // Total: 300ms

  return { transactions, accounts, categories };
}

// ✅ FIX: Promises em paralelo
async function loadDashboard(userId: string) {
  const [transactions, accounts, categories] = await Promise.all([
    getTransactions(userId),
    getAccounts(userId),
    getCategories(userId)
  ]);
  // Total: 100ms (simultâneo!)

  return { transactions, accounts, categories };
}
```

---

#### State Bugs no React

```typescript
// ❌ BUG: Mutação direta do estado
function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = (newTransaction: Transaction) => {
    transactions.push(newTransaction); // ❌ Mutação!
    setTransactions(transactions); // React não detecta mudança
  };
}

// ✅ FIX: Criar novo array
const addTransaction = (newTransaction: Transaction) => {
  setTransactions([...transactions, newTransaction]);
  // ou
  setTransactions(prev => [...prev, newTransaction]);
};

// ❌ BUG: Estado desatualizado
const [count, setCount] = useState(0);

const incrementThreeTimes = () => {
  setCount(count + 1); // count = 0, setCount(1)
  setCount(count + 1); // count ainda = 0, setCount(1)
  setCount(count + 1); // count ainda = 0, setCount(1)
  // Resultado: count = 1 (não 3!)
};

// ✅ FIX: Usar função updater
const incrementThreeTimes = () => {
  setCount(prev => prev + 1); // 0 → 1
  setCount(prev => prev + 1); // 1 → 2
  setCount(prev => prev + 1); // 2 → 3
  // Resultado: count = 3 ✓
};
```

---

#### Dependency Array Bugs

```typescript
// ❌ BUG: Dependência faltando
useEffect(() => {
  fetchTransactions(userId, filter);
  // ESLint warning: React Hook useEffect has missing dependencies
}, []); // filter não está nas dependências!

// ✅ FIX: Incluir todas as dependências
useEffect(() => {
  fetchTransactions(userId, filter);
}, [userId, filter]);

// ❌ BUG: Objeto recriado causa loop infinito
function TransactionList() {
  const filter = { type: 'EXPENSE' }; // Recriado a cada render!

  useEffect(() => {
    fetchTransactions(filter);
  }, [filter]); // filter sempre diferente → loop infinito
}

// ✅ FIX 1: useMemo
const filter = useMemo(() => ({ type: 'EXPENSE' }), []);

// ✅ FIX 2: Primitive values
const filterType = 'EXPENSE';
useEffect(() => {
  fetchTransactions({ type: filterType });
}, [filterType]);
```

---

### FERRAMENTAS ÚTEIS

#### 1. Error Monitoring

```typescript
// Sentry para capturar erros em produção
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Erros são automaticamente enviados para Sentry
app.use(Sentry.Handlers.errorHandler());
```

---

#### 2. Source Maps

```json
// tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true // Mapear TypeScript → JavaScript
  }
}
```

```json
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: true // Debugar código original no browser
  }
});
```

---

#### 3. ESLint

```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "warn" // Avisar se deixar console.log em produção
  }
}
```

---

### CHECKLIST DE DEBUGGING

Quando encontrar um bug, siga este checklist:

```
[ ] 1. Reproduzi o bug de forma consistente?
[ ] 2. Isolei o código problemático?
[ ] 3. Verifiquei console/logs/errors?
[ ] 4. Coloquei breakpoints nos locais suspeitos?
[ ] 5. Inspecionei valores de variáveis?
[ ] 6. Verifiquei tipos (TypeScript errors)?
[ ] 7. Verifiquei dependências do useEffect (React)?
[ ] 8. Verifiquei mutação de estado?
[ ] 9. Verifiquei async/await?
[ ] 10. Criei teste para o bug?
[ ] 11. Apliquei correção?
[ ] 12. Verifiquei que correção funciona?
[ ] 13. Verifiquei que não quebrei nada?
[ ] 14. Documentei o bug/fix?
```

---

### EXEMPLO COMPLETO: DEBUGGING NO FINTRACK

**Cenário:** Saldo da conta está incorreto

```typescript
// 1. REPRODUZIR
const account = await prisma.account.findUnique({
  where: { id: 'acc-123' },
  include: { transactions: true }
});

console.log('Account:', account);
console.log('Transactions:', account.transactions);

// 2. CALCULAR MANUALMENTE
const manualBalance = account.transactions.reduce((sum, t) => {
  console.log(`${t.type} ${t.amount}: ${sum} → ${sum + (t.type === 'INCOME' ? t.amount : -t.amount)}`);
  return sum + (t.type === 'INCOME' ? t.amount : -t.amount);
}, 0);

console.log('Manual balance:', manualBalance);
console.log('Stored balance:', account.balance);
console.log('Difference:', account.balance - manualBalance);

// 3. INVESTIGAR DISCREPÂNCIA
// Descobriu que transações PENDING estão incluídas!

// 4. CRIAR TESTE
it('should exclude pending transactions from balance', async () => {
  const account = await createAccount({ balance: 1000 });

  await createTransaction({
    accountId: account.id,
    amount: 100,
    type: 'INCOME',
    status: 'PENDING' // ← Não deve afetar saldo
  });

  const balance = await accountService.getBalance(account.id);

  expect(balance).toBe(1000); // Não 1100
});

// 5. APLICAR FIX
async function getBalance(accountId: string): Promise<number> {
  const transactions = await prisma.transaction.findMany({
    where: {
      accountId,
      status: 'COMPLETED' // ← FIX: Apenas completed
    }
  });

  return transactions.reduce((sum, t) => {
    return t.type === 'INCOME' ? sum + t.amount : sum - t.amount;
  }, 0);
}

// 6. VERIFICAR
// ✅ Teste passa!
// ✅ Saldo correto na UI!
```

---

### QUANDO USAR CADA TÉCNICA

| Situação | Técnica |
|----------|---------|
| **"Código não roda"** | Console errors, ESLint, TypeScript |
| **"Resultado errado"** | console.log, breakpoints, assertions |
| **"Código lento"** | Performance tab, console.time, Profiler |
| **"Bug em produção"** | Logging estruturado, Sentry, source maps |
| **"React re-renderiza muito"** | React DevTools Profiler, why-did-you-render |
| **"Não sei onde está o erro"** | console.trace, debugging sistemático |
| **"API não funciona"** | Network tab, curl, Postman |

---

## 8. DATES AND TIME

### O QUE SÃO DATES?

Em JavaScript, datas e horários são representados pelo objeto `Date`. É essencial em aplicações financeiras como o FinTrack para:
- Registrar quando transações ocorreram
- Filtrar transações por período
- Gerar relatórios mensais/anuais
- Agendar pagamentos recorrentes
- Lidar com timezones

---

### CRIAR DATES

```typescript
// ✅ Data atual
const now = new Date();
console.log(now); // 2025-02-19T15:30:45.123Z

// ✅ Date de string ISO
const specific = new Date('2025-02-19T10:00:00Z');
console.log(specific);

// ✅ Date de string brasileira
const br = new Date('2025-02-19'); // Cuidado! Pode interpretar como UTC
console.log(br);

// ✅ Date de componentes (ano, mês, dia, hora, minuto, segundo, ms)
// ATENÇÃO: Mês começa em 0 (Janeiro = 0, Dezembro = 11)
const composed = new Date(2025, 1, 19, 10, 30, 0); // 19 de Fevereiro 2025, 10:30
console.log(composed);

// ✅ Date de timestamp (milissegundos desde 1970-01-01)
const fromTimestamp = new Date(1708344600000);
console.log(fromTimestamp);

// ✅ Timestamp atual
const timestamp = Date.now(); // 1708344600000
console.log(timestamp);
```

---

### OPERAÇÕES BÁSICAS

#### Getters

```typescript
const date = new Date('2025-02-19T15:30:45.123Z');

// ✅ Componentes da data
console.log(date.getFullYear()); // 2025
console.log(date.getMonth()); // 1 (Fevereiro, começa em 0!)
console.log(date.getDate()); // 19 (dia do mês)
console.log(date.getDay()); // 3 (dia da semana, 0=domingo)

// ✅ Componentes do horário
console.log(date.getHours()); // 15
console.log(date.getMinutes()); // 30
console.log(date.getSeconds()); // 45
console.log(date.getMilliseconds()); // 123

// ✅ Timestamp
console.log(date.getTime()); // 1708356645123
```

---

#### Setters

```typescript
const date = new Date('2025-02-19T10:00:00Z');

// ✅ Modificar componentes
date.setFullYear(2026);
date.setMonth(11); // Dezembro (0-indexed!)
date.setDate(25); // Dia 25
date.setHours(23, 59, 59, 999); // 23:59:59.999

console.log(date); // 2026-12-25T23:59:59.999Z

// ⚠️ Setters modificam o objeto original!
const original = new Date('2025-02-19');
const modified = original;
modified.setDate(20);

console.log(original); // 2025-02-20 (mudou!)
console.log(modified); // 2025-02-20

// ✅ Para não modificar, criar cópia
const copy = new Date(original.getTime());
```

---

### FORMATAR DATES

#### toLocaleString() - Recomendado

```typescript
const date = new Date('2025-02-19T15:30:45Z');

// ✅ Formato brasileiro completo
console.log(date.toLocaleString('pt-BR'));
// "19/02/2025, 12:30:45" (converteu para fuso horário local)

// ✅ Apenas data
console.log(date.toLocaleDateString('pt-BR'));
// "19/02/2025"

// ✅ Apenas horário
console.log(date.toLocaleTimeString('pt-BR'));
// "12:30:45"

// ✅ Com opções customizadas
console.log(date.toLocaleDateString('pt-BR', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}));
// "quarta-feira, 19 de fevereiro de 2025"

// ✅ Formato para inputs (YYYY-MM-DD)
const inputFormat = date.toISOString().split('T')[0];
console.log(inputFormat); // "2025-02-19"
```

---

#### toISOString() - Para APIs

```typescript
const date = new Date('2025-02-19T15:30:45.123Z');

// ✅ Formato ISO 8601 (padrão internacional)
console.log(date.toISOString());
// "2025-02-19T15:30:45.123Z"

// ✅ Sempre UTC (Z = Zulu time = UTC)
// Use para armazenar no banco de dados
// Use para enviar em APIs
```

---

### COMPARAR DATES

```typescript
const date1 = new Date('2025-02-19');
const date2 = new Date('2025-02-20');
const date3 = new Date('2025-02-19');

// ❌ NÃO use === (compara referência, não valor)
console.log(date1 === date3); // false (objetos diferentes)

// ✅ Compare timestamps
console.log(date1.getTime() === date3.getTime()); // true
console.log(date1.getTime() < date2.getTime()); // true

// ✅ Operadores funcionam (convertem para timestamp)
console.log(date1 < date2); // true
console.log(date1 > date2); // false

// ✅ Helper functions
function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isAfter(d1: Date, d2: Date): boolean {
  return d1.getTime() > d2.getTime();
}

function isBefore(d1: Date, d2: Date): boolean {
  return d1.getTime() < d2.getTime();
}
```

---

### CALCULAR DIFERENÇAS

```typescript
// ✅ Diferença em milissegundos
const start = new Date('2025-02-19T10:00:00Z');
const end = new Date('2025-02-19T15:30:00Z');

const diffMs = end.getTime() - start.getTime();
console.log(diffMs); // 19800000

// ✅ Converter para unidades
const diffSeconds = diffMs / 1000;
const diffMinutes = diffMs / (1000 * 60);
const diffHours = diffMs / (1000 * 60 * 60);
const diffDays = diffMs / (1000 * 60 * 60 * 24);

console.log(diffHours); // 5.5 horas

// ✅ Helper function
function daysBetween(d1: Date, d2: Date): number {
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

const days = daysBetween(
  new Date('2025-02-01'),
  new Date('2025-02-19')
);
console.log(days); // 18 dias
```

---

### ADICIONAR/SUBTRAIR TEMPO

```typescript
const date = new Date('2025-02-19T10:00:00Z');

// ✅ Adicionar dias
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const tomorrow = addDays(date, 1);
const nextWeek = addDays(date, 7);
const yesterday = addDays(date, -1);

// ✅ Adicionar meses
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

const nextMonth = addMonths(date, 1);
const lastMonth = addMonths(date, -1);

// ✅ Adicionar horas
function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

// ✅ Início/fim do dia
function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}
```

---

### TIMEZONES

```typescript
// ⚠️ Date em JS sempre armazena UTC internamente
// ⚠️ Mas getters/setters usam timezone local!

const date = new Date('2025-02-19T15:00:00Z'); // UTC

// Se você está em São Paulo (UTC-3)
console.log(date.getHours()); // 12 (converteu para local!)
console.log(date.getUTCHours()); // 15 (UTC real)

// ✅ Use UTC getters/setters para consistência
console.log(date.getUTCFullYear());
console.log(date.getUTCMonth());
console.log(date.getUTCDate());

// ✅ Obter timezone offset
const offsetMinutes = date.getTimezoneOffset();
console.log(offsetMinutes); // 180 (São Paulo = UTC-3 = -180 minutos)

// ✅ Converter timezone para string
const tzString = Intl.DateTimeFormat().resolvedOptions().timeZone;
console.log(tzString); // "America/Sao_Paulo"
```

---

### DATE-FNS LIBRARY (Recomendado)

```bash
npm install date-fns
```

```typescript
import {
  format,
  parse,
  addDays,
  addMonths,
  subDays,
  startOfMonth,
  endOfMonth,
  isAfter,
  isBefore,
  isSameDay,
  differenceInDays,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ✅ Formatar (muito mais fácil!)
const date = new Date('2025-02-19T15:30:45Z');

console.log(format(date, 'dd/MM/yyyy')); // "19/02/2025"
console.log(format(date, 'dd/MM/yyyy HH:mm')); // "19/02/2025 15:30"
console.log(format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR }));
// "19 de fevereiro de 2025"

// ✅ Parsear string
const parsed = parse('19/02/2025', 'dd/MM/yyyy', new Date());
console.log(parsed); // Date object

const isoDate = parseISO('2025-02-19T15:30:45Z');
console.log(isoDate); // Date object

// ✅ Adicionar/subtrair (retorna novo Date, não modifica original!)
const tomorrow = addDays(date, 1);
const nextMonth = addMonths(date, 1);
const yesterday = subDays(date, 1);

// ✅ Início/fim de período
const monthStart = startOfMonth(date); // 2025-02-01 00:00:00
const monthEnd = endOfMonth(date); // 2025-02-28 23:59:59

// ✅ Comparações
console.log(isSameDay(date, tomorrow)); // false
console.log(isAfter(tomorrow, date)); // true
console.log(isBefore(yesterday, date)); // true

// ✅ Diferenças
const days = differenceInDays(
  new Date('2025-02-28'),
  new Date('2025-02-01')
);
console.log(days); // 27
```

---

### EXEMPLO FINTRACK: FILTRAR TRANSAÇÕES POR PERÍODO

```typescript
// src/services/transactionService.ts

import { startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

interface DateFilter {
  startDate?: Date;
  endDate?: Date;
}

export class TransactionService {
  async getByPeriod(userId: string, filter: DateFilter) {
    // ✅ Se não especificar, usar mês atual
    const start = filter.startDate
      ? startOfDay(filter.startDate)
      : startOfMonth(new Date());

    const end = filter.endDate
      ? endOfDay(filter.endDate)
      : endOfMonth(new Date());

    return prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: start, // greater than or equal
          lte: end    // less than or equal
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
  }

  async getMonthlyReport(userId: string, year: number, month: number) {
    // month: 0-11 (Janeiro = 0)
    const date = new Date(year, month, 1);
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    const transactions = await this.getByPeriod(userId, {
      startDate: start,
      endDate: end
    });

    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      period: {
        start: format(start, 'dd/MM/yyyy'),
        end: format(end, 'dd/MM/yyyy')
      },
      income,
      expense,
      balance: income - expense,
      transactions
    };
  }
}
```

---

### EXEMPLO FINTRACK: AGENDAMENTO DE PAGAMENTOS

```typescript
// src/services/recurringPaymentService.ts

import { addMonths, isBefore } from 'date-fns';

interface RecurringPayment {
  id: string;
  amount: number;
  description: string;
  startDate: Date;
  frequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  endDate?: Date;
}

export class RecurringPaymentService {
  async generateScheduledTransactions(
    payment: RecurringPayment,
    until: Date
  ): Promise<Date[]> {
    const dates: Date[] = [];
    let currentDate = payment.startDate;

    while (isBefore(currentDate, until)) {
      // Se tem data fim e já passou, parar
      if (payment.endDate && isAfter(currentDate, payment.endDate)) {
        break;
      }

      dates.push(new Date(currentDate));

      // Avançar baseado na frequência
      switch (payment.frequency) {
        case 'MONTHLY':
          currentDate = addMonths(currentDate, 1);
          break;
        case 'WEEKLY':
          currentDate = addDays(currentDate, 7);
          break;
        case 'YEARLY':
          currentDate = addMonths(currentDate, 12);
          break;
      }
    }

    return dates;
  }

  async processRecurringPayments(): Promise<void> {
    const today = startOfDay(new Date());
    const recurringPayments = await prisma.recurringPayment.findMany({
      where: {
        nextExecutionDate: {
          lte: today
        },
        active: true
      }
    });

    for (const payment of recurringPayments) {
      await this.createTransaction(payment);

      // Atualizar próxima data
      const nextDate = addMonths(payment.nextExecutionDate, 1);
      await prisma.recurringPayment.update({
        where: { id: payment.id },
        data: { nextExecutionDate: nextDate }
      });
    }
  }
}
```

---

### EXEMPLO FINTRACK: COMPONENT COM DATE PICKER

```typescript
// src/components/TransactionFilters.tsx

import { useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export function TransactionFilters() {
  const [startDate, setStartDate] = useState<string>(
    format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState<string>(
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );

  const handleFilter = () => {
    // Converter strings para Date
    const start = new Date(startDate);
    const end = new Date(endDate);

    fetchTransactions({ startDate: start, endDate: end });
  };

  return (
    <div className="filters">
      <label>
        Data Início:
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          max={endDate} // Não pode ser depois do fim
        />
      </label>

      <label>
        Data Fim:
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate} // Não pode ser antes do início
        />
      </label>

      <button onClick={handleFilter}>Filtrar</button>
    </div>
  );
}
```

---

### ARMAZENAR DATES NO BANCO

```typescript
// ✅ Prisma schema

model Transaction {
  id          String   @id @default(cuid())
  amount      Float
  description String
  date        DateTime @default(now()) // Tipo DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([date]) // Índice para queries por data
}
```

```typescript
// ✅ Criar transação com data específica
await prisma.transaction.create({
  data: {
    amount: 100,
    description: 'Salário',
    date: new Date('2025-02-19T00:00:00Z'), // ISO string ou Date object
    userId: 'user-123'
  }
});

// ✅ Query por período
const transactions = await prisma.transaction.findMany({
  where: {
    date: {
      gte: new Date('2025-02-01'), // maior ou igual
      lt: new Date('2025-03-01')   // menor que
    }
  }
});

// ✅ Ordenar por data
const recent = await prisma.transaction.findMany({
  orderBy: {
    date: 'desc' // mais recente primeiro
  },
  take: 10
});
```

---

### COMMON PITFALLS (ARMADILHAS)

```typescript
// ❌ Mês começa em 0!
const wrong = new Date(2025, 2, 19); // Março 19, não Fevereiro!
const right = new Date(2025, 1, 19); // Fevereiro 19 ✓

// ❌ Date modifica original
const date1 = new Date('2025-02-19');
const date2 = date1;
date2.setDate(20);
console.log(date1); // 2025-02-20 (mudou!)

// ✅ Sempre criar cópia
const date2 = new Date(date1);

// ❌ Comparar com ===
const d1 = new Date('2025-02-19');
const d2 = new Date('2025-02-19');
console.log(d1 === d2); // false (objetos diferentes)

// ✅ Comparar timestamps
console.log(d1.getTime() === d2.getTime()); // true

// ❌ Parse ambíguo
const ambiguous = new Date('02/03/2025'); // 02 de Março ou 03 de Fevereiro?

// ✅ Use ISO format
const clear = new Date('2025-03-02'); // YYYY-MM-DD

// ✅ Ou date-fns parse
const parsed = parse('02/03/2025', 'dd/MM/yyyy', new Date());
```

---

### BEST PRACTICES

```typescript
// ✅ 1. SEMPRE armazene UTC no banco
await prisma.transaction.create({
  data: {
    date: new Date().toISOString() // UTC
  }
});

// ✅ 2. Converta para timezone do usuário apenas na UI
const displayDate = format(transaction.date, 'dd/MM/yyyy HH:mm', {
  locale: ptBR
});

// ✅ 3. Use date-fns para manipulação
import { addDays, isAfter } from 'date-fns';
const deadline = addDays(new Date(), 7);

// ✅ 4. Sempre crie cópias ao modificar
function addOneDay(date: Date): Date {
  return addDays(date, 1); // date-fns já retorna cópia
}

// ✅ 5. Use TypeScript para type safety
interface Transaction {
  id: string;
  amount: number;
  date: Date; // Não string!
}

// ✅ 6. Valide inputs de data
function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

// ✅ 7. Use ISO format em APIs
res.json({
  date: transaction.date.toISOString() // "2025-02-19T15:30:45.123Z"
});
```

---

### QUANDO USAR CADA ABORDAGEM

| Situação | Use |
|----------|-----|
| **Formatar para UI** | `format()` do date-fns |
| **Parsear input do usuário** | `parse()` do date-fns |
| **Armazenar no banco** | ISO string (`.toISOString()`) |
| **Adicionar/subtrair tempo** | Functions do date-fns |
| **Comparar datas** | `isAfter()`, `isBefore()`, `isSameDay()` do date-fns |
| **Calcular diferenças** | `differenceInDays()`, etc do date-fns |
| **Input HTML** | Format `yyyy-MM-dd` |
| **API Request/Response** | ISO 8601 format |
| **Logging** | `.toISOString()` |

---

## 9. REGULAR EXPRESSIONS (REGEX)

### O QUE SÃO REGEX?

**Regular Expressions (Regex)** são padrões usados para **buscar, validar e manipular strings**. São essenciais para:
- Validar emails, CPF, telefones, senhas
- Extrair informações de textos
- Substituir padrões em strings
- Sanitizar inputs do usuário

---

### SINTAXE BÁSICA

```typescript
// ✅ Criar regex com literal
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ✅ Criar regex com constructor
const dynamicRegex = new RegExp('^[0-9]+$');

// ✅ Flags
const caseInsensitive = /hello/i;  // i = case insensitive
const global = /cat/g;             // g = global (todas ocorrências)
const multiline = /^start/m;       // m = multiline
const dotAll = /./s;               // s = dot matches newline
```

---

### MÉTODOS BÁSICOS

#### test() - Verificar se Match Existe

```typescript
// ✅ test() retorna boolean
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

console.log(emailRegex.test('user@example.com')); // true
console.log(emailRegex.test('invalid-email')); // false

// Exemplo FinTrack: validar email
function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
```

---

#### match() - Extrair Matches

```typescript
// ✅ match() retorna array de matches ou null
const text = 'Meu telefone é (11) 98765-4321';
const phoneRegex = /\((\d{2})\)\s*(\d{4,5})-?(\d{4})/;

const match = text.match(phoneRegex);
console.log(match);
// [
//   '(11) 98765-4321',  // [0] = match completo
//   '11',               // [1] = primeiro grupo (DDD)
//   '98765',            // [2] = segundo grupo
//   '4321'              // [3] = terceiro grupo
// ]

// ✅ Com flag g (global)
const text2 = 'Preços: R$ 10.50, R$ 25.00, R$ 100.99';
const priceRegex = /R\$\s*(\d+\.?\d*)/g;

console.log(text2.match(priceRegex));
// ['R$ 10.50', 'R$ 25.00', 'R$ 100.99']
```

---

#### replace() - Substituir Padrões

```typescript
// ✅ replace() com string
const text = 'Hello World';
console.log(text.replace(/World/, 'JavaScript')); // "Hello JavaScript"

// ✅ replace() com função
const masked = '1234567890'.replace(/\d(?=\d{4})/g, '*');
console.log(masked); // "******7890"

// ✅ Usando grupos de captura ($1, $2, ...)
const phone = '11987654321';
const formatted = phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
console.log(formatted); // "(11) 98765-4321"

// Exemplo FinTrack: mascarar CPF
function maskCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

console.log(maskCPF('12345678900')); // "123.456.789-00"
```

---

#### exec() - Iterar sobre Matches

```typescript
// ✅ exec() com flag g para múltiplas iterações
const text = 'R$ 10.50, R$ 25.00, R$ 100.99';
const regex = /R\$\s*(\d+\.?\d*)/g;

let match;
while ((match = regex.exec(text)) !== null) {
  console.log(`Encontrado: ${match[0]}, Valor: ${match[1]}`);
}
// Encontrado: R$ 10.50, Valor: 10.50
// Encontrado: R$ 25.00, Valor: 25.00
// Encontrado: R$ 100.99, Valor: 100.99
```

---

### CARACTERES ESPECIAIS

```typescript
// . = qualquer caractere (exceto newline)
/a.c/.test('abc'); // true
/a.c/.test('a c'); // true
/a.c/.test('ac');  // false

// \d = dígito [0-9]
/\d{3}/.test('123'); // true

// \w = palavra [a-zA-Z0-9_]
/\w+/.test('hello'); // true

// \s = whitespace (espaço, tab, newline)
/\s/.test(' '); // true

// ^ = início da string
/^hello/.test('hello world'); // true
/^hello/.test('world hello'); // false

// $ = fim da string
/world$/.test('hello world'); // true
/world$/.test('world hello'); // false

// [] = classe de caracteres
/[aeiou]/.test('hello'); // true (tem 'e' e 'o')
/[0-9]/.test('abc123'); // true

// [^] = negação
/[^0-9]/.test('123'); // false (só tem dígitos)
/[^0-9]/.test('a123'); // true (tem 'a')

// | = OR
/cat|dog/.test('I have a cat'); // true
/cat|dog/.test('I have a bird'); // false

// () = grupo de captura
/(\d{2})-(\d{2})/.exec('10-20'); // ['10-20', '10', '20']

// (?:) = grupo não-capturante
/(?:\d{2})-(\d{2})/.exec('10-20'); // ['10-20', '20']

// * = 0 ou mais
/ab*c/.test('ac');    // true (0 'b')
/ab*c/.test('abbc');  // true (2 'b')

// + = 1 ou mais
/ab+c/.test('ac');    // false (0 'b')
/ab+c/.test('abc');   // true (1 'b')

// ? = 0 ou 1 (opcional)
/colou?r/.test('color');  // true
/colou?r/.test('colour'); // true

// {n} = exatamente n
/\d{3}/.test('123'); // true
/\d{3}/.test('12');  // false

// {n,} = n ou mais
/\d{3,}/.test('1234'); // true
/\d{3,}/.test('12');   // false

// {n,m} = entre n e m
/\d{3,5}/.test('1234'); // true
/\d{3,5}/.test('12');   // false
```

---

### VALIDAÇÕES COMUNS NO FINTRACK

#### Email

```typescript
// ✅ Email básico
function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// ✅ Email mais rigoroso (RFC 5322 simplificado)
function isValidEmailStrict(email: string): boolean {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

console.log(isValidEmail('user@example.com')); // true
console.log(isValidEmail('user@.com')); // false
```

---

#### CPF

```typescript
// ✅ Validar formato CPF
function isValidCPFFormat(cpf: string): boolean {
  // Remove formatação
  const cleaned = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  const regex = /^\d{11}$/;
  return regex.test(cleaned);
}

// ✅ Validar CPF completo (com dígitos verificadores)
function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');

  if (!/^\d{11}$/.test(cleaned)) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  // Validar dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;

  return (
    parseInt(cleaned[9]) === digit1 &&
    parseInt(cleaned[10]) === digit2
  );
}

console.log(isValidCPF('123.456.789-00')); // false (inválido)
console.log(isValidCPF('111.444.777-35')); // true (válido)
```

---

#### Telefone Brasileiro

```typescript
// ✅ Validar telefone brasileiro
function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');

  // (11) 98765-4321 ou (11) 3456-7890
  const regex = /^(?:\d{2})(?:\d{4,5})(?:\d{4})$/;

  return regex.test(cleaned);
}

// ✅ Formatar telefone
function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return phone;
}

console.log(formatPhone('11987654321')); // "(11) 98765-4321"
console.log(formatPhone('1134567890'));  // "(11) 3456-7890"
```

---

#### Senha Forte

```typescript
// ✅ Validar senha forte
function isStrongPassword(password: string): boolean {
  // Mínimo 8 caracteres
  // Pelo menos 1 maiúscula
  // Pelo menos 1 minúscula
  // Pelo menos 1 número
  // Pelo menos 1 caractere especial

  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar
  );
}

// ✅ Versão com uma regex (mais complexa)
function isStrongPasswordRegex(password: string): boolean {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

console.log(isStrongPassword('Abc123!@')); // true
console.log(isStrongPassword('password')); // false
```

---

#### Valores Monetários

```typescript
// ✅ Extrair valores monetários de texto
function extractMoneyValues(text: string): number[] {
  const regex = /R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g;
  const matches = text.matchAll(regex);

  const values: number[] = [];
  for (const match of matches) {
    // Converter "1.234,56" para 1234.56
    const normalized = match[1]
      .replace(/\./g, '') // Remove pontos de milhar
      .replace(',', '.'); // Troca vírgula por ponto

    values.push(parseFloat(normalized));
  }

  return values;
}

const text = 'Transações: R$ 1.234,56, R$ 500,00 e R$ 10.000,99';
console.log(extractMoneyValues(text)); // [1234.56, 500, 10000.99]
```

---

#### URL

```typescript
// ✅ Validar URL
function isValidURL(url: string): boolean {
  const regex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
  return regex.test(url);
}

console.log(isValidURL('https://example.com')); // true
console.log(isValidURL('not-a-url')); // false
```

---

### LOOKAHEAD E LOOKBEHIND

```typescript
// ✅ Positive Lookahead (?=...)
// Match se seguido por padrão
const hasDigitFollowedByLetter = /\d(?=[a-z])/;
console.log(hasDigitFollowedByLetter.test('1a')); // true
console.log(hasDigitFollowedByLetter.test('12')); // false

// ✅ Negative Lookahead (?!...)
// Match se NÃO seguido por padrão
const notFollowedByDigit = /\d(?!\d)/;
console.log(notFollowedByDigit.test('12')); // true (match no '2')
console.log(notFollowedByDigit.test('1')); // true

// ✅ Positive Lookbehind (?<=...)
// Match se precedido por padrão
const priceWithSymbol = /(?<=R\$\s*)\d+/;
console.log('R$ 100'.match(priceWithSymbol)); // ['100']

// ✅ Negative Lookbehind (?<!...)
// Match se NÃO precedido por padrão
const notPrecededByDollar = /(?<!\$)\d+/;
console.log('$100 and 200'.match(notPrecededByDollar)); // ['200']
```

---

### EXEMPLO FINTRACK: VALIDAÇÃO DE TRANSAÇÃO

```typescript
// src/validators/transactionValidator.ts

import { z } from 'zod';

// ✅ Custom validators com regex
const amountRegex = /^\d+(\.\d{1,2})?$/;
const descriptionRegex = /^[a-zA-Z0-9\s\-,\.]{3,200}$/;

export const transactionSchema = z.object({
  amount: z
    .string()
    .regex(amountRegex, 'Valor inválido (use formato: 123.45)')
    .transform(Number)
    .refine(val => val > 0, 'Valor deve ser positivo'),

  description: z
    .string()
    .regex(descriptionRegex, 'Descrição contém caracteres inválidos')
    .min(3, 'Descrição muito curta')
    .max(200, 'Descrição muito longa'),

  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)')
    .transform(str => new Date(str)),

  type: z.enum(['INCOME', 'EXPENSE']),

  categoryId: z
    .string()
    .regex(/^[a-z0-9]{20,}$/, 'ID de categoria inválido'),
});

// Uso
try {
  const validated = transactionSchema.parse({
    amount: '123.45',
    description: 'Compra de materiais',
    date: '2025-02-19',
    type: 'EXPENSE',
    categoryId: 'clsj8r9x00000abc123def45'
  });

  console.log(validated);
} catch (error) {
  console.error(error.errors);
}
```

---

### EXEMPLO FINTRACK: SANITIZAÇÃO DE INPUT

```typescript
// src/utils/sanitize.ts

export class Sanitizer {
  // ✅ Remover caracteres perigosos para SQL Injection
  static sanitizeSQL(input: string): string {
    return input.replace(/['";\\]/g, '');
  }

  // ✅ Remover HTML tags (XSS protection)
  static sanitizeHTML(input: string): string {
    return input.replace(/<[^>]*>/g, '');
  }

  // ✅ Apenas números (útil para CPF, telefone)
  static numbersOnly(input: string): string {
    return input.replace(/\D/g, '');
  }

  // ✅ Apenas letras e espaços
  static lettersOnly(input: string): string {
    return input.replace(/[^a-zA-Z\s]/g, '');
  }

  // ✅ Normalizar espaços
  static normalizeSpaces(input: string): string {
    return input.replace(/\s+/g, ' ').trim();
  }

  // ✅ Limpar valor monetário
  static cleanMoneyValue(input: string): number {
    const cleaned = input
      .replace(/[^\d,.-]/g, '') // Remove tudo exceto dígitos, vírgula, ponto, hífen
      .replace(/\./g, '')        // Remove pontos (milhar)
      .replace(',', '.');        // Troca vírgula por ponto

    return parseFloat(cleaned) || 0;
  }
}

// Uso
const userInput = '  R$ 1.234,56  ';
const value = Sanitizer.cleanMoneyValue(userInput);
console.log(value); // 1234.56

const cpf = '(123) 456.789-00';
const cleanCPF = Sanitizer.numbersOnly(cpf);
console.log(cleanCPF); // "12345678900"
```

---

### EXEMPLO FINTRACK: SEARCH/FILTER

```typescript
// src/services/transactionService.ts

export class TransactionService {
  async search(userId: string, query: string) {
    // ✅ Escapar caracteres especiais de regex
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // ✅ Criar regex case-insensitive
    const regex = new RegExp(escaped, 'i');

    // Buscar em Prisma (PostgreSQL suporta regex)
    const transactions = await prisma.$queryRaw`
      SELECT * FROM transactions
      WHERE user_id = ${userId}
      AND description ~* ${escaped}
      ORDER BY date DESC
    `;

    return transactions;
  }

  // ✅ Versão com filter em memória
  filterByQuery(transactions: Transaction[], query: string): Transaction[] {
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    return transactions.filter(t =>
      regex.test(t.description) ||
      regex.test(t.category?.name || '') ||
      regex.test(t.amount.toString())
    );
  }
}
```

---

### COMMON PITFALLS (ARMADILHAS)

```typescript
// ❌ Esquecer de escapar caracteres especiais
const badRegex = new RegExp('.$'); // . é qualquer char!
console.log(badRegex.test('hello')); // true (não o esperado)

// ✅ Escapar corretamente
const goodRegex = new RegExp('\\.$'); // \. é literal '.'
console.log(goodRegex.test('hello.')); // true

// ❌ Flag g com test() causa comportamento estranho
const regex = /test/g;
console.log(regex.test('test')); // true
console.log(regex.test('test')); // false (!!!)
// Problema: regex mantém lastIndex entre chamadas

// ✅ Não use flag g com test()
const regex2 = /test/;
console.log(regex2.test('test')); // true
console.log(regex2.test('test')); // true ✓

// ❌ Esquecer ^ e $ permite matches parciais
const partial = /\d{3}/;
console.log(partial.test('abc123def')); // true (match parcial)

// ✅ Use ^ e $ para match completo
const complete = /^\d{3}$/;
console.log(complete.test('abc123def')); // false
console.log(complete.test('123')); // true ✓

// ❌ Confundir \d com \D, \w com \W, etc.
// \d = dígito, \D = NÃO dígito
// \w = palavra, \W = NÃO palavra
// \s = espaço, \S = NÃO espaço
```

---

### BEST PRACTICES

```typescript
// ✅ 1. Sempre validar no backend também (não confie no frontend)
// Frontend
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  alert('Email inválido');
  return;
}

// Backend (SEMPRE!)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw new ValidationError('Email inválido');
}

// ✅ 2. Use bibliotecas para validações complexas
import { z } from 'zod';
import validator from 'validator';

// Em vez de regex complexo para email
const email = z.string().email();

// Em vez de regex para URL
validator.isURL('https://example.com');

// ✅ 3. Documente regexes complexas
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// Mínimo 8 caracteres
// Pelo menos 1 minúscula
// Pelo menos 1 maiúscula
// Pelo menos 1 dígito
// Pelo menos 1 caractere especial

// ✅ 4. Teste suas regexes
// Use https://regex101.com/ para testar e debugar

// ✅ 5. Performance: compile regexes uma vez
// ❌ Ruim (compila a cada chamada)
function validate(value: string): boolean {
  return /^\d+$/.test(value);
}

// ✅ Bom (compila uma vez)
const numberRegex = /^\d+$/;
function validate(value: string): boolean {
  return numberRegex.test(value);
}

// ✅ 6. Use named capture groups para legibilidade (ES2018+)
const phoneRegex = /\((?<ddd>\d{2})\)\s*(?<number>\d{5}-\d{4})/;
const match = '(11) 98765-4321'.match(phoneRegex);
console.log(match.groups.ddd); // "11"
console.log(match.groups.number); // "98765-4321"
```

---

### FERRAMENTAS ÚTEIS

```typescript
// ✅ regex101.com - Testar e debugar regex online
// ✅ regexr.com - Alternativa com visualizações
// ✅ validator.js - Biblioteca de validações prontas
import validator from 'validator';

validator.isEmail('user@example.com'); // true
validator.isCreditCard('4111111111111111'); // true
validator.isURL('https://example.com'); // true
validator.isUUID('550e8400-e29b-41d4-a716-446655440000'); // true

// ✅ zod - Schema validation com regex support
import { z } from 'zod';

const schema = z.object({
  username: z.string().regex(/^[a-z0-9_]{3,20}$/),
  email: z.string().email(),
  phone: z.string().regex(/^\(\d{2}\)\s*\d{4,5}-\d{4}$/)
});
```

---

### CHECKLIST REGEX

```
[ ] Entendo caracteres especiais (., *, +, ?, ^, $, [], {}, ())
[ ] Sei usar quantificadores (*, +, ?, {n}, {n,m})
[ ] Sei usar classes de caracteres (\d, \w, \s)
[ ] Sei criar grupos de captura () e não-capturantes (?:)
[ ] Entendo anchors (^ início, $ fim)
[ ] Sei usar lookahead e lookbehind
[ ] Sei quando usar flags (i, g, m, s)
[ ] Sempre valido no backend
[ ] Escapo caracteres especiais quando necessário
[ ] Uso bibliotecas para casos complexos (validator, zod)
[ ] Testo minhas regexes antes de usar em produção
```

---

### QUANDO USAR REGEX

| Situação | Use Regex? |
|----------|-----------|
| **Validar email** | ✅ Sim (ou biblioteca) |
| **Validar CPF/CNPJ** | ⚠️ Regex + algoritmo verificador |
| **Validar telefone** | ✅ Sim |
| **Validar senha forte** | ✅ Sim |
| **Extrair dados de texto** | ✅ Sim |
| **Substituir padrões** | ✅ Sim |
| **Sanitizar inputs** | ✅ Sim |
| **Parse JSON** | ❌ Não (use JSON.parse) |
| **Parse HTML** | ❌ Não (use DOMParser ou biblioteca) |
| **Validações muito complexas** | ⚠️ Use biblioteca especializada |

---

## 10. AUTHENTICATION & AUTHORIZATION

### O QUE É AUTH?

**Authentication (Autenticação)**: Verificar **quem é o usuário** (identidade)
**Authorization (Autorização)**: Verificar **o que o usuário pode fazer** (permissões)

```
Authentication: "Você é quem diz ser?"
Authorization: "Você tem permissão para fazer isso?"
```

---

### AUTHENTICATION STRATEGIES

#### 1. SESSION-BASED AUTH

**Como funciona:**
1. Usuário envia credenciais (email/senha)
2. Servidor valida e cria sessão
3. Servidor retorna Session ID (cookie)
4. Cliente envia cookie em cada request
5. Servidor valida session ID

```typescript
// Backend: src/middleware/sessionAuth.ts

import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

// ✅ Configurar Redis para armazenar sessões
const redisClient = createClient({
  url: process.env.REDIS_URL
});
redisClient.connect();

export const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    httpOnly: true, // Não acessível via JavaScript
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
    sameSite: 'lax' // CSRF protection
  }
});

// ✅ Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  // Salvar na sessão
  req.session.userId = user.id;
  req.session.email = user.email;

  res.json({ message: 'Login bem-sucedido', user });
});

// ✅ Middleware para rotas protegidas
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  next();
}

// ✅ Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    res.json({ message: 'Logout bem-sucedido' });
  });
});
```

**Vantagens:**
- Servidor tem controle total (pode invalidar sessão)
- Familiar e bem estabelecido
- Funciona bem com SSR

**Desvantagens:**
- Requer storage no servidor (Redis, memória)
- Dificulta scaling horizontal
- CORS pode ser complicado

---

#### 2. JWT (JSON WEB TOKEN)

**Como funciona:**
1. Usuário envia credenciais
2. Servidor valida e gera JWT
3. Cliente armazena JWT (localStorage/sessionStorage)
4. Cliente envia JWT no header Authorization
5. Servidor valida JWT

```typescript
// Backend: src/utils/jwt.ts

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';
const REFRESH_SECRET = process.env.REFRESH_SECRET!;
const REFRESH_EXPIRES_IN = '30d';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// ✅ Gerar access token
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

// ✅ Gerar refresh token
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN
  });
}

// ✅ Verificar token
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

// ✅ Verificar refresh token
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
}
```

```typescript
// Backend: src/controllers/authController.ts

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // ✅ Gerar tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // ✅ Salvar refresh token no banco
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token não fornecido' });
    }

    try {
      // ✅ Verificar refresh token
      const payload = verifyRefreshToken(refreshToken);

      // ✅ Verificar se existe no banco
      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      });

      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({ error: 'Refresh token inválido' });
      }

      // ✅ Gerar novo access token
      const newPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const newAccessToken = generateAccessToken(newPayload);

      res.json({ accessToken: newAccessToken });
    } catch (error) {
      return res.status(401).json({ error: 'Refresh token inválido' });
    }
  }

  async logout(req: Request, res: Response) {
    const userId = req.user.id;

    // ✅ Remover refresh token do banco
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    });

    res.json({ message: 'Logout bem-sucedido' });
  }
}
```

```typescript
// Backend: src/middleware/auth.ts

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);

    // Adicionar user ao request
    req.user = payload;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }

    return res.status(401).json({ error: 'Token inválido' });
  }
}
```

```typescript
// Frontend: src/services/api.ts

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// ✅ Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ Interceptor para refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se token expirou e ainda não tentamos refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = sessionStorage.getItem('refreshToken');

      if (!refreshToken) {
        // Redirecionar para login
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          refreshToken
        });

        sessionStorage.setItem('accessToken', data.accessToken);

        // Tentar request original novamente
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh falhou, fazer logout
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

**Vantagens:**
- Stateless (não precisa storage no servidor)
- Escala bem horizontalmente
- Funciona em mobile apps
- CORS amigável

**Desvantagens:**
- Não pode ser invalidado até expirar
- Precisa refresh token para renovação
- XSS risk se armazenado em localStorage

---

### AUTHORIZATION (RBAC)

**Role-Based Access Control**: Usuários têm **roles** (papéis) com **permissions** (permissões).

```typescript
// Backend: src/types/roles.ts

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MODERATOR = 'MODERATOR'
}

export enum Permission {
  // Transações
  CREATE_TRANSACTION = 'CREATE_TRANSACTION',
  READ_TRANSACTION = 'READ_TRANSACTION',
  UPDATE_TRANSACTION = 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION = 'DELETE_TRANSACTION',

  // Contas
  CREATE_ACCOUNT = 'CREATE_ACCOUNT',
  READ_ACCOUNT = 'READ_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',

  // Admin
  MANAGE_USERS = 'MANAGE_USERS',
  VIEW_ALL_DATA = 'VIEW_ALL_DATA'
}

// ✅ Mapear roles para permissions
export const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.CREATE_TRANSACTION,
    Permission.READ_TRANSACTION,
    Permission.UPDATE_TRANSACTION,
    Permission.DELETE_TRANSACTION,
    Permission.CREATE_ACCOUNT,
    Permission.READ_ACCOUNT,
    Permission.UPDATE_ACCOUNT,
    Permission.DELETE_ACCOUNT,
    Permission.MANAGE_USERS,
    Permission.VIEW_ALL_DATA
  ],
  [Role.MODERATOR]: [
    Permission.CREATE_TRANSACTION,
    Permission.READ_TRANSACTION,
    Permission.UPDATE_TRANSACTION,
    Permission.CREATE_ACCOUNT,
    Permission.READ_ACCOUNT,
    Permission.UPDATE_ACCOUNT,
    Permission.VIEW_ALL_DATA
  ],
  [Role.USER]: [
    Permission.CREATE_TRANSACTION,
    Permission.READ_TRANSACTION,
    Permission.UPDATE_TRANSACTION,
    Permission.DELETE_TRANSACTION,
    Permission.CREATE_ACCOUNT,
    Permission.READ_ACCOUNT,
    Permission.UPDATE_ACCOUNT
  ]
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}
```

```typescript
// Backend: src/middleware/authorization.ts

export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!hasPermission(user.role, permission)) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    next();
  };
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    next();
  };
}
```

```typescript
// Backend: src/routes/transactionRoutes.ts

import { requireAuth } from '../middleware/auth';
import { requirePermission, requireRole } from '../middleware/authorization';
import { Permission, Role } from '../types/roles';

const router = Router();

// ✅ Qualquer usuário autenticado pode listar suas transações
router.get(
  '/',
  requireAuth,
  transactionController.list
);

// ✅ Apenas users com permissão podem criar
router.post(
  '/',
  requireAuth,
  requirePermission(Permission.CREATE_TRANSACTION),
  transactionController.create
);

// ✅ Apenas admin pode deletar
router.delete(
  '/:id',
  requireAuth,
  requireRole(Role.ADMIN),
  transactionController.delete
);

// ✅ Apenas admin pode ver todas as transações
router.get(
  '/all',
  requireAuth,
  requirePermission(Permission.VIEW_ALL_DATA),
  transactionController.listAll
);

export default router;
```

---

### RESOURCE-BASED AUTHORIZATION

Verificar se usuário pode acessar **recurso específico** (ownership).

```typescript
// Backend: src/middleware/ownership.ts

export function requireOwnership(resourceType: 'transaction' | 'account') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const resourceId = req.params.id;

    try {
      let resource;

      if (resourceType === 'transaction') {
        resource = await prisma.transaction.findUnique({
          where: { id: resourceId }
        });
      } else if (resourceType === 'account') {
        resource = await prisma.account.findUnique({
          where: { id: resourceId }
        });
      }

      if (!resource) {
        return res.status(404).json({ error: 'Recurso não encontrado' });
      }

      // ✅ Verificar ownership
      if (resource.userId !== user.userId) {
        return res.status(403).json({ error: 'Sem permissão' });
      }

      // Adicionar recurso ao request para evitar buscar novamente
      req.resource = resource;

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao verificar ownership' });
    }
  };
}
```

```typescript
// Uso
router.put(
  '/transactions/:id',
  requireAuth,
  requireOwnership('transaction'),
  transactionController.update
);

router.delete(
  '/accounts/:id',
  requireAuth,
  requireOwnership('account'),
  accountController.delete
);
```

---

### PROTECTED ROUTES NO FRONTEND

```typescript
// Frontend: src/components/ProtectedRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: Role;
  requiredPermission?: Permission;
}

export function ProtectedRoute({ requiredRole, requiredPermission }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
```

```typescript
// Frontend: src/App.tsx

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rotas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
      </Route>

      {/* Apenas admin */}
      <Route element={<ProtectedRoute requiredRole={Role.ADMIN} />}>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/users" element={<UsersManagement />} />
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

---

### BEST PRACTICES

```typescript
// ✅ 1. SEMPRE hash senhas
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash(password, 12); // 12 rounds

// ✅ 2. SEMPRE valide no backend
// Frontend validation é UX, não segurança

// ✅ 3. Use HTTPS em produção
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure) {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// ✅ 4. Configure CORS corretamente
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true // Permite cookies
}));

// ✅ 5. Rate limiting em rotas de auth
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 tentativas
  message: 'Muitas tentativas de login, tente novamente em 15 minutos'
});

router.post('/login', loginLimiter, authController.login);

// ✅ 6. Não exponha informações sensíveis em erros
// ❌ Ruim
if (!user) {
  return res.status(401).json({ error: 'Usuário não encontrado' });
}
if (!validPassword) {
  return res.status(401).json({ error: 'Senha incorreta' });
}

// ✅ Bom (não revela se email existe)
if (!user || !validPassword) {
  return res.status(401).json({ error: 'Credenciais inválidas' });
}

// ✅ 7. Tokens curtos + refresh token
const accessToken = generateAccessToken(payload, '15m'); // 15 minutos
const refreshToken = generateRefreshToken(payload, '7d'); // 7 dias

// ✅ 8. Logout invalida refresh token
await prisma.user.update({
  where: { id: userId },
  data: { refreshToken: null }
});

// ✅ 9. Armazene tokens com segurança
// sessionStorage (limpa ao fechar tab) ou
// httpOnly cookies (mais seguro, imune a XSS)

// ✅ 10. Implemente CSRF protection
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);
```

---

### CHECKLIST AUTH

```
[ ] Senhas são sempre hasheadas (bcrypt)
[ ] Validação no backend (não confio no frontend)
[ ] HTTPS em produção
[ ] CORS configurado corretamente
[ ] Rate limiting em rotas de auth
[ ] Tokens têm expiração
[ ] Refresh token implementado
[ ] Logout invalida sessão/token
[ ] Erros não revelam informações sensíveis
[ ] RBAC ou ABAC implementado
[ ] Rotas protegidas no backend e frontend
[ ] Ownership verificado em recursos
[ ] XSS protection (httpOnly cookies ou sanitização)
[ ] CSRF protection implementado
```

---

## 11. API DESIGN BEST PRACTICES

### O QUE É BOA API DESIGN?

Uma boa API é:
- **Intuitiva**: Fácil de entender e usar
- **Consistente**: Padrões previsíveis
- **Documentada**: Clara e completa
- **Versionada**: Mudanças não quebram clientes
- **Segura**: Protegida contra ataques
- **Performática**: Rápida e eficiente

---

### REST API PRINCIPLES

#### 1. RECURSOS E ENDPOINTS

```typescript
// ✅ BOM: Recursos no plural, verbos HTTP para ações
GET    /api/transactions       // Listar todas
GET    /api/transactions/:id   // Buscar uma
POST   /api/transactions       // Criar nova
PUT    /api/transactions/:id   // Atualizar completa
PATCH  /api/transactions/:id   // Atualizar parcial
DELETE /api/transactions/:id   // Deletar

// ❌ RUIM: Verbos nos endpoints
GET    /api/getTransactions
POST   /api/createTransaction
POST   /api/deleteTransaction/:id

// ✅ BOM: Recursos aninhados para relacionamentos
GET    /api/accounts/:accountId/transactions
POST   /api/accounts/:accountId/transactions

// ❌ RUIM: Aninhamento profundo (máximo 2 níveis)
GET    /api/users/:userId/accounts/:accountId/transactions/:transactionId/attachments
```

---

#### 2. HTTP STATUS CODES

```typescript
// ✅ Use códigos corretos

// 2xx: Sucesso
200 OK              // GET, PUT, PATCH bem-sucedido
201 Created         // POST bem-sucedido, recurso criado
204 No Content      // DELETE bem-sucedido, sem retorno

// 4xx: Erro do cliente
400 Bad Request     // Dados inválidos
401 Unauthorized    // Não autenticado
403 Forbidden       // Autenticado mas sem permissão
404 Not Found       // Recurso não existe
409 Conflict        // Conflito (ex: email já existe)
422 Unprocessable   // Validação falhou
429 Too Many Requests // Rate limit excedido

// 5xx: Erro do servidor
500 Internal Server Error  // Erro genérico
503 Service Unavailable    // Servidor temporariamente indisponível
```

```typescript
// Exemplo FinTrack

export class TransactionController {
  async create(req: Request, res: Response) {
    try {
      const transaction = await this.service.create(req.body);
      return res.status(201).json(transaction); // ✅ 201 Created
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(422).json({ error: error.message }); // ✅ 422
      }
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message }); // ✅ 404
      }
      return res.status(500).json({ error: 'Erro interno' }); // ✅ 500
    }
  }

  async delete(req: Request, res: Response) {
    await this.service.delete(req.params.id);
    return res.status(204).send(); // ✅ 204 No Content
  }
}
```

---

#### 3. REQUEST/RESPONSE FORMAT

```typescript
// ✅ BOM: JSON consistente

// Request body
POST /api/transactions
{
  "amount": 100.50,
  "description": "Almoço",
  "type": "EXPENSE",
  "categoryId": "cat-123",
  "accountId": "acc-456",
  "date": "2025-02-19"
}

// Response sucesso
{
  "id": "txn-789",
  "amount": 100.50,
  "description": "Almoço",
  "type": "EXPENSE",
  "categoryId": "cat-123",
  "accountId": "acc-456",
  "date": "2025-02-19T00:00:00.000Z",
  "createdAt": "2025-02-19T15:30:45.123Z",
  "updatedAt": "2025-02-19T15:30:45.123Z"
}

// Response erro (formato consistente)
{
  "error": "Valor deve ser positivo",
  "code": "INVALID_AMOUNT",
  "field": "amount"
}

// Response erro com múltiplos campos
{
  "error": "Validação falhou",
  "code": "VALIDATION_ERROR",
  "fields": {
    "amount": "Valor deve ser positivo",
    "description": "Descrição é obrigatória",
    "categoryId": "Categoria não encontrada"
  }
}
```

---

#### 4. PAGINAÇÃO

```typescript
// ✅ BOM: Query params para paginação

GET /api/transactions?page=1&limit=20

// Response com metadados
{
  "data": [
    { "id": "txn-1", "amount": 100, ... },
    { "id": "txn-2", "amount": 200, ... }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 157,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "links": {
    "first": "/api/transactions?page=1&limit=20",
    "last": "/api/transactions?page=8&limit=20",
    "next": "/api/transactions?page=2&limit=20",
    "prev": null
  }
}
```

```typescript
// Implementação

export class TransactionController {
  async list(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: req.user.id },
        skip,
        take: limit,
        orderBy: { date: 'desc' }
      }),
      prisma.transaction.count({
        where: { userId: req.user.id }
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      data: transactions,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      links: {
        first: `/api/transactions?page=1&limit=${limit}`,
        last: `/api/transactions?page=${totalPages}&limit=${limit}`,
        next: page < totalPages ? `/api/transactions?page=${page + 1}&limit=${limit}` : null,
        prev: page > 1 ? `/api/transactions?page=${page - 1}&limit=${limit}` : null
      }
    });
  }
}
```

---

#### 5. FILTROS E ORDENAÇÃO

```typescript
// ✅ BOM: Query params para filtros

GET /api/transactions?type=EXPENSE&categoryId=cat-123&dateFrom=2025-02-01&dateTo=2025-02-28&sort=-date,amount

// sort: - = desc, + ou vazio = asc
// Múltiplos campos separados por vírgula
```

```typescript
// Implementação

export class TransactionController {
  async list(req: Request, res: Response) {
    const { type, categoryId, dateFrom, dateTo, sort } = req.query;

    // ✅ Construir where dinamicamente
    const where: any = { userId: req.user.id };

    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom as string);
      if (dateTo) where.date.lte = new Date(dateTo as string);
    }

    // ✅ Construir orderBy dinamicamente
    const orderBy: any[] = [];

    if (sort) {
      const fields = (sort as string).split(',');
      for (const field of fields) {
        if (field.startsWith('-')) {
          orderBy.push({ [field.slice(1)]: 'desc' });
        } else {
          orderBy.push({ [field]: 'asc' });
        }
      }
    } else {
      // Default: mais recente primeiro
      orderBy.push({ date: 'desc' });
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy
    });

    res.json({ data: transactions });
  }
}
```

---

#### 6. VERSIONAMENTO

```typescript
// ✅ OPÇÃO 1: URL versioning (mais comum)
GET /api/v1/transactions
GET /api/v2/transactions

// ✅ OPÇÃO 2: Header versioning
GET /api/transactions
Headers: Accept: application/vnd.fintrack.v1+json

// ✅ OPÇÃO 3: Query param
GET /api/transactions?version=1
```

```typescript
// Implementação URL versioning

// src/routes/index.ts
import v1Routes from './v1';
import v2Routes from './v2';

app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

// src/routes/v1/index.ts
const router = Router();
router.use('/transactions', transactionRoutesV1);
export default router;

// src/routes/v2/index.ts
const router = Router();
router.use('/transactions', transactionRoutesV2);
export default router;
```

---

### NAMING CONVENTIONS

```typescript
// ✅ camelCase para JSON fields
{
  "userId": "user-123",
  "firstName": "João",
  "createdAt": "2025-02-19T15:30:45.123Z"
}

// ✅ Plural para coleções
/api/transactions
/api/accounts
/api/categories

// ✅ Singular para recurso único
/api/transactions/txn-123
/api/me (usuário atual)
/api/config

// ✅ Kebab-case para URLs
/api/recurring-payments
/api/payment-methods

// ✅ Consistência!
// Se usou camelCase, use sempre
// Se usou snake_case, use sempre
```

---

### IDEMPOTÊNCIA

```typescript
// ✅ Operações idempotentes: resultado igual independente de quantas vezes executar

// GET, PUT, DELETE são naturalmente idempotentes
GET    /api/transactions/:id   // Sempre retorna mesmo resultado
PUT    /api/transactions/:id   // Múltiplas chamadas = mesmo estado final
DELETE /api/transactions/:id   // Deletar 2x = recurso deletado

// POST NÃO é idempotente (cria novo recurso a cada chamada)
POST   /api/transactions        // Cada call cria nova transação

// ✅ Tornar POST idempotente com Idempotency-Key
app.post('/api/transactions', async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];

  if (idempotencyKey) {
    // Verificar se já processamos esta key
    const existing = await redis.get(`idempotency:${idempotencyKey}`);
    if (existing) {
      return res.json(JSON.parse(existing)); // Retornar resultado anterior
    }
  }

  const transaction = await service.create(req.body);

  if (idempotencyKey) {
    // Salvar resultado por 24h
    await redis.setex(`idempotency:${idempotencyKey}`, 86400, JSON.stringify(transaction));
  }

  res.status(201).json(transaction);
});
```

---

### RATE LIMITING

```typescript
// src/middleware/rateLimiter.ts

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect();

// ✅ Limite global
export const globalLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:global:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests
  message: 'Muitas requisições, tente novamente mais tarde',
  standardHeaders: true, // Retorna rate limit nos headers
  legacyHeaders: false
});

// ✅ Limite específico para auth
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // Apenas 5 tentativas de login
  message: 'Muitas tentativas de login, tente novamente em 15 minutos'
});

// ✅ Headers retornados
/*
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708358445
Retry-After: 900
*/
```

---

### CACHING

```typescript
// ✅ Cache-Control headers

app.get('/api/transactions', async (req, res) => {
  const transactions = await service.getAll();

  // Cache por 5 minutos
  res.set('Cache-Control', 'private, max-age=300');

  res.json(transactions);
});

// ✅ ETag para validação
app.get('/api/transactions/:id', async (req, res) => {
  const transaction = await service.getById(req.params.id);

  const etag = generateETag(transaction);
  res.set('ETag', etag);

  // Cliente envia If-None-Match com ETag
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).send(); // Not Modified
  }

  res.json(transaction);
});

// ✅ Estratégias de cache
/*
private          - Apenas cliente pode cachear
public           - Proxies podem cachear
no-cache         - Revalidar sempre
no-store         - Nunca cachear
max-age=N        - Cache válido por N segundos
must-revalidate  - Revalidar quando expirar
*/
```

---

### DOCUMENTAÇÃO (SWAGGER/OPENAPI)

```typescript
// src/swagger.ts

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FinTrack API',
      version: '1.0.0',
      description: 'API de gerenciamento financeiro pessoal'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Desenvolvimento'
      },
      {
        url: 'https://api.fintrack.com',
        description: 'Produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const specs = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

```typescript
// src/controllers/transactionController.ts

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Listar todas as transações
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items por página
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         description: Filtrar por tipo
 *     responses:
 *       200:
 *         description: Lista de transações
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       401:
 *         description: Não autenticado
 */
export async function list(req: Request, res: Response) {
  // ...
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - amount
 *         - type
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           description: ID único da transação
 *         amount:
 *           type: number
 *           description: Valor da transação
 *         description:
 *           type: string
 *           description: Descrição da transação
 *         type:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         date:
 *           type: string
 *           format: date-time
 */
```

---

### BEST PRACTICES CHECKLIST

```typescript
// ✅ API Design Checklist

[ ] Usa verbos HTTP corretamente (GET, POST, PUT, DELETE)
[ ] Recursos no plural (/transactions, não /transaction)
[ ] Status codes corretos (200, 201, 400, 404, 500, etc.)
[ ] Formato JSON consistente
[ ] Paginação implementada
[ ] Filtros e ordenação suportados
[ ] Versionamento (v1, v2...)
[ ] Rate limiting configurado
[ ] Caching strategy definida
[ ] Documentação (Swagger/OpenAPI)
[ ] Idempotência para operações críticas
[ ] Validação de inputs
[ ] Error handling consistente
[ ] CORS configurado
[ ] HTTPS em produção
[ ] Logging de requisições
[ ] Monitoramento de performance
```

---

## 12. ESTADO GLOBAL AVANÇADO

### POR QUE ESTADO GLOBAL?

**Problema:** Passar props por muitos componentes (prop drilling)

```typescript
// ❌ Prop drilling
function App() {
  const [user, setUser] = useState<User | null>(null);

  return <Dashboard user={user} setUser={setUser} />;
}

function Dashboard({ user, setUser }: Props) {
  return <Sidebar user={user} setUser={setUser} />;
}

function Sidebar({ user, setUser }: Props) {
  return <UserMenu user={user} setUser={setUser} />;
}

function UserMenu({ user, setUser }: Props) {
  // Finalmente usa!
  return <div>{user.name}</div>;
}
```

**Solução:** Estado global acessível em qualquer componente

---

### CONTEXT API (BUILT-IN REACT)

```typescript
// src/contexts/AuthContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Carregar user ao montar
  useEffect(() => {
    const loadUser = async () => {
      const token = sessionStorage.getItem('accessToken');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        sessionStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });

    const { accessToken, refreshToken, user } = response.data;

    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);

    setUser(user);
  };

  const logout = async () => {
    await api.post('/auth/logout');

    sessionStorage.clear();
    setUser(null);
  };

  const register = async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);

    const { accessToken, refreshToken, user } = response.data;

    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);

    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
```

```typescript
// src/main.tsx

import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
```

```typescript
// Usar em qualquer componente

function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div>
      <span>{user.name}</span>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

**Vantagens Context:**
- Built-in React (sem libs)
- Simples para casos básicos

**Desvantagens:**
- Re-renders desnecessários
- Difícil debugar
- Não tem DevTools
- Performance ruim em apps grandes

---

### ZUSTAND (RECOMENDADO)

```bash
npm install zustand
```

```typescript
// src/stores/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });

        const { accessToken, refreshToken, user } = response.data;

        set({
          user,
          accessToken,
          refreshToken
        });
      },

      logout: async () => {
        await api.post('/auth/logout');

        set({
          user: null,
          accessToken: null,
          refreshToken: null
        });
      },

      register: async (data) => {
        const response = await api.post('/auth/register', data);

        const { accessToken, refreshToken, user } = response.data;

        set({
          user,
          accessToken,
          refreshToken
        });
      },

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken })
    }),
    {
      name: 'auth-storage', // Nome no sessionStorage
      partialize: (state) => ({
        // Salvar apenas tokens
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      })
    }
  )
);
```

```typescript
// Usar em componentes

function UserMenu() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  return (
    <div>
      <span>{user.name}</span>
      <button onClick={logout}>Sair</button>
    </div>
  );
}

// ✅ Selectors para performance
function UserName() {
  // Apenas re-renderiza se user.name mudar
  const userName = useAuthStore((state) => state.user?.name);

  return <span>{userName}</span>;
}
```

**Vantagens Zustand:**
- ✅ Simples e minimalista
- ✅ Sem boilerplate
- ✅ Performance excelente
- ✅ DevTools support
- ✅ Persist middleware (localStorage/sessionStorage)
- ✅ TypeScript friendly
- ✅ Selectors para evitar re-renders

---

### ZUSTAND: MÚLTIPLAS STORES

```typescript
// src/stores/transactionStore.ts

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;

  fetchTransactions: () => Promise<void>;
  createTransaction: (data: CreateTransactionData) => Promise<void>;
  updateTransaction: (id: string, data: UpdateTransactionData) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,

  fetchTransactions: async () => {
    set({ loading: true, error: null });

    try {
      const response = await api.get('/transactions');
      set({ transactions: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createTransaction: async (data) => {
    const response = await api.post('/transactions', data);
    set((state) => ({
      transactions: [response.data, ...state.transactions]
    }));
  },

  updateTransaction: async (id, data) => {
    const response = await api.put(`/transactions/${id}`, data);
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? response.data : t
      )
    }));
  },

  deleteTransaction: async (id) => {
    await api.delete(`/transactions/${id}`);
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id)
    }));
  }
}));
```

```typescript
// src/stores/uiStore.ts

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'ui-storage'
    }
  )
);
```

---

### ZUSTAND DEVTOOLS

```typescript
import { devtools } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // ... state e actions
      }),
      { name: 'auth-storage' }
    ),
    { name: 'AuthStore' } // Nome no Redux DevTools
  )
);
```

Instale Redux DevTools extension no Chrome para debugar!

---

### QUANDO USAR CADA SOLUÇÃO

| Situação | Solução |
|----------|---------|
| **Estado local simples** | useState |
| **Estado compartilhado entre 2-3 componentes** | Props ou useState + lift state |
| **Tema, Auth, UI state** | Context API ou Zustand |
| **Estado complexo com muitas actions** | Zustand |
| **App grande com muitos stores** | Zustand |
| **Precisa time-travel debugging** | Redux (mais verboso) |
| **Server state (cache, sync)** | React Query ou SWR |

---

## 13. TYPESCRIPT GENERICS

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

## 14. UTILITY TYPES

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

## 15. TYPE GUARDS

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

## 16. DISCRIMINATED UNIONS

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

## 17. MÓDULOS ES6

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

## 18. PROGRAMAÇÃO ORIENTADA A OBJETOS (POO)

### O QUE É POO?

POO é um paradigma de programação que organiza código em **objetos** que combinam dados (propriedades) e comportamentos (métodos).

**Por que é importante no FinTrack?**
- Modelar entidades do domínio (User, Transaction, Account)
- Encapsular lógica de negócio
- Reutilizar código através de herança e composição
- Facilitar testes e manutenção

### OS 4 PILARES DA POO

```
┌─────────────────────────────────────────────┐
│  1. ENCAPSULAMENTO                          │
│  Esconder detalhes internos, expor interface│
├─────────────────────────────────────────────┤
│  2. ABSTRAÇÃO                               │
│  Simplificar complexidade, focar no essencial│
├─────────────────────────────────────────────┤
│  3. HERANÇA                                 │
│  Reutilizar código de classes base          │
├─────────────────────────────────────────────┤
│  4. POLIMORFISMO                            │
│  Múltiplas formas, mesma interface          │
└─────────────────────────────────────────────┘
```

---

### 1. ENCAPSULAMENTO

Esconder detalhes de implementação e expor apenas interface pública.

```typescript
// ❌ SEM ENCAPSULAMENTO: Dados expostos
class BankAccount {
  balance: number = 0; // Público, qualquer um pode modificar

  constructor(initialBalance: number) {
    this.balance = initialBalance;
  }
}

const account = new BankAccount(1000);
account.balance = 999999; // ❌ Modificado diretamente! Bypass de validação

// ✅ COM ENCAPSULAMENTO: Dados protegidos
class BankAccountEncapsulated {
  private balance: number = 0; // Privado

  constructor(initialBalance: number) {
    this.balance = initialBalance;
  }

  // ✅ Métodos públicos com validação
  deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    this.balance += amount;
  }

  withdraw(amount: number): void {
    if (amount > this.balance) {
      throw new Error('Insufficient funds');
    }
    this.balance -= amount;
  }

  // Getter público para ler saldo (mas não modificar)
  getBalance(): number {
    return this.balance;
  }
}

const account2 = new BankAccountEncapsulated(1000);
// account2.balance = 999999; // ❌ Erro: Property 'balance' is private
account2.deposit(500); // ✅ Usa método público
console.log(account2.getBalance()); // 1500
```

**Exemplo FinTrack - Classe Transaction:**

```typescript
// src/domain/entities/Transaction.ts

export class Transaction {
  private readonly id: string;
  private amount: number;
  private description: string;
  private readonly createdAt: Date;
  private deletedAt: Date | null = null;

  constructor(
    id: string,
    amount: number,
    description: string
  ) {
    this.id = id;
    this.setAmount(amount); // Usa setter com validação
    this.description = description;
    this.createdAt = new Date();
  }

  // ✅ Setter com validação
  setAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    this.amount = amount;
  }

  // ✅ Getter público
  getAmount(): number {
    return this.amount;
  }

  // ✅ Método de negócio encapsulado
  softDelete(): void {
    if (this.deletedAt) {
      throw new Error('Transaction already deleted');
    }
    this.deletedAt = new Date();
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  // ✅ Método para serialização (ex: enviar ao frontend)
  toJSON() {
    return {
      id: this.id,
      amount: this.amount,
      description: this.description,
      createdAt: this.createdAt,
      isDeleted: this.isDeleted()
    };
  }
}
```

---

### 2. ABSTRAÇÃO

Simplificar complexidade, focar no essencial, esconder detalhes de implementação.

```typescript
// ✅ ABSTRAÇÃO: Interface simples, complexidade escondida

interface PaymentProcessor {
  processPayment(amount: number, method: string): Promise<boolean>;
}

// Implementação 1: Stripe
class StripePaymentProcessor implements PaymentProcessor {
  async processPayment(amount: number, method: string): Promise<boolean> {
    // Detalhes complexos do Stripe escondidos aqui
    const stripeToken = await this.createToken(method);
    const charge = await this.createCharge(amount, stripeToken);
    return charge.status === 'succeeded';
  }

  private async createToken(method: string): Promise<string> {
    // Lógica complexa do Stripe
    return 'tok_xxx';
  }

  private async createCharge(amount: number, token: string) {
    // API call ao Stripe
    return { status: 'succeeded' };
  }
}

// Implementação 2: PayPal
class PayPalPaymentProcessor implements PaymentProcessor {
  async processPayment(amount: number, method: string): Promise<boolean> {
    // Detalhes complexos do PayPal escondidos aqui
    const orderId = await this.createOrder(amount);
    const captured = await this.captureOrder(orderId);
    return captured;
  }

  private async createOrder(amount: number): Promise<string> {
    // Lógica PayPal
    return 'ORDER_XXX';
  }

  private async captureOrder(orderId: string): Promise<boolean> {
    // API call ao PayPal
    return true;
  }
}

// ✅ Código cliente usa abstração, não se preocupa com detalhes
class CheckoutService {
  constructor(private paymentProcessor: PaymentProcessor) {}

  async checkout(amount: number, method: string) {
    // Usa interface simples, não sabe se é Stripe ou PayPal
    const success = await this.paymentProcessor.processPayment(amount, method);

    if (success) {
      console.log('Payment successful!');
    }
  }
}

// Pode trocar implementação facilmente
const checkoutWithStripe = new CheckoutService(new StripePaymentProcessor());
const checkoutWithPayPal = new CheckoutService(new PayPalPaymentProcessor());
```

**Exemplo FinTrack - Repository Abstraction:**

```typescript
// src/domain/repositories/ITransactionRepository.ts

// ✅ ABSTRAÇÃO: Interface define "o quê", não "como"
export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByUserId(userId: string): Promise<Transaction[]>;
  create(transaction: Transaction): Promise<Transaction>;
  update(transaction: Transaction): Promise<Transaction>;
  delete(id: string): Promise<void>;
}

// Implementação com Prisma
// src/infrastructure/repositories/PrismaTransactionRepository.ts
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Transaction | null> {
    const data = await this.prisma.transaction.findUnique({
      where: { id }
    });
    return data ? this.toDomain(data) : null;
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    const data = await this.prisma.transaction.findMany({
      where: { userId, deletedAt: null }
    });
    return data.map(this.toDomain);
  }

  async create(transaction: Transaction): Promise<Transaction> {
    const data = await this.prisma.transaction.create({
      data: this.toPersistence(transaction)
    });
    return this.toDomain(data);
  }

  // ... outros métodos

  // ✅ Métodos privados de conversão (detalhes escondidos)
  private toDomain(data: any): Transaction {
    return new Transaction(data.id, data.amount, data.description);
  }

  private toPersistence(transaction: Transaction): any {
    return transaction.toJSON();
  }
}

// ✅ Service usa abstração, não sabe que é Prisma
class TransactionService {
  constructor(
    private transactionRepository: ITransactionRepository // Interface, não implementação
  ) {}

  async getTransactions(userId: string) {
    // Usa interface, não se importa se é Prisma, MongoDB, etc
    return this.transactionRepository.findByUserId(userId);
  }
}
```

---

### 3. HERANÇA

Reutilizar código de classes base (herança de implementação).

```typescript
// ✅ HERANÇA: Classe base com comportamento comum

class Account {
  protected balance: number;
  protected readonly id: string;

  constructor(id: string, initialBalance: number) {
    this.id = id;
    this.balance = initialBalance;
  }

  deposit(amount: number): void {
    if (amount <= 0) throw new Error('Invalid amount');
    this.balance += amount;
  }

  getBalance(): number {
    return this.balance;
  }

  // ✅ Template method (pode ser sobrescrito)
  protected calculateFee(amount: number): number {
    return 0; // Sem taxa por padrão
  }
}

// ✅ Herda comportamentos de Account
class CheckingAccount extends Account {
  private overdraftLimit: number;

  constructor(id: string, initialBalance: number, overdraftLimit: number) {
    super(id, initialBalance); // Chama construtor da classe pai
    this.overdraftLimit = overdraftLimit;
  }

  // ✅ Sobrescreve método para adicionar funcionalidade
  withdraw(amount: number): void {
    const fee = this.calculateFee(amount);
    const total = amount + fee;

    if (this.balance - total < -this.overdraftLimit) {
      throw new Error('Exceeds overdraft limit');
    }

    this.balance -= total;
  }

  // ✅ Sobrescreve cálculo de taxa
  protected calculateFee(amount: number): number {
    return amount * 0.01; // 1% de taxa
  }
}

class SavingsAccount extends Account {
  private interestRate: number;

  constructor(id: string, initialBalance: number, interestRate: number) {
    super(id, initialBalance);
    this.interestRate = interestRate;
  }

  // ✅ Adiciona método específico
  applyInterest(): void {
    const interest = this.balance * this.interestRate;
    this.deposit(interest);
  }

  // Sem taxa em conta poupança
  protected calculateFee(amount: number): number {
    return 0;
  }
}

const checking = new CheckingAccount('acc1', 1000, 500);
checking.withdraw(100); // Balance: 899 (100 + 1% taxa)

const savings = new SavingsAccount('acc2', 5000, 0.05);
savings.applyInterest(); // Balance: 5250 (5% juros)
```

**⚠️ CUIDADO COM HERANÇA:**

```typescript
// ❌ PROBLEMA: Herança rígida, difícil de estender

class Bird {
  fly() {
    console.log('Flying...');
  }
}

class Penguin extends Bird {
  // ❌ Problema: Pinguim não voa, mas herdou fly()!
  fly() {
    throw new Error('Penguins cannot fly');
  }
}

// ✅ MELHOR: Composição ao invés de herança

interface Flyable {
  fly(): void;
}

class FlyingBehavior implements Flyable {
  fly() {
    console.log('Flying...');
  }
}

class Bird {
  constructor(private flyBehavior: Flyable | null) {}

  performFly() {
    if (this.flyBehavior) {
      this.flyBehavior.fly();
    } else {
      console.log('Cannot fly');
    }
  }
}

const eagle = new Bird(new FlyingBehavior()); // Pode voar
const penguin = new Bird(null); // Não pode voar

eagle.performFly(); // Flying...
penguin.performFly(); // Cannot fly
```

**Exemplo FinTrack - Herança de Entidades:**

```typescript
// src/domain/entities/BaseEntity.ts

// ✅ Classe base com comportamento comum
abstract class BaseEntity {
  protected readonly id: string;
  protected readonly createdAt: Date;
  protected updatedAt: Date;
  protected deletedAt: Date | null = null;

  constructor(id: string) {
    this.id = id;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  getId(): string {
    return this.id;
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  // ✅ Método abstrato - subclasses devem implementar
  abstract validate(): void;
}

// Transação herda comportamento base
class Transaction extends BaseEntity {
  private amount: number;
  private type: 'income' | 'expense';

  constructor(id: string, amount: number, type: 'income' | 'expense') {
    super(id);
    this.amount = amount;
    this.type = type;
    this.validate(); // Validar ao criar
  }

  // ✅ Implementa método abstrato
  validate(): void {
    if (this.amount <= 0) {
      throw new Error('Amount must be positive');
    }
    if (!['income', 'expense'].includes(this.type)) {
      throw new Error('Invalid transaction type');
    }
  }

  getAmount(): number {
    return this.amount;
  }
}

// Conta herda comportamento base
class Account extends BaseEntity {
  private name: string;
  private balance: number;

  constructor(id: string, name: string, initialBalance: number) {
    super(id);
    this.name = name;
    this.balance = initialBalance;
    this.validate();
  }

  validate(): void {
    if (!this.name || this.name.length < 3) {
      throw new Error('Account name too short');
    }
    if (this.balance < 0) {
      throw new Error('Balance cannot be negative');
    }
  }

  getBalance(): number {
    return this.balance;
  }
}
```

---

### 4. POLIMORFISMO

Mesma interface, múltiplas implementações. Objetos de diferentes classes podem ser tratados uniformemente.

```typescript
// ✅ POLIMORFISMO: Interface comum, implementações diferentes

interface NotificationSender {
  send(recipient: string, message: string): Promise<void>;
}

// Implementação 1: Email
class EmailNotificationSender implements NotificationSender {
  async send(recipient: string, message: string): Promise<void> {
    console.log(`Sending email to ${recipient}: ${message}`);
    // Lógica específica de email (SMTP, templates, etc)
  }
}

// Implementação 2: SMS
class SMSNotificationSender implements NotificationSender {
  async send(recipient: string, message: string): Promise<void> {
    console.log(`Sending SMS to ${recipient}: ${message}`);
    // Lógica específica de SMS (Twilio, etc)
  }
}

// Implementação 3: Push
class PushNotificationSender implements NotificationSender {
  async send(recipient: string, message: string): Promise<void> {
    console.log(`Sending push to ${recipient}: ${message}`);
    // Lógica específica de push (FCM, etc)
  }
}

// ✅ Código cliente usa polimorfismo
class NotificationService {
  // Recebe array de qualquer implementação de NotificationSender
  constructor(private senders: NotificationSender[]) {}

  async notifyUser(recipient: string, message: string): Promise<void> {
    // ✅ Trata todas implementações uniformemente
    await Promise.all(
      this.senders.map(sender => sender.send(recipient, message))
    );
  }
}

// Pode usar qualquer combinação de senders
const service = new NotificationService([
  new EmailNotificationSender(),
  new SMSNotificationSender(),
  new PushNotificationSender()
]);

await service.notifyUser('user@example.com', 'Your transaction was approved!');
// Envia por email, SMS e push simultaneamente!
```

**Exemplo FinTrack - Polimorfismo em Export:**

```typescript
// src/services/exporters/ITransactionExporter.ts

// ✅ Interface comum
interface ITransactionExporter {
  export(transactions: Transaction[]): Promise<Buffer>;
  getFileExtension(): string;
}

// Implementação 1: CSV
class CSVExporter implements ITransactionExporter {
  async export(transactions: Transaction[]): Promise<Buffer> {
    const csv = transactions.map(t =>
      `${t.id},${t.amount},${t.description}`
    ).join('\n');

    return Buffer.from(`id,amount,description\n${csv}`);
  }

  getFileExtension(): string {
    return 'csv';
  }
}

// Implementação 2: Excel
class ExcelExporter implements ITransactionExporter {
  async export(transactions: Transaction[]): Promise<Buffer> {
    // Usa biblioteca xlsx
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(
      transactions.map(t => t.toJSON())
    );
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    return XLSX.write(workbook, { type: 'buffer' });
  }

  getFileExtension(): string {
    return 'xlsx';
  }
}

// Implementação 3: PDF
class PDFExporter implements ITransactionExporter {
  async export(transactions: Transaction[]): Promise<Buffer> {
    const doc = new PDFDocument();
    transactions.forEach(t => {
      doc.text(`${t.id} - ${t.amount} - ${t.description}`);
    });
    doc.end();

    return doc as any; // Simplificado
  }

  getFileExtension(): string {
    return 'pdf';
  }
}

// ✅ Service usa polimorfismo
class ExportService {
  private exporters: Map<string, ITransactionExporter>;

  constructor() {
    this.exporters = new Map([
      ['csv', new CSVExporter()],
      ['excel', new ExcelExporter()],
      ['pdf', new PDFExporter()]
    ]);
  }

  async exportTransactions(
    transactions: Transaction[],
    format: string
  ): Promise<{ buffer: Buffer; extension: string }> {
    const exporter = this.exporters.get(format);

    if (!exporter) {
      throw new Error(`Unsupported format: ${format}`);
    }

    // ✅ Polimorfismo: chama export() independente da implementação
    const buffer = await exporter.export(transactions);
    const extension = exporter.getFileExtension();

    return { buffer, extension };
  }
}

// Uso
const exportService = new ExportService();

// Exportar como CSV
await exportService.exportTransactions(transactions, 'csv');

// Exportar como Excel
await exportService.exportTransactions(transactions, 'excel');

// Exportar como PDF
await exportService.exportTransactions(transactions, 'pdf');
```

---

### COMPOSIÇÃO VS HERANÇA

**Regra geral**: Prefira composição sobre herança.

```typescript
// ❌ HERANÇA: Rígida, difícil de mudar

class Vehicle {
  start() { }
  stop() { }
}

class FlyingVehicle extends Vehicle {
  fly() { }
}

class WaterVehicle extends Vehicle {
  sail() { }
}

// ❌ E um veículo anfíbio que voa E navega? Múltipla herança não é suportada!

// ✅ COMPOSIÇÃO: Flexível, fácil de combinar

interface Startable {
  start(): void;
  stop(): void;
}

interface Flyable {
  fly(): void;
}

interface Sailable {
  sail(): void;
}

class StartBehavior implements Startable {
  start() { console.log('Engine started'); }
  stop() { console.log('Engine stopped'); }
}

class FlyBehavior implements Flyable {
  fly() { console.log('Flying...'); }
}

class SailBehavior implements Sailable {
  sail() { console.log('Sailing...'); }
}

// ✅ Combinar comportamentos via composição
class AmphibiousPlane {
  constructor(
    private startBehavior: Startable,
    private flyBehavior: Flyable,
    private sailBehavior: Sailable
  ) {}

  start() { this.startBehavior.start(); }
  stop() { this.startBehavior.stop(); }
  fly() { this.flyBehavior.fly(); }
  sail() { this.sailBehavior.sail(); }
}

const vehicle = new AmphibiousPlane(
  new StartBehavior(),
  new FlyBehavior(),
  new SailBehavior()
);

vehicle.start(); // Engine started
vehicle.fly();   // Flying...
vehicle.sail();  // Sailing...
```

---

### QUANDO USAR POO NO FINTRACK

✅ **USE POO para:**
- Entidades de domínio (User, Transaction, Account, Goal)
- Services com estado ou lógica complexa
- Repositories e Data Access Objects
- Estratégias intercambiáveis (Strategy pattern)

❌ **NÃO USE POO para:**
- Funções utilitárias puras (formatters, validators)
- Operações stateless simples
- Transformações de dados

```typescript
// ✅ BOM USO: Entidade com comportamento
class Goal {
  private currentAmount: number = 0;

  constructor(
    private readonly id: string,
    private readonly targetAmount: number,
    private readonly deadline: Date
  ) {}

  contribute(amount: number): void {
    this.currentAmount += amount;
  }

  getProgress(): number {
    return (this.currentAmount / this.targetAmount) * 100;
  }

  isAchieved(): boolean {
    return this.currentAmount >= this.targetAmount;
  }

  daysRemaining(): number {
    const diff = this.deadline.getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}

// ❌ USO DESNECESSÁRIO: Função simples não precisa ser classe
class CurrencyFormatter {
  format(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }
}

// ✅ MELHOR: Função pura
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}
```

---

## 🎯 CHECKLIST DE DOMÍNIO

Marque conforme dominar cada conceito:

- [ ] Event Loop
  - [ ] Entendo como funciona o Event Loop
  - [ ] Sei diferenciar Microtasks de Tasks
  - [ ] Evito bloquear o Event Loop em código assíncrono

- [ ] Estruturas de Dados
  - [ ] Domino métodos principais de Arrays (map, filter, reduce, find, some, every)
  - [ ] Sei quando usar Array vs Object vs Map vs Set
  - [ ] Uso Object.keys(), Object.values(), Object.entries()
  - [ ] Entendo Map para chaves não-string e cache
  - [ ] Uso Set para valores únicos e verificação rápida
  - [ ] Sei acessar e manipular propriedades de objetos
  - [ ] Aplico estruturas de dados corretas no FinTrack

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

- [ ] Programação Orientada a Objetos
  - [ ] Entendo os 4 pilares (Encapsulamento, Abstração, Herança, Polimorfismo)
  - [ ] Uso encapsulamento (private, protected, public)
  - [ ] Crio abstrações com interfaces
  - [ ] Entendo quando usar herança vs composição
  - [ ] Aplico polimorfismo corretamente
  - [ ] Prefiro composição sobre herança quando apropriado
  - [ ] Modelo entidades de domínio com classes

- [ ] Advanced TypeScript
  - [ ] Uso Mapped Types para transformar tipos
  - [ ] Uso Conditional Types para tipos dinâmicos
  - [ ] Entendo e uso Template Literal Types
  - [ ] Uso infer para extrair tipos
  - [ ] Crio Recursive Types quando necessário
  - [ ] Uso Discriminated Unions avançadas

- [ ] Performance Optimization
  - [ ] Uso memo para componentes React
  - [ ] Uso useMemo para cálculos pesados
  - [ ] Uso useCallback para callbacks
  - [ ] Implemento lazy loading e code splitting
  - [ ] Uso virtualization para listas grandes
  - [ ] Aplico debounce e throttle corretamente
  - [ ] Otimizo queries do banco (N+1, eager loading)
  - [ ] Uso índices no banco de dados
  - [ ] Implemento caching (Redis)
  - [ ] Uso cursor pagination em vez de offset

- [ ] Web APIs
  - [ ] Uso Fetch API corretamente (error handling, AbortController)
  - [ ] Entendo localStorage vs sessionStorage
  - [ ] Sei quando usar WebSockets
  - [ ] Uso Notification API
  - [ ] Uso Intersection Observer (infinite scroll)
  - [ ] Uso Geolocation API quando necessário

- [ ] Data Structures & Algorithms (Interview Prep)
  - [ ] Entendo Big O notation (O(1), O(n), O(log n), O(n²))
  - [ ] Sei implementar e usar Arrays/Strings eficientemente
  - [ ] Conheço Linked Lists (reverse, detect cycle)
  - [ ] Entendo Stack e Queue (implementação e aplicações)
  - [ ] Uso Hash Tables para lookup O(1)
  - [ ] Entendo Binary Trees (DFS, BFS, traversals)
  - [ ] Conheço Binary Search Trees e validação
  - [ ] Sei implementar algoritmos de sorting (Quick, Merge, Bubble)
  - [ ] Sei implementar Binary Search
  - [ ] Uso Two Pointers pattern
  - [ ] Uso Sliding Window pattern
  - [ ] Entendo Dynamic Programming (memoization, tabulation)
  - [ ] Sei analisar complexidade de tempo e espaço
  - [ ] Pratico problemas no LeetCode/HackerRank
  - [ ] Consigo explicar meu código em voz alta
  - [ ] Sempre testo com edge cases

---

## 19. ADVANCED TYPESCRIPT

### MAPPED TYPES

**Mapped Types** permitem **transformar tipos existentes** criando novos tipos baseados neles.

```typescript
// ✅ Sintaxe básica
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Optional<T> = {
  [P in keyof T]?: T[P];
};

type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};
```

#### Exemplo FinTrack

```typescript
// Tipo original
interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  date: Date;
}

// ✅ Tornar todos os campos readonly
type ReadonlyTransaction = Readonly<Transaction>;
// Equivalente a:
// {
//   readonly id: string;
//   readonly amount: number;
//   readonly description: string;
//   readonly type: 'INCOME' | 'EXPENSE';
//   readonly date: Date;
// }

// ✅ Tornar todos os campos opcionais
type PartialTransaction = Partial<Transaction>;
// Usado em updates onde nem todos os campos são obrigatórios

// ✅ Tornar todos os campos obrigatórios
type RequiredTransaction = Required<PartialTransaction>;

// ✅ Tornar todos os campos nullable
type NullableTransaction = Nullable<Transaction>;
```

---

#### Custom Mapped Types

```typescript
// ✅ Adicionar prefixo a todas as propriedades
type Prefixed<T, Prefix extends string> = {
  [P in keyof T as `${Prefix}${Capitalize<string & P>}`]: T[P];
};

interface User {
  name: string;
  email: string;
  age: number;
}

type PrefixedUser = Prefixed<User, 'user'>;
// {
//   userName: string;
//   userEmail: string;
//   userAge: number;
// }

// ✅ Filtrar apenas propriedades de certo tipo
type StringPropertiesOnly<T> = {
  [P in keyof T as T[P] extends string ? P : never]: T[P];
};

type UserStrings = StringPropertiesOnly<User>;
// {
//   name: string;
//   email: string;
// }

// ✅ Criar getters para todas as propriedades
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

type UserGetters = Getters<User>;
// {
//   getName: () => string;
//   getEmail: () => string;
//   getAge: () => number;
// }
```

---

### CONDITIONAL TYPES

**Conditional Types** selecionam tipos baseados em **condições**.

```typescript
// ✅ Sintaxe: T extends U ? X : Y

type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false

// ✅ Extrair tipo de retorno de Promise
type Awaited<T> = T extends Promise<infer U> ? U : T;

type A = Awaited<Promise<string>>; // string
type B = Awaited<Promise<number>>; // number
type C = Awaited<string>; // string (não é Promise)
```

---

#### Exemplo FinTrack: API Response Types

```typescript
// ✅ Extrair tipo de sucesso ou erro
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type UnwrapApiResponse<T> = T extends { success: true; data: infer D }
  ? D
  : never;

type TransactionResponse = ApiResponse<Transaction>;
type TransactionData = UnwrapApiResponse<TransactionResponse>; // Transaction

// ✅ Tipo condicional para filtros
type FilterValue<T> = T extends Date
  ? { from?: Date; to?: Date }
  : T extends number
  ? { min?: number; max?: number }
  : T extends string
  ? { contains?: string }
  : never;

interface TransactionFilters {
  amount: FilterValue<number>; // { min?: number; max?: number }
  date: FilterValue<Date>; // { from?: Date; to?: Date }
  description: FilterValue<string>; // { contains?: string }
}
```

---

### TEMPLATE LITERAL TYPES

Criar tipos usando **template strings**.

```typescript
// ✅ Criar tipos a partir de strings
type EventName = 'click' | 'focus' | 'blur';
type EventHandler = `on${Capitalize<EventName>}`;
// 'onClick' | 'onFocus' | 'onBlur'

// ✅ Combinar múltiplos tipos
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Endpoint = '/users' | '/transactions' | '/accounts';
type ApiRoute = `${HttpMethod} ${Endpoint}`;
// 'GET /users' | 'GET /transactions' | 'GET /accounts' |
// 'POST /users' | 'POST /transactions' | ...
```

---

#### Exemplo FinTrack: Type-safe Routes

```typescript
// ✅ Rotas type-safe
type RouteParams = {
  '/transactions': never;
  '/transactions/:id': { id: string };
  '/accounts/:accountId/transactions': { accountId: string };
  '/accounts/:accountId/transactions/:transactionId': {
    accountId: string;
    transactionId: string;
  };
};

function navigate<T extends keyof RouteParams>(
  route: T,
  ...params: RouteParams[T] extends never ? [] : [RouteParams[T]]
): void {
  // Implementation
}

// ✅ Type-safe!
navigate('/transactions'); // OK
navigate('/transactions/:id', { id: 'txn-123' }); // OK
navigate('/transactions/:id'); // ❌ Error: Expected 2 arguments
navigate('/transactions', { id: 'txn-123' }); // ❌ Error: route doesn't expect params
```

---

### INFER KEYWORD

**infer** permite **extrair tipos** dentro de conditional types.

```typescript
// ✅ Extrair tipo de retorno de função
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getTransaction(id: string): Promise<Transaction> {
  // ...
}

type TransactionReturn = ReturnType<typeof getTransaction>;
// Promise<Transaction>

// ✅ Extrair tipo de parâmetros
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

type GetTransactionParams = Parameters<typeof getTransaction>;
// [id: string]

// ✅ Extrair tipo de array
type ArrayElement<T> = T extends (infer E)[] ? E : never;

type TransactionArray = Transaction[];
type SingleTransaction = ArrayElement<TransactionArray>; // Transaction

// ✅ Extrair tipo de Promise
type Awaited<T> = T extends Promise<infer U> ? U : T;

type TransactionPromise = Promise<Transaction>;
type TransactionAwaited = Awaited<TransactionPromise>; // Transaction
```

---

#### Exemplo FinTrack: Service Return Types

```typescript
// ✅ Extrair automaticamente tipos dos services
class TransactionService {
  async getAll() {
    return prisma.transaction.findMany();
  }

  async getById(id: string) {
    return prisma.transaction.findUnique({ where: { id } });
  }

  async create(data: CreateTransactionData) {
    return prisma.transaction.create({ data });
  }
}

// Extrair tipo de retorno (removendo Promise)
type ServiceMethod<T> = T extends (...args: any[]) => Promise<infer R>
  ? R
  : never;

type TransactionServiceType = TransactionService;

type GetAllReturn = ServiceMethod<TransactionServiceType['getAll']>;
// Transaction[]

type GetByIdReturn = ServiceMethod<TransactionServiceType['getById']>;
// Transaction | null

type CreateReturn = ServiceMethod<TransactionServiceType['create']>;
// Transaction
```

---

### RECURSIVE TYPES

Tipos que **referenciam a si mesmos**.

```typescript
// ✅ JSON type
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

const validJson: JSONValue = {
  name: 'João',
  age: 30,
  transactions: [
    { amount: 100, type: 'INCOME' },
    { amount: 50, type: 'EXPENSE' }
  ]
};

// ✅ Deep Readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

interface Account {
  id: string;
  name: string;
  balance: number;
  transactions: Transaction[];
}

type ReadonlyAccount = DeepReadonly<Account>;
// {
//   readonly id: string;
//   readonly name: string;
//   readonly balance: number;
//   readonly transactions: readonly Transaction[];
// }

// ✅ Deep Partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

---

### DISCRIMINATED UNIONS AVANÇADO

```typescript
// ✅ Extrair tipo específico de union
type ExtractByType<Union, Type> = Union extends { type: Type } ? Union : never;

type ApiAction =
  | { type: 'CREATE'; payload: { amount: number } }
  | { type: 'UPDATE'; payload: { id: string; amount: number } }
  | { type: 'DELETE'; payload: { id: string } };

type CreateAction = ExtractByType<ApiAction, 'CREATE'>;
// { type: 'CREATE'; payload: { amount: number } }

// ✅ Criar reducer type-safe
function reducer(state: State, action: ApiAction): State {
  switch (action.type) {
    case 'CREATE':
      // TypeScript sabe que action.payload tem { amount: number }
      return { ...state, items: [...state.items, action.payload] };

    case 'UPDATE':
      // TypeScript sabe que action.payload tem { id: string; amount: number }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, ...action.payload } : item
        )
      };

    case 'DELETE':
      // TypeScript sabe que action.payload tem { id: string }
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id)
      };
  }
}
```

---

### TYPE CHALLENGES

```typescript
// ✅ Challenge 1: DeepPick - Pegar propriedades nested
type DeepPick<T, Path extends string> = Path extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? { [K in Key]: DeepPick<T[Key], Rest> }
    : never
  : Path extends keyof T
  ? { [K in Path]: T[Path] }
  : never;

interface User {
  id: string;
  profile: {
    name: string;
    address: {
      street: string;
      city: string;
    };
  };
}

type UserCity = DeepPick<User, 'profile.address.city'>;
// { profile: { address: { city: string } } }

// ✅ Challenge 2: NonNullableFields - Remover null/undefined de todos os campos
type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

interface MaybeTransaction {
  id: string | null;
  amount: number | undefined;
  description: string;
}

type DefiniteTransaction = NonNullableFields<MaybeTransaction>;
// {
//   id: string;
//   amount: number;
//   description: string;
// }
```

---

### QUANDO USAR ADVANCED TYPESCRIPT

| Situação | Use |
|----------|-----|
| **Transformar tipos existentes** | Mapped Types |
| **Tipos baseados em condições** | Conditional Types |
| **Extrair tipos de outros tipos** | infer keyword |
| **Type-safe strings** | Template Literal Types |
| **Tipos nested profundos** | Recursive Types |
| **Discriminar unions** | Discriminated Unions |
| **Biblioteca/framework** | Todos os acima! |
| **App simples** | Provavelmente não precisa |

---

## 20. PERFORMANCE OPTIMIZATION

### POR QUE OTIMIZAR?

**Performance ruim afeta:**
- ❌ Experiência do usuário (lentidão)
- ❌ SEO (Google penaliza sites lentos)
- ❌ Conversão (usuários abandonam)
- ❌ Custos de servidor/CDN

**Métricas importantes:**
- **FCP** (First Contentful Paint): < 1.8s
- **LCP** (Largest Contentful Paint): < 2.5s
- **TTI** (Time to Interactive): < 3.8s
- **CLS** (Cumulative Layout Shift): < 0.1

---

### FRONTEND OPTIMIZATION

#### 1. REACT MEMOIZATION

```typescript
// ❌ Re-renderiza sempre que pai renderiza
function TransactionItem({ transaction }: Props) {
  console.log('Render TransactionItem');
  return <div>{transaction.description}</div>;
}

// ✅ Só re-renderiza se props mudarem
const TransactionItem = memo(function TransactionItem({ transaction }: Props) {
  console.log('Render TransactionItem');
  return <div>{transaction.description}</div>;
});

// ✅ Com comparação customizada
const TransactionItem = memo(
  function TransactionItem({ transaction }: Props) {
    return <div>{transaction.description}</div>;
  },
  (prevProps, nextProps) => {
    // Retorna true se props são iguais (não re-renderiza)
    return prevProps.transaction.id === nextProps.transaction.id;
  }
);
```

---

#### 2. useMemo e useCallback

```typescript
// ❌ Calcula a cada render
function Dashboard({ transactions }: Props) {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0); // Recalcula sempre!

  const handleFilter = (type: string) => {
    // Nova função a cada render!
    filterTransactions(type);
  };

  return <FilterButton onClick={handleFilter} />;
}

// ✅ Calcula apenas quando transactions mudar
function Dashboard({ transactions }: Props) {
  const total = useMemo(() => {
    console.log('Calculando total...');
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const handleFilter = useCallback(
    (type: string) => {
      filterTransactions(type);
    },
    [filterTransactions]
  );

  return <FilterButton onClick={handleFilter} />;
}
```

**Quando usar:**
- ✅ useMemo: Cálculos pesados, transformações de arrays grandes
- ✅ useCallback: Callbacks passados para componentes memoizados
- ❌ NÃO use para operações simples (overhead maior que benefício)

---

#### 3. LAZY LOADING E CODE SPLITTING

```typescript
// ❌ Importa tudo de uma vez (bundle grande)
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';

// ✅ Lazy loading (carrega sob demanda)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Reports = lazy(() => import('./pages/Reports'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Suspense>
  );
}

// ✅ Preload para antecipar navegação
function Navigation() {
  const preloadReports = () => {
    import('./pages/Reports'); // Começa download antes do click
  };

  return (
    <nav>
      <Link to="/">Dashboard</Link>
      <Link to="/reports" onMouseEnter={preloadReports}>
        Relatórios
      </Link>
    </nav>
  );
}
```

---

#### 4. VIRTUALIZATION (LISTAS GRANDES)

```bash
npm install react-window
```

```typescript
// ❌ Renderiza 10.000 itens (lento!)
function TransactionList({ transactions }: Props) {
  return (
    <div>
      {transactions.map((t) => (
        <TransactionItem key={t.id} transaction={t} />
      ))}
    </div>
  );
}

// ✅ Renderiza apenas itens visíveis (rápido!)
import { FixedSizeList } from 'react-window';

function TransactionList({ transactions }: Props) {
  const Row = ({ index, style }: any) => (
    <div style={style}>
      <TransactionItem transaction={transactions[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={transactions.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

---

#### 5. DEBOUNCE E THROTTLE

```typescript
// ❌ API call a cada keystroke (muitos requests!)
function SearchBar() {
  const [query, setQuery] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    searchTransactions(value); // API call!
  };

  return <input value={query} onChange={handleChange} />;
}

// ✅ Debounce: espera usuário parar de digitar
import { useDebouncedCallback } from 'use-debounce';

function SearchBar() {
  const [query, setQuery] = useState('');

  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      searchTransactions(value);
    },
    500 // 500ms após última digitação
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return <input value={query} onChange={handleChange} />;
}

// ✅ Throttle: limita frequência de execução
import { useThrottledCallback } from 'use-debounce';

function ScrollTracker() {
  const handleScroll = useThrottledCallback(
    () => {
      console.log('Scroll position:', window.scrollY);
    },
    100 // Máximo 1 vez a cada 100ms
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return <div>...</div>;
}
```

---

### BACKEND OPTIMIZATION

#### 1. DATABASE QUERY OPTIMIZATION

```typescript
// ❌ N+1 Query Problem
async function getTransactions() {
  const transactions = await prisma.transaction.findMany();

  // Para cada transação, busca categoria (N queries extras!)
  for (const t of transactions) {
    t.category = await prisma.category.findUnique({
      where: { id: t.categoryId }
    });
  }

  return transactions;
}

// ✅ Eager Loading (1 query apenas)
async function getTransactions() {
  return prisma.transaction.findMany({
    include: {
      category: true,
      account: true
    }
  });
}

// ✅ Select apenas campos necessários
async function getTransactionsSummary() {
  return prisma.transaction.findMany({
    select: {
      id: true,
      amount: true,
      type: true,
      date: true
      // NÃO carrega description, notes, etc
    }
  });
}
```

---

#### 2. INDEXING

```prisma
// schema.prisma

model Transaction {
  id          String   @id @default(cuid())
  userId      String
  amount      Float
  type        String
  date        DateTime
  createdAt   DateTime @default(now())

  // ✅ Índices para queries frequentes
  @@index([userId]) // WHERE userId = ?
  @@index([userId, date]) // WHERE userId = ? ORDER BY date
  @@index([type, date]) // WHERE type = ? ORDER BY date
}
```

---

#### 3. CACHING

```typescript
// src/services/cacheService.ts

import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export class CacheService {
  // ✅ Cache com TTL
  async get<T>(key: string): Promise<T | null> {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value));
  }

  async delete(key: string): Promise<void> {
    await redis.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

// Usar no service
export class TransactionService {
  async getAll(userId: string) {
    const cacheKey = `transactions:${userId}`;

    // Tentar cache primeiro
    const cached = await cacheService.get<Transaction[]>(cacheKey);
    if (cached) {
      console.log('Cache hit!');
      return cached;
    }

    // Se não tem cache, buscar do banco
    const transactions = await prisma.transaction.findMany({
      where: { userId }
    });

    // Salvar no cache por 5 minutos
    await cacheService.set(cacheKey, transactions, 300);

    return transactions;
  }

  async create(userId: string, data: CreateTransactionData) {
    const transaction = await prisma.transaction.create({ data });

    // Invalidar cache ao criar
    await cacheService.delete(`transactions:${userId}`);

    return transaction;
  }
}
```

---

#### 4. PAGINATION E CURSOR

```typescript
// ❌ Offset pagination (lento em páginas altas)
async function getTransactions(page: number, limit: number) {
  const skip = (page - 1) * limit;

  return prisma.transaction.findMany({
    skip, // SELECT * FROM transactions LIMIT 20 OFFSET 10000 (lento!)
    take: limit
  });
}

// ✅ Cursor pagination (sempre rápido)
async function getTransactions(cursor?: string, limit: number = 20) {
  return prisma.transaction.findMany({
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' }
  });
}

// Response:
// {
//   data: [...],
//   nextCursor: 'last-item-id'
// }
```

---

### IMAGE OPTIMIZATION

```typescript
// ✅ Use next/image ou otimize manualmente

// 1. Servir formato moderno (WebP, AVIF)
// 2. Lazy loading
// 3. Responsive images
// 4. CDN

<img
  src="transaction-receipt.jpg"
  srcset="
    transaction-receipt-400w.webp 400w,
    transaction-receipt-800w.webp 800w,
    transaction-receipt-1200w.webp 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Comprovante"
  loading="lazy"
/>
```

---

### BUNDLE OPTIMIZATION

```typescript
// vite.config.ts

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor em chunk próprio
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts']
        }
      }
    },
    // Minify
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true // Remove console.log em produção
      }
    }
  }
});
```

---

### CHECKLIST PERFORMANCE

```
Frontend:
[ ] Componentes memoizados onde necessário
[ ] useMemo para cálculos pesados
[ ] useCallback para callbacks
[ ] Lazy loading de rotas
[ ] Code splitting
[ ] Virtualization para listas grandes
[ ] Debounce em inputs de busca
[ ] Throttle em scroll/resize handlers
[ ] Images otimizadas (WebP, lazy load)
[ ] Bundle size < 200KB inicial

Backend:
[ ] Eager loading (evitar N+1)
[ ] Select apenas campos necessários
[ ] Índices em colunas frequentemente filtradas
[ ] Caching (Redis)
[ ] Pagination (cursor > offset)
[ ] Compressão (gzip/brotli)
[ ] CDN para assets estáticos
[ ] Database connection pooling
[ ] API responses < 200ms (p95)
```

---

## 21. WEB APIS

### FETCH API

```typescript
// ✅ GET request
async function getTransactions() {
  try {
    const response = await fetch('https://api.fintrack.com/transactions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// ✅ POST request
async function createTransaction(data: CreateTransactionData) {
  const response = await fetch('https://api.fintrack.com/transactions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  return response.json();
}

// ✅ AbortController para cancelar requests
const controller = new AbortController();

fetch('https://api.fintrack.com/transactions', {
  signal: controller.signal
});

// Cancelar após 5 segundos
setTimeout(() => controller.abort(), 5000);
```

---

### WEB STORAGE

#### localStorage

```typescript
// ✅ Armazenamento persistente (nunca expira)

// Salvar
localStorage.setItem('theme', 'dark');
localStorage.setItem('user', JSON.stringify({ id: '123', name: 'João' }));

// Recuperar
const theme = localStorage.getItem('theme'); // 'dark'
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Remover
localStorage.removeItem('theme');

// Limpar tudo
localStorage.clear();

// ✅ Helper type-safe
class LocalStorage {
  static set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static get<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }
}

// Uso
LocalStorage.set('user', { id: '123', name: 'João' });
const user = LocalStorage.get<User>('user');
```

#### sessionStorage

```typescript
// ✅ Armazenamento temporário (limpa ao fechar aba)

sessionStorage.setItem('accessToken', token);
const token = sessionStorage.getItem('accessToken');
sessionStorage.clear();

// Uso: tokens, estado temporário de formulários
```

---

### WEBSOCKETS

```typescript
// Backend: src/websocket.ts

import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Cliente conectado');

  ws.on('message', (data) => {
    console.log('Mensagem recebida:', data);

    // Broadcast para todos os clientes
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });

  // Enviar mensagem
  ws.send(JSON.stringify({ type: 'welcome', message: 'Conectado!' }));
});
```

```typescript
// Frontend: src/services/websocket.ts

export class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(url: string) {
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket conectado');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.emit(data.type, data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket desconectado');
      // Reconectar após 3s
      setTimeout(() => this.connect(url), 3000);
    };
  }

  send(type: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }

  disconnect() {
    this.ws?.close();
  }
}

// Uso
const ws = new WebSocketService();
ws.connect('ws://localhost:8080');

ws.on('transaction-created', (data) => {
  console.log('Nova transação:', data);
  // Atualizar UI
});

ws.send('subscribe', { channel: 'transactions' });
```

---

### NOTIFICATION API

```typescript
// ✅ Pedir permissão
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// ✅ Enviar notificação
function notifyNewTransaction(transaction: Transaction) {
  if (Notification.permission === 'granted') {
    new Notification('Nova Transação', {
      body: `${transaction.type}: R$ ${transaction.amount}`,
      icon: '/icon.png',
      badge: '/badge.png',
      tag: transaction.id, // Substitui notificações duplicadas
      requireInteraction: false // Auto-fecha após alguns segundos
    });
  }
}

// ✅ Service Worker notification (mais recursos)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.showNotification('Nova Transação', {
      body: 'Você recebeu R$ 1.000',
      icon: '/icon.png',
      actions: [
        { action: 'view', title: 'Ver' },
        { action: 'dismiss', title: 'Dispensar' }
      ]
    });
  });
}
```

---

### INTERSECTION OBSERVER

```typescript
// ✅ Detectar quando elemento entra no viewport (infinite scroll)

function useInfiniteScroll(callback: () => void) {
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [callback]);

  return observerRef;
}

// Uso
function TransactionList() {
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const loadMore = () => {
    setPage((p) => p + 1);
    // Fetch more data
  };

  const observerRef = useInfiniteScroll(loadMore);

  return (
    <div>
      {transactions.map((t) => (
        <TransactionItem key={t.id} transaction={t} />
      ))}
      <div ref={observerRef} style={{ height: 20 }} />
    </div>
  );
}
```

---

### GEOLOCATION API

```typescript
// ✅ Obter localização do usuário

function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  });
}

// Uso
try {
  const position = await getCurrentLocation();
  console.log('Lat:', position.coords.latitude);
  console.log('Lng:', position.coords.longitude);
} catch (error) {
  console.error('Location error:', error);
}

// Exemplo FinTrack: Adicionar localização à transação
async function createTransactionWithLocation(data: CreateTransactionData) {
  const position = await getCurrentLocation();

  return api.post('/transactions', {
    ...data,
    location: {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    }
  });
}
```

---

## 22. DATA STRUCTURES & ALGORITHMS (INTERVIEW PREP)

### BIG O NOTATION

**Big O** mede a **complexidade** de algoritmos: quanto tempo/memória cresce conforme input aumenta.

#### Complexidades Comuns

```typescript
// O(1) - Constante: sempre mesmo tempo
function getFirst<T>(arr: T[]): T {
  return arr[0]; // Não importa tamanho do array
}

// O(log n) - Logarítmica: divide problema pela metade
function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1;
}

// O(n) - Linear: percorre todos os elementos
function findTransaction(transactions: Transaction[], id: string): Transaction | undefined {
  return transactions.find(t => t.id === id); // Pior caso: percorre todos
}

// O(n log n) - Linearítmica: melhor sorting possível
function sortTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.sort((a, b) => a.amount - b.amount);
}

// O(n²) - Quadrática: nested loops
function findDuplicates(arr: number[]): number[] {
  const duplicates: number[] = [];

  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        duplicates.push(arr[i]);
      }
    }
  }

  return duplicates;
}

// O(2ⁿ) - Exponencial: muito lento! (evitar)
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2); // 2 chamadas recursivas
}
```

#### Ranking de Complexidade (melhor → pior)

```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)
```

---

### ARRAYS & STRINGS

#### Problem 1: Two Sum

**Dado array de números, retornar índices de dois números que somam target.**

```typescript
// ❌ Solução Brute Force - O(n²)
function twoSumBruteForce(nums: number[], target: number): number[] {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}

// ✅ Solução Otimizada - O(n) com Hash Map
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>(); // valor → índice

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }

    map.set(nums[i], i);
  }

  return [];
}

// Exemplo FinTrack: Encontrar 2 transações que somam valor
function findTransactionPair(
  transactions: Transaction[],
  targetAmount: number
): [Transaction, Transaction] | null {
  const map = new Map<number, Transaction>();

  for (const t of transactions) {
    const complement = targetAmount - t.amount;

    if (map.has(complement)) {
      return [map.get(complement)!, t];
    }

    map.set(t.amount, t);
  }

  return null;
}

console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
```

---

#### Problem 2: Valid Anagram

**Verificar se duas strings são anagramas.**

```typescript
// ✅ Solução com Hash Map - O(n)
function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;

  const count = new Map<string, number>();

  // Contar caracteres de s
  for (const char of s) {
    count.set(char, (count.get(char) || 0) + 1);
  }

  // Decrementar com caracteres de t
  for (const char of t) {
    if (!count.has(char)) return false;

    const newCount = count.get(char)! - 1;
    if (newCount === 0) {
      count.delete(char);
    } else {
      count.set(char, newCount);
    }
  }

  return count.size === 0;
}

console.log(isAnagram('anagram', 'nagaram')); // true
console.log(isAnagram('rat', 'car')); // false
```

---

#### Problem 3: Reverse String

```typescript
// ✅ In-place - O(n) time, O(1) space
function reverseString(s: string[]): void {
  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    [s[left], s[right]] = [s[right], s[left]]; // Swap
    left++;
    right--;
  }
}

const chars = ['h', 'e', 'l', 'l', 'o'];
reverseString(chars);
console.log(chars); // ['o', 'l', 'l', 'e', 'h']
```

---

### LINKED LISTS

```typescript
// ✅ Definição
class ListNode<T> {
  value: T;
  next: ListNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

class LinkedList<T> {
  head: ListNode<T> | null = null;

  // O(1) - Adicionar no início
  prepend(value: T): void {
    const newNode = new ListNode(value);
    newNode.next = this.head;
    this.head = newNode;
  }

  // O(n) - Adicionar no final
  append(value: T): void {
    const newNode = new ListNode(value);

    if (!this.head) {
      this.head = newNode;
      return;
    }

    let current = this.head;
    while (current.next) {
      current = current.next;
    }
    current.next = newNode;
  }

  // O(n) - Buscar
  find(value: T): ListNode<T> | null {
    let current = this.head;

    while (current) {
      if (current.value === value) return current;
      current = current.next;
    }

    return null;
  }

  // O(n) - Deletar
  delete(value: T): void {
    if (!this.head) return;

    if (this.head.value === value) {
      this.head = this.head.next;
      return;
    }

    let current = this.head;
    while (current.next) {
      if (current.next.value === value) {
        current.next = current.next.next;
        return;
      }
      current = current.next;
    }
  }

  // Converter para array (para debug)
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;

    while (current) {
      result.push(current.value);
      current = current.next;
    }

    return result;
  }
}
```

#### Problem: Reverse Linked List

```typescript
// ✅ Iterativo - O(n) time, O(1) space
function reverseList<T>(head: ListNode<T> | null): ListNode<T> | null {
  let prev: ListNode<T> | null = null;
  let current = head;

  while (current) {
    const next = current.next; // Salvar próximo
    current.next = prev;        // Reverter ponteiro
    prev = current;             // Avançar prev
    current = next;             // Avançar current
  }

  return prev; // Novo head
}

// ✅ Recursivo - O(n) time, O(n) space (call stack)
function reverseListRecursive<T>(head: ListNode<T> | null): ListNode<T> | null {
  if (!head || !head.next) return head;

  const newHead = reverseListRecursive(head.next);
  head.next.next = head;
  head.next = null;

  return newHead;
}
```

---

### STACKS & QUEUES

#### Stack (LIFO - Last In, First Out)

```typescript
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}

// Exemplo FinTrack: Undo/Redo de transações
class TransactionHistory {
  private undoStack = new Stack<Transaction>();
  private redoStack = new Stack<Transaction>();

  addTransaction(transaction: Transaction): void {
    this.undoStack.push(transaction);
    // Limpar redo stack ao adicionar nova ação
    this.redoStack = new Stack<Transaction>();
  }

  undo(): Transaction | undefined {
    const transaction = this.undoStack.pop();
    if (transaction) {
      this.redoStack.push(transaction);
    }
    return transaction;
  }

  redo(): Transaction | undefined {
    const transaction = this.redoStack.pop();
    if (transaction) {
      this.undoStack.push(transaction);
    }
    return transaction;
  }
}
```

#### Problem: Valid Parentheses

```typescript
// ✅ Stack - O(n)
function isValidParentheses(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = {
    ')': '(',
    '}': '{',
    ']': '['
  };

  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.length === 0 || stack.pop() !== pairs[char]) {
        return false;
      }
    }
  }

  return stack.length === 0;
}

console.log(isValidParentheses('()')); // true
console.log(isValidParentheses('()[]{}')); // true
console.log(isValidParentheses('(]')); // false
```

---

#### Queue (FIFO - First In, First Out)

```typescript
class Queue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  peek(): T | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}

// Exemplo FinTrack: Fila de processamento de transações
class TransactionQueue {
  private queue = new Queue<Transaction>();

  async processTransactions(): Promise<void> {
    while (!this.queue.isEmpty()) {
      const transaction = this.queue.dequeue()!;

      try {
        await this.processTransaction(transaction);
        console.log(`Processada: ${transaction.id}`);
      } catch (error) {
        console.error(`Erro ao processar ${transaction.id}:`, error);
        // Re-enfileirar ou mover para DLQ (Dead Letter Queue)
      }
    }
  }

  private async processTransaction(transaction: Transaction): Promise<void> {
    // Lógica de processamento
  }
}
```

---

### HASH TABLES

```typescript
// ✅ Hash Map custom (para entender internamente)
class HashMap<K, V> {
  private buckets: Array<Array<[K, V]>>;
  private size: number = 0;

  constructor(private capacity: number = 16) {
    this.buckets = new Array(capacity).fill(null).map(() => []);
  }

  private hash(key: K): number {
    const str = JSON.stringify(key);
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash) % this.capacity;
  }

  set(key: K, value: V): void {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    // Atualizar se chave já existe
    for (const pair of bucket) {
      if (pair[0] === key) {
        pair[1] = value;
        return;
      }
    }

    // Adicionar novo par
    bucket.push([key, value]);
    this.size++;
  }

  get(key: K): V | undefined {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (const pair of bucket) {
      if (pair[0] === key) {
        return pair[1];
      }
    }

    return undefined;
  }

  delete(key: K): boolean {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket.splice(i, 1);
        this.size--;
        return true;
      }
    }

    return false;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }
}
```

#### Problem: First Non-Repeating Character

```typescript
// ✅ Hash Map - O(n)
function firstUniqChar(s: string): number {
  const count = new Map<string, number>();

  // Contar frequências
  for (const char of s) {
    count.set(char, (count.get(char) || 0) + 1);
  }

  // Encontrar primeiro com count === 1
  for (let i = 0; i < s.length; i++) {
    if (count.get(s[i]) === 1) {
      return i;
    }
  }

  return -1;
}

console.log(firstUniqChar('leetcode')); // 0 ('l')
console.log(firstUniqChar('loveleetcode')); // 2 ('v')
```

---

### TREES

#### Binary Tree

```typescript
class TreeNode<T> {
  value: T;
  left: TreeNode<T> | null = null;
  right: TreeNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

class BinaryTree<T> {
  root: TreeNode<T> | null = null;

  // DFS - In-order (Left, Root, Right)
  inOrder(node: TreeNode<T> | null = this.root, result: T[] = []): T[] {
    if (node) {
      this.inOrder(node.left, result);
      result.push(node.value);
      this.inOrder(node.right, result);
    }
    return result;
  }

  // DFS - Pre-order (Root, Left, Right)
  preOrder(node: TreeNode<T> | null = this.root, result: T[] = []): T[] {
    if (node) {
      result.push(node.value);
      this.preOrder(node.left, result);
      this.preOrder(node.right, result);
    }
    return result;
  }

  // DFS - Post-order (Left, Right, Root)
  postOrder(node: TreeNode<T> | null = this.root, result: T[] = []): T[] {
    if (node) {
      this.postOrder(node.left, result);
      this.postOrder(node.right, result);
      result.push(node.value);
    }
    return result;
  }

  // BFS - Level-order
  levelOrder(): T[] {
    if (!this.root) return [];

    const result: T[] = [];
    const queue: TreeNode<T>[] = [this.root];

    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node.value);

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    return result;
  }

  // Altura da árvore
  height(node: TreeNode<T> | null = this.root): number {
    if (!node) return 0;
    return 1 + Math.max(this.height(node.left), this.height(node.right));
  }
}
```

#### Problem: Maximum Depth of Binary Tree

```typescript
function maxDepth(root: TreeNode<number> | null): number {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```

#### Problem: Validate Binary Search Tree

```typescript
function isValidBST(
  root: TreeNode<number> | null,
  min: number = -Infinity,
  max: number = Infinity
): boolean {
  if (!root) return true;

  if (root.value <= min || root.value >= max) {
    return false;
  }

  return (
    isValidBST(root.left, min, root.value) &&
    isValidBST(root.right, root.value, max)
  );
}
```

---

### SORTING ALGORITHMS

```typescript
// ✅ Bubble Sort - O(n²)
function bubbleSort(arr: number[]): number[] {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }

  return arr;
}

// ✅ Quick Sort - O(n log n) average
function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;

  const pivot = arr[arr.length - 1];
  const left: number[] = [];
  const right: number[] = [];

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  return [...quickSort(left), pivot, ...quickSort(right)];
}

// ✅ Merge Sort - O(n log n) sempre
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  return result.concat(left.slice(i)).concat(right.slice(j));
}

// Exemplo FinTrack: Ordenar transações
function sortTransactionsByAmount(transactions: Transaction[]): Transaction[] {
  return transactions.sort((a, b) => b.amount - a.amount);
}
```

---

### SEARCHING ALGORITHMS

```typescript
// ✅ Linear Search - O(n)
function linearSearch<T>(arr: T[], target: T): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

// ✅ Binary Search - O(log n) - APENAS EM ARRAYS ORDENADOS
function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1;
}

// Exemplo FinTrack: Busca binária por data
function findTransactionByDate(
  transactions: Transaction[], // DEVE estar ordenado por data!
  targetDate: Date
): Transaction | null {
  let left = 0;
  let right = transactions.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midDate = transactions[mid].date.getTime();
    const target = targetDate.getTime();

    if (midDate === target) {
      return transactions[mid];
    }

    if (midDate < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return null;
}
```

---

### DYNAMIC PROGRAMMING

#### Problem: Fibonacci com Memoization

```typescript
// ❌ Recursivo puro - O(2ⁿ) - MUITO LENTO
function fibSlow(n: number): number {
  if (n <= 1) return n;
  return fibSlow(n - 1) + fibSlow(n - 2);
}

// ✅ Memoization (Top-Down) - O(n)
function fib(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n)!;

  const result = fib(n - 1, memo) + fib(n - 2, memo);
  memo.set(n, result);

  return result;
}

// ✅ Tabulation (Bottom-Up) - O(n)
function fibTab(n: number): number {
  if (n <= 1) return n;

  const dp: number[] = [0, 1];

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }

  return dp[n];
}

console.log(fib(50)); // Instantâneo
console.log(fibSlow(50)); // Travaria o browser!
```

#### Problem: Climbing Stairs

**Você pode subir 1 ou 2 degraus. Quantas formas existem de subir n degraus?**

```typescript
// ✅ DP - O(n)
function climbStairs(n: number): number {
  if (n <= 2) return n;

  const dp: number[] = [0, 1, 2];

  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }

  return dp[n];
}

console.log(climbStairs(5)); // 8 formas
```

---

### TWO POINTERS

```typescript
// Problem: Container With Most Water
function maxArea(height: number[]): number {
  let maxWater = 0;
  let left = 0;
  let right = height.length - 1;

  while (left < right) {
    const width = right - left;
    const minHeight = Math.min(height[left], height[right]);
    const area = width * minHeight;

    maxWater = Math.max(maxWater, area);

    // Mover ponteiro com menor altura
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }

  return maxWater;
}

// Problem: Remove Duplicates from Sorted Array (in-place)
function removeDuplicates(nums: number[]): number {
  if (nums.length === 0) return 0;

  let slow = 0;

  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }

  return slow + 1;
}

const nums = [1, 1, 2, 2, 3, 4, 4];
const length = removeDuplicates(nums);
console.log(nums.slice(0, length)); // [1, 2, 3, 4]
```

---

### SLIDING WINDOW

```typescript
// Problem: Maximum Sum Subarray of Size K
function maxSumSubarray(arr: number[], k: number): number {
  let maxSum = 0;
  let windowSum = 0;

  // Primeira janela
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  maxSum = windowSum;

  // Deslizar janela
  for (let i = k; i < arr.length; i++) {
    windowSum = windowSum - arr[i - k] + arr[i];
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}

console.log(maxSumSubarray([1, 2, 3, 4, 5], 3)); // 12 (3+4+5)

// Exemplo FinTrack: Média móvel de gastos
function movingAverage(transactions: Transaction[], windowSize: number): number[] {
  const averages: number[] = [];
  let windowSum = 0;

  // Primeira janela
  for (let i = 0; i < windowSize && i < transactions.length; i++) {
    windowSum += transactions[i].amount;
  }
  averages.push(windowSum / windowSize);

  // Deslizar janela
  for (let i = windowSize; i < transactions.length; i++) {
    windowSum = windowSum - transactions[i - windowSize].amount + transactions[i].amount;
    averages.push(windowSum / windowSize);
  }

  return averages;
}
```

---

### INTERVIEW TIPS

#### 1. PROCESSO DE RESOLUÇÃO

```
1. ENTENDER o problema
   - Fazer perguntas clarificadoras
   - Exemplos de input/output
   - Edge cases

2. PLANEJAR a abordagem
   - Começar com solução brute force
   - Otimizar depois
   - Discutir trade-offs

3. IMPLEMENTAR
   - Escrever código limpo
   - Comentar partes complexas
   - Testar com exemplos

4. TESTAR
   - Casos normais
   - Edge cases
   - Casos grandes

5. ANALISAR
   - Complexidade de tempo
   - Complexidade de espaço
   - Possíveis otimizações
```

---

#### 2. CHEAT SHEET DE PATTERNS

```typescript
// Array/String: Two Pointers, Sliding Window
// Hash Table: Frequência, lookup O(1)
// Stack: Parentheses, ordem reversa, backtracking
// Queue: BFS, processamento ordenado
// Tree: DFS (recursão), BFS (queue)
// Graph: DFS, BFS, Dijkstra
// DP: Memoization, Tabulation
// Recursion: Dividir problema em subproblemas
// Sorting: Quick/Merge para O(n log n)
// Searching: Binary search para arrays ordenados
```

---

#### 3. COMMON MISTAKES

```typescript
// ❌ Não considerar edge cases
function divide(a: number, b: number): number {
  return a / b; // E se b === 0?
}

// ✅ Tratar edge cases
function divide(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
}

// ❌ Modificar input sem avisar
function sortArray(arr: number[]): number[] {
  arr.sort((a, b) => a - b); // Modifica array original!
  return arr;
}

// ✅ Criar cópia
function sortArray(arr: number[]): number[] {
  return [...arr].sort((a, b) => a - b);
}

// ❌ Esquecer de retornar valor
function findMax(arr: number[]): number {
  let max = arr[0];
  for (const num of arr) {
    if (num > max) max = num;
  }
  // Esqueceu return!
}

// ✅ Sempre retornar
function findMax(arr: number[]): number {
  let max = arr[0];
  for (const num of arr) {
    if (num > max) max = num;
  }
  return max;
}
```

---

### PRACTICE RESOURCES

**Plataformas:**
- 🔗 LeetCode (mais popular)
- 🔗 HackerRank
- 🔗 CodeSignal
- 🔗 NeetCode (problemas organizados)

**Roadmap:**
1. Começar com Easy (2-3 semanas)
2. Passar para Medium (1-2 meses)
3. Alguns Hard (1 mês)
4. Mock interviews

**Top 75 LeetCode Questions:**
- Two Sum
- Valid Parentheses
- Merge Two Sorted Lists
- Maximum Subarray
- Climbing Stairs
- Best Time to Buy and Sell Stock
- Valid Anagram
- Binary Search
- Flood Fill
- Lowest Common Ancestor
- etc.

---

### CHECKLIST INTERVIEW PREP

```
[ ] Entendo Big O notation
[ ] Sei implementar arrays e manipulações
[ ] Conheço Linked Lists (reverse, detect cycle)
[ ] Entendo Stack e Queue (implementação e uso)
[ ] Sei usar Hash Tables para lookup O(1)
[ ] Entendo Binary Trees (DFS, BFS)
[ ] Conheço Binary Search Trees
[ ] Sei quando usar Two Pointers
[ ] Sei quando usar Sliding Window
[ ] Entendo recursão e base cases
[ ] Conheço Dynamic Programming básico
[ ] Sei analisar complexidade de tempo e espaço
[ ] Pratico no LeetCode regularmente
[ ] Consigo explicar meu raciocínio em voz alta
[ ] Testo meu código com edge cases
```

---

## 📚 PRÓXIMOS PASSOS

Agora que domina JavaScript e TypeScript avançado, prossiga para:

👉 **[Módulo 2: HTTP e Web](./modulo-02-http-web.md)**
- Protocolo HTTP
- CORS
- Cookies vs LocalStorage

---

**Última atualização**: Março 2026
**Status**: ✅ Completo + Interview Prep
**Seções**: 22 (Junior, Pleno, Senior + Interview Prep)
**Linhas**: 10.926
**Conceitos**: 250+ tópicos cobertos
**Exemplos**: 600+ code samples com FinTrack
**Algoritmos**: 20+ problemas clássicos de entrevista
