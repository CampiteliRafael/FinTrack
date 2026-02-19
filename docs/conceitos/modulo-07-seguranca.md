# Módulo 7: Segurança

## Objetivos deste Módulo

- Compreender OWASP Top 10
- Implementar autenticação segura com JWT
- Hash de senhas com bcrypt
- Rate limiting para proteger APIs
- Sanitização de inputs
- CORS security
- Security headers com Helmet.js
- Proteger contra ataques comuns

## Índice

1. [Segurança Web Fundamentals](#segurança-web-fundamentals)
2. [OWASP Top 10](#owasp-top-10)
3. [Autenticação com JWT](#autenticação-com-jwt)
4. [Hash de Senhas com Bcrypt](#hash-de-senhas-com-bcrypt)
5. [Rate Limiting](#rate-limiting)
6. [Input Sanitization](#input-sanitization)
7. [CORS Security](#cors-security)
8. [Security Headers](#security-headers)
9. [Checklist de Conhecimentos](#checklist-de-conhecimentos)

---

## Segurança Web Fundamentals

### O que é Segurança?

```
┌─────────────────────────────────────────┐
│  SEGURANÇA = Confidencialidade +        │
│            Integridade +                │
│            Disponibilidade               │
├─────────────────────────────────────────┤
│ Confidencialidade: Dados protegidos     │
│ Integridade: Dados não alterados        │
│ Disponibilidade: Sistema sempre ativo   │
└─────────────────────────────────────────┘
```

### Tipos de Ataques

```
┌─────────────────────────────────────┐
│  ATAQUES COMUNS                     │
├─────────────────────────────────────┤
│ SQL Injection      - Modificar SQL  │
│ XSS                - Robar dados    │
│ CSRF               - Ações falsas   │
│ Força Bruta        - Adivinhar      │
│ DDoS               - Parar servidor │
│ Man-in-the-Middle  - Interceptar    │
│ Phishing           - Enganar        │
└─────────────────────────────────────┘
```

---

## OWASP Top 10

### 1. Broken Access Control

```javascript
// ❌ VULNERÁVEL: Usuário acessa dados de outro
app.get('/api/usuarios/:id', async (req, res) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: parseInt(req.params.id) }
  });
  res.json(usuario); // Qualquer um consegue acessar qualquer ID!
});

// ✅ SEGURO: Verificar autorização
app.get('/api/usuarios/:id', verificarAutenticacao, async (req, res) => {
  const usuarioId = parseInt(req.params.id);
  const meuId = req.user.id;

  // Só pode acessar seus próprios dados
  if (usuarioId !== meuId && req.user.role !== 'admin') {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId }
  });
  res.json(usuario);
});
```

### 2. Cryptographic Failures (Dados Expostos)

```javascript
// ❌ VULNERÁVEL: Dados sensíveis em text
const usuario = {
  id: 1,
  email: 'joao@example.com',
  senha: '123456',  // ❌ Texto puro!
  apiKey: 'super_secret_key_xyz'  // ❌ Exposado!
};

// ✅ SEGURO: Hash e criptografia
const usuario = {
  id: 1,
  email: 'joao@example.com',
  senhaHash: '$2b$10$N9qo8uLO...',  // ✅ Hash do bcrypt
  apiKeyHash: 'hash_da_chave'  // ✅ Hash
};

// Guardar senhas apenas com hash
app.post('/api/usuarios', async (req, res) => {
  const { email, senha } = req.body;

  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.usuario.create({
    data: {
      email,
      senha: senhaHash  // ✅ Salvar hash, nunca texto
    }
  });
});
```

### 3. Injection (SQL Injection)

```javascript
// ❌ VULNERÁVEL: Query construída com string
const email = req.body.email;
const query = `SELECT * FROM usuarios WHERE email = '${email}'`;
// Se email = "admin' --", SQL vira:
// SELECT * FROM usuarios WHERE email = 'admin' --'
// Bypassa senha!

// ✅ SEGURO: Prepared statements / Parametrizado
const usuario = await prisma.usuario.findUnique({
  where: { email: req.body.email }
});

// Ou com raw SQL
const usuario = await prisma.$queryRaw`
  SELECT * FROM usuarios WHERE email = ${req.body.email}
`;
```

### 4. Insecure Design

```javascript
// ❌ VULNERÁVEL: Sem validação de entrada
app.post('/api/transacoes', (req, res) => {
  const { valor, descricao } = req.body;
  // Aceita qualquer coisa! Valores negativos, strings gigantes...
  salvarTransacao(valor, descricao);
});

// ✅ SEGURO: Validar tudo
const esquemaTransacao = z.object({
  valor: z.number().positive().max(1000000),
  descricao: z.string().min(1).max(500)
});

app.post('/api/transacoes', validar(esquemaTransacao), (req, res) => {
  const { valor, descricao } = req.body; // Dados validados e seguros
  salvarTransacao(valor, descricao);
});
```

### 5. Broken Authentication

```javascript
// ❌ VULNERÁVEL: Senhas fracas permitidas
app.post('/api/registro', async (req, res) => {
  const { email, senha } = req.body;

  // Qualquer senha funciona!
  if (senha.length < 3) {
    // ❌ Muito fraco
  }

  await prisma.usuario.create({ data: { email, senha } });
});

// ✅ SEGURO: Exigir senhas fortes
const schemaRegistro = z.object({
  email: z.string().email(),
  senha: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve incluir maiúscula')
    .regex(/[0-9]/, 'Deve incluir número')
    .regex(/[!@#$%]/, 'Deve incluir caractere especial')
});

app.post('/api/registro', validar(schemaRegistro), async (req, res) => {
  const { email, senha } = req.body;
  const senhaHash = await bcrypt.hash(senha, 10);
  await prisma.usuario.create({ data: { email, senha: senhaHash } });
});
```

### 6. Security Misconfiguration

```javascript
// ❌ VULNERÁVEL: Configuração insegura
const app = express();
app.use(express.json({ limit: '50mb' })); // ❌ Muito grande!
app.disable('x-powered-by'); // ❌ Não desabilitou

// ✅ SEGURO: Configuração apropriada
app.use(express.json({ limit: '1mb' })); // ✅ Limite razoável
app.set('x-powered-by', false); // ✅ Esconder tech stack
app.use(helmet()); // ✅ Security headers
app.use(cors({ origin: 'https://fintrack.com' })); // ✅ CORS restritivo
```

### 7. Cross-Site Scripting (XSS)

```javascript
// ❌ VULNERÁVEL: Renderizar input sem sanitizar
function Perfil({ descricao }) {
  return (
    <div>
      <p>{descricao}</p>
      {/* Se descricao = "<script>alert('hack')</script>",
          script é executado! */}
    </div>
  );
}

// ✅ SEGURO: React já sanitiza por padrão
function Perfil({ descricao }) {
  return (
    <div>
      <p>{descricao}</p>
      {/* React escapa HTML automaticamente */}
    </div>
  );
}

// Se precisar HTML: use biblioteca como DOMPurify
import DOMPurify from 'dompurify';

function Perfil({ descricao }) {
  const htmlSeguro = DOMPurify.sanitize(descricao);
  return (
    <div dangerouslySetInnerHTML={{ __html: htmlSeguro }} />
  );
}
```

### 8. Software and Data Integrity Failures

```javascript
// ❌ VULNERÁVEL: npm install sem verificação
npm install qualquer-pacote-suspeito

// ✅ SEGURO: Usar package-lock.json
npm ci  # Usar lockfile exato

// ✅ Auditar vulnerabilidades
npm audit

// ✅ Manter dependências atualizadas
npm update
npm audit fix
```

### 9. Logging and Monitoring Failures

```javascript
// ❌ VULNERÁVEL: Sem logs
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  const usuario = await autenticar(email, senha);
  res.json({ token });
});

// ✅ SEGURO: Logar eventos de segurança
app.post('/api/login', async (req, res) => {
  const { email } = req.body;

  try {
    const usuario = await autenticar(email, req.body.senha);
    logger.info('Login bem-sucedido', { usuarioId: usuario.id, email });
    res.json({ token });
  } catch (erro) {
    logger.warn('Login falhado', { email, tentativas: contador });
    res.status(401).json({ erro: 'Credenciais inválidas' });
  }
});
```

### 10. Server-Side Request Forgery (SSRF)

```javascript
// ❌ VULNERÁVEL: Requisições para URLs arbitrárias
app.post('/api/carregar-imagem', async (req, res) => {
  const { url } = req.body;
  const imagem = await fetch(url);  // ❌ Pode ser URL interna!
  // Usuário poderia fazer fetch de http://localhost:5000/admin
});

// ✅ SEGURO: Whitelist de URLs
const urlPermitidas = ['https://storage.example.com'];

app.post('/api/carregar-imagem', async (req, res) => {
  const { url } = req.body;

  if (!urlPermitidas.some(permitida => url.startsWith(permitida))) {
    return res.status(403).json({ erro: 'URL não permitida' });
  }

  const imagem = await fetch(url);
});
```

---

## Autenticação com JWT

### O que é JWT?

```
JWT = JSON Web Token

Estrutura: xxxxx.yyyyy.zzzzz
          └─┬─┘ └─┬─┘ └─┬─┘
         Header Payload Signature

Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "1234567890",
  "nome": "João Silva",
  "iat": 1516239022,
  "exp": 1516242622
}

Signature:
HMACSHA256(base64(header) + "." + base64(payload), secret)
```

### Fluxo JWT

```
┌──────────────────────────────────────────────┐
│ 1. Cliente envia email + senha               │
└────────────────┬─────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────┐
│ 2. Servidor valida e cria JWT                │
│    - Verifica credenciais                    │
│    - Gera token com secret                   │
│    - Retorna token ao cliente                │
└────────────────┬─────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────┐
│ 3. Cliente guarda token (localStorage)       │
└────────────────┬─────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────┐
│ 4. Cliente envia token em Authorization      │
│    Authorization: Bearer eyJhbGc...          │
└────────────────┬─────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────┐
│ 5. Servidor verifica token                   │
│    - Decodifica                              │
│    - Verifica signature                      │
│    - Verifica expiração                      │
└────────────────┬─────────────────────────────┘
                 │
         ✅ Acesso liberado
```

### Implementação JWT

```bash
npm install jsonwebtoken
```

```javascript
// ✅ Criar JWT
const jwt = require('jsonwebtoken');

function criarToken(usuarioId, email) {
  const payload = {
    usuarioId,
    email,
    iat: Math.floor(Date.now() / 1000),  // Issued at
    exp: Math.floor(Date.now() / 1000) + 3600  // Expira em 1 hora
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return token;
  // Retorna: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
}

// ✅ Verificar e decodificar JWT
function verificarToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
    // Retorna: { usuarioId: 1, email: 'joao@example.com', iat: ..., exp: ... }
  } catch (erro) {
    if (erro.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    }
    throw new Error('Token inválido');
  }
}

// ✅ Middleware de autenticação
function autenticacao(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const [tipo, token] = authHeader.split(' ');

  if (tipo !== 'Bearer') {
    return res.status(401).json({ erro: 'Formato inválido' });
  }

  try {
    const decoded = verificarToken(token);
    req.usuario = decoded;  // Adiciona dados do token à requisição
    next();
  } catch (erro) {
    res.status(401).json({ erro: erro.message });
  }
}

// ✅ Rota de login
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario || !await bcrypt.compare(senha, usuario.senhaHash)) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  const token = criarToken(usuario.id, usuario.email);

  res.json({
    sucesso: true,
    token,
    usuario: { id: usuario.id, email: usuario.email, nome: usuario.nome }
  });
});

// ✅ Rota protegida
app.get('/api/perfil', autenticacao, (req, res) => {
  res.json({
    usuarioId: req.usuario.usuarioId,
    email: req.usuario.email
  });
});
```

### Access Token + Refresh Token

```javascript
// ✅ Access Token (curta duração - 15 min)
function criarAccessToken(usuarioId) {
  return jwt.sign({ usuarioId }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  });
}

// ✅ Refresh Token (longa duração - 7 dias)
function criarRefreshToken(usuarioId) {
  return jwt.sign({ usuarioId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  });
}

// ✅ Login retorna ambos
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  const usuario = await autenticar(email, senha);

  const accessToken = criarAccessToken(usuario.id);
  const refreshToken = criarRefreshToken(usuario.id);

  // ✅ Guardar refreshToken no BD
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { refreshToken }
  });

  res.json({
    accessToken,  // Usar em requisições
    refreshToken  // Guardar seguro (httpOnly cookie ou localStorage)
  });
});

// ✅ Renovar access token com refresh token
app.post('/api/refresh', (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const novoAccessToken = criarAccessToken(decoded.usuarioId);

    res.json({ accessToken: novoAccessToken });
  } catch (erro) {
    res.status(401).json({ erro: 'Refresh token inválido' });
  }
});

// ✅ Logout invalida refresh token
app.post('/api/logout', autenticacao, async (req, res) => {
  await prisma.usuario.update({
    where: { id: req.usuario.usuarioId },
    data: { refreshToken: null }
  });

  res.json({ mensagem: 'Logout bem-sucedido' });
});
```

---

## Hash de Senhas com Bcrypt

### Por que Bcrypt?

```
❌ MD5:     d41d8cd98f00b204e9800998ecf8427e  # Rápido demais!
           Vulnerável a ataques

❌ SHA256:  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  # Rápido demais!

✅ Bcrypt:  $2b$10$N9qo8uLOickgx2ZMRZoHeu  # Lento propositalmente!
           Com salt, adaptativo, seguro
```

### Implementação Bcrypt

```bash
npm install bcrypt
```

```javascript
const bcrypt = require('bcrypt');

// ✅ Hash de senha
async function hashearSenha(senhaTexto) {
  const salt = await bcrypt.genSalt(10);  // Gerar salt
  const hash = await bcrypt.hash(senhaTexto, salt);
  return hash;
}

// Resultado: $2b$10$N9qo8uLOickgx2ZMRZoHeuuOBPHJqvKy6fzMCHvCDiBEpOBUfIR4e

// ✅ Verificar senha
async function verificarSenha(senhaTexto, senhaHash) {
  return await bcrypt.compare(senhaTexto, senhaHash);
}

// ✅ Registro
app.post('/api/registro', async (req, res) => {
  const { email, senha } = req.body;

  // Validar força
  if (senha.length < 8) {
    return res.status(400).json({ erro: 'Senha muito fraca' });
  }

  // Hash a senha
  const senhaHash = await hashearSenha(senha);

  // Salvar
  const usuario = await prisma.usuario.create({
    data: { email, senhaHash }
  });

  res.status(201).json({ id: usuario.id, email: usuario.email });
});

// ✅ Login
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario) {
    return res.status(401).json({ erro: 'Email ou senha incorretos' });
  }

  // Verificar senha com bcrypt
  const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

  if (!senhaValida) {
    return res.status(401).json({ erro: 'Email ou senha incorretos' });
  }

  // Senha correta - gerar token
  const token = criarToken(usuario.id, usuario.email);
  res.json({ token });
});

// ⚠️ NUNCA armazene senha em texto plano!
// ⚠️ NUNCA tente descriptografar senha (hash é irreversível!)
```

---

## Rate Limiting

### Por que Rate Limiting?

```
❌ SEM Rate Limiting:
- Usuário malicioso faz 10.000 requisições/segundo
- Força bruta de senha
- DDoS attack
- Esgota recursos do servidor

✅ COM Rate Limiting:
- Máximo 5 tentativas de login por minuto
- Máximo 100 requisições por hora por IP
- Máximo 1000 requisições por dia por usuário
```

### Implementação

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

// ✅ Limiter geral (todas as requisições)
const limiterGeral = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 100,                   // 100 requisições por IP
  message: 'Muitas requisições, tente mais tarde',
  standardHeaders: true,      // Retorna em RateLimit-* headers
  legacyHeaders: false        // Desabilita X-RateLimit-* headers
});

app.use(limiterGeral);

// ✅ Limiter para login (mais restritivo)
const limiterLogin = rateLimit({
  windowMs: 1 * 60 * 1000,   // 1 minuto
  max: 5,                     // 5 tentativas
  skipSuccessfulRequests: true,  // Reset após sucesso
  message: 'Muitas tentativas de login. Tente em 1 minuto'
});

app.post('/api/login', limiterLogin, async (req, res) => {
  // Lógica de login
});

// ✅ Limiter por usuário (não apenas IP)
const limiterPorUsuario = rateLimit({
  keyGenerator: (req, res) => {
    return req.usuario?.id || req.ip;  // Usar ID do usuário se autenticado
  },
  windowMs: 24 * 60 * 60 * 1000,  // 24 horas
  max: 1000  // 1000 requisições por dia por usuário
});

app.use('/api/', limiterPorUsuario);

// ✅ Limiter customizado com Redis (para produção)
const redis = require('redis');
const RedisStore = require('rate-limit-redis');
const client = redis.createClient();

const limiterRedis = rateLimit({
  store: new RedisStore({
    client: client,
    prefix: 'rl:'  // rate limit prefix
  }),
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiterRedis);
```

### Exemplo Completo - Proteção de Força Bruta

```javascript
const limiterLogin = rateLimit({
  windowMs: 5 * 60 * 1000,    // 5 minutos
  max: 5,                      // 5 tentativas
  skipSuccessfulRequests: true,  // Reset após sucesso
  handler: (req, res) => {
    logger.warn('Rate limit atingido para login', { ip: req.ip });
    res.status(429).json({
      erro: 'Muitas tentativas. Tente novamente em 5 minutos'
    });
  }
});

app.post('/api/login', limiterLogin, async (req, res) => {
  const { email, senha } = req.body;

  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario || !await bcrypt.compare(senha, usuario.senhaHash)) {
    logger.warn('Falha de login', { email, ip: req.ip });
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  logger.info('Login bem-sucedido', { usuarioId: usuario.id });
  const token = criarToken(usuario.id, usuario.email);
  res.json({ token });
});
```

---

## Input Sanitization

### Por que Sanitizar?

```
❌ SEM sanitização:
- Usuário envia: "<script>alert('hack')</script>"
- Script é armazenado e executado
- XSS attack

✅ COM sanitização:
- HTML é escapado
- Caracteres perigosos removidos
- Dados seguros armazenados
```

### Implementação

```bash
npm install sanitize-html xss
```

```javascript
const sanitizeHtml = require('sanitize-html');
const xss = require('xss');

// ✅ Sanitizar no salvar
app.post('/api/perfil', autenticacao, async (req, res) => {
  const { descricao, bio } = req.body;

  // Remover tags HTML perigosas
  const descricaoSegura = sanitizeHtml(descricao, {
    allowedTags: [],  // Não permitir nenhuma tag
    allowedAttributes: {}
  });

  // Ou escapar tudo
  const bioSegura = xss(bio);

  await prisma.usuario.update({
    where: { id: req.usuario.id },
    data: {
      descricao: descricaoSegura,
      bio: bioSegura
    }
  });

  res.json({ mensagem: 'Perfil atualizado' });
});

// ✅ Sanitizar inputs com Zod
const schemaUsuario = z.object({
  nome: z.string().max(100).transform(v => xss(v)),
  email: z.string().email(),
  bio: z.string().max(500).optional().transform(v => v ? xss(v) : undefined)
});

app.post('/api/usuarios', validar(schemaUsuario), async (req, res) => {
  const { nome, email, bio } = req.body;  // Já sanitizado!
  // ...
});
```

---

## CORS Security

### O que é CORS?

```
CORS = Cross-Origin Resource Sharing

Sem CORS:
- Frontend (localhost:3000) NÃO pode requisitar Backend (localhost:5000)
- Proteção contra requisições não autorizadas

Com CORS mal configurado:
- Qualquer site pode acessar sua API
- Roubo de dados

Com CORS bem configurado:
- Apenas origens autorizadas podem acessar
- Dados protegidos
```

### Implementação CORS

```bash
npm install cors
```

```javascript
const cors = require('cors');

// ❌ VULNERÁVEL: Permitir todas as origens
app.use(cors());

// ✅ SEGURO: Whitelist de origens
const urlsPermitidas = [
  'https://fintrack.com',
  'https://www.fintrack.com',
  'http://localhost:3000'  // Dev
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || urlsPermitidas.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS não permitido'));
    }
  },
  credentials: true,  // Permitir cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ CORS com configuração manual
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (urlsPermitidas.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});
```

---

## Security Headers

### O que São Security Headers?

Headers HTTP que instruem navegadores a comportarem-se de forma segura.

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');

// ✅ Helmet - Adiciona vários headers de segurança automaticamente
app.use(helmet());

// O que Helmet adiciona:

// 1. Content-Security-Policy
//    Previne XSS indicando quais scripts podem ser carregados
// 2. X-Frame-Options: DENY
//    Previne Clickjacking
// 3. X-Content-Type-Options: nosniff
//    Previne MIME type sniffing
// 4. Strict-Transport-Security
//    Force HTTPS (HSTS)
// 5. X-XSS-Protection
//    Proteção contra XSS (navegadores antigos)
// 6. Referrer-Policy: strict-origin-when-cross-origin
//    Controla informação de referrer
// 7. Permissions-Policy
//    Controla acesso a recursos (câmera, microfone)

// ✅ Customizar Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.example.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,  // 1 ano
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny'  // Não permitir em iframes
  }
}));

// ✅ HTTPS redirect (em produção)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});
```

### Headers Importantes

```javascript
// ✅ Content-Security-Policy
// Previne XSS limitando fontes de conteúdo
res.setHeader("Content-Security-Policy", "default-src 'self'");

// ✅ X-Frame-Options
// Previne clickjacking
res.setHeader("X-Frame-Options", "DENY");

// ✅ X-Content-Type-Options
// Previne MIME type sniffing
res.setHeader("X-Content-Type-Options", "nosniff");

// ✅ Strict-Transport-Security
// Force HTTPS por 1 ano
res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

// ✅ Referrer-Policy
// Controla informação de referrer
res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

// ✅ Permissions-Policy
// Controla acesso a recursos
res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
```

---

## Checklist de Conhecimentos

- [ ] OWASP Top 10 vulnerabilidades
- [ ] Broken Access Control (autorização)
- [ ] Cryptographic Failures (encriptação)
- [ ] SQL Injection prevention
- [ ] Validação de entrada (Zod)
- [ ] Autenticação forte (JWT)
- [ ] Bcrypt para hash de senhas
- [ ] Access + Refresh tokens
- [ ] Rate limiting
- [ ] Input sanitization (XSS prevention)
- [ ] CORS configuration
- [ ] Security headers (Helmet)
- [ ] HTTPS/TLS
- [ ] Logging e monitoring
- [ ] Dependências seguras (npm audit)

---

## Próximo Módulo

Agora que sua aplicação está segura, explore **Módulo 8: Testes** para garantir qualidade e confiabilidade do código.
