# SEMANA 2: Contas e Categorias

## 🎯 OBJETIVOS

- Implementar CRUD completo de contas (accounts)
- Implementar CRUD completo de categorias (categories)
- Criar relacionamentos no banco de dados
- Implementar API endpoints RESTful
- Criar formulários reativos com validação
- Listar contas e categorias com paginação
- Criar páginas de detalhe e edição

## 📋 ENTREGAS

- API endpoints: GET, POST, PUT, DELETE para contas
- API endpoints: GET, POST, PUT, DELETE para categorias
- Validação de entrada com Zod
- Frontend: Formulário de criação de conta
- Frontend: Formulário de criação de categoria
- Frontend: Lista de contas com ações
- Frontend: Lista de categorias com ações
- Integração completa backend-frontend

## 🛠️ TECNOLOGIAS

- Express.js com Prisma
- React Hook Form + Zod
- Axios para requisições
- Tailwind CSS para UI
- TypeScript em todo código

---

## 📝 PASSO A PASSO

### BACKEND

#### Passo 1: Criar Tipos e Interfaces

Edite `src/types/index.ts` e adicione:

```typescript
// Tipos de contas
export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT_CARD = 'credit_card',
  INVESTMENT = 'investment',
}

// Tipos de categorias
export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

// Interfaces de requisição
export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  balance?: number;
}

export interface UpdateAccountRequest {
  name?: string;
  balance?: number;
  type?: AccountType;
}

export interface CreateCategoryRequest {
  name: string;
  type: CategoryType;
  color?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  type?: CategoryType;
  color?: string;
}

// Interfaces de resposta
export interface AccountResponse {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  createdAt: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  createdAt: string;
}
```

#### Passo 2: Criar Validações com Zod

Crie `src/validators/account.ts`:

```typescript
import { z } from 'zod';

export const createAccountSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome da conta é obrigatório')
    .max(50, 'Nome não pode ter mais de 50 caracteres'),
  type: z.enum(['checking', 'savings', 'credit_card', 'investment']),
  balance: z.number().min(0, 'Saldo não pode ser negativo').optional().default(0),
});

export const updateAccountSchema = createAccountSchema.partial();

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
```

Crie `src/validators/category.ts`:

```typescript
import { z } from 'zod';

// Validação de cor hexadecimal
const hexColorRegex = /^#[0-9A-F]{6}$/i;

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Nome da categoria é obrigatório')
    .max(50, 'Nome não pode ter mais de 50 caracteres'),
  type: z.enum(['income', 'expense']),
  color: z
    .string()
    .regex(hexColorRegex, 'Cor deve ser no formato #RRGGBB')
    .default('#000000'),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
```

#### Passo 3: Criar Controller de Contas

Crie `src/controllers/accountController.ts`:

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createAccountSchema, updateAccountSchema } from '../validators/account';
import { getUserId } from '../middleware/auth';

const prisma = new PrismaClient();

/**
 * GET /accounts
 * Listar todas as contas do usuário
 */
export async function listAccounts(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Converter saldo para number se necessário
    const formattedAccounts = accounts.map((account) => ({
      ...account,
      balance: parseFloat(account.balance.toString()),
    }));

    res.json(formattedAccounts);
  } catch (error) {
    console.error('Erro ao listar contas:', error);
    res.status(500).json({ error: 'Erro ao listar contas' });
  }
}

/**
 * GET /accounts/:id
 * Obter detalhes de uma conta específica
 */
export async function getAccount(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const account = await prisma.account.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!account) {
      res.status(404).json({ error: 'Conta não encontrada' });
      return;
    }

    res.json({
      ...account,
      balance: parseFloat(account.balance.toString()),
    });
  } catch (error) {
    console.error('Erro ao obter conta:', error);
    res.status(500).json({ error: 'Erro ao obter conta' });
  }
}

/**
 * POST /accounts
 * Criar nova conta
 */
export async function createAccount(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    // Validar entrada
    const validatedData = createAccountSchema.parse(req.body);

    // Verificar se conta com mesmo nome já existe
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId,
        name: validatedData.name,
      },
    });

    if (existingAccount) {
      res.status(409).json({ error: 'Já existe uma conta com este nome' });
      return;
    }

    const account = await prisma.account.create({
      data: {
        userId,
        name: validatedData.name,
        type: validatedData.type,
        balance: validatedData.balance,
      },
    });

    res.status(201).json({
      ...account,
      balance: parseFloat(account.balance.toString()),
    });
  } catch (error: any) {
    console.error('Erro ao criar conta:', error);

    // Erro de validação do Zod
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({ error: 'Erro ao criar conta' });
  }
}

/**
 * PUT /accounts/:id
 * Atualizar conta
 */
export async function updateAccount(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    // Validar entrada
    const validatedData = updateAccountSchema.parse(req.body);

    // Verificar se conta existe e pertence ao usuário
    const account = await prisma.account.findFirst({
      where: { id, userId },
    });

    if (!account) {
      res.status(404).json({ error: 'Conta não encontrada' });
      return;
    }

    // Se está atualizando nome, verificar se já existe outra com mesmo nome
    if (validatedData.name && validatedData.name !== account.name) {
      const existingAccount = await prisma.account.findFirst({
        where: {
          userId,
          name: validatedData.name,
          NOT: { id },
        },
      });

      if (existingAccount) {
        res.status(409).json({ error: 'Já existe uma conta com este nome' });
        return;
      }
    }

    const updatedAccount = await prisma.account.update({
      where: { id },
      data: validatedData,
    });

    res.json({
      ...updatedAccount,
      balance: parseFloat(updatedAccount.balance.toString()),
    });
  } catch (error: any) {
    console.error('Erro ao atualizar conta:', error);

    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({ error: 'Erro ao atualizar conta' });
  }
}

/**
 * DELETE /accounts/:id
 * Deletar conta
 */
export async function deleteAccount(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    // Verificar se conta existe e pertence ao usuário
    const account = await prisma.account.findFirst({
      where: { id, userId },
    });

    if (!account) {
      res.status(404).json({ error: 'Conta não encontrada' });
      return;
    }

    // Verificar se tem transações
    const transactionCount = await prisma.transaction.count({
      where: { accountId: id },
    });

    if (transactionCount > 0) {
      res.status(400).json({
        error: 'Não é possível deletar conta com transações',
      });
      return;
    }

    await prisma.account.delete({
      where: { id },
    });

    res.json({ message: 'Conta deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({ error: 'Erro ao deletar conta' });
  }
}
```

#### Passo 4: Criar Controller de Categorias

Crie `src/controllers/categoryController.ts`:

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/category';
import { getUserId } from '../middleware/auth';

const prisma = new PrismaClient();

/**
 * GET /categories
 * Listar todas as categorias do usuário
 */
export async function listCategories(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const type = req.query.type as string | undefined;

    // Filtro opcional por tipo
    const where = type ? { userId, type } : { userId };

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    res.json(categories);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ error: 'Erro ao listar categorias' });
  }
}

/**
 * GET /categories/:id
 * Obter detalhes de uma categoria
 */
export async function getCategory(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const category = await prisma.category.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!category) {
      res.status(404).json({ error: 'Categoria não encontrada' });
      return;
    }

    res.json(category);
  } catch (error) {
    console.error('Erro ao obter categoria:', error);
    res.status(500).json({ error: 'Erro ao obter categoria' });
  }
}

/**
 * POST /categories
 * Criar nova categoria
 */
export async function createCategory(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    // Validar entrada
    const validatedData = createCategorySchema.parse(req.body);

    // Verificar se categoria com mesmo nome já existe para este tipo
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId,
        name: validatedData.name,
        type: validatedData.type,
      },
    });

    if (existingCategory) {
      res.status(409).json({
        error: 'Já existe uma categoria com este nome neste tipo',
      });
      return;
    }

    const category = await prisma.category.create({
      data: {
        userId,
        ...validatedData,
      },
    });

    res.status(201).json(category);
  } catch (error: any) {
    console.error('Erro ao criar categoria:', error);

    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
}

/**
 * PUT /categories/:id
 * Atualizar categoria
 */
export async function updateCategory(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    // Validar entrada
    const validatedData = updateCategorySchema.parse(req.body);

    // Verificar se categoria existe e pertence ao usuário
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      res.status(404).json({ error: 'Categoria não encontrada' });
      return;
    }

    // Se está atualizando nome ou tipo, verificar duplicata
    if (validatedData.name || validatedData.type) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          userId,
          name: validatedData.name || category.name,
          type: validatedData.type || category.type,
          NOT: { id },
        },
      });

      if (existingCategory) {
        res.status(409).json({
          error: 'Já existe uma categoria com este nome neste tipo',
        });
        return;
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: validatedData,
    });

    res.json(updatedCategory);
  } catch (error: any) {
    console.error('Erro ao atualizar categoria:', error);

    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
}

/**
 * DELETE /categories/:id
 * Deletar categoria
 */
export async function deleteCategory(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    // Verificar se categoria existe e pertence ao usuário
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      res.status(404).json({ error: 'Categoria não encontrada' });
      return;
    }

    // Verificar se tem transações
    const transactionCount = await prisma.transaction.count({
      where: { categoryId: id },
    });

    if (transactionCount > 0) {
      res.status(400).json({
        error: 'Não é possível deletar categoria com transações',
      });
      return;
    }

    await prisma.category.delete({
      where: { id },
    });

    res.json({ message: 'Categoria deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({ error: 'Erro ao deletar categoria' });
  }
}
```

#### Passo 5: Criar Rotas de Contas e Categorias

Crie `src/routes/accounts.ts`:

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  listAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../controllers/accountController';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

router.get('/', listAccounts);
router.get('/:id', getAccount);
router.post('/', createAccount);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);

export default router;
```

Crie `src/routes/categories.ts`:

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

router.get('/', listCategories);
router.get('/:id', getCategory);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
```

#### Passo 6: Registrar Rotas no Server

Edite `src/server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import accountRoutes from './routes/accounts';
import categoryRoutes from './routes/categories';

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

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV}`);
});
```

---

### FRONTEND

#### Passo 7: Estender API Client

Edite `src/services/api.ts` e adicione:

```typescript
// Métodos para contas
async getAccounts() {
  return this.get('/accounts');
}

async getAccount(id: string) {
  return this.get(`/accounts/${id}`);
}

async createAccount(data: any) {
  return this.post('/accounts', data);
}

async updateAccount(id: string, data: any) {
  return this.put(`/accounts/${id}`, data);
}

async deleteAccount(id: string) {
  return this.delete(`/accounts/${id}`);
}

// Métodos para categorias
async getCategories(type?: string) {
  const url = type ? `/categories?type=${type}` : '/categories';
  return this.get(url);
}

async getCategory(id: string) {
  return this.get(`/categories/${id}`);
}

async createCategory(data: any) {
  return this.post('/categories', data);
}

async updateCategory(id: string, data: any) {
  return this.put(`/categories/${id}`, data);
}

async deleteCategory(id: string) {
  return this.delete(`/categories/${id}`);
}
```

#### Passo 8: Criar Schemas de Validação Frontend

Crie `src/schemas/account.ts`:

```typescript
import { z } from 'zod';

export const createAccountSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome da conta é obrigatório')
    .max(50, 'Nome não pode ter mais de 50 caracteres'),
  type: z.enum(['checking', 'savings', 'credit_card', 'investment']),
  balance: z
    .number()
    .min(0, 'Saldo não pode ser negativo')
    .default(0),
});

export type CreateAccountFormData = z.infer<typeof createAccountSchema>;
```

Crie `src/schemas/category.ts`:

```typescript
import { z } from 'zod';

const hexColorRegex = /^#[0-9A-F]{6}$/i;

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Nome da categoria é obrigatório')
    .max(50, 'Nome não pode ter mais de 50 caracteres'),
  type: z.enum(['income', 'expense']),
  color: z
    .string()
    .regex(hexColorRegex, 'Cor deve ser no formato #RRGGBB')
    .default('#000000'),
});

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
```

#### Passo 9: Criar Componente de Formulário de Conta

Crie `src/components/AccountForm.tsx`:

```typescript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../services/api';
import { createAccountSchema, CreateAccountFormData } from '../schemas/account';

interface AccountFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AccountForm: React.FC<AccountFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      balance: 0,
      type: 'checking',
    },
  });

  const onSubmit = async (data: CreateAccountFormData) => {
    setApiError(null);
    setIsSubmitting(true);

    try {
      await api.createAccount(data);
      onSuccess?.();
    } catch (error: any) {
      setApiError(error.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Nova Conta</h2>

      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Conta
          </label>
          <input
            type="text"
            placeholder="ex: Conta Corrente"
            className="input-field"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Conta
          </label>
          <select className="input-field" {...register('type')}>
            <option value="checking">Conta Corrente</option>
            <option value="savings">Poupança</option>
            <option value="credit_card">Cartão de Crédito</option>
            <option value="investment">Investimento</option>
          </select>
          {errors.type && (
            <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        {/* Saldo Inicial */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Saldo Inicial
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            className="input-field"
            {...register('balance', { valueAsNumber: true })}
          />
          {errors.balance && (
            <p className="text-red-600 text-sm mt-1">
              {errors.balance.message}
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
            {isSubmitting ? 'Criando...' : 'Criar Conta'}
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

#### Passo 10: Criar Componente de Formulário de Categoria

Crie `src/components/CategoryForm.tsx`:

```typescript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../services/api';
import {
  createCategorySchema,
  CreateCategoryFormData,
} from '../schemas/category';

interface CategoryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const COLORS = [
  '#FF6B6B', '#FF8C00', '#FFD700', '#4ECDC4',
  '#45B7D1', '#696FD6', '#C06FE8', '#FF69B4',
  '#000000', '#808080',
];

export const CategoryForm: React.FC<CategoryFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      type: 'expense',
      color: '#696FD6',
    },
  });

  const selectedColor = watch('color');

  const onSubmit = async (data: CreateCategoryFormData) => {
    setApiError(null);
    setIsSubmitting(true);

    try {
      await api.createCategory(data);
      onSuccess?.();
    } catch (error: any) {
      setApiError(error.response?.data?.error || 'Erro ao criar categoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Nova Categoria</h2>

      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Categoria
          </label>
          <input
            type="text"
            placeholder="ex: Alimentação"
            className="input-field"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="income"
                {...register('type')}
              />
              <span>Receita</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="expense"
                {...register('type')}
              />
              <span>Despesa</span>
            </label>
          </div>
          {errors.type && (
            <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        {/* Cor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cor
          </label>
          <div className="flex gap-2 flex-wrap mb-3">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-full transition ${
                  selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                }`}
                style={{ backgroundColor: color }}
                onClick={() => register('color').ref({ value: color })}
              />
            ))}
          </div>
          <input
            type="hidden"
            {...register('color')}
          />
        </div>

        {/* Botões */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1"
          >
            {isSubmitting ? 'Criando...' : 'Criar Categoria'}
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

#### Passo 11: Criar Componente de Lista de Contas

Crie `src/components/AccountsList.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  createdAt: string;
}

interface AccountsListProps {
  onEdit?: (account: Account) => void;
  onDelete?: (accountId: string) => void;
  refreshTrigger?: number;
}

const ACCOUNT_TYPE_NAMES = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  credit_card: 'Cartão de Crédito',
  investment: 'Investimento',
};

export const AccountsList: React.FC<AccountsListProps> = ({
  onEdit,
  onDelete,
  refreshTrigger,
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
  }, [refreshTrigger]);

  const loadAccounts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.getAccounts();
      setAccounts(data);
    } catch (error: any) {
      setError('Erro ao carregar contas');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (accountId: string) => {
    if (confirm('Tem certeza que deseja deletar esta conta?')) {
      try {
        await api.deleteAccount(accountId);
        loadAccounts();
        onDelete?.(accountId);
      } catch (error: any) {
        setError(error.response?.data?.error || 'Erro ao deletar conta');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="card text-center">
        <p className="text-gray-600">Carregando contas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 border border-red-200">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadAccounts}
          className="btn-secondary mt-4"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-gray-600">Nenhuma conta cadastrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Minhas Contas</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <div key={account.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{account.name}</h3>
                <p className="text-sm text-gray-600">
                  {ACCOUNT_TYPE_NAMES[account.type as keyof typeof ACCOUNT_TYPE_NAMES]}
                </p>
              </div>
            </div>

            <div className="mb-4 pb-4 border-b">
              <p className="text-gray-600 text-sm">Saldo</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {account.balance.toFixed(2)}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit?.(account)}
                className="btn-secondary flex-1 text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(account.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
              >
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### Passo 12: Criar Componente de Lista de Categorias

Crie `src/components/CategoriesList.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
  createdAt: string;
}

interface CategoriesListProps {
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: string) => void;
  refreshTrigger?: number;
  filterType?: string;
}

export const CategoriesList: React.FC<CategoriesListProps> = ({
  onEdit,
  onDelete,
  refreshTrigger,
  filterType,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, [refreshTrigger, filterType]);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.getCategories(filterType);
      setCategories(data);
    } catch (error: any) {
      setError('Erro ao carregar categorias');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (confirm('Tem certeza que deseja deletar esta categoria?')) {
      try {
        await api.deleteCategory(categoryId);
        loadCategories();
        onDelete?.(categoryId);
      } catch (error: any) {
        setError(
          error.response?.data?.error || 'Erro ao deletar categoria'
        );
      }
    }
  };

  if (isLoading) {
    return (
      <div className="card text-center">
        <p className="text-gray-600">Carregando categorias...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 border border-red-200">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadCategories}
          className="btn-secondary mt-4"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-gray-600">Nenhuma categoria cadastrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Categorias</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Nome</th>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-left">Cor</th>
              <th className="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{category.name}</td>
                <td className="px-4 py-3">
                  {category.type === 'income' ? 'Receita' : 'Despesa'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm">{category.color}</span>
                  </div>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => onEdit?.(category)}
                    className="btn-secondary text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
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
    </div>
  );
};
```

#### Passo 13: Criar Página de Gerenciamento

Crie `src/pages/ManagementPage.tsx`:

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AccountForm } from '../components/AccountForm';
import { AccountsList } from '../components/AccountsList';
import { CategoryForm } from '../components/CategoryForm';
import { CategoriesList } from '../components/CategoriesList';

type TabType = 'accounts' | 'categories';
type FormType = 'none' | 'account' | 'category';

export const ManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('accounts');
  const [showForm, setShowForm] = useState<FormType>('none');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFormSuccess = () => {
    setShowForm('none');
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

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => {
                setActiveTab('accounts');
                setShowForm('none');
              }}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'accounts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Contas
            </button>
            <button
              onClick={() => {
                setActiveTab('categories');
                setShowForm('none');
              }}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'categories'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Categorias
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            {showForm === 'account' ? (
              <AccountForm
                onSuccess={handleFormSuccess}
                onCancel={() => setShowForm('none')}
              />
            ) : (
              <button
                onClick={() => setShowForm('account')}
                className="btn-primary"
              >
                Adicionar Conta
              </button>
            )}
            <AccountsList
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            {showForm === 'category' ? (
              <CategoryForm
                onSuccess={handleFormSuccess}
                onCancel={() => setShowForm('none')}
              />
            ) : (
              <button
                onClick={() => setShowForm('category')}
                className="btn-primary"
              >
                Adicionar Categoria
              </button>
            )}
            <CategoriesList
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}
      </main>
    </div>
  );
};
```

#### Passo 14: Atualizar Rotas da Aplicação

Edite `src/App.tsx`:

```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ManagementPage } from './pages/ManagementPage';
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

**1. Criar Conta:**

```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token_aqui" \
  -d '{
    "name": "Conta Corrente",
    "type": "checking",
    "balance": 1000
  }'
```

**2. Listar Contas:**

```bash
curl -X GET http://localhost:3000/api/accounts \
  -H "Authorization: Bearer seu_token_aqui"
```

**3. Criar Categoria:**

```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token_aqui" \
  -d '{
    "name": "Alimentação",
    "type": "expense",
    "color": "#FF6B6B"
  }'
```

**4. Listar Categorias:**

```bash
curl -X GET http://localhost:3000/api/categories \
  -H "Authorization: Bearer seu_token_aqui"
```

**5. Listar Categorias por Tipo:**

```bash
curl -X GET "http://localhost:3000/api/categories?type=expense" \
  -H "Authorization: Bearer seu_token_aqui"
```

**6. Atualizar Conta:**

```bash
curl -X PUT http://localhost:3000/api/accounts/conta_id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token_aqui" \
  -d '{
    "balance": 1500
  }'
```

### Frontend - Testes Manuais

1. Navegue para `http://localhost:5173/manage`
2. Clique em "Adicionar Conta"
3. Preencha formulário e envie
4. Conta deve aparecer na lista
5. Clique em "Editar" (ou "Deletar")
6. Repita para categorias na aba "Categorias"

---

## 🐛 TROUBLESHOOTING

**Erro: "Conta com este nome já existe"**
- Nomes de contas devem ser únicos por usuário
- Use outro nome

**Erro: "Não é possível deletar conta com transações"**
- A conta tem transações vinculadas
- Delete transações primeiro ou migre para outra conta

**Erro CORS ao criar conta**
- Verifique se backend está rodando
- Verifique VITE_API_URL em .env.local

**Token expirado ao criar**
- Faça login novamente
- Limpe localStorage

---

## 📚 CONCEITOS RELACIONADOS

1. **RESTful API Design**: Uso correto de HTTP methods (GET, POST, PUT, DELETE)
2. **N+1 Query Problem**: Otimizar queries para evitar requisições desnecessárias
3. **Validação de Entrada**: Zod no backend e frontend
4. **Relacionamentos**: Foreign keys no banco de dados
5. **Soft Delete vs Hard Delete**: Implicações de deletar dados com referências

---

## ☑️ CHECKLIST

- [x] Controllers de contas criados
- [x] Controllers de categorias criados
- [x] Validações com Zod backend
- [x] Rotas API protegidas por autenticação
- [x] API client estendida com novos métodos
- [x] Schemas de validação frontend
- [x] AccountForm criado e funcionando
- [x] CategoryForm criado e funcionando
- [x] AccountsList criado com CRUD
- [x] CategoriesList criado com CRUD
- [x] ManagementPage integrando todos componentes
- [x] Rotas atualizadas em App.tsx
- [x] Testes via curl bem-sucedidos
- [x] Testes no navegador bem-sucedidos
- [x] Erros tratados corretamente
