# SEMANA 1: Setup e Autenticação

## 🎯 OBJETIVOS

- Configurar ambiente de desenvolvimento completo
- Implementar autenticação com JWT
- Criar sistema de registro e login
- Implementar middleware de autenticação
- Setup do banco de dados PostgreSQL
- Criar interface de login e registro no frontend

## 📋 ENTREGAS

- Backend Express com TypeScript
- Database PostgreSQL com schema de usuários
- JWT authentication (registro e login)
- Password hashing com bcrypt
- Frontend React com formulários de autenticação
- Auth context para gerenciar estado de autenticação
- Environment variables configuradas

## 🛠️ TECNOLOGIAS

**Backend:**
- Node.js 18+
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (jsonwebtoken)
- bcrypt
- dotenv

**Frontend:**
- React 18+
- TypeScript
- Vite
- Tailwind CSS
- React Router
- axios
- React Hook Form
- zod

---

## 📝 PASSO A PASSO

### BACKEND

#### Passo 1: Inicializar Projeto Node.js

Crie a pasta do projeto e inicialize o repositório:

```bash
mkdir fintrack
cd fintrack
npm init -y
```

Instale as dependências principais:

```bash
npm install express typescript ts-node dotenv prisma @prisma/client bcryptjs jsonwebtoken cors
npm install -D @types/express @types/node @types/bcryptjs @types/jsonwebtoken tsx nodemon
```

**Explicação das dependências:**
- `express`: Framework web
- `typescript`: Linguagem tipada
- `prisma`: ORM para banco de dados
- `bcryptjs`: Hash seguro de senhas
- `jsonwebtoken`: Criação e validação de tokens JWT
- `cors`: Permitir requisições cross-origin
- `tsx`: Executar TypeScript diretamente
- `nodemon`: Recarregar servidor automaticamente em desenvolvimento

#### Passo 2: Configurar TypeScript

Crie `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

#### Passo 3: Configurar Variáveis de Ambiente

Crie `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fintrack"

# JWT
JWT_SECRET="sua-chave-secreta-muito-segura-com-numeros-e-caracteres"
JWT_EXPIRE="7d"

# Server
PORT=3000
NODE_ENV="development"
```

Crie `src/.env.example` para versionamento:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fintrack"
JWT_SECRET="your-secret-key"
JWT_EXPIRE="7d"
PORT=3000
NODE_ENV="development"
```

#### Passo 4: Inicializar Prisma

Execute:

```bash
npx prisma init
```

Edite `.env` com sua conexão PostgreSQL (certifique-se que PostgreSQL está rodando):

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/fintrack"
```

#### Passo 5: Definir Schema do Banco de Dados

Edite `prisma/schema.prisma`:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String     @id @default(cuid())
  email     String     @unique
  password  String
  name      String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  accounts  Account[]
  categories Category[]
  transactions Transaction[]

  @@index([email])
}

model Account {
  id        String     @id @default(cuid())
  userId    String
  name      String
  balance   Float      @default(0)
  type      String     // checking, savings, credit_card, etc
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  @@unique([userId, name])
  @@index([userId])
}

model Category {
  id        String     @id @default(cuid())
  userId    String
  name      String
  color     String     @default("#000000")
  type      String     // income, expense
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  @@unique([userId, name])
  @@index([userId])
}

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
}
```

**Explicação do schema:**

- **User**: Tabela principal com email único (índice para buscas rápidas)
- **Account**: Contas bancárias do usuário com relação um-para-muitos
- **Category**: Categorias para classificar transações
- **Transaction**: Registro de transações com referências às outras tabelas
- `onDelete: Cascade`: Ao deletar usuário, todas suas contas e transações são deletadas
- Índices: Melhoram performance em buscas comuns (userId, email, date)

#### Passo 6: Migrar Banco de Dados

Execute a migração:

```bash
npx prisma migrate dev --name init
```

Isso cria as tabelas no PostgreSQL. Você pode visualizar com:

```bash
npx prisma studio
```

#### Passo 7: Criar Tipos TypeScript

Crie `src/types/index.ts`:

```typescript
// Interface para requisição de registro
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Interface para requisição de login
export interface LoginRequest {
  email: string;
  password: string;
}

// Interface para resposta de autenticação
export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// Interface para payload do JWT
export interface JwtPayload {
  userId: string;
  email: string;
}

// Interface para request autenticado
export interface AuthenticatedRequest {
  userId?: string;
  email?: string;
}
```

#### Passo 8: Criar Utilidades de Autenticação

Crie `src/utils/auth.ts`:

```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * Hash uma senha usando bcrypt
 * Custo: 10 rounds (equilíbrio entre segurança e performance)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Comparar senha em texto plano com hash armazenado
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Gerar JWT token
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
}

/**
 * Verificar e decodificar JWT token
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
```

**Explicação das funções:**

- `hashPassword`: Salt rounds = 10 é recomendado pela OWASP (seguro e rápido)
- `comparePassword`: Usa bcrypt internamente para comparação segura
- `generateToken`: Cria JWT com expiração configurável
- `verifyToken`: Valida token e retorna null se inválido

#### Passo 9: Criar Middleware de Autenticação

Crie `src/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/auth';

/**
 * Middleware que verifica JWT token no header Authorization
 * Esperado: "Bearer <token>"
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer "
    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({ error: 'Token inválido ou expirado' });
      return;
    }

    // Adiciona informações do usuário ao request
    (req as any).userId = payload.userId;
    (req as any).email = payload.email;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Erro ao verificar token' });
  }
}

/**
 * Helper para extrair userId do request autenticado
 */
export function getUserId(req: Request): string {
  return (req as any).userId;
}
```

**Explicação:**

- Extrai token do header `Authorization: Bearer <token>`
- Valida token e adiciona `userId` ao objeto `req` para uso em controllers
- Retorna erro 401 se token inválido ou não fornecido

#### Passo 10: Criar Rotas de Autenticação

Crie `src/routes/auth.ts`:

```typescript
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  hashPassword,
  comparePassword,
  generateToken,
} from '../utils/auth';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /auth/register
 * Criar novo usuário
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body as RegisterRequest;

    // Validações básicas
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
      return;
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ error: 'Email já cadastrado' });
      return;
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Gerar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    const response: AuthResponse = {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

/**
 * POST /auth/login
 * Login com email e senha
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validações básicas
    if (!email || !password) {
      res.status(400).json({ error: 'Email e senha são obrigatórios' });
      return;
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Email ou senha incorretos' });
      return;
    }

    // Verificar senha
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Email ou senha incorretos' });
      return;
    }

    // Gerar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    const response: AuthResponse = {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

export default router;
```

**Explicação:**

- **Register**: Valida entrada, verifica email duplicado, faz hash de senha e cria usuário
- **Login**: Encontra usuário, valida senha, gera token JWT
- Retorna token e dados do usuário após sucesso
- Usa Prisma para queries ao banco de dados

#### Passo 11: Criar Server Express

Crie `src/server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - permite requisições do frontend
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

// Rotas
app.use('/api/auth', authRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV}`);
});
```

#### Passo 12: Configurar Scripts no package.json

Edite `package.json`:

```json
{
  "name": "fintrack-backend",
  "version": "1.0.0",
  "description": "Backend para FinTrack - Personal Finance Manager",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon --exec tsx src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:reset": "prisma migrate reset"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.1.0",
    "typescript": "^5.2.2"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.2",
    "@types/express": "^4.17.20",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.8.10",
    "nodemon": "^3.0.1",
    "prisma": "^5.0.0",
    "ts-node": "^10.9.1",
    "tsx": "^3.14.0"
  }
}
```

Inicie o servidor:

```bash
npm run dev
```

---

### FRONTEND

#### Passo 13: Criar Projeto React com Vite

```bash
npm create vite@latest fintrack-frontend -- --template react-ts
cd fintrack-frontend
npm install
```

#### Passo 14: Instalar Dependências do Frontend

```bash
npm install react-router-dom axios react-hook-form zod @hookform/resolvers tailwindcss postcss autoprefixer
npm install -D @types/react @types/react-dom
```

Configure Tailwind:

```bash
npx tailwindcss init -p
```

Edite `tailwind.config.js`:

```javascript
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

Edite `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition;
  }

  .btn-secondary {
    @apply px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition;
  }

  .input-field {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}
```

#### Passo 15: Criar API Client

Crie `src/services/api.ts`:

```typescript
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Adicionar token ao header de requisições
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Métodos de autenticação
  async register(email: string, password: string, name: string) {
    const response = await this.client.post('/auth/register', {
      email,
      password,
      name,
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  // Método genérico GET
  async get(url: string) {
    const response = await this.client.get(url);
    return response.data;
  }

  // Método genérico POST
  async post(url: string, data: any) {
    const response = await this.client.post(url, data);
    return response.data;
  }

  // Método genérico PUT
  async put(url: string, data: any) {
    const response = await this.client.put(url, data);
    return response.data;
  }

  // Método genérico DELETE
  async delete(url: string) {
    const response = await this.client.delete(url);
    return response.data;
  }
}

export default new ApiClient();
```

#### Passo 16: Criar Context de Autenticação

Crie `src/context/AuthContext.tsx`:

```typescript
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se existe token ao carregar
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login(email, password);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error: any) {
      throw error.response?.data?.error || 'Erro ao fazer login';
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await api.register(email, password, name);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error: any) {
      throw error.response?.data?.error || 'Erro ao registrar';
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
```

#### Passo 17: Criar Validação com Zod

Crie `src/schemas/auth.ts`:

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z
    .string()
    .min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
```

#### Passo 18: Criar Página de Login

Crie `src/pages/LoginPage.tsx`:

```typescript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { loginSchema, LoginFormData } from '../schemas/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error: any) {
      setApiError(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          FinTrack
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Gerencie suas finanças com facilidade
        </p>

        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="input-field"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••"
              className="input-field"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Botão Enviar */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Conectando...' : 'Entrar'}
          </button>
        </form>

        {/* Link para Registrar */}
        <p className="text-center mt-6 text-gray-600">
          Não tem conta?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-semibold">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
};
```

#### Passo 19: Criar Página de Registro

Crie `src/pages/RegisterPage.tsx`:

```typescript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { registerSchema, RegisterFormData } from '../schemas/auth';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      await registerUser(data.email, data.password, data.name);
      navigate('/dashboard');
    } catch (error: any) {
      setApiError(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          FinTrack
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Crie sua conta para começar
        </p>

        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              placeholder="João Silva"
              className="input-field"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Campo Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="input-field"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••"
              className="input-field"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Campo Confirmar Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Senha
            </label>
            <input
              type="password"
              placeholder="••••••"
              className="input-field"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Botão Enviar */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        {/* Link para Login */}
        <p className="text-center mt-6 text-gray-600">
          Já tem conta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
};
```

#### Passo 20: Criar Rota Protegida

Crie `src/components/ProtectedRoute.tsx`:

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

#### Passo 21: Criar Página Dashboard Básica

Crie `src/pages/DashboardPage.tsx`:

```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
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

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Bem-vindo ao FinTrack</h2>
          <p className="text-gray-600">
            Dashboard ainda em construção. Volte em breve para gerenciar suas finanças!
          </p>
        </div>
      </main>
    </div>
  );
};
```

#### Passo 22: Configurar Rotas Principais

Edite `src/App.tsx`:

```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

#### Passo 23: Configurar Variáveis de Ambiente Frontend

Crie `.env.local`:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## ✅ TESTES

### Backend - Testar com curl

**1. Registrar novo usuário:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123",
    "name": "João Silva"
  }'
```

**Resposta esperada:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx1234567890",
    "email": "joao@example.com",
    "name": "João Silva"
  }
}
```

**2. Fazer login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

**3. Acessar rota protegida com token:**

```bash
curl -X GET http://localhost:3000/health \
  -H "Authorization: Bearer seu_token_aqui"
```

**4. Testar com token inválido:**

```bash
curl -X GET http://localhost:3000/health \
  -H "Authorization: Bearer token_invalido"
```

### Frontend - Testar com Browser

1. Abra `http://localhost:5173`
2. Clique em "Cadastre-se"
3. Preencha formulário com dados válidos
4. Deve redirecionar para dashboard
5. Clique em "Sair" e volte para login
6. Faça login com as credenciais criadas

---

## 🐛 TROUBLESHOOTING

**Erro: "Cannot find module 'bcryptjs'"**
- Execute: `npm install bcryptjs @types/bcryptjs`

**Erro: "ECONNREFUSED" ao conectar PostgreSQL**
- Verifique se PostgreSQL está rodando
- Verifique DATABASE_URL em `.env`
- Teste conexão: `psql -U postgres`

**Erro: "Port 3000 already in use"**
- Mude PORT em `.env` ou mate processo: `lsof -ti:3000 | xargs kill -9`

**Token expirado em desenvolvimento**
- Limpe localStorage em dev tools
- Incremente JWT_EXPIRE em `.env`

**CORS error no frontend**
- Verifique se VITE_API_URL corresponde a http://localhost:3000/api
- Certifique-se que backend permite origin em cors config

---

## 📚 CONCEITOS RELACIONADOS

1. **JWT (JSON Web Tokens)**: Tokens auto-contidos com informações do usuário, sem necessidade de sessões no servidor
2. **Hash de Senha**: bcrypt com salt é padrão da indústria para segurança
3. **Autenticação vs Autorização**: Autenticação verifica quem é (login), autorização verifica o que pode fazer (permissões)
4. **CORS**: Mecanismo de segurança que permite/bloqueia requisições cross-origin
5. **Middleware**: Funções que processam requisições antes de chegar ao controller

---

## ☑️ CHECKLIST

- [x] Node.js e npm instalados
- [x] PostgreSQL rodando localmente
- [x] Projeto backend criado com Express + TypeScript
- [x] Prisma configurado e banco migrado
- [x] Autenticação JWT implementada (register/login)
- [x] Password hashing com bcrypt
- [x] Middleware de autenticação criado
- [x] Projeto frontend criado com React + Vite
- [x] Formulários de login e registro funcionando
- [x] Auth Context gerenciando estado global
- [x] Validação com Zod em formulários
- [x] Rotas protegidas implementadas
- [x] Dados persistem em localStorage
- [x] Testes com curl bem-sucedidos
- [x] Testes no navegador bem-sucedidos
