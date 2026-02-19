# 📘 MÓDULO 2: HTTP e Web

## 🎯 OBJETIVO

Dominar o protocolo HTTP, entender CORS, cookies, armazenamento web e comunicação client-server para desenvolvimento web profissional.

**Tempo estimado**: 6-8 horas de estudo
**Pré-requisitos**: Conhecimento básico de web

---

## 📑 ÍNDICE

1. [Protocolo HTTP](#1-protocolo-http)
2. [Métodos HTTP](#2-métodos-http)
3. [Status Codes](#3-status-codes)
4. [Headers](#4-headers)
5. [CORS (Cross-Origin Resource Sharing)](#5-cors)
6. [Cookies vs LocalStorage vs SessionStorage](#6-cookies-vs-localstorage-vs-sessionstorage)
7. [Content Negotiation](#7-content-negotiation)
8. [HTTP/2 vs HTTP/1.1](#8-http2-vs-http11)

---

## 1. PROTOCOLO HTTP

### O QUE É HTTP?

HTTP (HyperText Transfer Protocol) é o protocolo de comunicação usado na web para transferir dados entre cliente (navegador) e servidor.

**Modelo Request-Response:**
```
┌─────────────┐                    ┌─────────────┐
│   Cliente   │ ─────Request─────► │   Servidor  │
│  (Browser)  │                    │   (API)     │
│             │ ◄────Response───── │             │
└─────────────┘                    └─────────────┘
```

### ANATOMIA DE UMA REQUISIÇÃO HTTP

```http
POST /api/transactions HTTP/1.1                    ← Request Line
Host: api.fintrack.com                             ← Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
Content-Type: application/json
Content-Length: 89

{                                                   ← Body
  "amount": 100,
  "type": "INCOME",
  "description": "Freelance work"
}
```

**Componentes:**
1. **Request Line**: Método + Path + Versão HTTP
2. **Headers**: Metadados (autenticação, tipo de conteúdo, etc)
3. **Body**: Dados enviados (opcional)

### ANATOMIA DE UMA RESPOSTA HTTP

```http
HTTP/1.1 201 Created                               ← Status Line
Content-Type: application/json                     ← Headers
Set-Cookie: session=abc123; HttpOnly; Secure
Access-Control-Allow-Origin: https://app.fintrack.com

{                                                   ← Body
  "id": 42,
  "amount": 100,
  "type": "INCOME",
  "description": "Freelance work",
  "createdAt": "2026-02-19T10:30:00Z"
}
```

---

## 2. MÉTODOS HTTP

### MÉTODOS PRINCIPAIS

| Método | Descrição | Idempotente? | Safe? | Tem Body? |
|--------|-----------|--------------|-------|-----------|
| **GET** | Buscar recurso | ✅ Sim | ✅ Sim | ❌ Não |
| **POST** | Criar recurso | ❌ Não | ❌ Não | ✅ Sim |
| **PUT** | Substituir recurso | ✅ Sim | ❌ Não | ✅ Sim |
| **PATCH** | Atualizar parcialmente | ❌ Não | ❌ Não | ✅ Sim |
| **DELETE** | Remover recurso | ✅ Sim | ❌ Não | ❌ Não |
| **OPTIONS** | Ver métodos permitidos | ✅ Sim | ✅ Sim | ❌ Não |

**Idempotente**: Executar N vezes tem o mesmo efeito que executar 1 vez
**Safe**: Não modifica o estado do servidor

### GET - BUSCAR

```http
GET /api/transactions?page=1&limit=50 HTTP/1.1
Host: api.fintrack.com
Authorization: Bearer <token>

← Resposta: 200 OK
[
  { "id": 1, "amount": 100, "description": "..." },
  { "id": 2, "amount": 200, "description": "..." }
]
```

**Características:**
- Não tem body
- Parâmetros via query string (`?key=value&key2=value2`)
- Cacheable (pode ser cacheado)
- Idempotente e safe

### POST - CRIAR

```http
POST /api/transactions HTTP/1.1
Host: api.fintrack.com
Content-Type: application/json

{
  "amount": 100,
  "type": "INCOME",
  "description": "Salary"
}

← Resposta: 201 Created
{
  "id": 42,
  "amount": 100,
  "type": "INCOME",
  "description": "Salary",
  "createdAt": "2026-02-19T10:00:00Z"
}
```

**Características:**
- Tem body (dados do recurso a criar)
- Não idempotente (cada chamada cria novo recurso)
- Retorna `201 Created` + header `Location: /api/transactions/42`

### PUT - SUBSTITUIR

```http
PUT /api/transactions/42 HTTP/1.1
Content-Type: application/json

{
  "amount": 150,
  "type": "INCOME",
  "description": "Salary (updated)"
}

← Resposta: 200 OK ou 204 No Content
```

**PUT vs PATCH:**
- **PUT**: Substitui o recurso INTEIRO (precisa enviar todos campos)
- **PATCH**: Atualiza PARCIALMENTE (apenas campos modificados)

### PATCH - ATUALIZAR PARCIALMENTE

```http
PATCH /api/transactions/42 HTTP/1.1
Content-Type: application/json

{
  "amount": 150
}

← Resposta: 200 OK
```

**Vantagem:** Enviar apenas campos alterados (economiza banda).

### DELETE - REMOVER

```http
DELETE /api/transactions/42 HTTP/1.1

← Resposta: 204 No Content ou 200 OK
```

### APLICAÇÃO NO FINTRACK

```typescript
// src/routes/transactions.ts

import { Router } from 'express';

const router = Router();

// GET /api/transactions - Listar transações
router.get('/transactions', async (req, res) => {
  const { page = 1, limit = 50, type } = req.query;

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: req.userId,
      ...(type && { type: type as string })
    },
    take: Number(limit),
    skip: (Number(page) - 1) * Number(limit),
    orderBy: { date: 'desc' }
  });

  res.json(transactions);
});

// GET /api/transactions/:id - Buscar por ID
router.get('/transactions/:id', async (req, res) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: Number(req.params.id), userId: req.userId }
  });

  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  res.json(transaction);
});

// POST /api/transactions - Criar
router.post('/transactions', async (req, res) => {
  const data = req.body;

  const transaction = await prisma.transaction.create({
    data: {
      ...data,
      userId: req.userId
    }
  });

  // ✅ 201 Created + Location header
  res.status(201)
    .location(`/api/transactions/${transaction.id}`)
    .json(transaction);
});

// PATCH /api/transactions/:id - Atualizar parcialmente
router.patch('/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const transaction = await prisma.transaction.update({
    where: { id: Number(id), userId: req.userId },
    data
  });

  res.json(transaction);
});

// DELETE /api/transactions/:id - Remover
router.delete('/transactions/:id', async (req, res) => {
  await prisma.transaction.delete({
    where: { id: Number(req.params.id), userId: req.userId }
  });

  res.status(204).send(); // No Content
});
```

---

## 3. STATUS CODES

### CATEGORIAS

```
┌────────────────────────────────────────┐
│  1xx Informational (raramente usado)   │
│  100 Continue                          │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  2xx Success                           │
│  200 OK - Sucesso geral                │
│  201 Created - Recurso criado          │
│  204 No Content - Sucesso sem body     │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  3xx Redirection                       │
│  301 Moved Permanently                 │
│  302 Found (redirect temporário)       │
│  304 Not Modified (cache válido)       │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  4xx Client Error (erro do cliente)    │
│  400 Bad Request - Dados inválidos     │
│  401 Unauthorized - Não autenticado    │
│  403 Forbidden - Sem permissão         │
│  404 Not Found - Recurso não existe    │
│  409 Conflict - Conflito (duplicate)   │
│  422 Unprocessable Entity - Validação  │
│  429 Too Many Requests - Rate limit    │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  5xx Server Error (erro do servidor)   │
│  500 Internal Server Error             │
│  502 Bad Gateway - Erro no proxy       │
│  503 Service Unavailable - Fora do ar  │
└────────────────────────────────────────┘
```

### STATUS CODES COMUNS NO FINTRACK

```typescript
// src/middlewares/errorHandler.ts

function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  // 400 - Bad Request (dados inválidos)
  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details
    });
  }

  // 401 - Unauthorized (não autenticado)
  if (error instanceof JsonWebTokenError) {
    return res.status(401).json({
      error: 'Invalid or missing token'
    });
  }

  // 403 - Forbidden (sem permissão)
  if (error instanceof ForbiddenError) {
    return res.status(403).json({
      error: 'You don\'t have permission to access this resource'
    });
  }

  // 404 - Not Found
  if (error instanceof NotFoundError) {
    return res.status(404).json({
      error: 'Resource not found'
    });
  }

  // 409 - Conflict (duplicate key)
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return res.status(409).json({
      error: 'Duplicate entry',
      field: error.meta?.target
    });
  }

  // 422 - Unprocessable Entity (validação de negócio)
  if (error instanceof BusinessValidationError) {
    return res.status(422).json({
      error: error.message
    });
  }

  // 429 - Too Many Requests
  if (error instanceof RateLimitError) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: error.retryAfter
    });
  }

  // 500 - Internal Server Error (padrão)
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error'
  });
}
```

---

## 4. HEADERS

### HEADERS COMUNS

#### REQUEST HEADERS

```http
GET /api/transactions HTTP/1.1
Host: api.fintrack.com                    # Domínio do servidor (obrigatório)
User-Agent: Mozilla/5.0...                # Informações do cliente
Authorization: Bearer eyJhbGci...         # Token de autenticação
Content-Type: application/json           # Tipo do body (POST/PUT/PATCH)
Accept: application/json                 # Tipo de resposta desejada
Accept-Language: pt-BR,en;q=0.9          # Idiomas aceitos
Cookie: session=abc123                   # Cookies enviados
```

#### RESPONSE HEADERS

```http
HTTP/1.1 200 OK
Content-Type: application/json           # Tipo do body
Content-Length: 1234                     # Tamanho do body (bytes)
Set-Cookie: session=abc123; HttpOnly     # Define cookie
Cache-Control: public, max-age=3600      # Controle de cache
Access-Control-Allow-Origin: *           # CORS
Location: /api/transactions/42           # Localização do recurso criado (201)
```

### HEADERS DE SEGURANÇA (Helmet.js)

```typescript
// src/app.ts

import helmet from 'helmet';

app.use(helmet()); // Adiciona headers de segurança automaticamente

// Headers adicionados:
// X-Content-Type-Options: nosniff
// X-Frame-Options: DENY
// X-XSS-Protection: 1; mode=block
// Strict-Transport-Security: max-age=31536000; includeSubDomains
// Content-Security-Policy: default-src 'self'
```

### CONTENT-TYPE

```typescript
// JSON (mais comum)
res.setHeader('Content-Type', 'application/json');
res.json({ data: 'value' });

// HTML
res.setHeader('Content-Type', 'text/html');
res.send('<h1>Hello</h1>');

// Plain text
res.setHeader('Content-Type', 'text/plain');
res.send('Hello World');

// File download
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
res.send(pdfBuffer);
```

---

## 5. CORS

### O QUE É CORS?

CORS (Cross-Origin Resource Sharing) é um mecanismo de segurança que permite servidores controlarem quais origens podem acessar seus recursos.

**Problema:**
```
Frontend: http://localhost:5173
Backend:  http://localhost:3000

❌ SEM CORS: Navegador bloqueia requisição
✅ COM CORS: Servidor autoriza requisição
```

### COMO FUNCIONA

```
┌──────────────┐                   ┌──────────────┐
│   Frontend   │                   │   Backend    │
│ localhost:   │                   │ localhost:   │
│    5173      │                   │    3000      │
└──────┬───────┘                   └──────┬───────┘
       │                                  │
       │  1. OPTIONS /api/transactions    │
       │  Origin: http://localhost:5173   │
       ├─────────────────────────────────►│
       │                                  │
       │  2. Response com CORS headers    │
       │  Access-Control-Allow-Origin:... │
       │◄─────────────────────────────────┤
       │                                  │
       │  3. POST /api/transactions       │
       │  (requisição real)               │
       ├─────────────────────────────────►│
       │                                  │
       │  4. Response com dados           │
       │◄─────────────────────────────────┤
```

### PREFLIGHT REQUEST

Navegadores enviam requisição OPTIONS antes de POST/PUT/PATCH/DELETE com headers customizados:

```http
OPTIONS /api/transactions HTTP/1.1
Origin: http://localhost:5173
Access-Control-Request-Method: POST
Access-Control-Request-Headers: authorization, content-type
```

Servidor deve responder:

```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: authorization, content-type
Access-Control-Max-Age: 86400  # Cache preflight por 24h
```

### CONFIGURAÇÃO NO FINTRACK

```typescript
// src/config/cors.ts

import cors from 'cors';

// ❌ INSEGURO: Permitir todas origens (NÃO usar em produção)
app.use(cors());

// ✅ SEGURO: Whitelist de origens permitidas
const allowedOrigins = [
  'http://localhost:5173',              // Dev
  'https://app.fintrack.com',           // Produção
  'https://staging.fintrack.com'        // Staging
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },

  credentials: true, // Permitir cookies

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],

  allowedHeaders: ['Content-Type', 'Authorization'],

  maxAge: 86400 // Cache preflight por 24h
}));
```

```typescript
// ✅ CORS com regex para múltiplos subdomínios
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    // Permitir *.fintrack.com
    if (/^https:\/\/.*\.fintrack\.com$/.test(origin)) {
      return callback(null, true);
    }

    // Dev
    if (origin === 'http://localhost:5173') {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
```

---

## 6. COOKIES VS LOCALSTORAGE VS SESSIONSTORAGE

### COMPARAÇÃO

| Característica | Cookies | LocalStorage | SessionStorage |
|---------------|---------|--------------|----------------|
| **Capacidade** | 4 KB | 5-10 MB | 5-10 MB |
| **Expira** | Configurável | Nunca | Ao fechar aba |
| **Enviado ao servidor** | ✅ Sim (automaticamente) | ❌ Não | ❌ Não |
| **Acessível via JS** | ✅ Sim (se não HttpOnly) | ✅ Sim | ✅ Sim |
| **Escopo** | Domain + Path | Origin | Origin + Tab |
| **Segurança** | ✅ HttpOnly, Secure, SameSite | ❌ Vulnerável a XSS | ❌ Vulnerável a XSS |

### COOKIES

```typescript
// Backend: Definir cookie
res.cookie('session', 'abc123', {
  httpOnly: true,   // ✅ Não acessível via JavaScript (proteção XSS)
  secure: true,     // ✅ Apenas HTTPS
  sameSite: 'strict', // ✅ Proteção CSRF
  maxAge: 24 * 60 * 60 * 1000 // 24 horas
});

// Frontend: Ler cookie (se não HttpOnly)
document.cookie; // "session=abc123; other=value"

// ✅ USAR COOKIES PARA:
// - Session tokens
// - Refresh tokens
// - Configurações que servidor precisa saber
```

### LOCALSTORAGE

```typescript
// Salvar
localStorage.setItem('theme', 'dark');
localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Alice' }));

// Ler
const theme = localStorage.getItem('theme'); // 'dark'
const user = JSON.parse(localStorage.getItem('user')!);

// Remover
localStorage.removeItem('theme');
localStorage.clear(); // Remove tudo

// ✅ USAR LOCALSTORAGE PARA:
// - Preferências do usuário (tema, idioma)
// - Cache de dados não sensíveis
// - Estado da aplicação

// ❌ NÃO USAR PARA:
// - Tokens de autenticação (vulnerável a XSS)
// - Dados sensíveis
```

### SESSIONSTORAGE

```typescript
// API idêntica ao localStorage
sessionStorage.setItem('formData', JSON.stringify(form));
const formData = JSON.parse(sessionStorage.getItem('formData')!);

// ✅ USAR SESSIONSTORAGE PARA:
// - Dados temporários (wizard multi-step)
// - Estado de formulário
// - Dados que devem sumir ao fechar aba
```

### APLICAÇÃO NO FINTRACK

```typescript
// src/middlewares/auth.ts (Backend)

// ✅ Autenticação com HTTP-only cookie
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Validar credenciais
  const user = await validateCredentials(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Gerar tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // ✅ Refresh token em HTTP-only cookie (mais seguro)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,  // Não acessível via JS
    secure: process.env.NODE_ENV === 'production', // HTTPS em prod
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
  });

  // Access token no body (será guardado em memória no frontend)
  res.json({
    accessToken,
    user: { id: user.id, name: user.name, email: user.email }
  });
});
```

```typescript
// src/contexts/AuthContext.tsx (Frontend)

// ✅ Access token em memória (mais seguro que localStorage)
function AuthProvider({ children }) {
  // Estado em memória (desaparece ao recarregar)
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Carregar usuário ao iniciar (usando refresh token do cookie)
  useEffect(() => {
    refreshAccessToken(); // Faz requisição, cookie enviado automaticamente
  }, []);

  async function login(email: string, password: string) {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      credentials: 'include', // ✅ Enviar cookies
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const { accessToken, user } = await response.json();

    setAccessToken(accessToken); // Guardar em memória
    setUser(user);

    // ❌ NÃO FAZER: localStorage.setItem('token', accessToken)
    // Vulnerável a XSS!
  }

  async function refreshAccessToken() {
    try {
      const response = await fetch('http://localhost:3000/auth/refresh', {
        method: 'POST',
        credentials: 'include' // Envia refresh token (cookie)
      });

      const { accessToken, user } = await response.json();
      setAccessToken(accessToken);
      setUser(user);
    } catch (error) {
      // Refresh token inválido - fazer logout
      logout();
    }
  }

  // Armazenar preferências não sensíveis no localStorage
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );

  function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme); // ✅ OK para preferências
  }

  return (
    <AuthContext.Provider value={{
      accessToken, user, login, logout, refreshAccessToken, theme, toggleTheme
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## 7. CONTENT NEGOTIATION

### ACCEPT HEADER

Cliente indica formatos de resposta aceitos:

```http
GET /api/transactions/1 HTTP/1.1
Accept: application/json            # Prefere JSON

# Servidor responde:
HTTP/1.1 200 OK
Content-Type: application/json
{ "id": 1, "amount": 100 }
```

```http
GET /api/transactions/1 HTTP/1.1
Accept: text/html               # Prefere HTML

# Servidor responde:
HTTP/1.1 200 OK
Content-Type: text/html
<div>Transaction #1: $100</div>
```

### IMPLEMENTAÇÃO

```typescript
// src/middlewares/contentNegotiation.ts

function contentNegotiation(req: Request, res: Response, next: NextFunction) {
  const acceptHeader = req.get('Accept') || 'application/json';

  // Verificar formato suportado
  if (!acceptHeader.includes('application/json') &&
      !acceptHeader.includes('*/*')) {
    return res.status(406).json({
      error: 'Not Acceptable',
      message: 'Only application/json is supported'
    });
  }

  next();
}

app.use(contentNegotiation);
```

---

## 8. HTTP/2 VS HTTP/1.1

### DIFERENÇAS PRINCIPAIS

| Característica | HTTP/1.1 | HTTP/2 |
|---------------|----------|--------|
| **Formato** | Texto | Binário |
| **Conexões** | 1 request por conexão | Multiplexing (muitos requests em 1 conexão) |
| **Headers** | Repetidos | Comprimidos (HPACK) |
| **Server Push** | ❌ Não | ✅ Sim |
| **Priorização** | ❌ Não | ✅ Sim |

### HTTP/1.1 - PROBLEMAS

```
Cliente                        Servidor
  │                               │
  ├─ GET /style.css ────────────►│
  │◄────────────────────────────┤
  │                               │
  ├─ GET /script.js ────────────►│  ⏱️ Sequencial (lento!)
  │◄────────────────────────────┤
  │                               │
  ├─ GET /image.png ────────────►│
  │◄────────────────────────────┤
```

### HTTP/2 - MULTIPLEXING

```
Cliente                        Servidor
  │                               │
  ├─ GET /style.css  ─┐           │
  ├─ GET /script.js  ─┼──────────►│
  ├─ GET /image.png  ─┘           │
  │                               │
  │ ⚡ Todos simultâneos!          │
  │◄────────────────────────────┤
```

### HABILITAR HTTP/2 NO NODE.JS

```typescript
// src/server.ts

import http2 from 'http2';
import fs from 'fs';

const server = http2.createSecureServer({
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('cert.pem')
}, app);

server.listen(3000, () => {
  console.log('HTTP/2 server running on port 3000');
});
```

**Nota**: HTTP/2 requer HTTPS.

---

## 🎯 CHECKLIST DE DOMÍNIO

- [ ] Protocolo HTTP
  - [ ] Entendo anatomia de request/response
  - [ ] Conheço diferença entre headers e body
  - [ ] Sei quando usar cada componente

- [ ] Métodos HTTP
  - [ ] Uso GET para buscar
  - [ ] Uso POST para criar
  - [ ] Entendo diferença PUT vs PATCH
  - [ ] Uso DELETE corretamente
  - [ ] Sei o que é idempotência

- [ ] Status Codes
  - [ ] Conheço códigos 2xx, 4xx, 5xx
  - [ ] Uso 400 para validação
  - [ ] Uso 401 para autenticação
  - [ ] Uso 404 para não encontrado
  - [ ] Uso 500 para erro de servidor

- [ ] Headers
  - [ ] Entendo Content-Type
  - [ ] Uso Authorization
  - [ ] Conheço headers de segurança (Helmet)
  - [ ] Entendo Cache-Control

- [ ] CORS
  - [ ] Entendo o que é e por que existe
  - [ ] Configuro whitelist de origens
  - [ ] Entendo preflight request
  - [ ] Uso credentials: true quando necessário

- [ ] Storage
  - [ ] Entendo diferença entre Cookies, LocalStorage, SessionStorage
  - [ ] Uso HTTP-only cookies para tokens
  - [ ] Uso localStorage apenas para dados não sensíveis
  - [ ] Não guardo tokens em localStorage

---

## 📚 PRÓXIMOS PASSOS

👉 **[Módulo 3: Node.js e Backend](./modulo-03-nodejs-backend.md)**

---

**Última atualização**: Fevereiro 2026
**Status**: ✅ Completo
