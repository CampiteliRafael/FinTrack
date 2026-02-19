# SEMANA 9-10: Features Avançadas

## 🎯 OBJETIVOS

- Implementar transações parceladas (installment)
- Transações recorrentes (recurring)
- Metas financeiras (goals)
- Exportar relatórios (PDF)
- Operações em lote (bulk operations)
- Dashboard avançado

## 📋 ENTREGAS

- Schema para parcelamentos, recorrências e metas
- API endpoints para nova features
- Frontend components para criar parcelamentos
- Gráficos de progresso de metas
- Exportação PDF de relatórios
- Operações em lote (deletar múltiplas transações)

## 🛠️ TECNOLOGIAS

- Prisma migrations
- pdfkit ou puppeteer para PDF
- Cron jobs com node-schedule
- React components avançados

---

## 📝 PASSO A PASSO

### BACKEND

#### Passo 1: Estender Schema para Parcelamentos

Edite `prisma/schema.prisma`:

```prisma
model Transaction {
  id              String      @id @default(cuid())
  userId          String
  accountId       String
  categoryId      String
  amount          Float
  description     String?
  type            String      // income, expense, transfer
  date            DateTime
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relacionamentos para parcelamentos
  installmentId   String?
  installment     Installment? @relation(fields: [installmentId], references: [id], onDelete: Cascade)

  // Relacionamentos para recorrências
  recurringId     String?
  recurring       Recurring?  @relation(fields: [recurringId], references: [id], onDelete: Cascade)

  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  account         Account     @relation(fields: [accountId], references: [id], onDelete: Cascade)
  category        Category    @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([accountId])
  @@index([categoryId])
  @@index([date])
  @@index([userId, date])
  @@index([installmentId])
  @@index([recurringId])
}

model Installment {
  id              String      @id @default(cuid())
  userId          String
  description     String
  totalAmount     Float
  totalParcels    Int
  currentParcel   Int
  monthlyAmount   Float
  startDate       DateTime
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  transactions    Transaction[]

  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Recurring {
  id              String      @id @default(cuid())
  userId          String
  accountId       String
  categoryId      String
  description     String
  amount          Float
  type            String      // income, expense
  frequency       String      // daily, weekly, monthly, yearly
  isActive        Boolean     @default(true)
  nextDate        DateTime
  endDate         DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  transactions    Transaction[]
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  account         Account     @relation(fields: [accountId], references: [id], onDelete: Cascade)
  category        Category    @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([isActive])
  @@index([nextDate])
}

model Goal {
  id              String      @id @default(cuid())
  userId          String
  categoryId      String?
  name            String
  targetAmount    Float
  currentAmount   Float
  targetDate      DateTime
  description     String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  category        Category?   @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  @@index([userId])
}

// Adicionar relações em User, Account e Category:
model User {
  // ... campos existentes

  installments    Installment[]
  recurring       Recurring[]
  goals           Goal[]
}

model Account {
  // ... campos existentes

  recurring       Recurring[]
}

model Category {
  // ... campos existentes

  goals           Goal[]
}
```

Execute migração:

```bash
npx prisma migrate dev --name add_advanced_features
```

#### Passo 2: Criar Controller de Parcelamentos

Crie `src/controllers/installmentController.ts`:

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getUserId } from '../middleware/auth';

const prisma = new PrismaClient();

/**
 * POST /installments
 * Criar novo parcelamento
 */
export async function createInstallment(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const {
      description,
      totalAmount,
      totalParcels,
      monthlyAmount,
      startDate,
    } = req.body;

    // Validar
    if (totalAmount <= 0 || totalParcels <= 0) {
      res.status(400).json({ error: 'Valores inválidos' });
      return;
    }

    // Criar parcelamento
    const installment = await prisma.installment.create({
      data: {
        userId,
        description,
        totalAmount,
        totalParcels,
        currentParcel: 0,
        monthlyAmount,
        startDate: new Date(startDate),
      },
    });

    res.status(201).json(installment);
  } catch (error) {
    console.error('Erro ao criar parcelamento:', error);
    res.status(500).json({ error: 'Erro ao criar parcelamento' });
  }
}

/**
 * GET /installments
 * Listar parcelamentos do usuário
 */
export async function listInstallments(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    const installments = await prisma.installment.findMany({
      where: { userId },
      include: {
        transactions: { orderBy: { date: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(installments);
  } catch (error) {
    console.error('Erro ao listar parcelamentos:', error);
    res.status(500).json({ error: 'Erro ao listar parcelamentos' });
  }
}

/**
 * POST /installments/:id/advance
 * Avançar parcelamento (gerar próxima parcela)
 */
export async function advanceInstallment(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { accountId, categoryId, date } = req.body;

    const installment = await prisma.installment.findFirst({
      where: { id, userId },
    });

    if (!installment) {
      res.status(404).json({ error: 'Parcelamento não encontrado' });
      return;
    }

    if (installment.currentParcel >= installment.totalParcels) {
      res.status(400).json({ error: 'Parcelamento já finalizado' });
      return;
    }

    // Criar transação para a parcela
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId,
        categoryId,
        amount: installment.monthlyAmount,
        description: `${installment.description} (Parcela ${installment.currentParcel + 1}/${installment.totalParcels})`,
        type: 'expense',
        date: new Date(date),
        installmentId: id,
      },
    });

    // Atualizar parcelamento
    const updatedInstallment = await prisma.installment.update({
      where: { id },
      data: {
        currentParcel: installment.currentParcel + 1,
      },
    });

    res.json({
      installment: updatedInstallment,
      transaction,
    });
  } catch (error) {
    console.error('Erro ao avançar parcelamento:', error);
    res.status(500).json({ error: 'Erro ao avançar parcelamento' });
  }
}
```

#### Passo 3: Criar Controller de Recorrências

Crie `src/controllers/recurringController.ts`:

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getUserId } from '../middleware/auth';

const prisma = new PrismaClient();

/**
 * POST /recurring
 * Criar transação recorrente
 */
export async function createRecurring(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const {
      accountId,
      categoryId,
      description,
      amount,
      type,
      frequency,
      startDate,
      endDate,
    } = req.body;

    // Validar
    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(frequency)) {
      res.status(400).json({ error: 'Frequência inválida' });
      return;
    }

    const recurring = await prisma.recurring.create({
      data: {
        userId,
        accountId,
        categoryId,
        description,
        amount,
        type,
        frequency,
        nextDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isActive: true,
      },
    });

    res.status(201).json(recurring);
  } catch (error) {
    console.error('Erro ao criar recorrência:', error);
    res.status(500).json({ error: 'Erro ao criar recorrência' });
  }
}

/**
 * GET /recurring
 * Listar recorrências ativas
 */
export async function listRecurring(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    const recurring = await prisma.recurring.findMany({
      where: { userId, isActive: true },
      orderBy: { nextDate: 'asc' },
    });

    res.json(recurring);
  } catch (error) {
    console.error('Erro ao listar recorrências:', error);
    res.status(500).json({ error: 'Erro ao listar recorrências' });
  }
}

/**
 * PATCH /recurring/:id
 * Desativar recorrência
 */
export async function deactivateRecurring(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const recurring = await prisma.recurring.findFirst({
      where: { id, userId },
    });

    if (!recurring) {
      res.status(404).json({ error: 'Recorrência não encontrada' });
      return;
    }

    const updated = await prisma.recurring.update({
      where: { id },
      data: { isActive: false },
    });

    res.json(updated);
  } catch (error) {
    console.error('Erro ao desativar recorrência:', error);
    res.status(500).json({ error: 'Erro ao desativar recorrência' });
  }
}
```

#### Passo 4: Criar Controller de Metas

Crie `src/controllers/goalController.ts`:

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getUserId } from '../middleware/auth';

const prisma = new PrismaClient();

/**
 * POST /goals
 * Criar nova meta
 */
export async function createGoal(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const { categoryId, name, targetAmount, targetDate, description } = req.body;

    const goal = await prisma.goal.create({
      data: {
        userId,
        categoryId,
        name,
        targetAmount,
        currentAmount: 0,
        targetDate: new Date(targetDate),
        description,
      },
    });

    res.status(201).json(goal);
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    res.status(500).json({ error: 'Erro ao criar meta' });
  }
}

/**
 * GET /goals
 * Listar metas do usuário
 */
export async function listGoals(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    const goals = await prisma.goal.findMany({
      where: { userId },
      include: {
        category: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy: { targetDate: 'asc' },
    });

    // Calcular percentual de progresso
    const goalsWithProgress = goals.map((goal) => ({
      ...goal,
      progress: (goal.currentAmount / goal.targetAmount) * 100,
      remaining: Math.max(0, goal.targetAmount - goal.currentAmount),
    }));

    res.json(goalsWithProgress);
  } catch (error) {
    console.error('Erro ao listar metas:', error);
    res.status(500).json({ error: 'Erro ao listar metas' });
  }
}

/**
 * PUT /goals/:id
 * Atualizar progresso da meta
 */
export async function updateGoal(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { currentAmount } = req.body;

    const goal = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      res.status(404).json({ error: 'Meta não encontrada' });
      return;
    }

    const updated = await prisma.goal.update({
      where: { id },
      data: { currentAmount },
    });

    res.json({
      ...updated,
      progress: (updated.currentAmount / updated.targetAmount) * 100,
    });
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    res.status(500).json({ error: 'Erro ao atualizar meta' });
  }
}

/**
 * DELETE /goals/:id
 */
export async function deleteGoal(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const goal = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      res.status(404).json({ error: 'Meta não encontrada' });
      return;
    }

    await prisma.goal.delete({
      where: { id },
    });

    res.json({ message: 'Meta deletada' });
  } catch (error) {
    console.error('Erro ao deletar meta:', error);
    res.status(500).json({ error: 'Erro ao deletar meta' });
  }
}
```

#### Passo 5: Criar Controller de Relatórios

Crie `src/controllers/reportController.ts`:

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getUserId } from '../middleware/auth';
import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();

/**
 * GET /reports/monthly-pdf
 * Gerar relatório PDF do mês
 */
export async function generateMonthlyReport(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth();
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Buscar dados
    const [transactions, accounts, categoryBreakdown] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: firstDay, lte: lastDay },
        },
        include: {
          account: { select: { name: true } },
          category: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.account.findMany({
        where: { userId },
      }),
      prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          type: 'expense',
          date: { gte: firstDay, lte: lastDay },
        },
        _sum: { amount: true },
      }),
    ]);

    // Calcular totais
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    const totalBalance = accounts.reduce(
      (sum, a) => sum + parseFloat(a.balance.toString()),
      0
    );

    // Criar PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-${year}-${month + 1}.pdf"`);

    doc.pipe(res);

    // Título
    doc.fontSize(20).text('FinTrack - Relatório Mensal', { align: 'center' });
    doc.fontSize(12).text(`${new Date(year, month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`, {
      align: 'center',
    });

    // Resumo
    doc.moveDown();
    doc.fontSize(14).text('Resumo Financeiro');
    doc.fontSize(11).text(`Receitas: R$ ${totalIncome.toFixed(2)}`);
    doc.text(`Despesas: R$ ${totalExpense.toFixed(2)}`);
    doc.text(`Saldo Líquido: R$ ${(totalIncome - totalExpense).toFixed(2)}`);
    doc.text(`Saldo Total: R$ ${totalBalance.toFixed(2)}`);

    // Transações
    doc.moveDown();
    doc.fontSize(14).text('Transações');
    doc.fontSize(9).text('Data | Descrição | Conta | Valor');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    transactions.forEach((t) => {
      const date = new Date(t.date).toLocaleDateString('pt-BR');
      const amount = `${t.type === 'income' ? '+' : '-'}R$ ${parseFloat(t.amount.toString()).toFixed(2)}`;
      doc.fontSize(8).text(`${date} | ${t.description || '-'} | ${t.account.name} | ${amount}`);
    });

    doc.end();
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
}
```

---

### FRONTEND

#### Passo 6: Criar Componentes para Parcelamentos

Crie `src/components/InstallmentForm.tsx`:

```typescript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';

const installmentSchema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  totalAmount: z.number().positive('Valor deve ser positivo'),
  totalParcels: z.number().int().min(2, 'Mínimo 2 parcelas'),
  startDate: z.date(),
});

type InstallmentFormData = z.infer<typeof installmentSchema>;

interface InstallmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const InstallmentForm: React.FC<InstallmentFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InstallmentFormData>({
    resolver: zodResolver(installmentSchema),
  });

  const totalAmount = watch('totalAmount');
  const totalParcels = watch('totalParcels');
  const monthlyAmount = totalAmount && totalParcels ? totalAmount / totalParcels : 0;

  const onSubmit = async (data: InstallmentFormData) => {
    setApiError(null);
    setIsSubmitting(true);

    try {
      await api.post('/installments', {
        ...data,
        monthlyAmount,
      });
      onSuccess?.();
    } catch (error: any) {
      setApiError(error.response?.data?.error || 'Erro ao criar parcelamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Novo Parcelamento</h2>

      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Descrição</label>
          <input
            type="text"
            placeholder="ex: Compra de eletrônico"
            className="input-field"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Valor Total</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              {...register('totalAmount', { valueAsNumber: true })}
            />
            {errors.totalAmount && (
              <p className="text-red-600 text-sm mt-1">{errors.totalAmount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Número de Parcelas</label>
            <input
              type="number"
              step="1"
              min="2"
              className="input-field"
              {...register('totalParcels', { valueAsNumber: true })}
            />
            {errors.totalParcels && (
              <p className="text-red-600 text-sm mt-1">{errors.totalParcels.message}</p>
            )}
          </div>
        </div>

        {monthlyAmount > 0 && (
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm">Valor mensal: R$ {monthlyAmount.toFixed(2)}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Data Inicial</label>
          <input
            type="date"
            className="input-field"
            {...register('startDate', {
              setValueAs: (value) => new Date(value),
            })}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1"
          >
            {isSubmitting ? 'Criando...' : 'Criar Parcelamento'}
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

#### Passo 7: Criar Componentes para Metas

Crie `src/components/GoalsWidget.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  progress: number;
  remaining: number;
}

export const GoalsWidget: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await api.get('/goals');
      setGoals(data);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="card">Carregando metas...</div>;
  }

  if (goals.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Metas Financeiras</h3>
        <p className="text-gray-600 text-center py-8">Nenhuma meta cadastrada</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-4">Metas Financeiras</h3>

      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold">{goal.name}</p>
                <p className="text-sm text-gray-600">
                  até {new Date(goal.targetDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <p className="font-bold text-blue-600">{goal.progress.toFixed(0)}%</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(goal.progress, 100)}%` }}
              />
            </div>

            {/* Valores */}
            <div className="flex justify-between text-sm text-gray-600">
              <span>R$ {goal.currentAmount.toFixed(2)}</span>
              <span>R$ {goal.targetAmount.toFixed(2)}</span>
            </div>

            {/* Faltando */}
            <p className="text-xs text-gray-500 mt-1">
              Faltam: R$ {goal.remaining.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## ✅ TESTES

### Testar Parcelamentos

```bash
# Criar parcelamento
curl -X POST http://localhost:3000/api/installments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "description": "Notebook",
    "totalAmount": 3000,
    "totalParcels": 12,
    "monthlyAmount": 250,
    "startDate": "2024-02-01"
  }'

# Listar parcelamentos
curl -X GET http://localhost:3000/api/installments \
  -H "Authorization: Bearer token"
```

### Testar Metas

```bash
# Criar meta
curl -X POST http://localhost:3000/api/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "name": "Fundo de Emergência",
    "targetAmount": 10000,
    "targetDate": "2024-12-31",
    "categoryId": "category_id"
  }'

# Listar metas
curl -X GET http://localhost:3000/api/goals \
  -H "Authorization: Bearer token"
```

### Testar PDF

```bash
# Gerar relatório PDF
curl -X GET "http://localhost:3000/api/reports/monthly-pdf?month=1&year=2024" \
  -H "Authorization: Bearer token" \
  -o relatorio.pdf
```

---

## 📚 CONCEITOS RELACIONADOS

1. **Parcelamentos**: Dividir uma transação em múltiplas menores
2. **Recorrências**: Automatizar transações periódicas
3. **Metas**: Rastrear progresso de objetivos financeiros
4. **PDF Generation**: Exportar dados estruturados
5. **Agregação de Dados**: Relatórios complexos

---

## ☑️ CHECKLIST

- [x] Schema atualizado (Installment, Recurring, Goal)
- [x] Controllers de parcelamentos
- [x] Controllers de metas
- [x] Controllers de relatórios (PDF)
- [x] Componentes React para parcelamentos
- [x] Componentes React para metas
- [x] Testes via curl
- [x] Documentação completa
