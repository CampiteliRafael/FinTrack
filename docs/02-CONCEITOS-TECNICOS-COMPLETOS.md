# 📘 DOCUMENTO 2: CONCEITOS TÉCNICOS COMPLETOS

## 📚 VISÃO GERAL

Este documento serve como **índice central** para todos os conceitos técnicos do projeto FinTrack. Cada módulo está disponível como um arquivo separado na pasta `conceitos/` com explicações detalhadas, código comentado e exemplos práticos.

**Total**: 10 módulos | ~300 páginas | 150+ conceitos

---

## 🎯 COMO USAR ESTE DOCUMENTO

1. **Para Estudo**: Leia os módulos em ordem sequencial (1 → 10)
2. **Para Referência**: Use o índice abaixo para encontrar conceitos específicos
3. **Durante Desenvolvimento**: Consulte o módulo relevante conforme necessário
4. **Para Aprofundamento**: Cada módulo tem 30-50 páginas de conteúdo detalhado

---

## 📑 ÍNDICE DE MÓDULOS

### 📗 Módulo 1: JavaScript e TypeScript
**📄 Arquivo**: [`conceitos/modulo-01-javascript-typescript.md`](./conceitos/modulo-01-javascript-typescript.md)

**Conteúdo** (~43 KB):
- ⚡ Event Loop e Assincronia (como evitar bloquear o servidor)
- 🔒 Closures e Escopo (factory functions, private data)
- 🎯 This Binding (arrow functions vs regular functions)
- 🎁 Promises e Async/Await (parallel vs sequential execution)
- 🔧 TypeScript Generics (type-safe reusable components)
- 🛠️ Utility Types (Partial, Omit, Pick, Record, ReturnType)
- 🔍 Type Guards (runtime type checking)
- 🎭 Discriminated Unions (modeling states)
- 📦 Módulos ES6 (import/export, barrel exports)

**Por que é importante**: Fundamento para todo código TypeScript/JavaScript no projeto.

---

### 📗 Módulo 2: HTTP e Web
**📄 Arquivo**: [`conceitos/modulo-02-http-web.md`](./conceitos/modulo-02-http-web.md)

**Conteúdo** (~25 KB):
- 🌐 Protocolo HTTP (request/response anatomy)
- 🔧 Métodos HTTP (GET, POST, PUT, PATCH, DELETE)
- 📊 Status Codes (2xx, 4xx, 5xx e quando usar cada um)
- 📋 Headers (Authorization, Content-Type, CORS headers)
- 🔐 CORS Detalhado (preflight, configuration, security)
- 🍪 Cookies vs LocalStorage vs SessionStorage (security implications)
- 📄 Content Negotiation (Accept headers)
- ⚡ HTTP/2 vs HTTP/1.1 (multiplexing, performance)

**Por que é importante**: Entender comunicação client-server para APIs RESTful.

---

### 📗 Módulo 3: Node.js e Backend
**📄 Arquivo**: [`conceitos/modulo-03-nodejs-backend.md`](./conceitos/modulo-03-nodejs-backend.md)

**Conteúdo** (~33 KB):
- 🚀 Express.js Completo (routing, middleware stack, error handling)
- 🔄 Request/Response Cycle (como Express processa requisições)
- 🎯 Middleware Patterns (authentication, validation, logging)
- ✅ Validação com Zod (schema validation, error messages)
- 🗄️ Prisma ORM (queries, relations, transactions, migrations)
- 🔑 Environment Variables (dotenv, type-safe config)
- 📁 Estrutura de Projeto (layered architecture, separation of concerns)

**Por que é importante**: Stack backend do FinTrack.

**Aplicação no FinTrack**:
- API REST completa
- Autenticação JWT
- CRUD de transações, contas, categorias
- Middleware de autenticação e validação

---

### 📗 Módulo 4: React e Frontend
**📄 Arquivo**: [`conceitos/modulo-04-react-frontend.md`](./conceitos/modulo-04-react-frontend.md)

**Conteúdo** (~35 KB):
- ⚛️ React Fundamentos (components, JSX, virtual DOM)
- 🎣 TODOS os Hooks:
  - useState (state management)
  - useEffect (side effects, cleanup)
  - useContext (global state)
  - useReducer (complex state logic)
  - useMemo (expensive computations)
  - useCallback (function memoization)
  - useRef (DOM access, persistent values)
  - useImperativeHandle (custom ref handles)
  - useLayoutEffect (synchronous effects)
  - useDebugValue (dev tools)
- 🔧 Custom Hooks (reusable logic, useAuth, useFetch)
- 🛣️ React Router v6 (routing, protected routes, nested routes)
- 📝 Forms (React Hook Form + Zod validation)
- 🌍 Estado Global (Context API vs Zustand)
- ⚡ Performance (React.memo, lazy loading, code splitting)
- 🎨 Design Patterns (Container/Presentational, Compound Components)

**Por que é importante**: Stack frontend do FinTrack.

**Aplicação no FinTrack**:
- Dashboard interativo
- Formulários de transação
- Autenticação e rotas protegidas
- Estado global do usuário
- Performance otimizada

---

### 📗 Módulo 5: SQL e Banco de Dados
**📄 Arquivo**: [`conceitos/modulo-05-sql-banco-dados.md`](./conceitos/modulo-05-sql-banco-dados.md)

**Conteúdo** (~29 KB):
- 📊 SQL Básico Completo (SELECT, INSERT, UPDATE, DELETE)
- 🔗 Joins Detalhados:
  - INNER JOIN (intersecção)
  - LEFT JOIN (todos da esquerda + matches)
  - RIGHT JOIN (todos da direita + matches)
  - FULL OUTER JOIN (todos de ambos)
- 📈 Aggregations (COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING)
- 🎯 Subqueries (scalar, row, table subqueries)
- 🚀 Indexes (B-tree, composite indexes, EXPLAIN ANALYZE)
- 🔒 Transactions e ACID (atomicity, consistency, isolation, durability)
- ⚡ Query Optimization (analyze plans, avoid N+1 problem)
- 📄 Paginação (offset-based vs cursor-based)

**Por que é importante**: Database design e query performance no FinTrack.

**Aplicação no FinTrack**:
- Queries otimizadas de transações
- Agregações de dashboard (saldos, totais)
- Joins entre transações, contas, categorias
- Índices para performance
- Transações atômicas

---

### 📗 Módulo 6: Arquitetura e Design Patterns
**📄 Arquivo**: [`conceitos/modulo-06-arquitetura-patterns.md`](./conceitos/modulo-06-arquitetura-patterns.md)

**Conteúdo** (~32 KB):
- 🏛️ Layered Architecture (Presentation, Application, Domain, Infrastructure)
- 🧹 Clean Architecture (dependency rule, use cases, entities)
- 💎 SOLID Principles:
  - S: Single Responsibility
  - O: Open/Closed
  - L: Liskov Substitution
  - I: Interface Segregation
  - D: Dependency Inversion
- 🎨 Design Patterns:
  - Repository Pattern (data access abstraction)
  - Factory Pattern (object creation)
  - Strategy Pattern (interchangeable algorithms)
  - Observer Pattern (event notification)
  - Dependency Injection (decoupling)
  - Singleton Pattern (single instance)
  - Builder Pattern (complex object construction)
- 📚 Domain-Driven Design Básico (entities, value objects, aggregates)
- 🔧 Separation of Concerns (cohesion, coupling)

**Por que é importante**: Manutenibilidade e escalabilidade do código (Fase 2 do FinTrack).

**Aplicação no FinTrack**:
- Refatoração para Clean Architecture (Semanas 7-8)
- Repository pattern para acesso ao banco
- Use cases para lógica de negócio
- Dependency Injection para testabilidade

---

### 📗 Módulo 7: Segurança
**📄 Arquivo**: [`conceitos/modulo-07-seguranca.md`](./conceitos/modulo-07-seguranca.md)

**Conteúdo** (~26 KB):
- 🛡️ OWASP Top 10 Detalhado:
  1. Broken Access Control
  2. Cryptographic Failures
  3. Injection (SQL, XSS, Command)
  4. Insecure Design
  5. Security Misconfiguration
  6. Vulnerable Components
  7. Identification and Authentication Failures
  8. Software and Data Integrity Failures
  9. Security Logging Failures
  10. Server-Side Request Forgery (SSRF)
- 🔐 Autenticação Avançada:
  - JWT (access tokens, claims, signing)
  - Refresh Tokens (rotation strategy, blacklist)
  - Token expiration e refresh flow
- 🔒 Password Hashing (bcrypt, salt, pepper, cost factor)
- ⏱️ Rate Limiting (per-IP, per-user, sliding window)
- 🧹 Input Sanitization (SQL injection, XSS prevention)
- 🔧 CORS Seguro (whitelist, credentials, preflight)
- 🛡️ Security Headers (Helmet.js: CSP, HSTS, X-Frame-Options)
- 🔐 HTTPS e TLS (certificates, HTTPS enforcement)

**Por que é importante**: Proteger dados financeiros sensíveis (Fase 2 do FinTrack).

**Aplicação no FinTrack**:
- JWT authentication com refresh tokens (Semanas 5-6)
- Rate limiting em endpoints de autenticação
- Password hashing com bcrypt
- CORS configurado corretamente
- Helmet.js para security headers

---

### 📗 Módulo 8: Testes
**📄 Arquivo**: [`conceitos/modulo-08-testes.md`](./conceitos/modulo-08-testes.md)

**Conteúdo** (~23 KB):
- 🔺 Pirâmide de Testes (70% unit, 20% integration, 10% E2E)
- 🧪 Unit Tests com Jest:
  - Test structure (describe, it, expect)
  - Matchers (toBe, toEqual, toHaveProperty)
  - Mocks (jest.fn, jest.spyOn)
  - Stubs e Spies
  - Code coverage (80%+ target)
  - Snapshot testing
- 🔗 Integration Tests com Supertest:
  - API endpoint testing
  - Database integration
  - Authentication flow testing
- 🎭 E2E Tests com Playwright:
  - Page Object Model
  - User flow testing
  - Visual regression testing
- 🔴🟢♻️ TDD (Test-Driven Development):
  - Red: Write failing test
  - Green: Make it pass
  - Refactor: Clean up code
- 📋 Test Patterns (AAA: Arrange-Act-Assert, Given-When-Then)

**Por que é importante**: Quality assurance e confidence in refactoring (Fase 3 do FinTrack).

**Aplicação no FinTrack**:
- Unit tests para services e repositories (Semana 13-14)
- Integration tests para API endpoints
- E2E tests para user flows críticos
- 80%+ code coverage

---

### 📗 Módulo 9: DevOps e Deploy
**📄 Arquivo**: [`conceitos/modulo-09-devops-deploy.md`](./conceitos/modulo-09-devops-deploy.md)

**Conteúdo** (~17 KB):
- 🐳 Docker Completo:
  - Dockerfile (multi-stage builds, layer caching)
  - docker-compose (multi-container apps)
  - Best practices (small images, security)
- 🔄 CI/CD com GitHub Actions:
  - Workflows (push, pull request triggers)
  - Jobs e steps
  - Automated testing
  - Build e deploy automation
  - Environment secrets
- ☁️ Deploy em Cloud:
  - Railway (backend + PostgreSQL)
  - Vercel (frontend SPA)
  - Neon (managed PostgreSQL)
- 📝 Logging Estruturado:
  - Winston (levels, transports, formats)
  - Structured logs (JSON)
  - Log aggregation
- 📊 Monitoramento:
  - Sentry (error tracking, alerts)
  - Health checks (liveness, readiness)
  - Better Uptime (uptime monitoring)

**Por que é importante**: Production deployment e operational excellence (Fase 4 do FinTrack).

**Aplicação no FinTrack**:
- Docker containers para local development (Semanas 15-16)
- GitHub Actions CI/CD pipeline
- Railway deployment (backend)
- Vercel deployment (frontend)
- Winston logging + Sentry monitoring (Semanas 17-18)

---

### 📗 Módulo 10: Documentação
**📄 Arquivo**: [`conceitos/modulo-10-documentacao.md`](./conceitos/modulo-10-documentacao.md)

**Conteúdo** (~21 KB):
- 📄 README Efetivo:
  - Project overview
  - Installation instructions
  - Usage examples
  - Contributing guidelines
  - License
- 📚 Swagger/OpenAPI:
  - API documentation
  - Schema definitions
  - Interactive API explorer
  - Request/response examples
- 💬 JSDoc/TSDoc:
  - Function documentation
  - Type annotations
  - Examples in comments
  - Generating docs
- 📊 Diagramas:
  - Architecture diagrams (C4 model)
  - ER diagrams (database schema)
  - Sequence diagrams (user flows)
  - Flowcharts (business logic)
  - Mermaid syntax
- 📝 Changelog:
  - Semantic versioning
  - Keep a Changelog format
  - Release notes
- 📐 Architecture Decision Records (ADRs)

**Por que é importante**: Manutenibilidade e onboarding de novos desenvolvedores.

**Aplicação no FinTrack**:
- README completo com instruções
- Swagger docs para API
- JSDoc para funções complexas
- Architecture diagrams
- Changelog ao longo do projeto

---

## 🎯 TRILHA DE APRENDIZADO RECOMENDADA

### Para Iniciantes
1. Módulo 1: JavaScript/TypeScript
2. Módulo 2: HTTP/Web
3. Módulo 3: Node.js/Backend
4. Módulo 4: React/Frontend
5. Módulo 5: SQL/Database

### Para Intermediários (já sabe o básico)
1. Módulo 6: Arquitetura
2. Módulo 7: Segurança
3. Módulo 8: Testes
4. Módulo 9: DevOps

### Para Referência Rápida
- Use o INDEX.md em `conceitos/` para encontrar tópicos específicos
- Busque por palavras-chave nos arquivos
- Cada módulo tem índice interno

---

## 📚 COMO CADA MÓDULO SE APLICA NO FINTRACK

| Módulo | Fase | Semanas | Aplicação |
|--------|------|---------|-----------|
| 1-5 | Fase 1 | 1-4 | Fundamentos (CRUD, Auth, Dashboard) |
| 6-7 | Fase 2 | 5-10 | Arquitetura Limpa, Segurança Avançada |
| 8 | Fase 3 | 11-14 | Testes, Performance |
| 9-10 | Fase 4 | 15-18 | Docker, CI/CD, Deploy, Docs |

---

## 🔍 ÍNDICE DE CONCEITOS (A-Z)

### A
- AAA Pattern (Arrange-Act-Assert) → Módulo 8
- ACID Properties → Módulo 5
- Access Tokens → Módulo 7
- Aggregations (SQL) → Módulo 5
- Architecture Decision Records (ADRs) → Módulo 10
- Async/Await → Módulo 1
- Authentication (JWT) → Módulo 7

### B
- B-tree Indexes → Módulo 5
- Bcrypt → Módulo 7
- Builder Pattern → Módulo 6

### C
- CI/CD → Módulo 9
- Clean Architecture → Módulo 6
- Closures → Módulo 1
- Code Coverage → Módulo 8
- CORS → Módulo 2, Módulo 7
- Cursor-based Pagination → Módulo 5
- Custom Hooks → Módulo 4

### D
- Dependency Injection → Módulo 6
- Discriminated Unions → Módulo 1
- Docker → Módulo 9
- Domain-Driven Design → Módulo 6

### E
- E2E Tests → Módulo 8
- Environment Variables → Módulo 3
- Event Loop → Módulo 1
- Express.js → Módulo 3

### F
- Factory Pattern → Módulo 6

### G
- Generics → Módulo 1
- GitHub Actions → Módulo 9

### H
- Helmet.js → Módulo 7
- HTTP Methods → Módulo 2
- HTTP Status Codes → Módulo 2
- HTTP/2 → Módulo 2

### I
- Indexes (Database) → Módulo 5
- Input Sanitization → Módulo 7
- Integration Tests → Módulo 8

### J
- Jest → Módulo 8
- Joins (SQL) → Módulo 5
- JSDoc → Módulo 10
- JWT → Módulo 7

### L
- Layered Architecture → Módulo 6
- LocalStorage vs Cookies → Módulo 2
- Logging (Winston) → Módulo 9

### M
- Middleware → Módulo 3
- Mocks → Módulo 8
- Módulos ES6 → Módulo 1
- Monitoring (Sentry) → Módulo 9

### N
- N+1 Problem → Módulo 5

### O
- Observer Pattern → Módulo 6
- OpenAPI/Swagger → Módulo 10
- OWASP Top 10 → Módulo 7

### P
- Page Object Model → Módulo 8
- Password Hashing → Módulo 7
- Performance Optimization → Módulo 4
- Playwright → Módulo 8
- Prisma ORM → Módulo 3
- Promises → Módulo 1

### Q
- Query Optimization → Módulo 5

### R
- Rate Limiting → Módulo 7
- React Hooks → Módulo 4
- React Router → Módulo 4
- README → Módulo 10
- Refresh Tokens → Módulo 7
- Repository Pattern → Módulo 6

### S
- Security Headers → Módulo 7
- Sentry → Módulo 9
- SOLID Principles → Módulo 6
- SQL → Módulo 5
- Strategy Pattern → Módulo 6
- Supertest → Módulo 8

### T
- TDD (Test-Driven Development) → Módulo 8
- This Binding → Módulo 1
- Transactions (Database) → Módulo 5
- Type Guards → Módulo 1
- TypeScript Utility Types → Módulo 1

### U
- Unit Tests → Módulo 8
- useCallback → Módulo 4
- useContext → Módulo 4
- useEffect → Módulo 4
- useMemo → Módulo 4
- useReducer → Módulo 4
- useRef → Módulo 4
- useState → Módulo 4

### V
- Validation (Zod) → Módulo 3

### W
- Winston → Módulo 9

### X
- XSS Prevention → Módulo 7

### Z
- Zod → Módulo 3, Módulo 4
- Zustand → Módulo 4

---

## 📖 FORMATO DOS MÓDULOS

Cada módulo segue esta estrutura:

```markdown
# 📘 MÓDULO X: [Título]

## 🎯 OBJETIVO
[O que você aprenderá]

## 📑 ÍNDICE
[Lista de tópicos]

## [TÓPICO 1]

### O QUE É?
[Definição clara]

### POR QUE É IMPORTANTE?
[Relevância no projeto]

### COMO FUNCIONA?
[Explicação técnica com diagramas]

### EXEMPLO PRÁTICO
```typescript
// Código comentado linha por linha
```

### APLICAÇÃO NO FINTRACK
[Como usar no projeto real]

### ❌ ANTI-PATTERNS
[O que NÃO fazer]

### ✅ BEST PRACTICES
[O que fazer]

## 🎯 CHECKLIST DE DOMÍNIO
- [ ] Item 1
- [ ] Item 2

## 📚 PRÓXIMOS PASSOS
[Link para próximo módulo]
```

---

## ✅ CHECKLIST DE USO

### Antes de Começar Desenvolvimento
- [ ] Li Documento 1 (Escopo e Arquitetura)
- [ ] Revisei módulos 1-5 (fundamentos)
- [ ] Entendi stack técnica (Express, React, Prisma, PostgreSQL)

### Durante Desenvolvimento (Fase 1 - Semanas 1-4)
- [ ] Consulto Módulo 3 (Node.js) conforme preciso
- [ ] Consulto Módulo 4 (React) para frontend
- [ ] Consulto Módulo 5 (SQL) para queries
- [ ] Consulto Módulo 7 (Segurança) para autenticação

### Durante Refatoração (Fase 2 - Semanas 5-10)
- [ ] Estudo Módulo 6 (Arquitetura) para Clean Architecture
- [ ] Aprofundo Módulo 7 (Segurança) para refresh tokens
- [ ] Aplico SOLID principles

### Durante Testes (Fase 3 - Semanas 11-14)
- [ ] Estudo Módulo 8 (Testes) completo
- [ ] Implemento unit + integration + E2E tests
- [ ] Otimizo queries com Módulo 5

### Durante Deploy (Fase 4 - Semanas 15-18)
- [ ] Estudo Módulo 9 (DevOps) para Docker/CI/CD
- [ ] Estudo Módulo 10 (Documentação) para README e Swagger
- [ ] Configuro monitoring e logging

---

## 🎓 CERTIFICAÇÃO DE CONHECIMENTO

Ao completar o estudo dos 10 módulos, você dominará:

### Backend (Módulos 1, 2, 3, 5, 6, 7, 8, 9)
- ✅ TypeScript avançado
- ✅ Node.js + Express.js profissional
- ✅ PostgreSQL otimizado
- ✅ Clean Architecture
- ✅ Segurança (OWASP Top 10, JWT)
- ✅ Testes automatizados
- ✅ Docker e CI/CD

### Frontend (Módulos 1, 2, 4, 8)
- ✅ React + Hooks avançado
- ✅ TypeScript no frontend
- ✅ Estado global (Context API, Zustand)
- ✅ Performance optimization
- ✅ Forms complexos
- ✅ Testes de componentes

### DevOps (Módulo 9)
- ✅ Docker e containerização
- ✅ CI/CD pipelines
- ✅ Cloud deployment
- ✅ Logging e monitoring

### Engenharia de Software (Módulos 6, 8, 10)
- ✅ Arquitetura de software
- ✅ Design patterns
- ✅ SOLID principles
- ✅ TDD e pirâmide de testes
- ✅ Documentação técnica

---

## 💡 DICAS DE USO

### ✅ FAÇA
1. **Leia na ordem** (1 → 10) se for iniciante
2. **Use como referência** durante desenvolvimento
3. **Pratique cada conceito** no projeto
4. **Marque checkboxes** conforme aprende
5. **Revise conceitos** antes de entrevistas

### ❌ EVITE
1. ❌ Tentar ler tudo de uma vez
2. ❌ Pular exemplos práticos
3. ❌ Ignorar os "por quês"
4. ❌ Não praticar (só ler não basta!)

---

## 📊 ESTATÍSTICAS

| Métrica | Valor |
|---------|-------|
| **Total de Módulos** | 10 |
| **Páginas Totais** | ~300 |
| **Conceitos Cobertos** | 150+ |
| **Exemplos de Código** | 300+ |
| **Comparações (❌ vs ✅)** | 100+ |
| **Diagramas** | 50+ |
| **Tamanho Total** | ~308 KB |

---

## 🔗 NAVEGAÇÃO

- 📖 [Voltar ao README Principal](./README.md)
- 📘 [Documento 1: Escopo e Arquitetura](./01-DEFINICAO-ESCOPO-E-ARQUITETURA.md)
- 📕 [Documento 3: Guia de Desenvolvimento](./03-GUIA-DESENVOLVIMENTO-COMPLETO.md)
- 📁 [Pasta de Módulos](./conceitos/)
- 📁 [Pasta de Semanas](./semanas/)

---

**Última atualização**: Fevereiro 2026
**Versão**: 2.0 (Modular)
**Status**: ✅ Completo
