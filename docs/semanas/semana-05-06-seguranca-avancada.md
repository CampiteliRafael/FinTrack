# SEMANA 5-6: Segurança Avançada

## 🎯 OBJETIVOS

- Implementar refresh tokens com rotation
- Token blacklist com Redis
- Rate limiting em endpoints
- Input sanitization
- Security headers com Helmet.js
- CORS robusto
- Testes de segurança

## 📋 ENTREGAS

- Refresh token rotation strategy
- Token blacklist Redis
- Rate limiting global e por endpoint
- Helmet security headers
- CORS policy refinado
- Input validation e sanitization
- Security test suite
- Documentação de vulnerabilidades

## 🛠️ TECNOLOGIAS

- Redis para blacklist de tokens
- express-rate-limit
- helmet.js
- express-validator
- Security testing com curl
- Environment variables hardened

---

## 📝 PASSO A PASSO

### BACKEND

#### Passo 1: Instalar Dependências de Segurança

```bash
npm install helmet express-rate-limit redis express-validator
npm install -D @types/express-validator
```

#### Passo 2: Configurar Redis

Crie `src/services/redis.ts`:

```typescript
import { createClient } from 'redis';

const redisClient = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  db: parseInt(process.env.REDIS_DB || '0'),
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

// Conectar ao inicializar
export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

// Adicionar token à blacklist
export async function blacklistToken(token: string, expiresIn: number) {
  const key = `blacklist:${token}`;
  await redisClient.setEx(key, expiresIn, '1');
}

// Verificar se token está na blacklist
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const key = `blacklist:${token}`;
  const result = await redisClient.get(key);
  return result !== null;
}

// Armazenar refresh token
export async function storeRefreshToken(
  userId: string,
  token: string,
  expiresIn: number
) {
  const key = `refresh_token:${userId}`;
  await redisClient.setEx(key, expiresIn, token);
}

// Verificar refresh token
export async function getRefreshToken(userId: string): Promise<string | null> {
  const key = `refresh_token:${userId}`;
  return redisClient.get(key);
}

// Limpar refresh token ao fazer logout
export async function deleteRefreshToken(userId: string) {
  const key = `refresh_token:${userId}`;
  await redisClient.del(key);
}

export default redisClient;
```

#### Passo 3: Atualizar Tipos de Auth

Edite `src/types/index.ts`:

```typescript
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
```

#### Passo 4: Atualizar Utilidades de Autenticação

Edite `src/utils/auth.ts`:

```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '15m'; // Mais curto agora
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-secret-key';
const REFRESH_EXPIRE = process.env.REFRESH_EXPIRE || '7d';

/**
 * Hash uma senha usando bcrypt
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
 * Gerar access token (curta duração)
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
}

/**
 * Gerar refresh token (longa duração)
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRE });
}

/**
 * Gerar ambos tokens
 */
export function generateTokenPair(payload: JwtPayload) {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Verificar access token
 */
export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verificar refresh token
 */
export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extrair tempo de expiração do token
 */
export function getTokenExpiration(token: string): number {
  try {
    const decoded: any = jwt.decode(token);
    if (decoded && decoded.exp) {
      return (decoded.exp - Math.floor(Date.now() / 1000)); // segundos
    }
  } catch (error) {
    // ignored
  }
  return 0;
}
```

#### Passo 5: Atualizar Middleware de Autenticação

Edite `src/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth';
import { isTokenBlacklisted } from '../services/redis';

/**
 * Middleware que verifica JWT access token
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    const token = authHeader.substring(7);

    // Verificar se token está na blacklist
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      res.status(401).json({ error: 'Token inválido (expirado)' });
      return;
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      res.status(401).json({ error: 'Token inválido ou expirado' });
      return;
    }

    (req as any).userId = payload.userId;
    (req as any).email = payload.email;
    (req as any).token = token;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Erro ao verificar token' });
  }
}

/**
 * Helper para extrair userId
 */
export function getUserId(req: Request): string {
  return (req as any).userId;
}

/**
 * Helper para extrair token
 */
export function getToken(req: Request): string {
  return (req as any).token;
}
```

#### Passo 6: Criar Validação de Input

Crie `src/middleware/validation.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware que valida erros de validação
 */
export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array(),
    });
    return;
  }
  next();
}

/**
 * Validadores de autenticação
 */
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Senha deve conter letras maiúsculas, minúsculas e números'
    ),
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Nome deve ter pelo menos 3 caracteres')
    .isLength({ max: 100 })
    .withMessage('Nome não pode ter mais de 100 caracteres'),
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
];

/**
 * Validadores de transações
 */
export const validateTransaction = [
  body('accountId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Conta é obrigatória'),
  body('categoryId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Categoria é obrigatória'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Valor deve ser maior que 0'),
  body('description')
    .trim()
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição não pode ter mais de 500 caracteres'),
  body('type')
    .isIn(['income', 'expense', 'transfer'])
    .withMessage('Tipo inválido'),
  body('date')
    .isISO8601()
    .withMessage('Data deve estar em formato ISO 8601'),
];

/**
 * Validadores de ID
 */
export const validateId = [
  param('id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('ID inválido'),
];

/**
 * Validadores de conta
 */
export const validateAccount = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Nome deve ter entre 1 e 50 caracteres'),
  body('type')
    .isIn(['checking', 'savings', 'credit_card', 'investment'])
    .withMessage('Tipo de conta inválido'),
  body('balance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Saldo não pode ser negativo'),
];

/**
 * Validadores de categoria
 */
export const validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Nome deve ter entre 1 e 50 caracteres'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Tipo inválido'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Cor deve ser no formato #RRGGBB'),
];
```

#### Passo 7: Configurar Rate Limiting

Crie `src/middleware/rateLimiter.ts`:

```typescript
import rateLimit from 'express-rate-limit';

/**
 * Rate limiter global (geral)
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: 'Muitas requisições, tente novamente mais tarde',
  standardHeaders: true, // Retorna informação rate limit em headers
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  skip: (req) => {
    // Não limitar health check
    return req.path === '/health';
  },
});

/**
 * Rate limiter para autenticação (mais restritivo)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentativas
  message: 'Muitas tentativas de autenticação, tente novamente em 15 minutos',
  skipSuccessfulRequests: true, // Não conta sucessos
  keyGenerator: (req) => {
    // Limitar por email se disponível, senão por IP
    return req.body.email || req.ip || 'unknown';
  },
});

/**
 * Rate limiter para criar transações (evitar spam)
 */
export const transactionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 transações por minuto
  message: 'Limite de transações excedido',
  keyGenerator: (req) => (req as any).userId || req.ip || 'unknown',
});

/**
 * Rate limiter para API calls (geral para endpoints protegidos)
 */
export const apiLimiter = rateLimit({
  windowMs: 1000, // 1 segundo
  max: 30, // 30 requisições por segundo
  message: 'Limite de requisições excedido',
  keyGenerator: (req) => (req as any).userId || req.ip || 'unknown',
});
```

#### Passo 8: Atualizar Rotas com Validação e Rate Limit

Edite `src/routes/auth.ts`:

```typescript
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  hashPassword,
  comparePassword,
  generateTokenPair,
  verifyRefreshToken,
} from '../utils/auth';
import { authLimiter } from '../middleware/rateLimiter';
import {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} from '../middleware/validation';
import {
  blacklistToken,
  storeRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
} from '../services/redis';
import { authMiddleware, getToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /auth/register
 */
router.post(
  '/register',
  authLimiter,
  validateRegister,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      // Verificar se email já existe
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(409).json({ error: 'Email já cadastrado' });
        return;
      }

      const hashedPassword = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
      });

      // Armazenar refresh token no Redis
      await storeRefreshToken(user.id, tokens.refreshToken, 7 * 24 * 60 * 60);

      res.status(201).json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
  }
);

/**
 * POST /auth/login
 */
router.post(
  '/login',
  authLimiter,
  validateLogin,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(401).json({ error: 'Email ou senha incorretos' });
        return;
      }

      const passwordMatch = await comparePassword(password, user.password);

      if (!passwordMatch) {
        res.status(401).json({ error: 'Email ou senha incorretos' });
        return;
      }

      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
      });

      // Armazenar refresh token no Redis (rotation strategy)
      await storeRefreshToken(user.id, tokens.refreshToken, 7 * 24 * 60 * 60);

      res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }
);

/**
 * POST /auth/refresh
 * Renovar access token usando refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token não fornecido' });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      res.status(401).json({ error: 'Refresh token inválido ou expirado' });
      return;
    }

    // Verificar se refresh token está no Redis
    const storedToken = await getRefreshToken(payload.userId);

    if (storedToken !== refreshToken) {
      res.status(401).json({ error: 'Refresh token não autorizado' });
      return;
    }

    // Gerar novo par de tokens (rotation)
    const newTokens = generateTokenPair({
      userId: payload.userId,
      email: payload.email,
    });

    // Atualizar refresh token no Redis
    await storeRefreshToken(payload.userId, newTokens.refreshToken, 7 * 24 * 60 * 60);

    res.json({
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    });
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    res.status(500).json({ error: 'Erro ao renovar token' });
  }
});

/**
 * POST /auth/logout
 * Fazer logout (invalidar tokens)
 */
router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const token = getToken(req);

    // Adicionar access token à blacklist
    await blacklistToken(token, 15 * 60);

    // Remover refresh token do Redis
    await deleteRefreshToken(userId);

    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro ao fazer logout' });
  }
});

export default router;
```

#### Passo 9: Configurar Helmet.js e CORS

Edite `src/server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import accountRoutes from './routes/accounts';
import categoryRoutes from './routes/categories';
import transactionRoutes from './routes/transactions';
import dashboardRoutes from './routes/dashboard';
import { globalLimiter } from './middleware/rateLimiter';
import { connectRedis } from './services/redis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar ao Redis
connectRedis().catch((err) => {
  console.error('Falha ao conectar ao Redis:', err);
  process.exit(1);
});

// Security: Helmet headers
app.use(helmet());

// Security: CORS com whitelist
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',');

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
  })
);

// Parsers
app.use(express.json({ limit: '10kb' })); // Limitar tamanho do body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Security: Global rate limiter
app.use(globalLimiter);

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);

  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({ error: 'CORS policy violation' });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV}`);
});
```

#### Passo 10: Atualizar Env

Edite `.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/fintrack"

# JWT
JWT_SECRET="sua-chave-secreta-muito-longa-e-segura-com-caracteres-especiais-123456!@#$%"
JWT_EXPIRE="15m"
REFRESH_SECRET="sua-chave-refresh-diferente-com-mais-caracteres-securos-789012!@#$%^&*"
REFRESH_EXPIRE="7d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_DB=0

# Server
PORT=3000
NODE_ENV="development"

# CORS
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
```

---

### FRONTEND

#### Passo 11: Atualizar API Client com Refresh Token

Edite `src/services/api.ts`:

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

    // Interceptor: Adicionar access token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor: Handle token expirado
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await this.client.post('/auth/refresh', {
              refreshToken,
            });

            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);

            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Logout user
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ... rest of methods
}
```

#### Passo 12: Atualizar Auth Context

Edite `src/context/AuthContext.tsx`:

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
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      localStorage.setItem('refreshToken', response.refreshToken);
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
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error: any) {
      throw error.response?.data?.error || 'Erro ao registrar';
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
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

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
```

---

## ✅ TESTES

### Testes de Segurança

**1. Testar Rate Limit:**

```bash
# Tentar 6 logins em sequência (limite é 5)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# Resposta esperada na 6ª: "Muitas tentativas"
```

**2. Testar Token Expiration:**

```bash
# Obter token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}' | jq -r '.accessToken')

# Esperar token expirar (ou modificar JWT_EXPIRE para 1s em dev)
sleep 20

# Tentar usar token expirado
curl -X GET http://localhost:3000/api/accounts \
  -H "Authorization: Bearer $TOKEN"
# Resposta esperada: 401
```

**3. Testar Refresh Token:**

```bash
# Fazer login e obter tokens
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}')

ACCESS=$(echo $RESPONSE | jq -r '.accessToken')
REFRESH=$(echo $RESPONSE | jq -r '.refreshToken')

# Tentar renovar token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH\"}"
```

**4. Testar CORS:**

```bash
# Request from blocked origin
curl -X GET http://localhost:3000/api/accounts \
  -H "Origin: http://malicious.com" \
  -H "Authorization: Bearer token"
# Resposta esperada: CORS error
```

**5. Testar Input Validation:**

```bash
# Senha fraca (sem maiúsculas)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@test.com",
    "password":"password123",
    "name":"Test"
  }'
# Resposta esperada: Validação falha
```

**6. Testar Logout:**

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}' | jq -r '.accessToken')

# Fazer logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# Tentar usar token após logout
curl -X GET http://localhost:3000/api/accounts \
  -H "Authorization: Bearer $TOKEN"
# Resposta esperada: 401
```

---

## 🐛 TROUBLESHOOTING

**Redis não conecta**
- Verifique se Redis está rodando: `redis-cli ping`
- Verifique REDIS_HOST e REDIS_PORT em .env

**CORS error**
- Adicione origem a ALLOWED_ORIGINS em .env
- Reinicie servidor

**Rate limit muito restritivo**
- Ajuste windowMs e max em rateLimiter.ts

**Tokens expirando muito rápido**
- Aumente JWT_EXPIRE em .env (default 15m é correto)

---

## 📚 CONCEITOS RELACIONADOS

1. **Token Rotation**: Trocar refresh token a cada renovação
2. **Token Blacklist**: Invalidar tokens no logout
3. **Rate Limiting**: Proteger contra brute force
4. **Security Headers**: Helmet.js para proteção HTTP
5. **CORS Whitelist**: Apenas origens autorizadas
6. **Password Requirements**: Força mínima de senha

---

## ☑️ CHECKLIST

- [x] Redis configurado
- [x] Refresh tokens implementados
- [x] Token rotation strategy
- [x] Token blacklist em Redis
- [x] Rate limiting global
- [x] Rate limiting por endpoint
- [x] Input validation com express-validator
- [x] Helmet.js configurado
- [x] CORS com whitelist
- [x] Logout invalidando tokens
- [x] Testes de segurança
- [x] Password requirements robustos
