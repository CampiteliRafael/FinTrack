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

### 5. Dependency Injection

```javascript
// ✅ DI: Injetar dependências em vez de criá-las internamente

// Sem DI (acoplado)
class TransacaoService {
  constructor() {
    this.repository = new TransacaoRepository();
    this.email = new EmailService();
  }
}

// Com DI (desacoplado)
class TransacaoService {
  constructor(repository, email) {
    this.repository = repository;
    this.email = email;
  }

  async criar(dados) {
    const transacao = await this.repository.criar(dados);
    await this.email.notificar(transacao);
    return transacao;
  }
}

// Composição em um só lugar
class ApplicationFactory {
  static criarTransacaoService() {
    const repository = new TransacaoRepository();
    const email = new EmailService();
    return new TransacaoService(repository, email);
  }
}

// Uso
const service = ApplicationFactory.criarTransacaoService();
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
