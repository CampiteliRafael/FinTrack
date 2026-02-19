# SEMANA 4: Dashboard

## 🎯 OBJETIVOS

- Criar dashboard com estatísticas
- Agregações: saldo total, receitas, despesas
- Gráficos mensais
- Breakdown por categoria
- Transações recentes
- Visão geral das contas

## 📋 ENTREGAS

- API endpoint para agregações
- Gráficos com Recharts
- Cards de estatísticas
- Tabela de transações recentes
- Dashboard responsivo
- Período selecionável (mês)

## 🛠️ TECNOLOGIAS

- Express.js com Prisma
- Recharts para gráficos
- React para componentes
- Tailwind CSS

---

## 📝 PASSO A PASSO

### BACKEND

#### Passo 1: Criar Controller de Agregações

Crie `src/controllers/dashboardController.ts`:

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getUserId } from '../middleware/auth';

const prisma = new PrismaClient();

/**
 * GET /dashboard/summary
 * Retorna resumo financeiro do mês atual
 */
export async function getDashboardSummary(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth();
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

    // Primeiro e último dia do mês
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59);

    // Buscar todos os dados necessários em paralelo
    const [
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      recentTransactions,
      categoryBreakdown,
      accountsData,
    ] = await Promise.all([
      // Saldo total de todas as contas
      getTotalBalance(userId),
      // Receitas do mês
      getMonthlyIncome(userId, firstDay, lastDay),
      // Despesas do mês
      getMonthlyExpense(userId, firstDay, lastDay),
      // Últimas 5 transações
      getRecentTransactions(userId, 5),
      // Despesas por categoria
      getCategoryBreakdown(userId, firstDay, lastDay),
      // Dados das contas
      getAccountsData(userId),
    ]);

    res.json({
      summary: {
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        netIncome: monthlyIncome - monthlyExpense,
      },
      recentTransactions,
      categoryBreakdown,
      accounts: accountsData,
      month: month + 1,
      year,
    });
  } catch (error) {
    console.error('Erro ao obter resumo do dashboard:', error);
    res.status(500).json({ error: 'Erro ao obter dados do dashboard' });
  }
}

/**
 * GET /dashboard/monthly-chart
 * Retorna dados para gráfico mensal de receitas e despesas
 */
export async function getMonthlyChart(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth();
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59);

    // Buscar transações do mês agrupadas por dia
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      select: {
        date: true,
        amount: true,
        type: true,
      },
      orderBy: { date: 'asc' },
    });

    // Agrupar por dia
    const dailyData: { [key: string]: { income: number; expense: number } } = {};

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateStr = `${i.toString().padStart(2, '0')}/0${(month + 1).toString().padStart(2, '0')}`;
      dailyData[dateStr] = { income: 0, expense: 0 };
    }

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const day = date.getDate();
      const dateStr = `${day.toString().padStart(2, '0')}/0${(month + 1).toString().padStart(2, '0')}`;
      const amount = parseFloat(t.amount.toString());

      if (t.type === 'income') {
        dailyData[dateStr].income += amount;
      } else if (t.type === 'expense') {
        dailyData[dateStr].expense += amount;
      }
    });

    const chartData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      receita: parseFloat(data.income.toFixed(2)),
      despesa: parseFloat(data.expense.toFixed(2)),
    }));

    res.json(chartData);
  } catch (error) {
    console.error('Erro ao obter dados do gráfico:', error);
    res.status(500).json({ error: 'Erro ao obter dados do gráfico' });
  }
}

/**
 * GET /dashboard/category-breakdown
 * Retorna despesas por categoria
 */
export async function getCategoryBreakdownChart(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth();
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59);

    const breakdown = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'expense',
        date: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Buscar dados das categorias
    const categoryIds = breakdown.map((item) => item.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const data = breakdown.map((item) => {
      const category = categoryMap.get(item.categoryId);
      return {
        name: category?.name || 'Sem categoria',
        value: parseFloat((item._sum.amount || 0).toString()),
        color: category?.color || '#000000',
      };
    });

    res.json(data);
  } catch (error) {
    console.error('Erro ao obter breakdown de categorias:', error);
    res.status(500).json({ error: 'Erro ao obter dados das categorias' });
  }
}

// ==================== FUNÇÕES AUXILIARES ====================

async function getTotalBalance(userId: string): Promise<number> {
  const result = await prisma.account.aggregate({
    where: { userId },
    _sum: { balance: true },
  });
  return parseFloat((result._sum.balance || 0).toString());
}

async function getMonthlyIncome(userId: string, start: Date, end: Date): Promise<number> {
  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'income',
      date: { gte: start, lte: end },
    },
    _sum: { amount: true },
  });
  return parseFloat((result._sum.amount || 0).toString());
}

async function getMonthlyExpense(userId: string, start: Date, end: Date): Promise<number> {
  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'expense',
      date: { gte: start, lte: end },
    },
    _sum: { amount: true },
  });
  return parseFloat((result._sum.amount || 0).toString());
}

async function getRecentTransactions(userId: string, limit: number) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    include: {
      account: { select: { name: true } },
      category: { select: { name: true, color: true } },
    },
    orderBy: { date: 'desc' },
    take: limit,
  });

  return transactions.map((t) => ({
    id: t.id,
    description: t.description,
    amount: parseFloat(t.amount.toString()),
    type: t.type,
    date: t.date,
    account: t.account,
    category: t.category,
  }));
}

async function getCategoryBreakdown(userId: string, start: Date, end: Date) {
  const breakdown = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      type: 'expense',
      date: { gte: start, lte: end },
    },
    _sum: { amount: true },
  });

  const categoryIds = breakdown.map((item) => item.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, color: true },
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return breakdown
    .map((item) => {
      const category = categoryMap.get(item.categoryId);
      return {
        categoryId: item.categoryId,
        name: category?.name || 'Sem categoria',
        amount: parseFloat((item._sum.amount || 0).toString()),
        color: category?.color || '#000000',
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

async function getAccountsData(userId: string) {
  const accounts = await prisma.account.findMany({
    where: { userId },
    select: { id: true, name: true, type: true, balance: true },
  });

  return accounts.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    balance: parseFloat(a.balance.toString()),
  }));
}
```

#### Passo 2: Criar Rotas do Dashboard

Crie `src/routes/dashboard.ts`:

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getDashboardSummary,
  getMonthlyChart,
  getCategoryBreakdownChart,
} from '../controllers/dashboardController';

const router = Router();

router.use(authMiddleware);

router.get('/summary', getDashboardSummary);
router.get('/monthly-chart', getMonthlyChart);
router.get('/category-breakdown', getCategoryBreakdownChart);

export default router;
```

#### Passo 3: Registrar Rotas

Edite `src/server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import accountRoutes from './routes/accounts';
import categoryRoutes from './routes/categories';
import transactionRoutes from './routes/transactions';
import dashboardRoutes from './routes/dashboard';

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
app.use('/api/dashboard', dashboardRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
```

---

### FRONTEND

#### Passo 4: Instalar Recharts

```bash
npm install recharts
```

#### Passo 5: Estender API Client

Edite `src/services/api.ts` e adicione:

```typescript
// Métodos para dashboard
async getDashboardSummary(month?: number, year?: number) {
  const params = new URLSearchParams();
  if (month !== undefined) params.append('month', String(month));
  if (year !== undefined) params.append('year', String(year));
  const url = params.toString() ? `/dashboard/summary?${params.toString()}` : '/dashboard/summary';
  return this.get(url);
}

async getMonthlyChart(month?: number, year?: number) {
  const params = new URLSearchParams();
  if (month !== undefined) params.append('month', String(month));
  if (year !== undefined) params.append('year', String(year));
  const url = params.toString() ? `/dashboard/monthly-chart?${params.toString()}` : '/dashboard/monthly-chart';
  return this.get(url);
}

async getCategoryBreakdown(month?: number, year?: number) {
  const params = new URLSearchParams();
  if (month !== undefined) params.append('month', String(month));
  if (year !== undefined) params.append('year', String(year));
  const url = params.toString() ? `/dashboard/category-breakdown?${params.toString()}` : '/dashboard/category-breakdown';
  return this.get(url);
}
```

#### Passo 6: Criar Componente de Cards de Estatísticas

Crie `src/components/DashboardCards.tsx`:

```typescript
import React from 'react';

interface Summary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netIncome: number;
}

interface DashboardCardsProps {
  summary: Summary;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const DashboardCards: React.FC<DashboardCardsProps> = ({ summary }) => {
  const cards = [
    {
      title: 'Saldo Total',
      value: summary.totalBalance,
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-600',
    },
    {
      title: 'Receitas (Mês)',
      value: summary.monthlyIncome,
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-600',
    },
    {
      title: 'Despesas (Mês)',
      value: summary.monthlyExpense,
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-600',
    },
    {
      title: 'Saldo Líquido',
      value: summary.netIncome,
      color: summary.netIncome >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200',
      textColor: summary.netIncome >= 0 ? 'text-emerald-600' : 'text-orange-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {cards.map((card, index) => (
        <div key={index} className={`card border ${card.color}`}>
          <p className="text-gray-600 text-sm font-medium mb-2">{card.title}</p>
          <p className={`text-2xl font-bold ${card.textColor}`}>
            {formatCurrency(card.value)}
          </p>
        </div>
      ))}
    </div>
  );
};
```

#### Passo 7: Criar Gráfico de Receitas e Despesas

Crie `src/components/IncomeExpenseChart.tsx`:

```typescript
import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartData {
  date: string;
  receita: number;
  despesa: number;
}

interface IncomeExpenseChartProps {
  data: ChartData[];
  type?: 'line' | 'bar';
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded border border-gray-300 shadow">
        <p className="text-sm font-semibold">{payload[0].payload.date}</p>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            style={{ color: entry.color }}
            className="text-sm"
          >
            {entry.name}: R$ {entry.value.toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
  data,
  type = 'bar',
}) => {
  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-4">Receitas vs Despesas</h3>
      <ResponsiveContainer width="100%" height={300}>
        {type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="receita"
              stroke="#22c55e"
              name="Receita"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="despesa"
              stroke="#ef4444"
              name="Despesa"
              connectNulls
            />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="receita" fill="#22c55e" name="Receita" />
            <Bar dataKey="despesa" fill="#ef4444" name="Despesa" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
```

#### Passo 8: Criar Gráfico de Pizza - Categorias

Crie `src/components/CategoryPieChart.tsx`:

```typescript
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface CategoryPieChartProps {
  data: CategoryData[];
}

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded border border-gray-300 shadow">
        <p className="text-sm font-semibold">{payload[0].payload.name}</p>
        <p className="text-sm">R$ {payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Despesas por Categoria</h3>
        <p className="text-gray-600 text-center py-8">Nenhuma despesa este mês</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-4">Despesas por Categoria</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Legenda detalhada */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.name}</span>
            </div>
            <span className="font-semibold">
              R$ {item.value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### Passo 9: Criar Componente de Tabela de Contas

Crie `src/components/AccountsSummary.tsx`:

```typescript
import React from 'react';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface AccountsSummaryProps {
  accounts: Account[];
}

const ACCOUNT_ICONS = {
  checking: '🏦',
  savings: '💰',
  credit_card: '💳',
  investment: '📈',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const AccountsSummary: React.FC<AccountsSummaryProps> = ({ accounts }) => {
  if (accounts.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Minhas Contas</h3>
        <p className="text-gray-600 text-center py-8">Nenhuma conta cadastrada</p>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-4">Minhas Contas</h3>

      <div className="space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {ACCOUNT_ICONS[account.type as keyof typeof ACCOUNT_ICONS] || '🏦'}
              </span>
              <div>
                <p className="font-semibold text-sm">{account.name}</p>
                <p className="text-xs text-gray-600">
                  {account.type.replace('_', ' ')}
                </p>
              </div>
            </div>
            <p className={`font-bold text-sm ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(account.balance)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <p className="font-semibold">Total</p>
        <p className="font-bold text-lg text-blue-600">
          {formatCurrency(totalBalance)}
        </p>
      </div>
    </div>
  );
};
```

#### Passo 10: Criar Componente de Transações Recentes

Crie `src/components/RecentTransactions.tsx`:

```typescript
import React from 'react';

interface Transaction {
  id: string;
  description?: string;
  amount: number;
  type: string;
  date: string;
  account?: { name: string };
  category?: { name: string; color: string };
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();

  // Se for hoje
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  // Se for ontem
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Ontem';
  }

  return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
};

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
}) => {
  if (transactions.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Transações Recentes</h3>
        <p className="text-gray-600 text-center py-8">Nenhuma transação</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-4">Transações Recentes</h3>

      <div className="space-y-2">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {transaction.category && (
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: transaction.category.color }}
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {transaction.description || transaction.category?.name || 'Sem categoria'}
                </p>
                <p className="text-xs text-gray-600">
                  {transaction.account?.name}
                </p>
              </div>
            </div>

            <div className="text-right flex-shrink-0 ml-2">
              <p
                className={`font-bold text-sm ${
                  transaction.type === 'income'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </p>
              <p className="text-xs text-gray-600">
                {formatDate(transaction.date)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### Passo 11: Criar Dashboard Principal

Edite `src/pages/DashboardPage.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { DashboardCards } from '../components/DashboardCards';
import { IncomeExpenseChart } from '../components/IncomeExpenseChart';
import { CategoryPieChart } from '../components/CategoryPieChart';
import { AccountsSummary } from '../components/AccountsSummary';
import { RecentTransactions } from '../components/RecentTransactions';

interface DashboardData {
  summary: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    netIncome: number;
  };
  recentTransactions: any[];
  categoryBreakdown: any[];
  accounts: any[];
  month: number;
  year: number;
}

interface ChartData {
  date: string;
  receita: number;
  despesa: number;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    loadDashboardData();
  }, [selectedMonth, selectedYear]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [summary, chart] = await Promise.all([
        api.getDashboardSummary(selectedMonth, selectedYear),
        api.getMonthlyChart(selectedMonth, selectedYear),
      ]);

      setDashboardData(summary);
      setChartData(chart);
    } catch (err: any) {
      setError('Erro ao carregar dashboard');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const monthName = new Date(selectedYear, selectedMonth).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

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

      {/* Navigation Links */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <Link
              to="/dashboard"
              className="py-4 px-2 border-b-2 border-blue-600 text-blue-600 font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/transactions"
              className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Transações
            </Link>
            <Link
              to="/manage"
              className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Gerenciar
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button onClick={loadDashboardData} className="ml-4 underline">
              Tentar novamente
            </button>
          </div>
        )}

        {/* Month Selector */}
        <div className="card mb-6 flex justify-between items-center">
          <button
            onClick={handlePreviousMonth}
            className="btn-secondary"
          >
            Mês Anterior
          </button>
          <h2 className="text-2xl font-bold capitalize">{monthName}</h2>
          <button
            onClick={handleNextMonth}
            className="btn-secondary"
          >
            Próximo Mês
          </button>
        </div>

        {dashboardData && (
          <>
            {/* Statistics Cards */}
            <DashboardCards summary={dashboardData.summary} />

            {/* Charts Row 1 */}
            <div className="grid gap-6 mb-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <IncomeExpenseChart data={chartData} type="bar" />
              </div>
              <div>
                <CategoryPieChart data={dashboardData.categoryBreakdown} />
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RecentTransactions transactions={dashboardData.recentTransactions} />
              </div>
              <div>
                <AccountsSummary accounts={dashboardData.accounts} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
```

---

## ✅ TESTES

### Backend - Testar com curl

**1. Obter Resumo do Dashboard:**

```bash
curl -X GET "http://localhost:3000/api/dashboard/summary" \
  -H "Authorization: Bearer seu_token"
```

**2. Obter Dados do Gráfico Mensal:**

```bash
curl -X GET "http://localhost:3000/api/dashboard/monthly-chart" \
  -H "Authorization: Bearer seu_token"
```

**3. Obter Breakdown de Categorias:**

```bash
curl -X GET "http://localhost:3000/api/dashboard/category-breakdown" \
  -H "Authorization: Bearer seu_token"
```

**4. Com Filtro de Mês:**

```bash
curl -X GET "http://localhost:3000/api/dashboard/summary?month=0&year=2024" \
  -H "Authorization: Bearer seu_token"
```

### Frontend - Testes Manuais

1. Navegue para `http://localhost:5173/dashboard`
2. Verifique se os cards aparecem com dados corretos
3. Verifique se os gráficos renderizam
4. Teste navegação entre meses
5. Teste links para transações e gerenciar

---

## 🐛 TROUBLESHOOTING

**Gráficos em branco**
- Verifique se tem transações no período
- Verifique console para erros

**Dados não aparecem**
- Confirme que tem contas e transações criadas
- Verifique autenticação

**Performance lenta**
- Muitas agregações simultâneas
- Considerar caching no Redis (próximas semanas)

---

## 📚 CONCEITOS RELACIONADOS

1. **Agregações**: groupBy, _sum do Prisma
2. **Gráficos**: Recharts para visualizações
3. **Data Range**: Cálculo de períodos
4. **Formatação**: Números, datas, moedas

---

## ☑️ CHECKLIST

- [x] Controller de dashboard criado
- [x] Endpoints de agregação
- [x] Gráficos com Recharts
- [x] Cards de estatísticas
- [x] Tabela de transações recentes
- [x] Resumo de contas
- [x] Seletor de mês/ano
- [x] Navegação entre páginas
- [x] Testes via curl
- [x] Testes no navegador
