# Módulo 3: Node.js e Desenvolvimento Backend

## Objetivos deste Módulo

- Dominar Express.js e construção de APIs RESTful
- Compreender o ciclo de vida de requisições e respostas
- Implementar middleware patterns efetivos
- Validar dados com Zod
- Dominar Prisma ORM para operações com banco de dados
- Estruturar projetos backend profissionalmente
- Gerenciar variáveis de ambiente

## Índice

1. [O que é Node.js](#o-que-é-nodejs)
2. [Express.js - Framework Web](#expressjs---framework-web)
3. [Ciclo de Requisição e Resposta](#ciclo-de-requisição-e-resposta)
4. [Middleware Patterns](#middleware-patterns)
5. [Validação de Dados com Zod](#validação-de-dados-com-zod)
6. [Prisma ORM](#prisma-orm)
7. [Variáveis de Ambiente](#variáveis-de-ambiente)
8. [Estrutura de Projetos Backend](#estrutura-de-projetos-backend)
9. [Checklist de Conhecimentos](#checklist-de-conhecimentos)

---

## O que é Node.js

### Por que Node.js?

Node.js é um runtime JavaScript assíncrono baseado no motor V8 do Chrome. Diferente do JavaScript de navegador, permite executar código JavaScript no servidor.

**Características principais:**
- **Event-driven, non-blocking I/O**: Ideal para aplicações em tempo real
- **NPM ecosystem**: Bilhões de pacotes disponíveis
- **JavaScript everywhere**: Mesmo linguagem frontend e backend
- **Escalável**: Suporta milhões de conexões simultâneas

### Modelo de Execução

```javascript
// Node.js usa um modelo assíncrono baseado em eventos (Event Loop)

// ❌ BLOQUEANTE (nunca faça assim)
const fs = require('fs');
const dados = fs.readFileSync('arquivo.txt', 'utf-8');
console.log('Dados lidos:', dados);
// Tudo fica parado enquanto lê o arquivo

// ✅ NÃO-BLOQUEANTE (forma correta)
const fs = require('fs').promises;
async function lerDados() {
  const dados = await fs.readFile('arquivo.txt', 'utf-8');
  console.log('Dados lidos:', dados);
}
lerDados();
// O programa continua executando enquanto lê o arquivo
```

---

## Express.js - Framework Web

### O que é Express?

Express é o framework web mais popular para Node.js. Fornece abstrações para roteamento, middleware, templates e muito mais.

### Estrutura Básica

```javascript
// server.js - Estrutura mínima
const express = require('express');
const app = express();

// Middleware global (executado em TODA requisição)
app.use(express.json()); // Parse JSON automaticamente

// ROTAS - Definem os endpoints da API

// GET: Obter dados
app.get('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;
  // Lógica para obter usuário
  res.json({ id, nome: 'João' });
});

// POST: Criar dados
app.post('/api/usuarios', (req, res) => {
  const { nome, email } = req.body;
  // Lógica para criar usuário
  res.status(201).json({ id: 1, nome, email });
});

// PUT: Atualizar dados completos
app.put('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;
  // Lógica para atualizar usuário
  res.json({ id, nome, email });
});

// PATCH: Atualizar dados parciais
app.patch('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;
  // Atualiza apenas os campos fornecidos
  res.json({ id, ...req.body });
});

// DELETE: Remover dados
app.delete('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;
  // Lógica para deletar usuário
  res.status(204).send();
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
```

### Métodos HTTP e Semântica

| Método | Idempotente? | Corpo? | Uso |
|--------|-------------|--------|-----|
| GET | ✅ Sim | ❌ Não | Obter recurso |
| POST | ❌ Não | ✅ Sim | Criar recurso |
| PUT | ✅ Sim | ✅ Sim | Atualizar completo |
| PATCH | ❌ Não | ✅ Sim | Atualizar parcial |
| DELETE | ✅ Sim | ❌ Não | Remover recurso |
| HEAD | ✅ Sim | ❌ Não | Como GET sem corpo |
| OPTIONS | ✅ Sim | ❌ Não | Info sobre recurso |

### Parâmetros de Requisição

```javascript
// 1. PARAMS: Parte da URL
// GET /api/usuarios/123
app.get('/api/usuarios/:id', (req, res) => {
  console.log(req.params.id); // "123"
  res.json({ usuarioId: req.params.id });
});

// 2. QUERY: Após "?"
// GET /api/usuarios?pagina=1&limite=10
app.get('/api/usuarios', (req, res) => {
  console.log(req.query.pagina); // "1"
  console.log(req.query.limite); // "10"
  res.json({ pagina: req.query.pagina });
});

// 3. BODY: Conteúdo da requisição
// POST /api/usuarios (body: {"nome": "João", "email": "joao@example.com"})
app.post('/api/usuarios', (req, res) => {
  console.log(req.body.nome); // "João"
  console.log(req.body.email); // "joao@example.com"
  res.json({ mensagem: 'Usuário criado' });
});

// 4. HEADERS: Metadados da requisição
// GET /api/usuarios (headers: {"authorization": "Bearer token123"})
app.get('/api/usuarios', (req, res) => {
  const token = req.headers.authorization;
  // Validar token...
  res.json({ token });
});
```

### Códigos de Status HTTP

```javascript
// 2xx: Sucesso
app.post('/api/usuarios', (req, res) => {
  res.status(201).json({}); // 201 Created
});

// 3xx: Redirecionamento
app.get('/api/antigo', (req, res) => {
  res.redirect(301, '/api/novo'); // Mover permanentemente
});

// 4xx: Erro do cliente
app.get('/api/usuarios/:id', (req, res) => {
  if (!usuarioExiste(req.params.id)) {
    res.status(404).json({ erro: 'Usuário não encontrado' }); // Not Found
  }
  if (!temPermissao()) {
    res.status(403).json({ erro: 'Acesso negado' }); // Forbidden
  }
  if (requisicaoInvalida()) {
    res.status(400).json({ erro: 'Dados inválidos' }); // Bad Request
  }
});

// 5xx: Erro do servidor
app.get('/api/usuarios', (req, res) => {
  try {
    // Lógica
  } catch (erro) {
    res.status(500).json({ erro: 'Erro interno do servidor' }); // Internal Server Error
  }
});
```

---

## Ciclo de Requisição e Resposta

### Entendendo o Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Navegador/App)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                    Faz requisição
                         │
                         ▼
          ┌──────────────────────────────┐
          │  1. Express recebe requisição  │
          │     - Parse URL                │
          │     - Parse headers            │
          │     - Parse body               │
          └──────────────────────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │  2. Executa middleware stack   │
          │     - Logger                   │
          │     - CORS                     │
          │     - Parser JSON              │
          │     - Autenticação             │
          └──────────────────────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │  3. Encontra rota              │
          │     - Match com padrão         │
          │     - Coloca em req.params     │
          └──────────────────────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │  4. Executa controller        │
          │     - Lógica de negócio       │
          │     - Acesso a BD             │
          └──────────────────────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │  5. Prepara resposta           │
          │     - Status code              │
          │     - Headers                  │
          │     - Body                     │
          └──────────────────────────────┘
                         │
                    res.json(dados)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                CLIENTE recebe resposta                       │
│          JSON é parseado em JavaScript                      │
└─────────────────────────────────────────────────────────────┘
```

### Exemplo Prático Completo

```javascript
// app.js
const express = require('express');
const app = express();

// Middleware 1: Parse JSON
app.use(express.json());

// Middleware 2: Logger customizado
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next(); // ⚠️ IMPORTANTE: Chamar next() para passar ao próximo middleware
});

// Middleware 3: Autenticação
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token && !req.path.includes('login')) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }
  // Se token valido, continua
  next();
});

// Middleware 4: Específico da rota
const loggerRota = (req, res, next) => {
  console.log(`Acessando rota: ${req.path}`);
  next();
};

// ROTAS
app.get('/api/usuarios', loggerRota, async (req, res) => {
  // Aqui chegamos após passar por todos os middleware
  try {
    // Simulando busca em BD
    const usuarios = [
      { id: 1, nome: 'João' },
      { id: 2, nome: 'Maria' }
    ];

    res.json({
      sucesso: true,
      dados: usuarios,
      total: usuarios.length
    });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando...');
});

// Request: GET /api/usuarios
// Response:
// {
//   "sucesso": true,
//   "dados": [
//     { "id": 1, "nome": "João" },
//     { "id": 2, "nome": "Maria" }
//   ],
//   "total": 2
// }
```

---

## Middleware Patterns

### O que é Middleware?

Middleware são funções que têm acesso ao objeto de requisição (req), resposta (res) e ao próximo middleware. Eles podem:
- Modificar req/res
- Encerrar o ciclo
- Chamar o próximo middleware

### Ordem de Execução

```javascript
const express = require('express');
const app = express();

app.use(express.json()); // 1º - Parse JSON

app.use((req, res, next) => {
  console.log('Middleware A');
  next(); // Passa ao próximo
}); // 2º

app.use((req, res, next) => {
  console.log('Middleware B');
  next();
}); // 3º

app.get('/usuarios', (req, res) => {
  console.log('Handler da rota');
  res.json({});
}); // 4º - Handler

// Requisição GET /usuarios produz:
// Middleware A
// Middleware B
// Handler da rota
```

### Tipos de Middleware

#### 1. Middleware Global (executado em toda requisição)

```javascript
const app = require('express')();

// Executa antes de TODA requisição
app.use(express.json());
app.use(express.static('public'));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/api/dados', (req, res) => {
  res.json({});
});
```

#### 2. Middleware de Rota Específica

```javascript
const app = require('express')();

const verificarAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ erro: 'Acesso negado' });
  }
  next();
};

// Middleware aplicado apenas nesta rota
app.delete('/api/usuarios/:id', verificarAdmin, (req, res) => {
  res.json({ mensagem: 'Usuário deletado' });
});

// Middleware em múltiplas rotas
app.get('/admin/dashboard', verificarAdmin, (req, res) => {
  res.json({ dashboard: true });
});
```

#### 3. Middleware de Tratamento de Erros

```javascript
const app = require('express')();

// Middleware de erro - SEMPRE por último
// ⚠️ Deve ter 4 parâmetros (err, req, res, next)
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    erro: err.message,
    status: err.status || 500
  });
});

// Uso:
app.get('/api/usuarios', (req, res, next) => {
  try {
    // Lógica
  } catch (erro) {
    // Passa ao middleware de erro
    next(erro);
  }
});
```

### Middleware Populares

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// 1. CORS - Permite requisições de outros domínios
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// 2. Helmet - Security headers
app.use(helmet());

// 3. Morgan - Logger de requisições
app.use(morgan('combined')); // Formatos: combined, common, dev, short, tiny

// 4. Rate Limit - Proteção contra abuso
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // 100 requisições por IP
});
app.use(limiter);

// 5. Body Parser - Parse de dados
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 6. Middleware customizado - Adicionar dados à requisição
app.use((req, res, next) => {
  req.timestamp = new Date();
  req.usuario = { id: 1, nome: 'João' }; // Simulado
  next();
});

app.get('/api/info', (req, res) => {
  res.json({
    timestamp: req.timestamp,
    usuario: req.usuario
  });
});

app.listen(3000);
```

### Padrão de Middleware - Composição

```javascript
// middleware.js - Arquivo separado com middlewares
const verificarAutenticacao = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  try {
    // Validar token (implementar com JWT em módulo de segurança)
    req.user = { id: 1 }; // Simulado
    next();
  } catch (erro) {
    res.status(401).json({ erro: 'Token inválido' });
  }
};

const verificarPermissao = (permissoes) => {
  return (req, res, next) => {
    if (!permissoes.includes(req.user?.role)) {
      return res.status(403).json({ erro: 'Permissão negada' });
    }
    next();
  };
};

module.exports = {
  verificarAutenticacao,
  verificarPermissao
};

// app.js - Usar middlewares
const express = require('express');
const { verificarAutenticacao, verificarPermissao } = require('./middleware');

const app = express();

app.delete(
  '/api/usuarios/:id',
  verificarAutenticacao,
  verificarPermissao(['admin']),
  (req, res) => {
    res.json({ mensagem: 'Deletado' });
  }
);

app.listen(3000);
```

---

## Validação de Dados com Zod

### Por que Validar?

- **Segurança**: Prevenir SQL injection, XSS
- **Confiabilidade**: Garantir dados esperados
- **DX**: Mensagens de erro claras
- **Type-safety**: Trabalhar com TypeScript

### Instalação

```bash
npm install zod
```

### Básico de Zod

```javascript
const { z } = require('zod');

// 1. Definir schema (estrutura esperada)
const usuarioSchema = z.object({
  nome: z.string().min(3).max(100),
  email: z.string().email(),
  idade: z.number().int().min(18).max(120),
  ativo: z.boolean().optional()
});

// 2. Validar dados
const dados = {
  nome: 'João Silva',
  email: 'joao@example.com',
  idade: 25
};

const resultado = usuarioSchema.safeParse(dados);

if (resultado.success) {
  console.log('Válido:', resultado.data);
} else {
  console.log('Inválido:', resultado.error.errors);
}
// Output:
// [
//   {
//     "code": "too_small",
//     "minimum": 3,
//     "type": "string",
//     "path": ["nome"],
//     "message": "String must contain at least 3 character(s)"
//   }
// ]
```

### Tipos Zod

```javascript
const { z } = require('zod');

// Primitivos
z.string().email().url().uuid()
z.number().int().positive().min(0).max(100)
z.boolean()
z.null()
z.undefined()
z.any()

// Estruturados
z.object({ nome: z.string() })
z.array(z.string())
z.tuple([z.string(), z.number()])
z.enum(['admin', 'user', 'guest'])
z.union([z.string(), z.number()]) // string OU number
z.record(z.string()) // { [key: string]: string }

// Customizados
z.date().min(new Date('2025-01-01'))
z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/) // CPF pattern
```

### Validação em Rotas Express

```javascript
const express = require('express');
const { z } = require('zod');

const app = express();
app.use(express.json());

// Definir schemas
const criarUsuarioSchema = z.object({
  nome: z.string().min(3).max(100),
  email: z.string().email(),
  senha: z.string().min(8),
  idade: z.number().int().min(18).optional()
});

const atualizarUsuarioSchema = criarUsuarioSchema.partial(); // Todos opcionais

// Middleware de validação
const validar = (schema) => {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      return res.status(400).json({
        erro: 'Validação falhou',
        detalhes: resultado.error.errors
      });
    }

    // Dados validados substituem req.body
    req.body = resultado.data;
    next();
  };
};

// ✅ ÓTIMO: Dados validados automaticamente
app.post('/api/usuarios', validar(criarUsuarioSchema), (req, res) => {
  // req.body está seguro e tipado
  const { nome, email, senha, idade } = req.body;

  // Salvar usuário...
  res.status(201).json({
    id: 1,
    nome,
    email,
    idade
  });
});

// ✅ Atualização parcial
app.patch('/api/usuarios/:id', validar(atualizarUsuarioSchema), (req, res) => {
  // req.body pode ter apenas alguns campos
  res.json({ mensagem: 'Usuário atualizado' });
});

app.listen(3000);
```

### Schemas Complexos para FinTrack

```javascript
const { z } = require('zod');

// Schema para criar transação
const transacaoSchema = z.object({
  tipo: z.enum(['receita', 'despesa']),
  categoria: z.string().min(1),
  valor: z.number().positive().multipleOf(0.01),
  descricao: z.string().max(500).optional(),
  data: z.coerce.date(),
  conta: z.string().uuid(),
  tags: z.array(z.string()).optional()
});

// Schema para filtro de transações
const filtroTransacoesSchema = z.object({
  tipo: z.enum(['receita', 'despesa']).optional(),
  categoria: z.string().optional(),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
  pagina: z.number().int().positive().default(1),
  limite: z.number().int().positive().max(100).default(20)
});

// Schema com validação customizada
const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(8)
}).strict(); // Rejeita campos extras

// Usar:
const validarTransacao = (dados) => {
  return transacaoSchema.safeParse(dados);
};

const validarLogin = (dados) => {
  return loginSchema.parse(dados); // Joga erro se inválido
};
```

---

## Prisma ORM

### O que é ORM?

ORM (Object-Relational Mapping) mapeia tabelas de banco de dados para classes/tipos em código.

```
┌──────────────┐        ┌──────────────────┐
│   Código     │   →   │  Banco de Dados   │
│   (Objetos)  │        │   (Tabelas)       │
└──────────────┘        └──────────────────┘

Usuario       →  usuarios (tabela)
  {
    id          → id (coluna)
    nome        → nome (coluna)
    email       → email (coluna)
  }
```

### Instalação e Setup

```bash
npm install @prisma/client
npm install -D prisma

# Inicializar Prisma
npx prisma init
# Cria: .env e prisma/schema.prisma
```

### Schema Prisma Básico

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Model Usuario
model Usuario {
  id    Int     @id @default(autoincrement())
  email String  @unique
  nome  String
  senha String
  ativo Boolean @default(true)

  // Relacionamentos
  contas Conta[]
  transacoes Transacao[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Model Conta Bancária
model Conta {
  id        Int     @id @default(autoincrement())
  nome      String
  saldo     Decimal @default(0) @db.Decimal(15, 2)
  tipo      String  // "corrente", "poupança"

  usuarioId Int
  usuario   Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)

  transacoes Transacao[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Model Transação
model Transacao {
  id          Int     @id @default(autoincrement())
  tipo        String  // "receita", "despesa"
  categoria   String
  valor       Decimal @db.Decimal(15, 2)
  descricao   String?
  data        DateTime

  usuarioId   Int
  usuario     Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)

  contaId     Int
  conta       Conta   @relation(fields: [contaId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([usuarioId])
  @@index([contaId])
}
```

### Operações CRUD

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ✅ CREATE - Criar usuário
async function criarUsuario() {
  const usuario = await prisma.usuario.create({
    data: {
      email: 'joao@example.com',
      nome: 'João Silva',
      senha: 'hash_da_senha'
    }
  });
  console.log(usuario);
  // { id: 1, email: '...', nome: '...', ativo: true, createdAt: ... }
}

// ✅ READ - Buscar usuário
async function buscarUsuario() {
  // Por ID
  const usuario = await prisma.usuario.findUnique({
    where: { id: 1 }
  });

  // Por email
  const usuario2 = await prisma.usuario.findUnique({
    where: { email: 'joao@example.com' }
  });

  // Primeiro que atender condição
  const usuario3 = await prisma.usuario.findFirst({
    where: { ativo: true }
  });

  // Muitos registros
  const usuarios = await prisma.usuario.findMany({
    where: { ativo: true },
    take: 10, // LIMIT
    skip: 0, // OFFSET
    orderBy: { nome: 'asc' }
  });
}

// ✅ UPDATE - Atualizar usuário
async function atualizarUsuario() {
  const usuario = await prisma.usuario.update({
    where: { id: 1 },
    data: {
      nome: 'João Silva Santos'
      // updatedAt é automático
    }
  });

  // Atualizar múltiplos
  const result = await prisma.usuario.updateMany({
    where: { ativo: false },
    data: { ativo: true }
  });
  console.log(`${result.count} usuários atualizados`);
}

// ✅ DELETE - Deletar usuário
async function deletarUsuario() {
  const usuario = await prisma.usuario.delete({
    where: { id: 1 }
  });

  // Deletar múltiplos
  const result = await prisma.usuario.deleteMany({
    where: { ativo: false }
  });
}
```

### Relacionamentos

```javascript
const prisma = new PrismaClient();

// ✅ Criar usuário com contas
const usuario = await prisma.usuario.create({
  data: {
    email: 'joao@example.com',
    nome: 'João',
    senha: 'senha',
    contas: {
      create: [
        { nome: 'Conta Corrente', tipo: 'corrente', saldo: 1000 },
        { nome: 'Poupança', tipo: 'poupança', saldo: 5000 }
      ]
    }
  },
  include: { contas: true } // Incluir dados relacionados
});

// ✅ Buscar usuário com relacionamentos
const usuarioComContas = await prisma.usuario.findUnique({
  where: { id: 1 },
  include: {
    contas: {
      where: { tipo: 'corrente' },
      take: 5
    },
    transacoes: true
  }
});

// ✅ Buscar contas com usuário e transações
const contas = await prisma.conta.findMany({
  include: {
    usuario: true,
    transacoes: {
      where: { tipo: 'despesa' },
      orderBy: { data: 'desc' }
    }
  }
});

// ✅ Transações aggregadas
const stats = await prisma.transacao.aggregate({
  where: { usuarioId: 1, tipo: 'despesa' },
  _sum: { valor: true },
  _avg: { valor: true },
  _count: true
});
console.log(`Total gasto: ${stats._sum.valor}`);
console.log(`Ticket médio: ${stats._avg.valor}`);
```

### Transações Database

```javascript
const prisma = new PrismaClient();

// ❌ PERIGOSO: Operações não-atômicas
async function transferirMalFeita(contaOrigemId, contaDestinoId, valor) {
  // Se server cair aqui, dinheiro desaparece!
  await prisma.conta.update({
    where: { id: contaOrigemId },
    data: { saldo: { decrement: valor } }
  });
  // ...
  await prisma.conta.update({
    where: { id: contaDestinoId },
    data: { saldo: { increment: valor } }
  });
}

// ✅ CORRETO: Usar transação
async function transferir(contaOrigemId, contaDestinoId, valor) {
  try {
    await prisma.$transaction(async (tx) => {
      // Ambas operações acontecem atomicamente
      // Ou ambas falham, ou ambas succedem

      const contaOrigem = await tx.conta.update({
        where: { id: contaOrigemId },
        data: { saldo: { decrement: valor } }
      });

      if (contaOrigem.saldo < 0) {
        throw new Error('Saldo insuficiente');
      }

      await tx.conta.update({
        where: { id: contaDestinoId },
        data: { saldo: { increment: valor } }
      });
    });
  } catch (erro) {
    // Tudo é revertido automaticamente
    console.error('Transferência falhou:', erro);
  }
}
```

### Queries Avançadas

```javascript
const prisma = new PrismaClient();

// ✅ Raw SQL quando necessário
const usuarios = await prisma.$queryRaw`
  SELECT * FROM "Usuario"
  WHERE "ativo" = true
  LIMIT 10
`;

// ✅ Filters complexos
const transacoes = await prisma.transacao.findMany({
  where: {
    AND: [
      { usuarioId: 1 },
      { OR: [
        { tipo: 'despesa' },
        { tipo: 'receita' }
      ]},
      { valor: { gte: 100 } }, // Maior ou igual
      { data: { gte: new Date('2025-01-01') } }
    ]
  }
});

// ✅ Distinct
const categoriasUsadas = await prisma.transacao.findMany({
  where: { usuarioId: 1 },
  distinct: ['categoria'],
  select: { categoria: true }
});

// ✅ Group By com count
const despesasPorCategoria = await prisma.transacao.groupBy({
  by: ['categoria'],
  where: { usuarioId: 1, tipo: 'despesa' },
  _sum: { valor: true },
  _count: true,
  orderBy: { _sum: { valor: 'desc' } }
});
```

---

## Variáveis de Ambiente

### Por que usar?

- **Segurança**: Não commitir secrets no Git
- **Flexibilidade**: Mudar config sem alterar código
- **Portabilidade**: Mesmo código em dev/prod

### Setup

```bash
# Instalar dotenv
npm install dotenv
```

```env
# .env (NUNCA fazer commit!)
DATABASE_URL=postgresql://user:password@localhost:5432/fintrack
JWT_SECRET=sua_chave_super_secreta_aqui
PORT=3000
NODE_ENV=development
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

```javascript
// app.js - Carregar variáveis
require('dotenv').config(); // ⚠️ SEMPRE no início

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`Rodando em ${NODE_ENV}`);

// Verificar variáveis obrigatórias
const variavelisObrigatorias = ['DATABASE_URL', 'JWT_SECRET'];
variavelisObrigatorias.forEach(varivel => {
  if (!process.env[varivel]) {
    throw new Error(`Variável ${varivel} não definida em .env`);
  }
});

app.listen(PORT);
```

```
# .gitignore
.env
.env.local
.env.*.local
```

### Ambiente de Produção

```env
# .env.production
DATABASE_URL=postgresql://prod_user:prod_pass@prod-server:5432/fintrack_prod
JWT_SECRET=chave_secreta_muito_segura_com_256_bits_ou_mais
PORT=8080
NODE_ENV=production
API_URL=https://api.fintrack.com
FRONTEND_URL=https://fintrack.com
LOG_LEVEL=warn
```

---

## Estrutura de Projetos Backend

### Estrutura Recomendada

```
fintrack-backend/
├── src/
│   ├── controllers/       # Lógica das rotas
│   │   ├── usuarioController.js
│   │   ├── contaController.js
│   │   └── transacaoController.js
│   ├── routes/           # Definição de rotas
│   │   ├── usuarioRoutes.js
│   │   ├── contaRoutes.js
│   │   └── transacaoRoutes.js
│   ├── middleware/       # Middlewares customizados
│   │   ├── autenticacao.js
│   │   ├── validacao.js
│   │   └── erros.js
│   ├── services/         # Lógica de negócio
│   │   ├── usuarioService.js
│   │   ├── contaService.js
│   │   └── transacaoService.js
│   ├── schemas/          # Schemas Zod
│   │   └── validacoes.js
│   ├── utils/            # Utilitários
│   │   ├── jwt.js
│   │   └── hash.js
│   ├── config/           # Configuração
│   │   └── database.js
│   └── app.js            # Configuração Express
├── prisma/
│   └── schema.prisma     # Schema banco de dados
├── tests/                # Testes
│   ├── unit/
│   └── integration/
├── .env                  # Variáveis (não commit)
├── .env.example          # Template .env
├── .gitignore
├── package.json
└── README.md
```

### Exemplo de Estrutura em Ação

```javascript
// src/app.js - Aplicação Express
const express = require('express');
const cors = require('cors');
const usuarioRoutes = require('./routes/usuarioRoutes');
const contaRoutes = require('./routes/contaRoutes');
const { erroHandler } = require('./middleware/erros');

const app = express();

// Middleware global
app.use(express.json());
app.use(cors());

// Rotas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/contas', contaRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Tratamento de erros (por último!)
app.use(erroHandler);

module.exports = app;
```

```javascript
// src/routes/usuarioRoutes.js
const express = require('express');
const { verificarAutenticacao } = require('../middleware/autenticacao');
const usuarioController = require('../controllers/usuarioController');

const router = express.Router();

router.post('/registro', usuarioController.registro);
router.post('/login', usuarioController.login);
router.get('/:id', verificarAutenticacao, usuarioController.obter);
router.put('/:id', verificarAutenticacao, usuarioController.atualizar);

module.exports = router;
```

```javascript
// src/controllers/usuarioController.js
const usuarioService = require('../services/usuarioService');

const usuarioController = {
  async registro(req, res, next) {
    try {
      const usuario = await usuarioService.criar(req.body);
      res.status(201).json(usuario);
    } catch (erro) {
      next(erro); // Passa ao middleware de erro
    }
  },

  async login(req, res, next) {
    try {
      const { token, usuario } = await usuarioService.login(
        req.body.email,
        req.body.senha
      );
      res.json({ token, usuario });
    } catch (erro) {
      next(erro);
    }
  }
};

module.exports = usuarioController;
```

```javascript
// src/services/usuarioService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const usuarioService = {
  async criar(dados) {
    // Validação já feita em middleware
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: dados.email }
    });

    if (usuarioExistente) {
      throw new Error('Email já cadastrado');
    }

    const usuario = await prisma.usuario.create({
      data: {
        email: dados.email,
        nome: dados.nome,
        senha: dados.senha // Hash em produção!
      },
      select: { id: true, email: true, nome: true }
    });

    return usuario;
  },

  async login(email, senha) {
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario || usuario.senha !== senha) {
      throw new Error('Email ou senha incorretos');
    }

    // Gerar JWT em produção
    const token = 'jwt_token_aqui';

    return {
      token,
      usuario: { id: usuario.id, email: usuario.email }
    };
  }
};

module.exports = usuarioService;
```

---

## Checklist de Conhecimentos

- [ ] Express.js routing (GET, POST, PUT, PATCH, DELETE)
- [ ] Entender ciclo de requisição/resposta
- [ ] Middleware global vs específico
- [ ] Validação com Zod antes de salvar dados
- [ ] Prisma schema e migrations
- [ ] CRUD completo com Prisma
- [ ] Relacionamentos 1:N e N:N
- [ ] Transações para operações críticas
- [ ] Variáveis de ambiente (.env)
- [ ] Estrutura de projeto escalável
- [ ] Tratamento de erros com try/catch
- [ ] Diferença entre params, query, body

---

## Próximo Módulo

Agora que você domina o backend com Node.js, explore **Módulo 4: React e Desenvolvimento Frontend** para entender como consumir essas APIs e construir interfaces.
