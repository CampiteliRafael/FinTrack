# Módulo 6: Arquitetura e Design Patterns

## Objetivos deste Módulo

- Compreender Layered Architecture
- Dominar Clean Architecture
- Aplicar Princípios SOLID
- Implementar Design Patterns comuns
- Aplicar Domain-Driven Design
- Criar código escalável e testável
- Separar responsabilidades

## Índice

1. [O que é Arquitetura](#o-que-é-arquitetura)
2. [Layered Architecture](#layered-architecture)
3. [Clean Architecture](#clean-architecture)
4. [SOLID Principles](#solid-principles)
5. [Design Patterns](#design-patterns)
6. [Domain-Driven Design](#domain-driven-design)
7. [Padrões em FinTrack](#padrões-em-fintrack)
8. [Checklist de Conhecimentos](#checklist-de-conhecimentos)

---

## O que é Arquitetura

### Por que Arquitetura Importa?

```
┌────────────────────────────────────────┐
│       SEM BOA ARQUITETURA               │
├────────────────────────────────────────┤
│ ❌ Código espaguete (tudo junto)       │
│ ❌ Difícil de testar                   │
│ ❌ Mudanças quebram tudo                │
│ ❌ Difícil adicionar features           │
│ ❌ Performance ruim                     │
│ ❌ Dívida técnica cresce                │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│       COM BOA ARQUITETURA               │
├────────────────────────────────────────┤
│ ✅ Código organizado e claro           │
│ ✅ Fácil testar cada parte             │
│ ✅ Mudanças isoladas                   │
│ ✅ Adicionar features é rápido         │
│ ✅ Performance previsível               │
│ ✅ Código mantível                     │
└────────────────────────────────────────┘
```

### Princípios Fundamentais

1. **Separação de Responsabilidades** - Cada classe/módulo faz UMA coisa bem
2. **Dependência em Abstrações** - Depender de interfaces, não implementações
3. **Alta Coesão** - Coisas relacionadas próximas
4. **Baixo Acoplamento** - Mínima dependência entre partes

---

## Layered Architecture

### Conceito - Camadas Horizontais

```
┌─────────────────────────────────────┐
│   CAMADA DE APRESENTAÇÃO            │
│  (Controllers, Views, API)          │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   CAMADA DE NEGÓCIO                 │
│  (Services, Use Cases, Rules)       │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   CAMADA DE PERSISTÊNCIA            │
│  (Database, ORM, Repositories)      │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   CAMADA DE INFRAESTRUTURA          │
│  (APIs externas, Email, Cloud)      │
└─────────────────────────────────────┘
```

### Implementação - FinTrack

```
fintrack-backend/
├── src/
│   ├── controllers/          ← Camada de Apresentação
│   │   ├── usuarioController.js
│   │   ├── transacaoController.js
│   │   └── contaController.js
│   │
│   ├── services/             ← Camada de Negócio
│   │   ├── usuarioService.js
│   │   ├── transacaoService.js
│   │   └── contaService.js
│   │
│   ├── repositories/         ← Camada de Persistência
│   │   ├── usuarioRepository.js
│   │   ├── transacaoRepository.js
│   │   └── contaRepository.js
│   │
│   └── infrastructure/       ← Camada de Infraestrutura
│       ├── email.js
│       ├── payment.js
│       └── storage.js
```

### Fluxo de uma Requisição

```javascript
// 1. CONTROLLER - Recebe requisição
app.post('/api/transacoes', async (req, res, next) => {
  try {
    // ✅ Validar input
    const dados = validarTransacao(req.body);

    // ✅ Chamar service
    const resultado = await transacaoService.criar(dados);

    // ✅ Retornar resposta
    res.status(201).json(resultado);
  } catch (erro) {
    next(erro);
  }
});

// 2. SERVICE - Lógica de negócio
class TransacaoService {
  async criar(dados) {
    // ✅ Regras de negócio
    const conta = await this.contaRepository.obter(dados.contaId);
    if (!conta) throw new Error('Conta não encontrada');

    // ✅ Validar saldo se despesa
    if (dados.tipo === 'despesa' && conta.saldo < dados.valor) {
      throw new Error('Saldo insuficiente');
    }

    // ✅ Criar transação
    const transacao = await this.transacaoRepository.criar(dados);

    // ✅ Atualizar saldo da conta
    await this.contaRepository.atualizarSaldo(dados.contaId, dados.valor, dados.tipo);

    // ✅ Notificar (infrastructure)
    await this.notificacao.enviar(conta.usuarioId, 'Transação criada');

    return transacao;
  }
}

// 3. REPOSITORY - Acesso a dados
class TransacaoRepository {
  async criar(dados) {
    return await prisma.transacao.create({
      data: dados
    });
  }

  async obter(id) {
    return await prisma.transacao.findUnique({ where: { id } });
  }
}

// 4. INFRASTRUCTURE - Serviços externos
class NotificacaoService {
  async enviar(usuarioId, mensagem) {
    const usuario = await buscarUsuario(usuarioId);
    await this.emailProvider.enviar(usuario.email, mensagem);
  }
}
```

### Vantagens

- ✅ Fácil de entender (camadas bem definidas)
- ✅ Fácil de testar (camadas independentes)
- ✅ Reutilizar services em múltiplos controllers
- ✅ Mudar banco de dados? Só muda repository

### Limitações

- ❌ Pode ficar grande e complexo
- ❌ Database-centric (design pelos dados)
- ❌ Dificuldade com casos de uso complexos

---

## Clean Architecture

### Conceito - Independência de Frameworks

```
                    Apresentação
                   /          \
                Entities    Controllers
                   \          /
                  Use Cases
                   /          \
              Gateways    External Services
```

### Camadas Clean Architecture

```
┌─────────────────────────────────────────────────┐
│           WEB/FRAMEWORKS (Express)              │
├─────────────────────────────────────────────────┤
│              CONTROLLERS & PRESENTERS            │
├─────────────────────────────────────────────────┤
│             USE CASES & INTERACTORS             │
├─────────────────────────────────────────────────┤
│            ENTITIES (Domain Objects)            │
├─────────────────────────────────────────────────┤
│              INTERFACES & GATEWAYS              │
├─────────────────────────────────────────────────┤
│          DATABASE, CLOUD, APIs EXTERNAS         │
└─────────────────────────────────────────────────┘

Regra de Ouro: Dependências apontam para o centro!
```

### Estrutura de Pastas

```
src/
├── domain/                    ← Lógica pura, sem dependências
│   ├── entities/
│   │   ├── Usuario.js
│   │   ├── Transacao.js
│   │   └── Conta.js
│   ├── usecases/              ← Casos de uso da aplicação
│   │   ├── CriarTransacao.js
│   │   ├── VisualizarSaldo.js
│   │   └── FazerTransferencia.js
│   └── interfaces/            ← Contratos (interfaces)
│       ├── IUsuarioRepository.js
│       ├── INotificacao.js
│       └── IPagamento.js
│
├── application/               ← Casos de uso em código
│   ├── usecases/
│   │   ├── CriarTransacao.js
│   │   └── VisualizarSaldo.js
│   └── services/
│       └── TransacaoService.js
│
├── infrastructure/            ← Implementações concretas
│   ├── repositories/
│   │   ├── UsuarioRepository.js
│   │   ├── TransacaoRepository.js
│   │   └── ContaRepository.js
│   ├── external/
│   │   ├── GatewayPagamento.js
│   │   ├── ServiceEmail.js
│   │   └── StorageS3.js
│   └── config/
│       └── database.js
│
└── presentation/              ← HTTP/API
    ├── controllers/
    │   ├── UsuarioController.js
    │   ├── TransacaoController.js
    │   └── ContaController.js
    ├── routes/
    │   └── index.js
    ├── middleware/
    │   └── autenticacao.js
    └── app.js
```

### Implementação

```javascript
// domain/entities/Transacao.js
class Transacao {
  constructor(id, usuarioId, contaId, tipo, valor, categoria, data) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.contaId = contaId;
    this.tipo = tipo; // 'receita' ou 'despesa'
    this.valor = valor;
    this.categoria = categoria;
    this.data = data;
  }

  // Lógica pura do domínio
  ehValida() {
    if (this.valor <= 0) return false;
    if (!['receita', 'despesa'].includes(this.tipo)) return false;
    return true;
  }

  obterMes() {
    return this.data.getMonth() + 1;
  }
}

// domain/usecases/CriarTransacao.js
class CriarTransacao {
  constructor(transacaoRepository, contaRepository, notificacao) {
    this.transacaoRepository = transacaoRepository;
    this.contaRepository = contaRepository;
    this.notificacao = notificacao;
  }

  async executar(dados) {
    // Criar entidade
    const transacao = new Transacao(
      null,
      dados.usuarioId,
      dados.contaId,
      dados.tipo,
      dados.valor,
      dados.categoria,
      new Date(dados.data)
    );

    // Validar
    if (!transacao.ehValida()) {
      throw new Error('Transação inválida');
    }

    // Verificar conta e saldo
    const conta = await this.contaRepository.obter(dados.contaId);
    if (!conta) throw new Error('Conta não encontrada');

    if (dados.tipo === 'despesa' && conta.saldo < dados.valor) {
      throw new Error('Saldo insuficiente');
    }

    // Persistir
    const transacaoCriada = await this.transacaoRepository.criar(transacao);

    // Notificar
    await this.notificacao.enviar(
      dados.usuarioId,
      `Transação de R$ ${dados.valor} criada`
    );

    return transacaoCriada;
  }
}

// presentation/controllers/TransacaoController.js
class TransacaoController {
  constructor(criarTransacao) {
    this.criarTransacao = criarTransacao;
  }

  async criar(req, res, next) {
    try {
      const resultado = await this.criarTransacao.executar(req.body);
      res.status(201).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }
}

// Injeção de Dependência (Dependency Injection)
const transacaoRepository = new TransacaoRepository(prisma);
const contaRepository = new ContaRepository(prisma);
const notificacao = new ServiceEmail();

const criarTransacao = new CriarTransacao(
  transacaoRepository,
  contaRepository,
  notificacao
);

const transacaoController = new TransacaoController(criarTransacao);

// Route
app.post('/api/transacoes', (req, res, next) =>
  transacaoController.criar(req, res, next)
);
```

### Vantagens

- ✅ Totalmente independente de frameworks
- ✅ Fácil de testar (sem dependências externas)
- ✅ Lógica de negócio clara e centralizada
- ✅ Fácil mudar implementações (banco, email, etc)

### Desvantagens

- ❌ Mais boilerplate inicial
- ❌ Curva de aprendizado maior
- ❌ Pode ser excessivo para projetos pequenos

---

## SOLID Principles

### S - Single Responsibility Principle

Cada classe deve ter UMA razão para mudar.

```javascript
// ❌ VIOLANDO SRP: Classe faz várias coisas
class Usuario {
  criar(email, senha) {
    // Criar usuário
    const usuario = { email, senha: this.hashearSenha(senha) };
    this.salvarBD(usuario);

    // Enviar email
    this.enviarEmailConfirmacao(email);

    // Log
    console.log('Usuário criado');
  }

  hashearSenha(senha) { /* ... */ }
  salvarBD(usuario) { /* ... */ }
  enviarEmailConfirmacao(email) { /* ... */ }
}

// ✅ RESPEITANDO SRP: Classes com responsabilidade única
class Usuario {
  constructor(email, senha) {
    this.email = email;
    this.senha = senha;
  }
}

class HashSenha {
  static hashear(senha) { /* ... */ }
  static validar(senha, hash) { /* ... */ }
}

class RepositorioUsuario {
  async criar(usuario) { /* ... */ }
}

class ServiceEmail {
  async enviarConfirmacao(email) { /* ... */ }
}

class ControladorUsuario {
  async criar(req, res) {
    const { email, senha } = req.body;
    const usuario = new Usuario(email, HashSenha.hashear(senha));
    await RepositorioUsuario.criar(usuario);
    await ServiceEmail.enviarConfirmacao(email);
  }
}
```

### O - Open/Closed Principle

Aberto para extensão, fechado para modificação.

```javascript
// ❌ VIOLANDO OCP: Mudar comportamento = mudar classe
class ProcessadorPagamento {
  processar(pagamento) {
    if (pagamento.tipo === 'cartao') {
      return this.processarCartao(pagamento);
    }
    if (pagamento.tipo === 'boleto') {
      return this.processarBoleto(pagamento);
    }
    // Adicionar novo tipo? Modificar classe!
  }
}

// ✅ RESPEITANDO OCP: Extensível sem modificação
class ProcessadorPagamento {
  constructor(estrategia) {
    this.estrategia = estrategia;
  }

  processar(pagamento) {
    return this.estrategia.executar(pagamento);
  }
}

// Estratégias (extensíveis)
class EstrategiaCartao {
  executar(pagamento) { /* ... */ }
}

class EstrategiaBoleto {
  executar(pagamento) { /* ... */ }
}

class EstrategiaPix {
  executar(pagamento) { /* ... */ }
}

// Usar
const processador = new ProcessadorPagamento(new EstrategiaCartao());
processador.processar(pagamento);
```

### L - Liskov Substitution Principle

Subclasses podem substituir superclasses sem quebrar.

```javascript
// ❌ VIOLANDO LSP: Subclass quebra comportamento
class Ave {
  voar() {
    return 'Voando...';
  }
}

class Passaro extends Ave {
  voar() {
    return 'Voando...';
  }
}

class Pinguim extends Ave {
  voar() {
    throw new Error('Pinguim não voa!'); // ❌ Quebra contrato!
  }
}

// ✅ RESPEITANDO LSP: Hierarquia correta
class Ave {
  mover() {
    return 'Movendo...';
  }
}

class PassaroVoador extends Ave {
  voar() {
    return 'Voando...';
  }
}

class Pinguim extends Ave {
  nadar() {
    return 'Nadando...';
  }
}
```

### I - Interface Segregation Principle

Clientes não devem depender de interfaces que não usam.

```javascript
// ❌ VIOLANDO ISP: Interface gorda
interface IRepositorio {
  criar(dados): void;
  obter(id): void;
  atualizar(id, dados): void;
  deletar(id): void;
  listar(): void;
  buscar(filtro): void;
  exportarCSV(): void;  // Nem todos precisam!
  importarCSV(arquivo): void;
  backup(): void;  // Nem todos precisam!
}

// ✅ RESPEITANDO ISP: Interfaces específicas
interface ICRUDRepositorio {
  criar(dados): void;
  obter(id): void;
  atualizar(id, dados): void;
  deletar(id): void;
}

interface IListavelRepositorio {
  listar(): void;
  buscar(filtro): void;
}

interface IExportavelRepositorio {
  exportarCSV(): void;
}

interface IBackupRepositorio {
  backup(): void;
}

class RepositorioTransacao implements ICRUDRepositorio, IListavelRepositorio {
  // Implementa só o que precisa
}
```

### D - Dependency Inversion Principle

Depender de abstrações, não de implementações concretas.

```javascript
// ❌ VIOLANDO DIP: Depende de implementação concreta
class ControladorTransacao {
  constructor() {
    this.repository = new RepositorioPostgres();  // ❌ Acoplado!
    this.email = new EmailSMTP();  // ❌ Acoplado!
  }
}

// Mudar de PostgreSQL para MongoDB? Modificar classe!

// ✅ RESPEITANDO DIP: Injetar abstrações
class ControladorTransacao {
  constructor(repository, email) {
    this.repository = repository;  // ✅ Interface
    this.email = email;  // ✅ Interface
  }

  async criar(dados) {
    const transacao = await this.repository.criar(dados);
    await this.email.enviar(transacao);
  }
}

// Usar com diferentes implementações
const repoPostgres = new RepositorioPostgres();
const repoMongo = new RepositorioMongo();
const emailSMTP = new EmailSMTP();
const emailSendGrid = new EmailSendGrid();

const controller1 = new ControladorTransacao(repoPostgres, emailSMTP);
const controller2 = new ControladorTransacao(repoMongo, emailSendGrid);
```

---

## Design Patterns

### 1. Repository Pattern

```javascript
// Abstração
class ITransacaoRepository {
  async criar(dados) { throw new Error(); }
  async obter(id) { throw new Error(); }
  async listar(filtros) { throw new Error(); }
  async atualizar(id, dados) { throw new Error(); }
  async deletar(id) { throw new Error(); }
}

// Implementação
class TransacaoRepository extends ITransacaoRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async criar(dados) {
    return this.prisma.transacao.create({ data: dados });
  }

  async obter(id) {
    return this.prisma.transacao.findUnique({ where: { id } });
  }

  async listar(filtros) {
    return this.prisma.transacao.findMany({ where: filtros });
  }

  async atualizar(id, dados) {
    return this.prisma.transacao.update({ where: { id }, data: dados });
  }

  async deletar(id) {
    return this.prisma.transacao.delete({ where: { id } });
  }
}

// Uso
class TransacaoService {
  constructor(repository) {
    this.repository = repository;  // Depende da interface
  }

  async criar(dados) {
    return this.repository.criar(dados);
  }
}

// Vantagem: Trocar banco de dados é fácil!
class TransacaoRepositoryMongo extends ITransacaoRepository {
  async criar(dados) {
    return db.transacoes.insertOne(dados);
  }
  // ...
}
```

### 2. Factory Pattern

```javascript
// ✅ Factory: Criar objetos sem especificar classe exata
class RepositorioFactory {
  static criar(tipo) {
    switch (tipo) {
      case 'postgres':
        return new TransacaoRepositoryPostgres();
      case 'mongo':
        return new TransacaoRepositoryMongo();
      case 'mock':
        return new TransacaoRepositoryMock();
      default:
        throw new Error('Tipo inválido');
    }
  }
}

// Uso
const repo = RepositorioFactory.criar(process.env.DB_TYPE);
const service = new TransacaoService(repo);
```

### 3. Strategy Pattern

```javascript
// ✅ Strategy: Diferentes formas de fazer algo
class CalculadoraImposto {
  constructor(estrategia) {
    this.estrategia = estrategia;
  }

  calcular(valor) {
    return this.estrategia.executar(valor);
  }
}

class EstrategyImposto {
  executar(valor) { throw new Error(); }
}

class EstrategiaImpostoBrasil extends EstrategyImposto {
  executar(valor) {
    return valor * 0.15;  // 15% de imposto
  }
}

class EstrategiaImpostoEUA extends EstrategyImposto {
  executar(valor) {
    return valor * 0.18;  // 18% de imposto
  }
}

// Uso
const calculadora = new CalculadoraImposto(new EstrategiaImpostoBrasil());
console.log(calculadora.calcular(100));  // 15
```

### 4. Observer Pattern

```javascript
// ✅ Observer: Notificar múltiplos listeners quando algo muda
class Transacao {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter(o => o !== observer);
  }

  notificar(evento) {
    this.observers.forEach(observer => observer.atualizar(evento));
  }

  criar(dados) {
    // ... lógica de criação
    this.notificar({ tipo: 'transacao-criada', dados });
  }
}

// Observers
class NotificadorEmail {
  atualizar(evento) {
    if (evento.tipo === 'transacao-criada') {
      console.log('Enviando email...');
    }
  }
}

class LoggerTransacao {
  atualizar(evento) {
    console.log('Transação:', evento);
  }
}

// Uso
const transacao = new Transacao();
transacao.subscribe(new NotificadorEmail());
transacao.subscribe(new LoggerTransacao());
transacao.criar({ valor: 100 });  // Notifica ambos
```

### 5. Dependency Injection (DI)

#### O QUE É DEPENDENCY INJECTION?

Dependency Injection é um padrão onde **dependências são fornecidas (injetadas) a uma classe externamente**, em vez de serem criadas internamente pela própria classe.

**Por que usar DI no FinTrack?**
- ✅ **Testabilidade**: Fácil mockar dependências em testes
- ✅ **Flexibilidade**: Trocar implementações sem alterar código
- ✅ **Manutenibilidade**: Menos acoplamento entre classes
- ✅ **Reutilização**: Mesma classe com diferentes dependências

```
┌────────────────────────────────────────────────┐
│  SEM DI: Classe cria suas dependências         │
│  ❌ Alto acoplamento                            │
│  ❌ Difícil testar                              │
│  ❌ Difícil trocar implementação                │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│  COM DI: Dependências são injetadas            │
│  ✅ Baixo acoplamento                           │
│  ✅ Fácil testar (mock dependencies)           │
│  ✅ Fácil trocar implementação                  │
└────────────────────────────────────────────────┘
```

---

#### PROBLEMA SEM DI

```typescript
// ❌ SEM DI: TransactionService cria suas próprias dependências

class TransactionService {
  private repository: TransactionRepository;
  private emailService: EmailService;
  private logger: Logger;

  constructor() {
    // ❌ Classe instancia suas dependências internamente
    this.repository = new TransactionRepository();
    this.emailService = new EmailService();
    this.logger = new Logger();
  }

  async createTransaction(data: CreateTransactionDTO) {
    this.logger.log('Creating transaction');

    const transaction = await this.repository.create(data);

    await this.emailService.send({
      to: data.userEmail,
      subject: 'New transaction created',
      body: `Transaction ${transaction.id} was created`
    });

    return transaction;
  }
}

// ❌ PROBLEMAS:
// 1. Impossível testar sem enviar emails reais
// 2. Impossível trocar repository (ex: usar mock, Redis, etc)
// 3. Logger sempre escreve em console (não pode trocar para arquivo)
// 4. Acoplamento alto - mudanças nas dependências afetam TransactionService
```

---

#### SOLUÇÃO COM DI

```typescript
// ✅ COM DI: Dependências são injetadas

// 1. Definir interfaces (abstrações)
interface ITransactionRepository {
  create(data: CreateTransactionDTO): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
}

interface IEmailService {
  send(params: EmailParams): Promise<void>;
}

interface ILogger {
  log(message: string): void;
  error(message: string, error: Error): void;
}

// 2. Service recebe dependências no construtor
class TransactionService {
  constructor(
    private repository: ITransactionRepository,  // ✅ Injetado
    private emailService: IEmailService,         // ✅ Injetado
    private logger: ILogger                      // ✅ Injetado
  ) {}

  async createTransaction(data: CreateTransactionDTO) {
    this.logger.log('Creating transaction');

    const transaction = await this.repository.create(data);

    await this.emailService.send({
      to: data.userEmail,
      subject: 'New transaction created',
      body: `Transaction ${transaction.id} was created`
    });

    return transaction;
  }
}

// 3. Criar implementações concretas
class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateTransactionDTO): Promise<Transaction> {
    return this.prisma.transaction.create({ data });
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.prisma.transaction.findUnique({ where: { id } });
  }
}

class SendGridEmailService implements IEmailService {
  async send(params: EmailParams): Promise<void> {
    // Implementação com SendGrid
  }
}

class WinstonLogger implements ILogger {
  log(message: string): void {
    console.log(`[LOG] ${message}`);
  }

  error(message: string, error: Error): void {
    console.error(`[ERROR] ${message}`, error);
  }
}

// 4. Compor e injetar dependências (manualmente)
const prisma = new PrismaClient();
const repository = new PrismaTransactionRepository(prisma);
const emailService = new SendGridEmailService();
const logger = new WinstonLogger();

const transactionService = new TransactionService(
  repository,
  emailService,
  logger
);

// ✅ VANTAGENS:
// 1. Fácil testar com mocks
// 2. Fácil trocar implementações
// 3. Baixo acoplamento
```

---

#### OS 3 TIPOS DE INJEÇÃO

**1. Constructor Injection (Recomendado)**

```typescript
// ✅ MELHOR: Injeção via construtor

class TransactionService {
  constructor(
    private readonly repository: ITransactionRepository,
    private readonly emailService: IEmailService
  ) {
    // Dependências obrigatórias garantidas no construtor
  }

  async create(data: CreateTransactionDTO) {
    return this.repository.create(data);
  }
}

// ✅ Vantagens:
// - Dependências obrigatórias (não pode criar sem elas)
// - Imutáveis (readonly)
// - Explícitas (visíveis na assinatura)
```

**2. Property Injection**

```typescript
// ❌ MENOS RECOMENDADO: Injeção via propriedade

class TransactionService {
  repository!: ITransactionRepository;  // ! indica que será injetado
  emailService!: IEmailService;

  async create(data: CreateTransactionDTO) {
    return this.repository.create(data);
  }
}

const service = new TransactionService();
service.repository = new PrismaTransactionRepository(prisma);
service.emailService = new SendGridEmailService();

// ❌ Problemas:
// - Dependências não são obrigatórias (pode esquecer de injetar)
// - Pode causar erros em runtime
// - Menos explícito
```

**3. Method Injection**

```typescript
// ⚠️ USO ESPECÍFICO: Injeção via método

class TransactionService {
  async create(
    data: CreateTransactionDTO,
    repository: ITransactionRepository  // ✅ Injetado no método
  ) {
    return repository.create(data);
  }
}

// ⚠️ Útil quando:
// - Dependência varia por chamada
// - Dependência é opcional
// - Queremos override pontual
```

---

#### DI CONTAINER (Automático)

Criar manualmente todas as dependências é trabalhoso. **DI Containers** automatizam isso.

**Bibliotecas populares:**
- `tsyringe` - Microsoft (TypeScript)
- `InversifyJS` - Popular
- `awilix` - Node.js focado
- `typedi` - TypeScript decorators

**Exemplo com TSyringe:**

```typescript
// 1. Instalar
// npm install tsyringe reflect-metadata

// 2. Importar reflect-metadata no entry point
import 'reflect-metadata';

// 3. Decorators para registrar classes
import { injectable, inject, container } from 'tsyringe';

// Interfaces
interface ITransactionRepository {
  create(data: CreateTransactionDTO): Promise<Transaction>;
}

interface IEmailService {
  send(params: EmailParams): Promise<void>;
}

// Implementações com @injectable
@injectable()
class PrismaTransactionRepository implements ITransactionRepository {
  constructor(@inject('PrismaClient') private prisma: PrismaClient) {}

  async create(data: CreateTransactionDTO): Promise<Transaction> {
    return this.prisma.transaction.create({ data });
  }
}

@injectable()
class SendGridEmailService implements IEmailService {
  async send(params: EmailParams): Promise<void> {
    // Implementação SendGrid
  }
}

// Service com @injectable
@injectable()
class TransactionService {
  constructor(
    @inject('ITransactionRepository') private repository: ITransactionRepository,
    @inject('IEmailService') private emailService: IEmailService
  ) {}

  async create(data: CreateTransactionDTO) {
    const transaction = await this.repository.create(data);
    await this.emailService.send({
      to: data.userEmail,
      subject: 'Transaction created'
    });
    return transaction;
  }
}

// 4. Registrar dependências no container
container.register('PrismaClient', {
  useValue: new PrismaClient()
});

container.register('ITransactionRepository', {
  useClass: PrismaTransactionRepository
});

container.register('IEmailService', {
  useClass: SendGridEmailService
});

// 5. Resolver automaticamente!
const transactionService = container.resolve(TransactionService);
// ✅ Container resolve todas dependências automaticamente!
```

---

#### DI NO FINTRACK - IMPLEMENTAÇÃO COMPLETA

**Estrutura de pastas:**

```
src/
├── domain/
│   ├── entities/
│   │   └── Transaction.ts
│   ├── repositories/  (interfaces)
│   │   └── ITransactionRepository.ts
│   └── services/  (interfaces)
│       └── IEmailService.ts
├── infrastructure/
│   ├── repositories/  (implementações)
│   │   └── PrismaTransactionRepository.ts
│   └── services/
│       └── SendGridEmailService.ts
├── application/
│   └── services/
│       └── TransactionService.ts
└── di/
    └── container.ts  (configuração do DI)
```

**1. Definir Interfaces (Domínio)**

```typescript
// src/domain/repositories/ITransactionRepository.ts

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByUserId(userId: string): Promise<Transaction[]>;
  create(data: CreateTransactionDTO): Promise<Transaction>;
  update(id: string, data: UpdateTransactionDTO): Promise<Transaction>;
  delete(id: string): Promise<void>;
}
```

```typescript
// src/domain/services/IEmailService.ts

export interface IEmailService {
  sendTransactionCreated(transaction: Transaction, userEmail: string): Promise<void>;
  sendBudgetAlert(userId: string, category: string): Promise<void>;
}
```

**2. Implementações (Infraestrutura)**

```typescript
// src/infrastructure/repositories/PrismaTransactionRepository.ts

import { injectable, inject } from 'tsyringe';

@injectable()
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(
    @inject('PrismaClient') private prisma: PrismaClient
  ) {}

  async findById(id: string): Promise<Transaction | null> {
    const data = await this.prisma.transaction.findUnique({
      where: { id }
    });
    return data ? this.toDomain(data) : null;
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    const data = await this.prisma.transaction.findMany({
      where: { userId, deletedAt: null }
    });
    return data.map(this.toDomain);
  }

  async create(data: CreateTransactionDTO): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: this.toPersistence(data)
    });
    return this.toDomain(transaction);
  }

  // Métodos de conversão
  private toDomain(data: any): Transaction {
    return new Transaction(
      data.id,
      data.amount,
      data.description,
      data.type,
      data.userId
    );
  }

  private toPersistence(transaction: any): any {
    return {
      amount: transaction.amount,
      description: transaction.description,
      type: transaction.type,
      userId: transaction.userId
    };
  }
}
```

```typescript
// src/infrastructure/services/SendGridEmailService.ts

import { injectable } from 'tsyringe';
import sgMail from '@sendgrid/mail';

@injectable()
export class SendGridEmailService implements IEmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async sendTransactionCreated(
    transaction: Transaction,
    userEmail: string
  ): Promise<void> {
    await sgMail.send({
      to: userEmail,
      from: 'noreply@fintrack.com',
      subject: 'Nova transação criada',
      html: `
        <h1>Transação Criada</h1>
        <p>ID: ${transaction.getId()}</p>
        <p>Valor: ${transaction.getAmount()}</p>
      `
    });
  }

  async sendBudgetAlert(userId: string, category: string): Promise<void> {
    // Implementação
  }
}
```

**3. Application Service (Usa DI)**

```typescript
// src/application/services/TransactionService.ts

import { injectable, inject } from 'tsyringe';

@injectable()
export class TransactionService {
  constructor(
    @inject('ITransactionRepository')
    private repository: ITransactionRepository,

    @inject('IEmailService')
    private emailService: IEmailService,

    @inject('ILogger')
    private logger: ILogger
  ) {}

  async createTransaction(
    userId: string,
    data: CreateTransactionDTO
  ): Promise<Transaction> {
    this.logger.log(`Creating transaction for user ${userId}`);

    // Validação
    if (data.amount <= 0) {
      throw new ValidationError('Amount must be positive');
    }

    // Criar transação
    const transaction = await this.repository.create({
      ...data,
      userId
    });

    // Enviar email (assíncrono, não bloqueia)
    this.emailService
      .sendTransactionCreated(transaction, data.userEmail)
      .catch(err => this.logger.error('Failed to send email', err));

    return transaction;
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    return this.repository.findByUserId(userId);
  }
}
```

**4. Configurar DI Container**

```typescript
// src/di/container.ts

import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

// Registrar PrismaClient como singleton
container.register('PrismaClient', {
  useValue: new PrismaClient()
});

// Registrar repositories
container.register('ITransactionRepository', {
  useClass: PrismaTransactionRepository
});

// Registrar services
container.register('IEmailService', {
  useClass: SendGridEmailService
});

container.register('ILogger', {
  useClass: WinstonLogger
});

export { container };
```

**5. Usar no Controller**

```typescript
// src/controllers/TransactionController.ts

import { container } from '../di/container';

export class TransactionController {
  async create(req: Request, res: Response) {
    try {
      // ✅ Resolve automaticamente todas dependências
      const transactionService = container.resolve(TransactionService);

      const transaction = await transactionService.createTransaction(
        req.userId!,
        req.body
      );

      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    const transactionService = container.resolve(TransactionService);

    const transactions = await transactionService.getTransactions(
      req.userId!
    );

    res.json(transactions);
  }
}
```

---

#### TESTAR COM DI

DI facilita MUITO os testes:

```typescript
// src/__tests__/services/TransactionService.test.ts

import { TransactionService } from '../../application/services/TransactionService';

describe('TransactionService', () => {
  let service: TransactionService;
  let mockRepository: jest.Mocked<ITransactionRepository>;
  let mockEmailService: jest.Mocked<IEmailService>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    // ✅ Criar mocks
    mockRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    mockEmailService = {
      sendTransactionCreated: jest.fn(),
      sendBudgetAlert: jest.fn()
    };

    mockLogger = {
      log: jest.fn(),
      error: jest.fn()
    };

    // ✅ Injetar mocks no service
    service = new TransactionService(
      mockRepository,
      mockEmailService,
      mockLogger
    );
  });

  it('should create transaction', async () => {
    // Arrange
    const userId = 'user-123';
    const data = {
      amount: 100,
      description: 'Test',
      type: 'expense',
      userEmail: 'user@example.com'
    };

    const mockTransaction = new Transaction(
      'tx-1',
      100,
      'Test',
      'expense',
      userId
    );

    mockRepository.create.mockResolvedValue(mockTransaction);

    // Act
    const result = await service.createTransaction(userId, data);

    // Assert
    expect(result).toEqual(mockTransaction);
    expect(mockRepository.create).toHaveBeenCalledWith({
      ...data,
      userId
    });
    expect(mockEmailService.sendTransactionCreated).toHaveBeenCalledWith(
      mockTransaction,
      data.userEmail
    );
  });

  it('should throw error for invalid amount', async () => {
    const data = { amount: -100, description: 'Test' };

    await expect(
      service.createTransaction('user-1', data)
    ).rejects.toThrow('Amount must be positive');

    // ✅ Repository não foi chamado
    expect(mockRepository.create).not.toHaveBeenCalled();
  });
});
```

---

#### QUANDO USAR DI

✅ **USE DI para:**
- Services que dependem de repositories
- Services que dependem de outros services
- Qualquer classe com dependências externas
- Código que precisa ser testado

❌ **NÃO USE DI para:**
- Classes sem dependências
- Funções puras
- Value Objects simples
- DTOs (Data Transfer Objects)

---

#### RESUMO DI

```
┌─────────────────────────────────────────────────────┐
│  DEPENDENCY INJECTION                               │
├─────────────────────────────────────────────────────┤
│  ✅ Baixo acoplamento                                │
│  ✅ Fácil testar (injetar mocks)                    │
│  ✅ Fácil trocar implementações                      │
│  ✅ Código mais limpo e organizado                   │
│  ✅ Segue SOLID (Dependency Inversion Principle)    │
├─────────────────────────────────────────────────────┤
│  3 tipos: Constructor, Property, Method            │
│  Recomendado: Constructor Injection                │
│  DI Container: TSyringe, InversifyJS, Awilix       │
└─────────────────────────────────────────────────────┘
```

---

## Domain-Driven Design

### Conceitos Principais

```
┌──────────────────────────────────────┐
│  DOMAIN (Domínio)                    │
│  - Lógica de negócio pura           │
│  - Independente de tecnologia        │
│  - Entidades: Usuario, Transacao    │
│  - Value Objects: Dinheiro, Email   │
│  - Aggregates: Agrupam entidades    │
└──────────────────────────────────────┘
```

### Entidades vs Value Objects

```javascript
// ❌ Tudo é entidade
class Usuario {
  constructor(id, nome, email, endereco) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.endereco = endereco;  // Deveria ser Value Object
  }
}

// ✅ Com Value Objects
class Email {
  constructor(valor) {
    if (!this.ehValido(valor)) {
      throw new Error('Email inválido');
    }
    this.valor = valor;
  }

  ehValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  equals(outro) {
    return this.valor === outro.valor;
  }
}

class Endereco {
  constructor(rua, numero, cidade, estado) {
    this.rua = rua;
    this.numero = numero;
    this.cidade = cidade;
    this.estado = estado;
  }

  equals(outro) {
    return this.rua === outro.rua && this.numero === outro.numero;
  }
}

class Usuario {
  constructor(id, nome, email, endereco) {
    this.id = id;
    this.nome = nome;
    this.email = new Email(email);  // Value Object
    this.endereco = new Endereco(...);  // Value Object
  }

  mudaNome(novoNome) {
    this.nome = novoNome;
  }

  // Lógica de domínio
  podeSerDeletado() {
    // Regra de negócio
    return !this.temTransacoes();
  }
}
```

### Aggregates

```javascript
// ✅ Aggregate: Usuario e suas Contas
class Usuario {
  constructor(id, nome, email) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.contas = [];  // Entidades dentro do Aggregate
  }

  adicionarConta(conta) {
    if (this.contas.length >= 5) {
      throw new Error('Máximo 5 contas permitidas');
    }
    this.contas.push(conta);
  }

  obterContaPrincipal() {
    return this.contas[0];
  }

  temSaldoSuficiente(valor) {
    return this.contas.some(c => c.saldo >= valor);
  }
}

// ✅ Aggregate: Transferencia entre contas
class Transferencia {
  constructor(contaOrigem, contaDestino, valor) {
    this.contaOrigem = contaOrigem;
    this.contaDestino = contaDestino;
    this.valor = valor;
    this.status = 'pendente';
  }

  executar() {
    if (!this.podeExecutar()) {
      throw new Error('Transferência não pode ser executada');
    }

    this.contaOrigem.debitar(this.valor);
    this.contaDestino.creditar(this.valor);
    this.status = 'concluída';
  }

  podeExecutar() {
    return this.contaOrigem.saldo >= this.valor;
  }
}
```

### Domain Services

```javascript
// ✅ Domain Service: Lógica entre Aggregates
class TransferenciaService {
  executar(transferencia) {
    // Validar
    if (transferencia.contaOrigem.usuario.id === transferencia.contaDestino.usuario.id) {
      throw new Error('Não pode transferir para própria conta');
    }

    // Executar
    transferencia.executar();

    // Notificar (evento de domínio)
    this.emitirEvento(
      new TransferenciaRealizadaEvent(transferencia)
    );
  }

  emitirEvento(evento) {
    EventBus.publish(evento);
  }
}
```

---

## Padrões em FinTrack

### Estrutura Recomendada

```
src/
├── domain/
│   ├── entities/
│   │   ├── Usuario.js       # Lógica pura do domínio
│   │   ├── Transacao.js
│   │   ├── Conta.js
│   │   └── Categoria.js
│   ├── valueobjects/
│   │   ├── Dinheiro.js      # Valor com validação
│   │   ├── Email.js         # Email com validação
│   │   └── Data.js
│   ├── usecases/
│   │   ├── CriarTransacao.js
│   │   ├── FazerTransferencia.js
│   │   ├── VisualizarSaldo.js
│   │   └── AnalisarDespesas.js
│   └── interfaces/
│       ├── ITransacaoRepository.js
│       └── INotificacao.js
│
├── application/
│   ├── services/
│   │   └── TransacaoService.js
│   └── dto/                  # Data Transfer Objects
│       ├── CriarTransacaoDTO.js
│       └── VisualizarSaldoDTO.js
│
├── infrastructure/
│   ├── persistence/
│   │   ├── repositories/
│   │   │   └── TransacaoRepository.js
│   │   └── migrations/
│   │       └── 001_criar_tabelas.js
│   ├── external/
│   │   ├── gateways/
│   │   │   └── PagamentoGateway.js
│   │   └── email/
│   │       └── EmailProvider.js
│   └── config/
│       └── database.js
│
└── presentation/
    ├── controllers/
    │   └── TransacaoController.js
    ├── routes/
    │   └── transacaoRoutes.js
    ├── middleware/
    │   └── validacao.js
    └── app.js
```

### Exemplo Completo - Criar Transação

```javascript
// 1. Domain Entity - Lógica pura
class Transacao {
  constructor(id, usuarioId, contaId, tipo, valor, categoria, data) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.contaId = contaId;
    this.tipo = tipo;
    this.valor = new Dinheiro(valor);
    this.categoria = categoria;
    this.data = data;
  }

  ehValida() {
    return this.valor.ehPositivo() && ['receita', 'despesa'].includes(this.tipo);
  }
}

// 2. Value Object - Dinheiro com validação
class Dinheiro {
  constructor(valor) {
    if (valor < 0) throw new Error('Valor não pode ser negativo');
    this.valor = valor;
  }

  ehPositivo() {
    return this.valor > 0;
  }

  adicionar(outro) {
    return new Dinheiro(this.valor + outro.valor);
  }
}

// 3. Use Case - Orquestar a operação
class CriarTransacao {
  constructor(transacaoRepository, contaRepository, notificacao) {
    this.transacaoRepository = transacaoRepository;
    this.contaRepository = contaRepository;
    this.notificacao = notificacao;
  }

  async executar(dados) {
    // Validar entrada
    const transacao = new Transacao(
      null,
      dados.usuarioId,
      dados.contaId,
      dados.tipo,
      dados.valor,
      dados.categoria,
      new Date(dados.data)
    );

    if (!transacao.ehValida()) {
      throw new Error('Transação inválida');
    }

    // Verificar conta
    const conta = await this.contaRepository.obter(dados.contaId);
    if (!conta) throw new Error('Conta não encontrada');

    // Verificar saldo para despesa
    if (dados.tipo === 'despesa') {
      if (conta.saldo < dados.valor) {
        throw new Error('Saldo insuficiente');
      }
    }

    // Persistir
    const transacaoCriada = await this.transacaoRepository.criar(transacao);

    // Atualizar saldo
    const novoSaldo = dados.tipo === 'receita'
      ? conta.saldo + dados.valor
      : conta.saldo - dados.valor;

    await this.contaRepository.atualizarSaldo(dados.contaId, novoSaldo);

    // Notificar
    await this.notificacao.enviar(dados.usuarioId, `Transação criada`);

    return transacaoCriada;
  }
}

// 4. Repository - Persistência
class TransacaoRepository {
  async criar(transacao) {
    return await prisma.transacao.create({
      data: {
        usuarioId: transacao.usuarioId,
        contaId: transacao.contaId,
        tipo: transacao.tipo,
        valor: transacao.valor.valor,
        categoria: transacao.categoria,
        data: transacao.data
      }
    });
  }

  async obter(id) {
    return await prisma.transacao.findUnique({ where: { id } });
  }
}

// 5. Controller - Apresentação HTTP
class TransacaoController {
  constructor(criarTransacao) {
    this.criarTransacao = criarTransacao;
  }

  async criar(req, res, next) {
    try {
      const { usuarioId, contaId, tipo, valor, categoria, data } = req.body;

      const resultado = await this.criarTransacao.executar({
        usuarioId,
        contaId,
        tipo,
        valor,
        categoria,
        data
      });

      res.status(201).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }
}

// 6. Setup / Injeção de Dependência
const transacaoRepository = new TransacaoRepository();
const contaRepository = new ContaRepository();
const notificacao = new EmailService();

const criarTransacao = new CriarTransacao(
  transacaoRepository,
  contaRepository,
  notificacao
);

const transacaoController = new TransacaoController(criarTransacao);

// 7. Routes
app.post('/api/transacoes', (req, res, next) =>
  transacaoController.criar(req, res, next)
);
```

---

## Checklist de Conhecimentos

- [ ] Entender Layered Architecture
- [ ] Aplicar Clean Architecture
- [ ] Todos os SOLID Principles
- [ ] Repository Pattern
- [ ] Factory Pattern
- [ ] Strategy Pattern
- [ ] Observer Pattern
- [ ] Dependency Injection
- [ ] Domain-Driven Design basics
- [ ] Entities vs Value Objects
- [ ] Aggregates
- [ ] Domain Services
- [ ] Separação de responsabilidades
- [ ] Testabilidade do código
- [ ] Escalabilidade da arquitetura

---

## Próximo Módulo

Agora que você compreende a arquitetura, explore **Módulo 7: Segurança** para proteger sua aplicação e dados.
