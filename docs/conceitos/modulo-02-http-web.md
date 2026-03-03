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
9. [HTTPS, SSL/TLS e Certificados](#9-https-ssltls-e-certificados)
10. [DNS e Domínios](#10-dns-e-domínios)

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

## 9. HTTPS, SSL/TLS E CERTIFICADOS

### O QUE É HTTPS?

HTTPS = HTTP + SSL/TLS (Secure Sockets Layer / Transport Layer Security)

```
┌──────────────────────────────────────────────┐
│  HTTP  (Inseguro)                            │
├──────────────────────────────────────────────┤
│  Cliente ────► Dados em texto ────► Servidor │
│           ❌ Qualquer um pode ler            │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  HTTPS (Seguro)                              │
├──────────────────────────────────────────────┤
│  Cliente ────► Dados criptografados ────► Servidor │
│           ✅ Apenas cliente e servidor leem │
└──────────────────────────────────────────────┘
```

**Por que usar HTTPS?**
- ✅ **Criptografia**: Dados não podem ser lidos por terceiros
- ✅ **Autenticação**: Garante que está falando com o servidor correto
- ✅ **Integridade**: Dados não foram modificados no caminho
- ✅ **SEO**: Google prioriza sites HTTPS
- ✅ **Confiança**: Navegadores mostram cadeado 🔒

### COMO FUNCIONA SSL/TLS

#### Handshake SSL/TLS

```
Cliente                                    Servidor
  │                                           │
  ├─1. ClientHello ─────────────────────────►│
  │   (versões SSL, ciphers suportados)      │
  │                                           │
  │◄─2. ServerHello ─────────────────────────┤
  │   (versão escolhida, cipher escolhido)   │
  │                                           │
  │◄─3. Certificado ─────────────────────────┤
  │   (certificado digital do servidor)      │
  │                                           │
  ├─4. Verificação ─────────────────────────►│
  │   (valida certificado com CA)            │
  │                                           │
  ├─5. Troca de chaves (Diffie-Hellman) ────►│
  │   (gera chave simétrica compartilhada)   │
  │                                           │
  ├─6. Dados criptografados ◄──────────────►│
  │   (usando chave simétrica)               │
```

**Etapas:**
1. **ClientHello**: Cliente diz versões e ciphers que suporta
2. **ServerHello**: Servidor escolhe versão e cipher
3. **Certificado**: Servidor envia certificado digital (prova identidade)
4. **Verificação**: Cliente valida certificado com Certificate Authority (CA)
5. **Key Exchange**: Cliente e servidor geram chave simétrica compartilhada
6. **Comunicação**: Dados trafegam criptografados com chave simétrica (mais rápido que assimétrica)

### CERTIFICADOS DIGITAIS

#### O que é um Certificado?

Um certificado digital é um documento que:
- Prova a identidade do servidor
- Contém chave pública do servidor
- É assinado por uma Certificate Authority (CA) confiável

**Estrutura de um certificado X.509:**

```
Certificado Digital
├── Informações do Domínio
│   ├── CN (Common Name): fintrack.com
│   ├── Organização: FinTrack Inc
│   └── País: BR
├── Chave Pública (RSA 2048-bit)
├── Validade
│   ├── Válido desde: 2024-01-01
│   └── Expira em: 2025-01-01
├── Assinatura da CA
│   ├── Emissor: Let's Encrypt
│   └── Assinatura Digital
└── Extensions
    ├── Subject Alternative Names (SANs)
    │   ├── fintrack.com
    │   ├── www.fintrack.com
    │   └── api.fintrack.com
    └── Key Usage
```

#### Tipos de Certificados

**1. Domain Validation (DV)** - Mais comum e barato
```
Valida: Controle do domínio
Tempo: Minutos
Custo: Gratuito (Let's Encrypt) ou $10-50/ano
Uso: Sites pessoais, blogs, pequenas aplicações
Exemplo: Let's Encrypt
```

**2. Organization Validation (OV)**
```
Valida: Controle do domínio + identidade da organização
Tempo: 1-3 dias
Custo: $50-200/ano
Uso: Sites corporativos
```

**3. Extended Validation (EV)** - Mais seguro
```
Valida: Verificação legal completa da empresa
Tempo: 7-15 dias
Custo: $200-1000/ano
Uso: Bancos, e-commerce de grande porte
Visual: Mostra nome da empresa na barra do navegador
```

**4. Wildcard Certificate**
```
Cobre: *.seudominio.com (todos subdomínios)
Exemplo: app.fintrack.com, api.fintrack.com, admin.fintrack.com
Custo: $100-300/ano (gratuito com Let's Encrypt)
```

### CERTIFICATE AUTHORITIES (CAs)

#### O que é uma CA?

Certificate Authority é uma entidade confiável que:
- Verifica a identidade do solicitante
- Emite certificados digitais
- Assina certificados com sua chave privada
- Mantém lista de certificados revogados (CRL)

**CAs Populares:**
- **Let's Encrypt** ⭐ - Gratuito, automatizado, renovação a cada 90 dias
- **DigiCert** - Pago, suporte enterprise
- **Cloudflare** - Gratuito com proxy
- **GlobalSign** - Pago
- **Comodo/Sectigo** - Pago

**Cadeia de Confiança:**

```
┌─────────────────────────────────┐
│  Root CA (Root Certificate)     │  ← Confiado pelo navegador
│  Ex: Let's Encrypt Root         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Intermediate CA                │  ← Assina certificados
│  Ex: Let's Encrypt Authority X3 │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  End-Entity Certificate         │  ← Seu certificado
│  Ex: fintrack.com               │
└─────────────────────────────────┘
```

### LET'S ENCRYPT - CERTIFICADOS GRATUITOS

#### Características

- ✅ **Gratuito**: Sem custo
- ✅ **Automatizado**: ACME protocol (renovação automática)
- ✅ **Válido por 90 dias**: Renovação frequente (segurança)
- ✅ **Suporta Wildcard**: `*.fintrack.com`
- ✅ **Confiado**: Presente em todos navegadores

#### Obter Certificado com Certbot

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obter certificado para Nginx (automático)
sudo certbot --nginx -d fintrack.com -d www.fintrack.com -d api.fintrack.com

# Responder perguntas:
# Email: seu@email.com
# Aceitar termos: (Y)es
# Compartilhar email com EFF: (N)o ou (Y)es
# Redirecionar HTTP → HTTPS: 2 (Redirect)

# ✅ Certificado instalado em:
# /etc/letsencrypt/live/fintrack.com/fullchain.pem
# /etc/letsencrypt/live/fintrack.com/privkey.pem
# /etc/letsencrypt/live/fintrack.com/chain.pem
# /etc/letsencrypt/live/fintrack.com/cert.pem
```

#### Renovação Automática

```bash
# Testar renovação (dry run)
sudo certbot renew --dry-run

# Renovação automática via systemd timer (já configurado)
sudo systemctl status certbot.timer

# Ver próxima renovação
sudo certbot certificates

# Output:
# Certificate Name: fintrack.com
#   Domains: fintrack.com www.fintrack.com api.fintrack.com
#   Expiry Date: 2024-04-01 10:30:00+00:00 (VALID: 89 days)
#   Certificate Path: /etc/letsencrypt/live/fintrack.com/fullchain.pem
#   Private Key Path: /etc/letsencrypt/live/fintrack.com/privkey.pem
```

#### Wildcard Certificate

```bash
# Requer validação DNS (não pode usar --nginx)
sudo certbot certonly --manual --preferred-challenges=dns -d fintrack.com -d *.fintrack.com

# Certbot pedirá para criar registro TXT no DNS:
# _acme-challenge.fintrack.com TXT "abc123xyz..."

# Adicionar no DNS provider (Cloudflare, Route53, etc)
# Aguardar propagação (~5 min)
# Pressionar Enter no Certbot

# ✅ Certificado wildcard obtido!
```

### CONFIGURAÇÃO HTTPS NO NGINX

```nginx
# /etc/nginx/sites-available/fintrack

# Redirecionar HTTP → HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name fintrack.com www.fintrack.com api.fintrack.com;

    # Redirecionar tudo para HTTPS
    return 301 https://$host$request_uri;
}

# Servidor HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name fintrack.com www.fintrack.com;

    # ============================================
    # SSL Certificates
    # ============================================
    ssl_certificate /etc/letsencrypt/live/fintrack.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fintrack.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/fintrack.com/chain.pem;

    # ============================================
    # SSL Configuration (Mozilla Modern)
    # ============================================
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    # Session Cache (performance)
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    # OCSP Stapling (performance + privacidade)
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # ============================================
    # Security Headers
    # ============================================
    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Outros headers de segurança
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # CSP (Content Security Policy)
    add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;" always;

    # ============================================
    # Application
    # ============================================
    root /var/www/fintrack/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### TLS VERSIONS

```
┌────────────────────────────────────────┐
│  SSL 2.0 (1995) ❌ Obsoleto, inseguro  │
│  SSL 3.0 (1996) ❌ Obsoleto, inseguro  │
│  TLS 1.0 (1999) ❌ Obsoleto, vulnerável│
│  TLS 1.1 (2006) ❌ Deprecated 2020     │
│  TLS 1.2 (2008) ✅ Seguro, amplamente usado │
│  TLS 1.3 (2018) ✅ Mais seguro e rápido│
└────────────────────────────────────────┘
```

**TLS 1.3 Melhorias:**
- ✅ Handshake mais rápido (1-RTT, 0-RTT)
- ✅ Ciphers mais seguros (removeu fracos)
- ✅ Forward secrecy obrigatório
- ✅ Menos vulnerabilidades

### TESTAR SSL/TLS

#### SSL Labs (Qualys)

```
https://www.ssllabs.com/ssltest/

Testa:
- Versões TLS suportadas
- Ciphers suportados
- Vulnerabilidades conhecidas
- Configuração de certificado
- HSTS, OCSP stapling

Nota de A+ a F
```

#### Linha de Comando

```bash
# Verificar certificado
openssl s_client -connect fintrack.com:443 -showcerts

# Ver detalhes do certificado
openssl x509 -in /etc/letsencrypt/live/fintrack.com/cert.pem -text -noout

# Testar versões TLS
nmap --script ssl-enum-ciphers -p 443 fintrack.com

# Ver data de expiração
echo | openssl s_client -connect fintrack.com:443 2>/dev/null | openssl x509 -noout -dates

# Output:
# notBefore=Jan  1 00:00:00 2024 GMT
# notAfter=Apr  1 23:59:59 2024 GMT
```

#### Testssl.sh (ferramenta avançada)

```bash
# Instalar
git clone https://github.com/drwetter/testssl.sh.git
cd testssl.sh

# Testar
./testssl.sh fintrack.com

# Testa:
# - Vulnerabilidades (BEAST, CRIME, POODLE, Heartbleed, etc)
# - Perfect Forward Secrecy
# - Cipher strength
# - HSTS, HPKP
# - Certificate trust
```

### HTTPS NO NODE.JS (Sem Nginx)

```typescript
// src/server.ts

import https from 'https';
import fs from 'fs';
import express from 'express';

const app = express();

// Configuração de rotas
app.get('/', (req, res) => {
  res.send('Hello HTTPS!');
});

// Opções SSL
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/fintrack.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/fintrack.com/fullchain.pem')
};

// Criar servidor HTTPS
const server = https.createServer(options, app);

server.listen(443, () => {
  console.log('HTTPS server running on port 443');
});

// Redirecionar HTTP para HTTPS
import http from 'http';

http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(80);
```

### MIXED CONTENT (Conteúdo Misto)

```
Problema: Página HTTPS carrega recursos HTTP

https://fintrack.com/
├── ✅ https://api.fintrack.com/data
├── ❌ http://example.com/script.js  ← Bloqueado!
└── ❌ http://cdn.example.com/image.png  ← Bloqueado!

Solução:
- Carregar TODOS recursos via HTTPS
- Usar URLs relativas: /api/data
- Usar protocol-relative: //cdn.example.com/image.png
```

### PERFORMANCE HTTPS

**HTTPS é mais lento?** Minimamente, mas otimizável:

✅ **HTTP/2**: Compensa overhead SSL
✅ **Session Resumption**: Reutiliza handshake
✅ **OCSP Stapling**: Evita requisição extra
✅ **TLS 1.3**: Handshake mais rápido (0-RTT)
✅ **Keep-Alive**: Reutiliza conexão

---

## 10. DNS E DOMÍNIOS

### O QUE É DNS?

DNS (Domain Name System) é o "catálogo telefônico da internet" que traduz nomes de domínio em endereços IP.

```
Você digita: fintrack.com
            ↓
    ┌─────────────┐
    │ DNS Resolver │ (8.8.8.8)
    └─────────────┘
            ↓
    Responde: 142.250.185.46
            ↓
    Navegador conecta ao IP
```

### HIERARQUIA DNS

```
                      . (Root)
                     / | \
                    /  |  \
           .com   .org  .net  .br  (TLDs)
           /              \
          /                \
    fintrack             google
       |                   |
  ┌────┴────┐         ┌────┴────┐
  |    |    |         |    |    |
 www  api  cdn       www  mail drive
```

**Exemplo:** `api.fintrack.com`
- `.com` - Top-Level Domain (TLD)
- `fintrack` - Second-Level Domain (SLD)
- `api` - Subdomain

### TIPOS DE REGISTROS DNS

#### A Record (Address)
```
Mapeia domínio → IPv4

Exemplo:
fintrack.com         A    142.250.185.46
www.fintrack.com     A    142.250.185.46
```

#### AAAA Record (IPv6)
```
Mapeia domínio → IPv6

Exemplo:
fintrack.com         AAAA  2607:f8b0:4004:c07::64
```

#### CNAME (Canonical Name)
```
Alias de um domínio para outro

Exemplo:
www.fintrack.com     CNAME  fintrack.com
blog.fintrack.com    CNAME  fintrack.com
```

**Limitação:** CNAME não pode coexistir com outros registros no mesmo nome.

#### MX Record (Mail Exchange)
```
Servidores de email

Exemplo:
fintrack.com         MX     10 mail1.fintrack.com
fintrack.com         MX     20 mail2.fintrack.com
                           ↑ prioridade (menor = maior prioridade)
```

#### TXT Record
```
Texto arbitrário (verificação, SPF, DKIM)

Exemplos:
fintrack.com         TXT    "v=spf1 include:_spf.google.com ~all"
_dmarc.fintrack.com  TXT    "v=DMARC1; p=quarantine; rua=mailto:admin@fintrack.com"
_acme-challenge.fintrack.com  TXT  "abc123xyz"  ← Let's Encrypt
```

#### NS Record (Name Server)
```
Servidores DNS autoritativos

Exemplo:
fintrack.com         NS     ns1.cloudflare.com
fintrack.com         NS     ns2.cloudflare.com
```

#### SOA Record (Start of Authority)
```
Informações sobre zona DNS

Exemplo:
fintrack.com         SOA    ns1.cloudflare.com admin.fintrack.com (
                                2024010100  ; Serial
                                7200        ; Refresh
                                3600        ; Retry
                                1209600     ; Expire
                                86400       ; Minimum TTL
                            )
```

### TTL (Time to Live)

TTL define quanto tempo um registro DNS é cacheado.

```
┌─────────────────────────────────────┐
│  TTL Baixo (300s = 5 min)           │
│  ✅ Mudanças rápidas                │
│  ❌ Mais requisições DNS (caro)     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  TTL Alto (86400s = 24h)            │
│  ✅ Menos requisições (barato)      │
│  ❌ Mudanças demoram a propagar     │
└─────────────────────────────────────┘
```

**Recomendação:**
- **Normal**: 3600s (1 hora)
- **Antes de mudança**: 300s (5 min)
- **Após mudança estabilizar**: voltar 3600s

### PROPAGAÇÃO DNS

```
Tempo para mudanças DNS propagarem:
┌────────────────────────────────────┐
│  Mínimo:     5-10 minutos          │
│  Típico:     1-4 horas             │
│  Máximo:     24-48 horas (TTL alto)│
└────────────────────────────────────┘
```

**Verificar propagação:**
```bash
# Verificar DNS em múltiplos servidores
https://www.whatsmydns.net/

# Linha de comando
dig fintrack.com @8.8.8.8
nslookup fintrack.com
host fintrack.com
```

### CONFIGURAÇÃO DNS PARA FINTRACK

#### Cloudflare (Recomendado)

```
┌─────────────────────────────────────────────┐
│  Cloudflare DNS (Gratuito)                  │
├─────────────────────────────────────────────┤
│  ✅ DNS ultrarrápido (anycast)              │
│  ✅ DDoS protection                          │
│  ✅ CDN gratuito                             │
│  ✅ SSL gratuito                             │
│  ✅ Cache automático                         │
└─────────────────────────────────────────────┘

Registros:
Type    Name              Content              TTL    Proxy
A       fintrack.com      142.250.185.46       Auto   ✅ Proxied
A       www               142.250.185.46       Auto   ✅ Proxied
A       api               142.250.185.46       Auto   ❌ DNS Only
CNAME   blog              fintrack.com         Auto   ✅ Proxied
MX      @                 mail.fintrack.com    Auto   -
TXT     @                 "v=spf1 ..."         Auto   -
```

**Proxied vs DNS Only:**
- **Proxied (☁️)**: Tráfego passa pelo Cloudflare (CDN, DDoS protection, cache)
- **DNS Only**: Tráfego vai direto para seu servidor

#### Registradores Populares

**Domínios .com / .org / .net:**
- **Namecheap** - $8-12/ano
- **Google Domains** - $12/ano
- **Cloudflare Registrar** - Preço de custo (~$8/ano)
- **GoDaddy** - $12-20/ano (caro)

**Domínios .com.br:**
- **Registro.br** - R$40/ano (oficial)

### DNS NO CÓDIGO (Node.js)

```typescript
// Resolver DNS programaticamente

import dns from 'dns/promises';

// Resolver A record
const addresses = await dns.resolve4('fintrack.com');
console.log(addresses); // ['142.250.185.46']

// Resolver AAAA record (IPv6)
const ipv6 = await dns.resolve6('fintrack.com');

// Resolver MX record
const mx = await dns.resolveMx('fintrack.com');
console.log(mx); // [{ exchange: 'mail.fintrack.com', priority: 10 }]

// Reverse DNS (IP → domínio)
const hostnames = await dns.reverse('142.250.185.46');
console.log(hostnames); // ['fintrack.com']

// Lookup (suporta A e AAAA)
const { address, family } = await dns.lookup('fintrack.com');
console.log(address);  // '142.250.185.46'
console.log(family);   // 4 (IPv4) ou 6 (IPv6)
```

### SUBDOMINIOS

```
Casos de uso comuns:

www.fintrack.com     → Frontend (opcional, pode usar apex)
app.fintrack.com     → Frontend (aplicação)
api.fintrack.com     → Backend API
admin.fintrack.com   → Admin panel
docs.fintrack.com    → Documentação
blog.fintrack.com    → Blog
cdn.fintrack.com     → CDN / Assets estáticos
status.fintrack.com  → Status page
staging.fintrack.com → Ambiente de staging
dev.fintrack.com     → Ambiente de desenvolvimento
```

**Wildcard DNS:**
```
*.fintrack.com       A    142.250.185.46

Cobre:
- qualquer.fintrack.com
- teste.fintrack.com
- xyz.fintrack.com

Não cobre:
- fintrack.com (apex)
- sub.dominio.fintrack.com (2 níveis)
```

### APEX DOMAIN (Root Domain)

```
Apex/Root/Naked Domain:
fintrack.com (sem www)

Problema: CNAME não funciona no apex
❌ fintrack.com     CNAME  something.cloudfront.net

Soluções:
✅ A record direto
✅ ALIAS record (Route53)
✅ ANAME record (alguns providers)
✅ CNAME Flattening (Cloudflare)
```

### TROUBLESHOOTING DNS

```bash
# Ver todos registros DNS
dig fintrack.com ANY

# Ver apenas A record
dig fintrack.com A

# Ver com trace (caminho completo)
dig +trace fintrack.com

# Ver servidores DNS autoritativos
dig fintrack.com NS

# Flush DNS cache (Windows)
ipconfig /flushdns

# Flush DNS cache (macOS)
sudo dscacheutil -flushcache

# Flush DNS cache (Linux)
sudo systemd-resolve --flush-caches

# Testar DNS específico
dig @8.8.8.8 fintrack.com      # Google DNS
dig @1.1.1.1 fintrack.com      # Cloudflare DNS
dig @208.67.222.222 fintrack.com  # OpenDNS
```

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

- [ ] HTTPS e SSL/TLS
  - [ ] Entendo diferença HTTP vs HTTPS
  - [ ] Sei como funciona handshake TLS
  - [ ] Conheço tipos de certificados (DV, OV, EV)
  - [ ] Sei usar Let's Encrypt
  - [ ] Configuro SSL no Nginx corretamente
  - [ ] Entendo TLS 1.2 vs TLS 1.3
  - [ ] Uso HSTS header
  - [ ] Testo SSL com SSL Labs

- [ ] DNS e Domínios
  - [ ] Entendo hierarquia DNS
  - [ ] Conheço tipos de registros (A, AAAA, CNAME, MX, TXT)
  - [ ] Sei o que é TTL e propagação
  - [ ] Configuro DNS corretamente (A, CNAME, etc)
  - [ ] Entendo diferença apex domain vs subdomain
  - [ ] Sei usar wildcard DNS
  - [ ] Troubleshoot problemas DNS com dig/nslookup

---

## 📚 PRÓXIMOS PASSOS

👉 **[Módulo 3: Node.js e Backend](./modulo-03-nodejs-backend.md)**

---

**Última atualização**: Fevereiro 2026
**Status**: ✅ Completo
