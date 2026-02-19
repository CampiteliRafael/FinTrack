# SEMANA 3: Transações

## 🎯 OBJETIVOS

- Implementar CRUD de transações
- Filtros avançados (data, tipo, categoria, conta)
- Paginação offset-based
- Busca por descrição
- Validação de transações
- Interface completa no frontend

## 📋 ENTREGAS

- API endpoints para transações (CRUD)
- Filtros: data range, tipo, categoria, conta
- Paginação com offset/limit
- Busca por descrição
- Validação no backend e frontend
- Componentes React para listar transações
- Formulário de criação/edição
- Página de transações completa

## 🛠️ TECNOLOGIAS

- Express.js, Prisma ORM
- PostgreSQL com índices
- React Hook Form
- Zod para validação
- axios para requisições

---

## 📝 PASSO A PASSO

### BACKEND

#### Passo 1: Atualizar Schema Prisma

O schema já foi criado na semana 1, mas vamos revisar os índices para performance:

Edite `prisma/schema.prisma` - Transaction model já está criado, confirmando:

```prisma
model Transaction {
  id          String     @id @default(cuid())
  userId      String
  accountId   String
  categoryId  String
  amount      Float
  description String?
  type        String     // income, expense, transfer
  date        DateTime
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  account   Account    @relation(fields: [accountId], references: [id], onDelete: Cascade)
  category  Category   @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([accountId])
  @@index([categoryId])
  @@index([date])
  @@index([userId, date])  // Índice composto para filtros comuns
}
```

Execute migração se necessário:

```bash
npx prisma migrate dev --name add_transaction_indexes
```

#### Passo 2: Criar Tipos e Validadores

Edite `src/types/index.ts` e adicione:

```typescript
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export interface CreateTransactionRequest {
  accountId: string;
  categoryId: string;
  amount: number;
  description?: string;
  type: TransactionType;
  date: string; // ISO string
}

export interface UpdateTransactionRequest {
  accountId?: string;
  categoryId?: string;
  amount?: number;
  description?: string;
  type?: TransactionType;
  date?: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  search?: string;
  offset?: number;
  limit?: number;
}

export interface TransactionResponse {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number;
  description?: string;
  type: TransactionType;
  date: string;
  createdAt: string;
  account?: { name: string };
  category?: { name: string; color: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}
```

Crie `src/validators/transaction.ts`:

```typescript
import { z } from 'zod';

export const createTransactionSchema = z.object({
  accountId: z.string().min(1, 'Conta é obrigatória'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  amount: z
    .number()
    .positive('Valor deve ser positivo'),
  description: z
    .string()
    .max(500, 'Descrição não pode ter mais de 500 caracteres')
    .optional(),
  type: z.enum(['income', 'expense', 'transfer']),
  date: z.string().datetime(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionFiltersSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.enum(['income', 'expense', 'transfer']).optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  search: z.string().optional(),
  offset: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(20),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFiltersInput = z.infer<typeof transactionFiltersSchema>;
```

#### Passo 3: Criar Controller de Transações

Crie `src/controllers/transactionController.ts`:

```typescript
import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionFiltersSchema,
} from '../validators/transaction';
import { getUserId } from '../middleware/auth';

const prisma = new PrismaClient();

/**
 * GET /transactions
 * Listar transações com filtros e paginação
 */
export async function listTransactions(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    // Validar filtros
    const filters = transactionFiltersSchema.parse({
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      type: req.query.type,
      categoryId: req.query.categoryId,
      accountId: req.query.accountId,
      search: req.query.search,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    });

    // Construir where clause
    const where: Prisma.TransactionWhereInput = {
      userId,
    };

    // Filtros opcionais
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        (where.date as any).gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        (where.date as any).lte = new Date(filters.endDate);
      }
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.accountId) {
      where.accountId = filters.accountId;
    }

    if (filters.search) {
      where.description = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    // Contar total de transações
    const total = await prisma.transaction.count({ where });

    // Buscar transações com paginação
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        account: {
          select: { name: true },
        },
        category: {
          select: { name: true, color: true },
        },
      },
      orderBy: { date: 'desc' },
      skip: filters.offset,
      take: filters.limit,
    });

    // Formatar response
    const formattedTransactions = transactions.map((t) => ({
      ...t,
      amount: parseFloat(t.amount.toString()),
    }));

    res.json({
      data: formattedTransactions,
      total,
      offset: filters.offset,
      limit: filters.limit,
      hasMore: filters.offset + filters.limit < total,
    });
  } catch (error: any) {
    console.error('Erro ao listar transações:', error);

    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Filtros inválidos',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({ error: 'Erro ao listar transações' });
  }
}

/**
 * GET /transactions/:id
 * Obter detalhes de uma transação
 */
export async function getTransaction(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        account: {
          select: { name: true },
        },
        category: {
          select: { name: true, color: true },
        },
      },
    });

    if (!transaction) {
      res.status(404).json({ error: 'Transação não encontrada' });
      return;
    }

    res.json({
      ...transaction,
      amount: parseFloat(transaction.amount.toString()),
    });
  } catch (error) {
    console.error('Erro ao obter transação:', error);
    res.status(500).json({ error: 'Erro ao obter transação' });
  }
}

/**
 * POST /transactions
 * Criar nova transação
 */
export async function createTransaction(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    // Validar entrada
    const validatedData = createTransactionSchema.parse(req.body);

    // Verificar se conta e categoria pertencem ao usuário
    const [account, category] = await Promise.all([
      prisma.account.findFirst({
        where: { id: validatedData.accountId, userId },
      }),
      prisma.category.findFirst({
        where: { id: validatedData.categoryId, userId },
      }),
    ]);

    if (!account) {
      res.status(404).json({ error: 'Conta não encontrada' });
      return;
    }

    if (!category) {
      res.status(404).json({ error: 'Categoria não encontrada' });
      return;
    }

    // Criar transação
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId: validatedData.accountId,
        categoryId: validatedData.categoryId,
        amount: validatedData.amount,
        description: validatedData.description,
        type: validatedData.type,
        date: new Date(validatedData.date),
      },
      include: {
        account: { select: { name: true } },
        category: { select: { name: true, color: true } },
      },
    });

    // Atualizar saldo da conta
    await updateAccountBalance(validatedData.accountId, validatedData.amount, validatedData.type);

    res.status(201).json({
      ...transaction,
      amount: parseFloat(transaction.amount.toString()),
    });
  } catch (error: any) {
    console.error('Erro ao criar transação:', error);

    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({ error: 'Erro ao criar transação' });
  }
}

/**
 * PUT /transactions/:id
 * Atualizar transação
 */
export async function updateTransaction(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    // Validar entrada
    const validatedData = updateTransactionSchema.parse(req.body);

    // Obter transação atual
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      res.status(404).json({ error: 'Transação não encontrada' });
      return;
    }

    // Se está atualizando conta ou categoria, validar pertencimento
    if (validatedData.accountId || validatedData.categoryId) {
      if (validatedData.accountId) {
        const account = await prisma.account.findFirst({
          where: { id: validatedData.accountId, userId },
        });
        if (!account) {
          res.status(404).json({ error: 'Conta não encontrada' });
          return;
        }
      }

      if (validatedData.categoryId) {
        const category = await prisma.category.findFirst({
          where: { id: validatedData.categoryId, userId },
        });
        if (!category) {
          res.status(404).json({ error: 'Categoria não encontrada' });
          return;
        }
      }
    }

    // Reverter saldo anterior se mudou conta ou valor
    if (
      validatedData.accountId !== transaction.accountId ||
      validatedData.amount !== transaction.amount ||
      validatedData.type !== transaction.type
    ) {
      await updateAccountBalance(
        transaction.accountId,
        parseFloat(transaction.amount.toString()),
        transaction.type as any,
        'reverse'
      );
    }

    // Atualizar transação
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
      },
      include: {
        account: { select: { name: true } },
        category: { select: { name: true, color: true } },
      },
    });

    // Aplicar novo saldo se mudou
    if (
      validatedData.accountId !== transaction.accountId ||
      validatedData.amount !== transaction.amount ||
      validatedData.type !== transaction.type
    ) {
      await updateAccountBalance(
        validatedData.accountId || transaction.accountId,
        validatedData.amount || transaction.amount,
        validatedData.type || transaction.type
      );
    }

    res.json({
      ...updated,
      amount: parseFloat(updated.amount.toString()),
    });
  } catch (error: any) {
    console.error('Erro ao atualizar transação:', error);

    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({ error: 'Erro ao atualizar transação' });
  }
}

/**
 * DELETE /transactions/:id
 * Deletar transação
 */
export async function deleteTransaction(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      res.status(404).json({ error: 'Transação não encontrada' });
      return;
    }

    // Reverter saldo antes de deletar
    await updateAccountBalance(
      transaction.accountId,
      parseFloat(transaction.amount.toString()),
      transaction.type as any,
      'reverse'
    );

    await prisma.transaction.delete({
      where: { id },
    });

    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({ error: 'Erro ao deletar transação' });
  }
}

/**
 * Função auxiliar para atualizar saldo da conta
 */
async function updateAccountBalance(
  accountId: string,
  amount: number,
  type: string,
  operation: 'add' | 'reverse' = 'add'
) {
  const changeAmount =
    operation === 'reverse'
      ? type === 'income'
        ? -amount
        : amount
      : type === 'income'
        ? amount
        : -amount;

  await prisma.account.update({
    where: { id: accountId },
    data: {
      balance: {
        increment: changeAmount,
      },
    },
  });
}
```

#### Passo 4: Criar Rota de Transações

Crie `src/routes/transactions.ts`:

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController';

const router = Router();

router.use(authMiddleware);

router.get('/', listTransactions);
router.get('/:id', getTransaction);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
```

#### Passo 5: Registrar Rota no Server

Edite `src/server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import accountRoutes from './routes/accounts';
import categoryRoutes from './routes/categories';
import transactionRoutes from './routes/transactions';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
```

---

### FRONTEND

#### Passo 6: Estender API Client

Edite `src/services/api.ts` e adicione:

```typescript
// Métodos para transações
async getTransactions(filters?: any) {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }
  const url = params.toString() ? `/transactions?${params.toString()}` : '/transactions';
  return this.get(url);
}

async getTransaction(id: string) {
  return this.get(`/transactions/${id}`);
}

async createTransaction(data: any) {
  return this.post('/transactions', data);
}

async updateTransaction(id: string, data: any) {
  return this.put(`/transactions/${id}`, data);
}

async deleteTransaction(id: string) {
  return this.delete(`/transactions/${id}`);
}
```

#### Passo 7: Criar Schema de Validação

Crie `src/schemas/transaction.ts`:

```typescript
import { z } from 'zod';

export const createTransactionSchema = z.object({
  accountId: z.string().min(1, 'Conta é obrigatória'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  amount: z
    .number()
    .positive('Valor deve ser positivo'),
  description: z
    .string()
    .max(500, 'Descrição não pode ter mais de 500 caracteres')
    .optional(),
  type: z.enum(['income', 'expense', 'transfer']),
  date: z.date(),
});

export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;
```

#### Passo 8: Criar Componente de Formulário

Crie `src/components/TransactionForm.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../services/api';
import { createTransactionSchema, CreateTransactionFormData } from '../schemas/transaction';

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface TransactionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer'>('expense');

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateTransactionFormData>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date(),
    },
  });

  // Carregar contas e categorias
  useEffect(() => {
    const loadData = async () => {
      try {
        const [accs, cats] = await Promise.all([
          api.getAccounts(),
          api.getCategories(),
        ]);
        setAccounts(accs);
        setCategories(cats);
      } catch (error) {
        setApiError('Erro ao carregar dados');
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  const onSubmit = async (data: CreateTransactionFormData) => {
    setApiError(null);
    setIsSubmitting(true);

    try {
      await api.createTransaction({
        ...data,
        date: data.date.toISOString(),
      });
      onSuccess?.();
    } catch (error: any) {
      setApiError(error.response?.data?.error || 'Erro ao criar transação');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return <div className="card">Carregando...</div>;
  }

  const filteredCategories = categories.filter((cat) => {
    if (transactionType === 'transfer') return false;
    return cat.type === transactionType;
  });

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Nova Transação</h2>

      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo
          </label>
          <div className="flex gap-4">
            {(['income', 'expense', 'transfer'] as const).map((type) => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={type}
                  {...register('type')}
                  onChange={(e) => setTransactionType(e.target.value as any)}
                />
                <span>{type === 'income' ? 'Receita' : type === 'expense' ? 'Despesa' : 'Transferência'}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Conta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conta
          </label>
          <select className="input-field" {...register('accountId')}>
            <option value="">Selecione uma conta</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
          {errors.accountId && (
            <p className="text-red-600 text-sm mt-1">
              {errors.accountId.message}
            </p>
          )}
        </div>

        {/* Categoria */}
        {transactionType !== 'transfer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select className="input-field" {...register('categoryId')}>
              <option value="">Selecione uma categoria</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-600 text-sm mt-1">
                {errors.categoryId.message}
              </p>
            )}
          </div>
        )}

        {/* Valor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            className="input-field"
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="text-red-600 text-sm mt-1">{errors.amount.message}</p>
          )}
        </div>

        {/* Data */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data
          </label>
          <input
            type="date"
            className="input-field"
            {...register('date', {
              setValueAs: (value) => new Date(value),
            })}
          />
          {errors.date && (
            <p className="text-red-600 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição (opcional)
          </label>
          <textarea
            placeholder="Detalhes da transação..."
            className="input-field"
            rows={3}
            {...register('description')}
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1"
          >
            {isSubmitting ? 'Criando...' : 'Criar Transação'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
```

#### Passo 9: Criar Componente de Lista com Filtros

Crie `src/components/TransactionsList.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Transaction {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number;
  description?: string;
  type: string;
  date: string;
  account?: { name: string };
  category?: { name: string; color: string };
}

interface TransactionsListProps {
  refreshTrigger?: number;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  refreshTrigger,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadTransactions();
  }, [refreshTrigger, startDate, endDate, type, search, offset]);

  const loadTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters: any = { offset, limit };
      if (startDate) filters.startDate = new Date(startDate).toISOString();
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59);
        filters.endDate = end.toISOString();
      }
      if (type) filters.type = type;
      if (search) filters.search = search;

      const response = await api.getTransactions(filters);
      setTransactions(response.data);
      setTotal(response.total);
    } catch (error: any) {
      setError('Erro ao carregar transações');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta transação?')) {
      try {
        await api.deleteTransaction(id);
        loadTransactions();
      } catch (error: any) {
        setError('Erro ao deletar transação');
      }
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const hasMore = offset + limit < total;
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Transações</h2>

      {/* Filtros */}
      <div className="card">
        <div className="grid gap-4 md:grid-cols-5">
          <div>
            <label className="block text-sm font-medium mb-1">Data Inicial</label>
            <input
              type="date"
              className="input-field"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setOffset(0);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Data Final</label>
            <input
              type="date"
              className="input-field"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setOffset(0);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              className="input-field"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setOffset(0);
              }}
            >
              <option value="">Todos</option>
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
              <option value="transfer">Transferência</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Busca</label>
            <input
              type="text"
              placeholder="Descrição..."
              className="input-field"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOffset(0);
              }}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setType('');
                setSearch('');
                setOffset(0);
              }}
              className="btn-secondary w-full"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="card bg-red-50 border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="card text-center">
          <p className="text-gray-600">Carregando transações...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="card text-center">
          <p className="text-gray-600">Nenhuma transação encontrada</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto card">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Data</th>
                  <th className="px-4 py-2 text-left">Descrição</th>
                  <th className="px-4 py-2 text-left">Conta</th>
                  <th className="px-4 py-2 text-left">Categoria</th>
                  <th className="px-4 py-2 text-right">Valor</th>
                  <th className="px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{formatDate(t.date)}</td>
                    <td className="px-4 py-3">{t.description || '-'}</td>
                    <td className="px-4 py-3">{t.account?.name || '-'}</td>
                    <td className="px-4 py-3">
                      {t.category && (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: t.category.color }}
                          />
                          {t.category.name}
                        </div>
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold ${
                        t.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button className="btn-secondary text-sm">Editar</button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="card flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Mostrando {offset + 1} a {Math.min(offset + limit, total)} de {total} transações
            </p>
            <div className="flex gap-2">
              <button
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - limit))}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-4 py-2">
                Página {currentPage} de {totalPages}
              </span>
              <button
                disabled={!hasMore}
                onClick={() => setOffset(offset + limit)}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
```

#### Passo 10: Criar Página de Transações

Crie `src/pages/TransactionsPage.tsx`:

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionsList } from '../components/TransactionsList';

export const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">FinTrack</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Olá, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {showForm ? (
          <TransactionForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary mb-6"
          >
            Adicionar Transação
          </button>
        )}

        <TransactionsList refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
};
```

#### Passo 11: Atualizar Rotas

Edite `src/App.tsx`:

```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ManagementPage } from './pages/ManagementPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage"
            element={
              <ProtectedRoute>
                <ManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

---

## ✅ TESTES

### Backend - Testar com curl

**1. Criar Transação:**

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token" \
  -d '{
    "accountId": "id_da_conta",
    "categoryId": "id_da_categoria",
    "amount": 50.00,
    "description": "Café",
    "type": "expense",
    "date": "2024-02-19T10:00:00Z"
  }'
```

**2. Listar Transações com Filtros:**

```bash
curl -X GET "http://localhost:3000/api/transactions?type=expense&limit=10&offset=0" \
  -H "Authorization: Bearer seu_token"
```

**3. Filtrar por Data Range:**

```bash
curl -X GET "http://localhost:3000/api/transactions?startDate=2024-02-01T00:00:00Z&endDate=2024-02-28T23:59:59Z" \
  -H "Authorization: Bearer seu_token"
```

**4. Buscar por Descrição:**

```bash
curl -X GET "http://localhost:3000/api/transactions?search=café" \
  -H "Authorization: Bearer seu_token"
```

---

## 🐛 TROUBLESHOOTING

**Erro: "Conta não encontrada"**
- Verifique se accountId existe e pertence ao usuário

**Saldo negativo inesperado**
- Verifyque lógica de reversão ao deletar
- Pode ser necessário recalcular saldos

**Paginação não funciona**
- Verifique offset e limit estão sendo passados corretamente

---

## 📚 CONCEITOS RELACIONADOS

1. **Paginação Offset-based**: Simples mas com limitações em grandes datasets
2. **Índices Compostos**: Melhoram performance de filtros combinados
3. **Transações ACID**: Garantem consistência do banco
4. **Soft Delete**: Alternativa a deletar dados definitivamente

---

## ☑️ CHECKLIST

- [x] Schema de transações com índices
- [x] Controller com CRUD completo
- [x] Filtros: data, tipo, categoria
- [x] Paginação offset-based
- [x] Busca por descrição
- [x] Atualização de saldo automática
- [x] API client atualizado
- [x] Validação com Zod
- [x] TransactionForm criado
- [x] TransactionsList com filtros
- [x] Página de transações
- [x] Testes via curl
- [x] Testes no navegador
