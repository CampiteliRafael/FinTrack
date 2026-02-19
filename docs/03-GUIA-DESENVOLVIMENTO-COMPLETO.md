# 📕 DOCUMENTO 3: GUIA DE DESENVOLVIMENTO COMPLETO

## 🎯 VISÃO GERAL

Este documento serve como **índice central** para o desenvolvimento completo do projeto FinTrack em 18 semanas. Cada semana está disponível como um arquivo separado na pasta `semanas/` com instruções passo a passo, código completo e explicações detalhadas.

**Total**: 18 semanas | 4 fases | 11 documentos | ~300 páginas

---

## 📊 ESTRUTURA DO PROJETO

```
18 SEMANAS = 4 FASES

🟢 FASE 1: Base Obrigatória (Semanas 1-4)
   ├─ Setup e Autenticação
   ├─ CRUD de Contas e Categorias
   ├─ CRUD de Transações com Filtros
   └─ Dashboard com Estatísticas

🟡 FASE 2: Nível Pleno Real (Semanas 5-10)
   ├─ Segurança Avançada (Refresh Tokens)
   ├─ Clean Architecture (Refatoração)
   └─ Features Avançadas (Parcelamento, Metas)

🔵 FASE 3: Concorrência e Escala (Semanas 11-14)
   ├─ Processamento Assíncrono (BullMQ)
   ├─ Performance (Cache, Indexes)
   └─ Testes Completos (Unit, Integration, E2E)

🟣 FASE 4: Infraestrutura e Produção (Semanas 15-18)
   ├─ Docker e CI/CD
   └─ Deploy e Monitoramento
```

---

## 🚀 COMO USAR ESTE GUIA

1. **Siga as semanas em ordem sequencial** (não pule etapas!)
2. **Cada semana é autocontida** com objetivos, código e testes
3. **Marque checkboxes** conforme completa as tarefas
4. **Consulte Documento 2** (Conceitos Técnicos) quando necessário
5. **Commit seu código** ao final de cada semana

---

## 📋 ÍNDICE DE SEMANAS

### 🟢 FASE 1: BASE OBRIGATÓRIA

#### Semana 1: Setup e Autenticação
**📄 Arquivo**: [`semanas/semana-01-setup-autenticacao.md`](./semanas/semana-01-setup-autenticacao.md)

**Entregas**: Backend + Frontend funcionando com autenticação JWT

#### Semana 2: Contas e Categorias
**📄 Arquivo**: [`semanas/semana-02-contas-categorias.md`](./semanas/semana-02-contas-categorias.md)

**Entregas**: CRUD completo de Accounts e Categories

#### Semana 3: Transações
**📄 Arquivo**: [`semanas/semana-03-transacoes.md`](./semanas/semana-03-transacoes.md)

**Entregas**: CRUD de Transactions com filtros e paginação

#### Semana 4: Dashboard
**📄 Arquivo**: [`semanas/semana-04-dashboard.md`](./semanas/semana-04-dashboard.md)

**Entregas**: Dashboard com agregações e gráficos

---

### 🟡 FASE 2: NÍVEL PLENO REAL

#### Semanas 5-6: Segurança Avançada
**📄 Arquivo**: [`semanas/semana-05-06-seguranca-avancada.md`](./semanas/semana-05-06-seguranca-avancada.md)

**Entregas**: Refresh tokens, rate limiting, security headers

#### Semanas 7-8: Clean Architecture
**📄 Arquivo**: [`semanas/semana-07-08-clean-architecture.md`](./semanas/semana-07-08-clean-architecture.md)

**Entregas**: Código refatorado com Clean Architecture e SOLID

#### Semanas 9-10: Features Avançadas
**📄 Arquivo**: [`semanas/semana-09-10-features-avancadas.md`](./semanas/semana-09-10-features-avancadas.md)

**Entregas**: Parcelamento, recorrências, metas, relatórios PDF

---

### 🔵 FASE 3: CONCORRÊNCIA E ESCALA

#### Semanas 11-12: Processamento Assíncrono
**📄 Arquivo**: [`semanas/semana-11-12-processamento-assincrono.md`](./semanas/semana-11-12-processamento-assincrono.md)

**Entregas**: BullMQ com jobs de email e relatórios

#### Semanas 13-14: Performance e Testes
**📄 Arquivo**: [`semanas/semana-13-14-performance-testes.md`](./semanas/semana-13-14-performance-testes.md)

**Entregas**: Testes completos (80%+ coverage) e otimizações

---

### 🟣 FASE 4: INFRAESTRUTURA E PRODUÇÃO

#### Semanas 15-16: Docker e CI/CD
**📄 Arquivo**: [`semanas/semana-15-16-docker-cicd.md`](./semanas/semana-15-16-docker-cicd.md)

**Entregas**: Docker containers e GitHub Actions pipeline

#### Semanas 17-18: Deploy e Monitoramento
**📄 Arquivo**: [`semanas/semana-17-18-deploy-monitoramento.md`](./semanas/semana-17-18-deploy-monitoramento.md)

**Entregas**: Projeto em produção com monitoring

---

👉 **Comece pela [Semana 1: Setup e Autenticação](./semanas/semana-01-setup-autenticacao.md)**

📚 **Consulte os [Conceitos Técnicos](./02-CONCEITOS-TECNICOS-COMPLETOS.md) quando necessário**

---

**Versão**: 2.0 (Modular) | **Status**: ✅ Completo
- [ ] Instalar dependências
- [ ] Configurar TypeScript
- [ ] Configurar scripts npm
- [ ] Criar estrutura de pastas
- [ ] Configurar variáveis de ambiente
- [ ] Setup Prisma
- [ ] Criar migration inicial
- [ ] Criar cliente Prisma
- [ ] Criar servidor Express
- [ ] Testar health check

#### 🔨 Implementação

**Passo 1: Criar Estrutura**

```bash
# Criar pastas principais
mkdir -p FinTrack/{backend,frontend,docs}
cd FinTrack/backend

# Inicializar Git
git init
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo "dist/" >> .gitignore
```

**Passo 2: Inicializar npm**

```bash
npm init -y
```

**Passo 3: Instalar Dependências**

```bash
# Produção
npm install express @prisma/client dotenv cors bcrypt jsonwebtoken zod

# Desenvolvimento
npm install -D typescript @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken ts-node-dev prisma
```

**Explicação de cada dependência**: Ver Documento 3 - Semana 1 completa no arquivo original

**Passo 4: Configurar TypeScript**

Arquivo `tsconfig.json` completo comentado - Ver arquivo original

**Passo 5-12**: Ver detalhes completos no arquivo `03-GUIA-PASSO-A-PASSO-SEMANA-1-COMPLETA.md` existente

#### ✅ Resultado do Dia 1
- [ ] Backend configurado e funcionando
- [ ] Health check respondendo em http://localhost:4000/health
- [ ] Prisma conectado ao PostgreSQL
- [ ] Git inicializado

---

### DIAS 2-3: Autenticação Backend

#### 📚 Objetivos de Aprendizado
- Implementar JWT completo
- Hashear senhas com bcrypt
- Criar arquitetura em camadas (Repository, Service, Controller)
- Validar dados com Zod

#### 📝 Checklist dos Dias

**Dia 2**:
- [ ] Criar utilitários (hash, JWT)
- [ ] Criar tipos TypeScript
- [ ] Criar schemas Zod
- [ ] Criar User Repository
- [ ] Criar Auth Service

**Dia 3**:
- [ ] Criar Auth Controller
- [ ] Criar Auth Middleware
- [ ] Criar Auth Routes
- [ ] Integrar no app.ts
- [ ] Testar endpoints

#### 🔨 Implementação Completa

Ver detalhes completos em `03-GUIA-PASSO-A-PASSO-SEMANA-1-COMPLETA.md` (arquivo existente) com:
- Código completo (~500 linhas)
- Explicações linha por linha
- Testes com curl
- Diagramas de fluxo

---

### DIAS 4-5: Setup Frontend

#### 📚 Objetivos de Aprendizado
- Configurar React + Vite + TypeScript
- Setup Tailwind CSS
- Criar componentes UI reutilizáveis
- Implementar forms com React Hook Form + Zod
- Criar Auth Context

#### 📝 Checklist dos Dias

**Dia 4**:
- [ ] Setup Vite + React + TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Criar estrutura de pastas (features)
- [ ] Criar service de API (axios + interceptors)
- [ ] Criar componentes UI básicos (Button, Input, Card)

**Dia 5**:
- [ ] Criar Auth Context
- [ ] Criar Auth Service (frontend)
- [ ] Criar LoginForm component
- [ ] Criar RegisterForm component
- [ ] Criar páginas (LoginPage, RegisterPage)
- [ ] Setup React Router

#### 🔨 Implementação

**Passo 1: Setup Vite**

```bash
cd ../frontend
npm create vite@latest . -- --template react-ts
npm install
```

**Passo 2: Instalar Dependências**

```bash
# UI e Forms
npm install react-router-dom react-hook-form @hookform/resolvers zod
npm install axios

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Passo 3: Configurar Tailwind**

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Passo 4-10**: Implementação completa de todos componentes, services, contexts - VER SEÇÃO EXPANDIDA ABAIXO

---

## EXPANSÃO DETALHADA - FRONTEND COMPLETO

### Estrutura de Pastas

```
frontend/
├─ src/
│  ├─ components/
│  │  └─ ui/
│  │     ├─ Button.tsx
│  │     ├─ Input.tsx
│  │     └─ Card.tsx
│  ├─ features/
│  │  └─ auth/
│  │     ├─ components/
│  │     │  ├─ LoginForm.tsx
│  │     │  └─ RegisterForm.tsx
│  │     ├─ contexts/
│  │     │  └─ AuthContext.tsx
│  │     ├─ services/
│  │     │  └─ authService.ts
│  │     └─ types/
│  │        └─ auth.types.ts
│  ├─ pages/
│  │  ├─ LoginPage.tsx
│  │  ├─ RegisterPage.tsx
│  │  └─ DashboardPage.tsx
│  ├─ services/
│  │  └─ api.ts
│  ├─ App.tsx
│  └─ main.tsx
```

### API Service (axios)

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Adiciona token em todas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Trata erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Auth Context

```typescript
// src/features/auth/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User, LoginDTO, RegisterDTO } from '../types/auth.types';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (data: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.getMe();
        setUser(userData);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }

  async function login(data: LoginDTO) {
    const response = await authService.login(data);
    localStorage.setItem('token', response.token);
    setUser(response.user);
  }

  async function register(data: RegisterDTO) {
    const response = await authService.register(data);
    localStorage.setItem('token', response.token);
    setUser(response.user);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Componentes UI

```typescript
// src/components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export function Button({ variant = 'primary', isLoading, children, ...props }: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? 'Carregando...' : children}
    </button>
  );
}
```

```typescript
// src/components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={`px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
        }`}
        {...props}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
```

### LoginForm com React Hook Form

```typescript
// src/features/auth/components/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    try {
      await login(data);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao fazer login');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
      />
      <Input
        label="Senha"
        type="password"
        {...register('password')}
        error={errors.password?.message}
      />
      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Entrar
      </Button>
    </form>
  );
}
```

### React Router Setup

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

### DIAS 6-7: Integração e Testes

#### 📝 Checklist

- [ ] Conectar frontend + backend (CORS configurado)
- [ ] Testar fluxo de cadastro completo
- [ ] Testar fluxo de login completo
- [ ] Implementar loading states
- [ ] Implementar error handling visual
- [ ] Adicionar toast notifications (opcional)
- [ ] Testar persistência de token
- [ ] Testar redirecionamento após login
- [ ] Testar logout
- [ ] Revisar e ajustar estilos

#### ✅ Resultado da Semana 1
- [ ] Backend autenticação funcionando
- [ ] Frontend autenticação funcionando
- [ ] Fluxos completos testados
- [ ] Sistema pronto para expandir (Semana 2)

---

## SEMANA 2: Contas e Categorias

### 📚 Objetivos
- Implementar CRUD completo (backend + frontend)
- Soft delete
- Formulários controlados
- Modals

### 📝 Checklist Geral

**Backend**:
- [ ] Atualizar Prisma schema (Account, Category)
- [ ] Criar migrations
- [ ] Implementar AccountRepository
- [ ] Implementar AccountService
- [ ] Implementar AccountController
- [ ] Criar rotas de Account
- [ ] Implementar CategoryRepository
- [ ] Implementar CategoryService
- [ ] Implementar CategoryController
- [ ] Criar rotas de Category
- [ ] Testar endpoints com curl/Postman

**Frontend**:
- [ ] Criar types (Account, Category)
- [ ] Criar AccountService
- [ ] Criar CategoryService
- [ ] Criar AccountList component
- [ ] Criar AccountForm component
- [ ] Criar AccountModal
- [ ] Criar AccountPage
- [ ] Criar CategoryList component
- [ ] Criar CategoryForm component (com color picker, icon selector)
- [ ] Criar CategoryPage
- [ ] Integrar no menu de navegação
- [ ] Testar fluxos completos

### 🔨 Implementação Backend

#### Atualizar Prisma Schema

```prisma
// prisma/schema.prisma (adicionar)

model Account {
  id             String        @id @default(uuid())
  userId         String        @map("user_id")
  name           String
  initialBalance Decimal       @map("initial_balance") @db.Decimal(15, 2)
  type           AccountType
  createdAt      DateTime      @default(now()) @map("created_at")
  updatedAt      DateTime      @updatedAt @map("updated_at")
  deletedAt      DateTime?     @map("deleted_at")

  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions   Transaction[]

  @@index([userId])
  @@index([deletedAt])
  @@map("accounts")
}

enum AccountType {
  checking
  savings
  cash
}

model Category {
  id           String          @id @default(uuid())
  userId       String          @map("user_id")
  name         String
  color        String          @default("#6B7280")
  icon         String          @default("tag")
  type         TransactionType
  createdAt    DateTime        @default(now()) @map("created_at")
  updatedAt    DateTime        @updatedAt @map("updated_at")
  deletedAt    DateTime?       @map("deleted_at")

  user         User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  @@index([userId])
  @@index([type])
  @@index([deletedAt])
  @@map("categories")
}

enum TransactionType {
  income
  expense
}
```

```bash
npx prisma migrate dev --name add_accounts_and_categories
```

#### Account Repository

```typescript
// src/modules/accounts/account.repository.ts
import prisma from '../../config/database';
import { Account, Prisma } from '@prisma/client';

export class AccountRepository {
  async findAll(userId: string): Promise<Account[]> {
    return prisma.account.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string): Promise<Account | null> {
    return prisma.account.findFirst({
      where: { id, userId, deletedAt: null },
    });
  }

  async create(data: Prisma.AccountCreateInput): Promise<Account> {
    return prisma.account.create({ data });
  }

  async update(id: string, userId: string, data: Prisma.AccountUpdateInput): Promise<Account> {
    return prisma.account.update({
      where: { id },
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
    });
  }

  async softDelete(id: string, userId: string): Promise<void> {
    await prisma.account.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        user: { connect: { id: userId } },
      },
    });
  }
}
```

#### Account Service

```typescript
// src/modules/accounts/account.service.ts
import { AccountRepository } from './account.repository';
import { CreateAccountDTO, UpdateAccountDTO } from './account.types';

export class AccountService {
  constructor(private accountRepository: AccountRepository) {}

  async getAll(userId: string) {
    return this.accountRepository.findAll(userId);
  }

  async getById(id: string, userId: string) {
    const account = await this.accountRepository.findById(id, userId);
    if (!account) {
      throw new Error('Account not found');
    }
    return account;
  }

  async create(userId: string, data: CreateAccountDTO) {
    return this.accountRepository.create({
      name: data.name,
      initialBalance: data.initialBalance,
      type: data.type,
      user: { connect: { id: userId } },
    });
  }

  async update(id: string, userId: string, data: UpdateAccountDTO) {
    await this.getById(id, userId); // Valida se existe
    return this.accountRepository.update(id, userId, data);
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId); // Valida se existe
    await this.accountRepository.softDelete(id, userId);
  }
}
```

#### Account Controller e Routes

```typescript
// src/modules/accounts/account.controller.ts
import { Request, Response } from 'express';
import { AccountService } from './account.service';

export class AccountController {
  constructor(private accountService: AccountService) {}

  getAll = async (req: Request, res: Response) => {
    try {
      const accounts = await this.accountService.getAll(req.user!.userId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const account = await this.accountService.getById(req.params.id, req.user!.userId);
      res.json(account);
    } catch (error: any) {
      if (error.message === 'Account not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const account = await this.accountService.create(req.user!.userId, req.body);
      res.status(201).json(account);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const account = await this.accountService.update(
        req.params.id,
        req.user!.userId,
        req.body
      );
      res.json(account);
    } catch (error: any) {
      if (error.message === 'Account not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.accountService.delete(req.params.id, req.user!.userId);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Account not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// src/modules/accounts/account.routes.ts
import { Router } from 'express';
import { AccountRepository } from './account.repository';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';

const router = Router();

const accountRepository = new AccountRepository();
const accountService = new AccountService(accountRepository);
const accountController = new AccountController(accountService);

router.use(authenticate); // Todas rotas requerem autenticação

router.get('/', accountController.getAll);
router.post('/', accountController.create);
router.get('/:id', accountController.getById);
router.patch('/:id', accountController.update);
router.delete('/:id', accountController.delete);

export default router;

// src/app.ts (adicionar)
import accountRoutes from './modules/accounts/account.routes';
app.use('/api/v1/accounts', accountRoutes);
```

### 🔨 Implementação Frontend

#### Account Service

```typescript
// src/features/accounts/services/accountService.ts
import api from '../../../services/api';
import type { Account, CreateAccountDTO, UpdateAccountDTO } from '../types/account.types';

export const accountService = {
  async getAll(): Promise<Account[]> {
    const { data } = await api.get('/accounts');
    return data;
  },

  async getById(id: string): Promise<Account> {
    const { data } = await api.get(`/accounts/${id}`);
    return data;
  },

  async create(dto: CreateAccountDTO): Promise<Account> {
    const { data } = await api.post('/accounts', dto);
    return data;
  },

  async update(id: string, dto: UpdateAccountDTO): Promise<Account> {
    const { data } = await api.patch(`/accounts/${id}`, dto);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/accounts/${id}`);
  },
};
```

#### Account Components

```typescript
// src/features/accounts/components/AccountCard.tsx
import { Account } from '../types/account.types';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{account.name}</h3>
          <p className="text-sm text-gray-500">{account.type}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(account)}
            className="text-blue-600 hover:text-blue-800"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="text-red-600 hover:text-red-800"
          >
            Excluir
          </button>
        </div>
      </div>
      <p className="mt-2 text-xl font-bold">{formatCurrency(Number(account.initialBalance))}</p>
    </div>
  );
}
```

```typescript
// src/features/accounts/components/AccountList.tsx
import { useState, useEffect } from 'react';
import { accountService } from '../services/accountService';
import { AccountCard } from './AccountCard';
import { AccountModal } from './AccountModal';
import type { Account } from '../types/account.types';

export function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      const data = await accountService.getAll();
      setAccounts(data);
    } catch (error) {
      alert('Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(account: Account) {
    setEditingAccount(account);
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente excluir esta conta?')) return;

    try {
      await accountService.delete(id);
      loadAccounts();
    } catch (error) {
      alert('Erro ao excluir conta');
    }
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingAccount(null);
    loadAccounts();
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Minhas Contas</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nova Conta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {isModalOpen && (
        <AccountModal
          account={editingAccount}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
```

**Similar para Categories** com:
- Color picker
- Icon selector
- Type selector (income/expense)

### ✅ Resultado da Semana 2
- [ ] CRUD de Contas funcionando
- [ ] CRUD de Categorias funcionando
- [ ] Soft delete implementado
- [ ] UI completa e responsiva

---

## SEMANA 3: Transações

### 📚 Objetivos
- CRUD de transações
- Filtros (data, tipo, conta, categoria)
- Paginação offset
- Soft delete
- Validações cruzadas

### 📝 Checklist Geral

**Backend**:
- [ ] Atualizar Prisma schema (Transaction)
- [ ] Criar migration com índices
- [ ] TransactionRepository (CRUD + filtros + paginação)
- [ ] TransactionService (validações de negócio)
- [ ] TransactionController (query params, paginação)
- [ ] Transaction Routes
- [ ] Validação: amount > 0
- [ ] Validação: type deve coincidir com category.type
- [ ] Testar todos endpoints

**Frontend**:
- [ ] Transaction types
- [ ] TransactionService
- [ ] TransactionList (paginado)
- [ ] TransactionCard
- [ ] TransactionForm (select de Account e Category, date picker)
- [ ] TransactionFilters (colapsável)
- [ ] Pagination component
- [ ] TransactionPage
- [ ] Modal de confirmação delete
- [ ] Loading skeletons
- [ ] Empty states

### 🔨 Implementação

**(Implementação detalhada similar às semanas anteriores)**

Schema Prisma, Repository, Service, Controller, Frontend components com:
- Filtros múltiplos
- Paginação (offset-based)
- Date picker
- Select de relacionamentos
- Validação cruzada (transaction.type === category.type)

### ✅ Resultado da Semana 3
- [ ] Transações CRUD funcionando
- [ ] Filtros funcionando
- [ ] Paginação funcionando
- [ ] Validações corretas

---

## SEMANA 4: Dashboard

### 📚 Objetivos
- Queries agregadas (SUM, GROUP BY)
- Gráficos (Recharts)
- Cards de resumo
- Otimização de queries

### 📝 Checklist

**Backend**:
- [ ] Dashboard Service (queries agregadas)
- [ ] GET /dashboard/summary (saldo, receitas, despesas do mês)
- [ ] GET /dashboard/by-category (gastos por categoria)
- [ ] GET /dashboard/recent (últimas 10 transações)
- [ ] Otimização com EXPLAIN
- [ ] Testes de performance

**Frontend**:
- [ ] Dashboard Service
- [ ] SummaryCards (saldo, receitas, despesas)
- [ ] CategoryPieChart (Recharts)
- [ ] RecentTransactions
- [ ] DashboardPage (grid layout)
- [ ] useMemo para cálculos pesados
- [ ] Refresh button

### 🔨 Implementação

**(Implementação com queries SQL agregadas, Recharts, useMemo)**

### ✅ Resultado da Fase 1
- [ ] MVP funcional completo
- [ ] Backend CRUD funcionando
- [ ] Frontend completo e responsivo
- [ ] Dashboard com visualizações
- [ ] Pronto para Fase 2

---

# 🟡 FASE 2: NÍVEL PLENO REAL

## SEMANAS 5-6: Segurança Avançada

### 📚 Objetivos
- Refresh tokens
- Rotação de tokens
- Rate limiting
- Helmet.js
- Sanitização

### 📝 Checklist

- [ ] Implementar refresh token (tabela no banco)
- [ ] Rotação de refresh tokens
- [ ] Endpoint POST /auth/refresh
- [ ] Rate limiting global (express-rate-limit)
- [ ] Rate limiting em /auth/* (mais restritivo)
- [ ] Helmet.js (security headers)
- [ ] Input sanitization (DOMPurify frontend, sanitize-html backend)
- [ ] CORS configurado com lista de origens
- [ ] Testes de segurança

### 🔨 Implementação

**(Implementação detalhada de refresh tokens, rate limiting, helmet)**

### ✅ Resultado
- [ ] Autenticação mais segura
- [ ] Rate limiting ativo
- [ ] Headers de segurança configurados

---

## SEMANAS 7-8: Refatoração Arquitetural

### 📚 Objetivos
- Refatorar para Clean Architecture
- Domain, Application, Infrastructure layers
- DTOs
- Dependency Injection

### 📝 Checklist

- [ ] Criar camada Domain (entities, value objects)
- [ ] Criar camada Application (use cases, DTOs)
- [ ] Refatorar camada Infrastructure (repositories)
- [ ] Implementar Dependency Injection (tsyringe)
- [ ] Refatorar todos módulos
- [ ] Escrever unit tests isolados
- [ ] Documentar arquitetura

### 🔨 Implementação

**(Implementação detalhada de Clean Architecture com código antes/depois)**

### ✅ Resultado
- [ ] Código mais manutenível
- [ ] Testes isolados
- [ ] Arquitetura escalável

---

## SEMANAS 9-10: Features Avançadas

### 📚 Objetivos
- Parcelamento de despesas
- Metas financeiras
- Relatórios avançados
- Zustand (estado global)

### 📝 Checklist

**Backend**:
- [ ] Schema de Installments (parcelamento)
- [ ] Schema de Goals (metas)
- [ ] CRUD de metas
- [ ] Cálculo de progresso de metas
- [ ] Relatórios avançados (múltiplos períodos)
- [ ] Exportação CSV

**Frontend**:
- [ ] Migrar Context API → Zustand
- [ ] Tela de Metas
- [ ] Componente de progresso
- [ ] Relatórios com múltiplos gráficos
- [ ] Botão de exportar CSV

### ✅ Resultado
- [ ] Features avançadas funcionando
- [ ] Estado global com Zustand
- [ ] Relatórios ricos

---

# 🔵 FASE 3: CONCORRÊNCIA E ESCALA

## SEMANAS 11-12: Processamento Assíncrono

### 📚 Objetivos
- BullMQ + Redis
- Jobs (email, PDF)
- Idempotência

### 📝 Checklist

- [ ] Setup Redis
- [ ] Instalar BullMQ
- [ ] Criar EmailQueue
- [ ] Criar ReportQueue
- [ ] Job: Enviar email de boas-vindas
- [ ] Job: Gerar relatório PDF
- [ ] Implementar idempotency keys
- [ ] Bull Board (dashboard de filas)
- [ ] Retry strategies
- [ ] Testes de jobs

### ✅ Resultado
- [ ] Processamento assíncrono funcionando
- [ ] Emails sendo enviados
- [ ] PDFs sendo gerados

---

## SEMANAS 13-14: Performance e Testes

### 📚 Objetivos
- Cache com Redis
- Cursor pagination
- Suite completa de testes

### 📝 Checklist

**Performance**:
- [ ] Cache de queries frequentes (Redis)
- [ ] Invalidação de cache
- [ ] Paginação por cursor (replace offset)
- [ ] Otimização de queries (EXPLAIN)
- [ ] Profiling de queries lentas

**Testes**:
- [ ] Jest setup completo
- [ ] Unit tests de Services (~30 testes)
- [ ] Unit tests de Utils (~10 testes)
- [ ] Integration tests de rotas (~50 testes)
- [ ] E2E tests com Playwright (~20 cenários)
- [ ] Coverage >80%
- [ ] CI rodando testes

### ✅ Resultado
- [ ] Performance otimizada
- [ ] Suite completa de testes
- [ ] CI/CD com testes automáticos

---

# 🟣 FASE 4: INFRAESTRUTURA E PRODUÇÃO

## SEMANAS 15-16: Containerização e CI/CD

### 📚 Objetivos
- Docker
- GitHub Actions

### 📝 Checklist

**Docker**:
- [ ] Dockerfile backend (multi-stage)
- [ ] Dockerfile frontend
- [ ] docker-compose.yml (dev)
- [ ] .dockerignore
- [ ] Build otimizado

**CI/CD**:
- [ ] GitHub Actions workflow
- [ ] Job: Lint + Type check
- [ ] Job: Run tests
- [ ] Job: Build
- [ ] Job: Deploy (Fase 4)
- [ ] Secrets configurados
- [ ] Deploy automático ao push main

### ✅ Resultado
- [ ] App containerizado
- [ ] CI/CD funcionando
- [ ] Deploy automático

---

## SEMANAS 17-18: Deploy e Monitoramento

### 📚 Objetivos
- Deploy em produção
- Logging
- Monitoramento

### 📝 Checklist

**Deploy**:
- [ ] Deploy backend (Railway)
- [ ] Deploy frontend (Vercel)
- [ ] Banco gerenciado (Neon)
- [ ] Variáveis de ambiente configuradas
- [ ] SSL/HTTPS ativo
- [ ] Domain personalizado (opcional)

**Logging**:
- [ ] Winston setup
- [ ] Logs estruturados (JSON)
- [ ] Níveis de log (error, warn, info)
- [ ] Não logar dados sensíveis
- [ ] Agregação de logs (opcional)

**Monitoramento**:
- [ ] Sentry setup (error tracking)
- [ ] Health checks (/health endpoint)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Alertas de erro (Sentry)

**Documentação**:
- [ ] Swagger/OpenAPI completo
- [ ] README do projeto
- [ ] Guia de deploy
- [ ] Changelog

### ✅ Resultado
- [ ] App em produção
- [ ] Logging funcionando
- [ ] Monitoramento ativo
- [ ] Documentação completa

---

# 🎉 PROJETO COMPLETO

## ✅ CHECKLIST FINAL

- [ ] Todas as 18 semanas concluídas
- [ ] Todas as features implementadas
- [ ] Testes com coverage >80%
- [ ] App deployado em produção
- [ ] Documentação completa
- [ ] Portfolio atualizado com projeto

---

**Parabéns! Você completou o FinTrack e aprendeu desenvolvimento full-stack do zero ao deploy!** 🚀

---

**Versão**: 2.0 Completa
**Última atualização**: Fevereiro 2026
