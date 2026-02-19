# Módulo 10: Documentação

## Objetivos deste Módulo

- Escrever READMEs efetivos
- Documentar APIs com Swagger/OpenAPI
- Code documentation com JSDoc/TSDoc
- Criar diagramas (arquitetura, ER, sequence)
- Manter changelog
- Documentar decisões de arquitetura
- Gerar docs automaticamente

## Índice

1. [README Efetivo](#readme-efetivo)
2. [Swagger/OpenAPI](#swaggeropenapi)
3. [JSDoc e TSDoc](#jsdoc-e-tsdoc)
4. [Diagramas](#diagramas)
5. [Changelog](#changelog)
6. [Architecture Decision Records](#architecture-decision-records)
7. [Geração Automática](#geração-automática)
8. [Checklist de Conhecimentos](#checklist-de-conhecimentos)

---

## README Efetivo

### Estrutura Recomendada

```markdown
# FinTrack - Gerenciador de Finanças Pessoais

> Aplicação completa para gerenciar receitas, despesas e visualizar análises financeiras.

## 📋 Sumário

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Quick Start](#quick-start)
- [Documentação](#documentação)
- [Contributing](#contributing)
- [License](#license)

## ⚡ Características

- ✅ Gerenciamento de múltiplas contas bancárias
- ✅ Registro de receitas e despesas categorizadas
- ✅ Análises e relatórios de gastos
- ✅ Autenticação segura com JWT
- ✅ APIs RESTful bem documentadas
- ✅ Deploy automático com GitHub Actions

## 🛠 Stack Tecnológico

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Testing**: Jest + Supertest

### Frontend
- **Library**: React 18+
- **Router**: React Router v6
- **Forms**: React Hook Form + Zod
- **State**: Zustand
- **UI**: CSS/Tailwind
- **Testing**: Playwright

### DevOps
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Cloud**: Railway, Vercel, Neon
- **Monitoring**: Sentry
- **Logging**: Winston

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Docker (opcional)

### Instalação

#### Opção 1: Local

\`\`\`bash
# Clone repositório
git clone https://github.com/user/fintrack.git
cd fintrack

# Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev

# Frontend (em outro terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
\`\`\`

#### Opção 2: Docker Compose

\`\`\`bash
git clone https://github.com/user/fintrack.git
cd fintrack

docker-compose up

# Backend: http://localhost:3000
# Frontend: http://localhost:3001
# PgAdmin: http://localhost:5050
\`\`\`

### Verificar Instalação

\`\`\`bash
# Terminal 1: Backend
cd backend
npm run dev
# Deve iniciar em http://localhost:3000

# Terminal 2: Frontend
cd frontend
npm run dev
# Deve abrir em http://localhost:3001

# Terminal 3: Testes
cd backend
npm test

# Deve rodar todos os testes com sucesso
\`\`\`

## 📚 Documentação

### APIs
- [API Reference](./docs/api.md) - Endpoints e exemplos
- [Swagger/OpenAPI](http://localhost:3000/api-docs) - Docs interativa
- [Postman Collection](./docs/postman.json) - Para testar

### Guias
- [Setup Desenvolvimento](./docs/setup-dev.md)
- [Arquitetura](./docs/arquitetura.md)
- [Padrões de Código](./docs/padroes.md)
- [Testing Guide](./docs/testing.md)
- [Deployment Guide](./docs/deployment.md)

### Conceitos
- [Módulo 3: Node.js Backend](./docs/conceitos/modulo-03-nodejs-backend.md)
- [Módulo 4: React Frontend](./docs/conceitos/modulo-04-react-frontend.md)
- [Módulo 5: SQL Database](./docs/conceitos/modulo-05-sql-banco-dados.md)

## 🏗 Arquitetura

```
┌─────────────────────────────┐
│    Frontend (React)         │
│    Port: 3001               │
└────────────┬────────────────┘
             │ HTTP/REST
┌────────────▼────────────────┐
│   Backend (Express.js)      │
│   Port: 3000                │
│   - Controllers             │
│   - Services                │
│   - Repositories            │
└────────────┬────────────────┘
             │ SQL
┌────────────▼────────────────┐
│   PostgreSQL                │
│   Port: 5432                │
│   (Neon cloud)              │
└─────────────────────────────┘
```

## 📊 Estrutura de Diretórios

\`\`\`
fintrack/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── config/
│   │   └── app.js
│   ├── tests/
│   ├── prisma/
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── docs/
│   ├── conceitos/        # Módulos técnicos
│   ├── api.md           # Documentação API
│   ├── arquitetura.md
│   └── deployment.md
│
└── .github/
    └── workflows/
        ├── tests.yml
        └── deploy.yml
\`\`\`

## 🔐 Variáveis de Ambiente

### Backend

\`\`\`env
# .env.example
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fintrack

# JWT
JWT_SECRET=sua_chave_super_secreta
JWT_REFRESH_SECRET=sua_chave_refresh_secreta

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@email.com
SMTP_PASS=sua_senha

# Sentry
SENTRY_DSN=https://...

# Redis
REDIS_URL=redis://localhost:6379
\`\`\`

### Frontend

\`\`\`env
# .env.example
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=FinTrack
\`\`\`

## 🧪 Testes

\`\`\`bash
# Backend
cd backend

# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
\`\`\`

## 🚢 Deploy

### Development

\`\`\`bash
# Local
npm run dev

# Docker
docker-compose up
\`\`\`

### Production

\`\`\`bash
# Via Railway (automático)
git push  # GitHub Actions rodam testes
          # Se passar, deploy automático para Railway

# Via Vercel (Frontend)
vercel deploy --prod
\`\`\`

[Ver guia completo de deployment](./docs/deployment.md)

## 🤝 Contributing

Contribuições são bem-vindas! Por favor:

1. Faça fork do repositório
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

[Ver CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes.

## 📝 License

Distribuído sob a licença MIT. Ver [LICENSE](./LICENSE) para mais informações.

## 👥 Autores

- **Seu Nome** - [GitHub](https://github.com/seu-user)

## 📞 Suporte

- 📧 Email: support@fintrack.com
- 🐛 Issues: [GitHub Issues](https://github.com/user/fintrack/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/user/fintrack/discussions)
\`\`\`

---

## Swagger/OpenAPI

### Setup

```bash
npm install swagger-jsdoc swagger-ui-express
```

### Configuração

```javascript
// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FinTrack API',
      version: '1.0.0',
      description: 'API para gerenciamento de finanças pessoais',
      contact: {
        name: 'FinTrack Support',
        email: 'support@fintrack.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de desenvolvimento'
      },
      {
        url: 'https://api.fintrack.com/api',
        description: 'Servidor de produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const specs = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  app.get('/api-docs.json', (req, res) => {
    res.json(specs);
  });
}

module.exports = setupSwagger;

// src/app.js
const setupSwagger = require('./config/swagger');
const app = require('express')();

setupSwagger(app);

app.listen(3000);
// Acessar: http://localhost:3000/api-docs
```

### Documentar Endpoints

```javascript
// src/routes/transacoes.js
/**
 * @swagger
 * /transacoes:
 *   get:
 *     summary: Listar transações
 *     description: Retorna lista de transações do usuário autenticado
 *     tags:
 *       - Transações
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: ['receita', 'despesa']
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de transações
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transacao'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Não autenticado
 */
router.get('/transacoes', verificarAutenticacao, async (req, res) => {
  // ...
});

/**
 * @swagger
 * /transacoes:
 *   post:
 *     summary: Criar transação
 *     tags:
 *       - Transações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarTransacao'
 *     responses:
 *       201:
 *         description: Transação criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transacao'
 */
router.post('/transacoes', verificarAutenticacao, async (req, res) => {
  // ...
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Transacao:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         tipo:
 *           type: string
 *           enum: ['receita', 'despesa']
 *         valor:
 *           type: number
 *           format: double
 *         categoria:
 *           type: string
 *         descricao:
 *           type: string
 *         data:
 *           type: string
 *           format: date-time
 *         criadoEm:
 *           type: string
 *           format: date-time
 *     CriarTransacao:
 *       type: object
 *       required:
 *         - tipo
 *         - valor
 *         - categoria
 *         - data
 *         - contaId
 *       properties:
 *         tipo:
 *           type: string
 *           enum: ['receita', 'despesa']
 *         valor:
 *           type: number
 *         categoria:
 *           type: string
 *         descricao:
 *           type: string
 *         data:
 *           type: string
 *           format: date
 *         contaId:
 *           type: integer
 */
```

---

## JSDoc e TSDoc

### Documentar Funções

```javascript
/**
 * Calcula o saldo total de um usuário.
 *
 * @param {number} usuarioId - ID do usuário
 * @param {Date} [dataFim] - Data final (opcional, padrão: hoje)
 * @returns {Promise<number>} Saldo total em reais
 * @throws {Error} Se usuário não encontrado
 *
 * @example
 * const saldo = await calcularSaldo(1);
 * console.log(saldo); // 1500.50
 *
 * @author João Silva
 * @version 1.0.0
 */
async function calcularSaldo(usuarioId, dataFim = new Date()) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId }
  });

  if (!usuario) {
    throw new Error('Usuário não encontrado');
  }

  const transacoes = await prisma.transacao.findMany({
    where: {
      usuarioId,
      data: { lte: dataFim }
    }
  });

  return transacoes.reduce((total, t) => {
    return total + (t.tipo === 'receita' ? t.valor : -t.valor);
  }, 0);
}
```

### Documentar Classes

```javascript
/**
 * Serviço para gerenciar transações financeiras.
 *
 * @class TransacaoService
 */
class TransacaoService {
  /**
   * Cria instância do serviço.
   *
   * @param {TransacaoRepository} repository - Repositório de transações
   * @param {NotificacaoService} notificacao - Serviço de notificação
   */
  constructor(repository, notificacao) {
    this.repository = repository;
    this.notificacao = notificacao;
  }

  /**
   * Cria uma nova transação.
   *
   * @async
   * @param {Object} dados - Dados da transação
   * @param {string} dados.tipo - Tipo: 'receita' ou 'despesa'
   * @param {number} dados.valor - Valor em reais
   * @param {string} dados.categoria - Categoria
   * @returns {Promise<Transacao>} Transação criada
   *
   * @throws {ValidationError} Se dados inválidos
   * @throws {InsufficientFundsError} Se saldo insuficiente
   */
  async criar(dados) {
    // implementação
  }
}
```

### TypeScript JSDoc

```typescript
/**
 * Busca usuários por critérios.
 *
 * @template T - Tipo genérico
 * @param {T} criterios - Critérios de busca
 * @param {string} criterios.email - Email do usuário
 * @param {boolean} [criterios.ativo] - Apenas usuários ativos
 * @returns {Promise<Usuario[]>} Usuários encontrados
 */
async function buscarUsuarios<T extends BuscaUsuario>(
  criterios: T
): Promise<Usuario[]> {
  // implementação
}
```

---

## Diagramas

### Diagrama de Arquitetura (Mermaid)

```mermaid
graph TB
    subgraph Frontend["Frontend (React)"]
        Pages["📄 Pages"]
        Components["🧩 Components"]
        Hooks["🪝 Custom Hooks"]
        Store["📦 Zustand Store"]
    end

    subgraph API["Backend (Node.js/Express)"]
        Controllers["🎮 Controllers"]
        Services["⚙️ Services"]
        Repositories["📚 Repositories"]
        Middlewares["🔧 Middlewares"]
    end

    subgraph Database["Data Layer"]
        PostgreSQL["🗄️ PostgreSQL"]
        Cache["⚡ Redis Cache"]
    end

    Frontend -->|HTTP/REST| API
    API -->|Queries/Commands| Repositories
    Repositories -->|SQL| PostgreSQL
    Repositories -->|Cache| Cache
    Controllers -->|Logic| Services
    Services -->|Data| Repositories
    Pages -->|UI| Components
    Components -->|State| Hooks
    Hooks -->|Global State| Store
    Store -->|API Calls| Controllers
```

### Diagrama ER (Entity Relationship)

```mermaid
erDiagram
    USUARIO ||--o{ CONTA : tem
    USUARIO ||--o{ TRANSACAO : realiza
    CONTA ||--o{ TRANSACAO : contem

    USUARIO {
        int id PK
        string email UK
        string nome
        string senha_hash
        boolean ativo
        timestamp criado_em
    }

    CONTA {
        int id PK
        int usuario_id FK
        string nome
        decimal saldo
        string tipo
        timestamp criado_em
    }

    TRANSACAO {
        int id PK
        int usuario_id FK
        int conta_id FK
        string tipo
        string categoria
        decimal valor
        date data
        string descricao
        timestamp criado_em
    }
```

### Diagrama de Sequência

```mermaid
sequenceDiagram
    participant User as 👤 Usuário
    participant Frontend as 💻 Frontend
    participant Backend as 🔧 Backend
    participant DB as 🗄️ Banco

    User ->> Frontend: Clica em "Criar Transação"
    Frontend ->> Frontend: Abre formulário
    User ->> Frontend: Preenche dados
    User ->> Frontend: Clica "Salvar"
    Frontend ->> Frontend: Valida com Zod
    Frontend ->> Backend: POST /api/transacoes
    Backend ->> Backend: Autenticação JWT
    Backend ->> Backend: Validação
    Backend ->> DB: Query conta
    DB -->> Backend: Retorna conta
    Backend ->> DB: Insert transação
    DB -->> Backend: Transação criada
    Backend ->> Backend: Enviar notificação
    Backend -->> Frontend: 201 Criado
    Frontend ->> Frontend: Atualiza estado
    Frontend ->> User: Mostra mensagem sucesso
```

---

## Changelog

```markdown
# Changelog

Todos os mudanças notáveis deste projeto estão documentadas neste arquivo.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/),
e este projeto segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.2.0] - 2025-02-19

### Added
- Novo recurso de análises mensais
- Exportar transações em CSV
- Temas claro/escuro na interface

### Changed
- Melhorado algoritmo de categorização automática
- Interface de login redesenhada
- Documentação API atualizada

### Fixed
- Correção bug cálculo de saldo negativo
- Problema com timezone em diferentes regiões
- Validação de duplicação de transações

### Security
- Atualizada versão do Prisma
- Novo rate limiting em endpoints sensíveis

## [1.1.0] - 2025-01-15

### Added
- Autenticação com JWT
- Refresh tokens
- Rate limiting por IP

### Changed
- Migração para PostgreSQL
- Nova estrutura de pastas

### Fixed
- Problemas com concorrência em transações

## [1.0.0] - 2024-12-01

### Added
- Release inicial
- CRUD de transações
- Gerenciamento de contas
- Autenticação básica
```

---

## Architecture Decision Records

```markdown
# ADR 001: Usar Zustand em vez de Redux

## Status
Aceito

## Contexto
Precisávamos de state management para o frontend React com muitas derivações de estado.
Consideramos Redux, Context API e Zustand.

## Decisão
Escolhemos Zustand porque:
- Menos boilerplate que Redux
- Performance melhor que Context API
- Bundle size menor (~3KB)
- DevTools integrado
- Suporte nativo a middleware

## Consequências

### Positivas
- Código mais limpo e legível
- Melhor performance
- Fácil integração com testes
- Suporta derivações naturalmente

### Negativas
- Menos comunidade que Redux
- Menos ferramentas/plugins
- DevTools experiência diferente

## Referências
- https://github.com/pmndrs/zustand
- Comparação: https://github.com/pmndrs/zustand/discussions/1088
```

---

## Geração Automática

### Generate Docs Script

```bash
# package.json
{
  "scripts": {
    "docs:generate": "npm run docs:swagger && npm run docs:jsdoc",
    "docs:swagger": "swagger-jsdoc -d swaggerOptions.js src/**/*.js > docs/swagger.json",
    "docs:jsdoc": "jsdoc -c jsdoc.json -d docs/jsdoc src/"
  }
}
```

### JSDoc Config

```json
// jsdoc.json
{
  "source": {
    "include": ["src"],
    "excludePattern": "node_modules"
  },
  "opts": {
    "destination": "./docs/jsdoc",
    "template": "./node_modules/better-docs",
    "readme": "./README.md"
  },
  "plugins": [
    "plugins/markdown"
  ]
}
```

---

## Checklist de Conhecimentos

- [ ] README completo e bem estruturado
- [ ] Quick start funcionando
- [ ] Swagger/OpenAPI documentado
- [ ] JSDoc em funções importantes
- [ ] TypeScript + TSDoc
- [ ] Diagramas arquitetura (Mermaid)
- [ ] Diagrama ER
- [ ] Changelog mantido
- [ ] ADRs para decisões importantes
- [ ] Geração automática de docs
- [ ] Docs em múltiplos idiomas (opcional)
- [ ] API examples (Postman/Insomnia)
- [ ] Troubleshooting guide
- [ ] FAQ

---

## Conclusão

Você agora domina todos os 10 módulos técnicos necessários para construir aplicações profissionais e escaláveis!

**Próximos Passos:**
1. ✅ Aplicar tudo em um projeto real
2. ✅ Continuar aprendendo e atualizando
3. ✅ Contribuir para open source
4. ✅ Ensinar outros sobre estes conceitos
5. ✅ Manter documentação atualizada

**Resumo do que foi aprendido:**
- Módulo 3: Backend com Node.js e Express
- Módulo 4: Frontend com React e Hooks
- Módulo 5: Banco de dados com SQL
- Módulo 6: Arquitetura e Design Patterns
- Módulo 7: Segurança web
- Módulo 8: Testes (Unit, Integration, E2E)
- Módulo 9: DevOps e Deployment
- Módulo 10: Documentação

🎉 **Parabéns! Você é agora um Full Stack Developer preparado para construir aplicações profissionais!**
