# SEMANA 7-8: Clean Architecture Refactoring

## 🎯 OBJETIVOS

- Refatorar código para Clean Architecture
- Separar em domain, application, infrastructure, presentation layers
- Implementar dependency injection
- Criar use cases (interactors)
- Implementar repositories pattern
- Melhorar testabilidade
- Desacoplar lógica de negócio

## 📋 ENTREGAS

- Domain entities e value objects
- Application use cases
- Infrastructure repositories
- Presentation controllers e routes
- Dependency injection container
- Type-safe architecture
- Testes unitários facilitados

## 🛠️ TECNOLOGIAS

- Express.js
- Prisma ORM
- TypeScript strict mode
- Dependency injection manual
- Jest para testes

---

## 📝 PASSO A PASSO

### BACKEND - REFATORAR PARA CLEAN ARCHITECTURE

#### Passo 1: Criar Domain Entities

Crie `src/domain/entities/User.ts`:

```typescript
/**
 * Domain Entity: User
 * Representa um usuário no sistema
 * Contém regras de negócio relacionadas ao usuário
 */
export interface IUser {
  id: string;
  email: string;
  password: string; // hash
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User implements IUser {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: IUser) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Validar email do usuário
   */
  isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  /**
   * Validar senha (regras de negócio)
   */
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }
    if (!/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
```

Crie `src/domain/entities/Account.ts`:

```typescript
/**
 * Domain Entity: Account
 */
export interface IAccount {
  id: string;
  userId: string;
  name: string;
  balance: number;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Account implements IAccount {
  id: string;
  userId: string;
  name: string;
  balance: number;
  type: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: IAccount) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.balance = data.balance;
    this.type = data.type;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Lógica de negócio: validar saldo
   */
  canWithdraw(amount: number): boolean {
    return this.balance >= amount;
  }

  /**
   * Lógica de negócio: depositar
   */
  deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Valor deve ser positivo');
    }
    this.balance += amount;
  }

  /**
   * Lógica de negócio: sacar
   */
  withdraw(amount: number): void {
    if (!this.canWithdraw(amount)) {
      throw new Error('Saldo insuficiente');
    }
    this.balance -= amount;
  }
}
```

Crie `src/domain/entities/Category.ts`:

```typescript
/**
 * Domain Entity: Category
 */
export interface ICategory {
  id: string;
  userId: string;
  name: string;
  color: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Category implements ICategory {
  id: string;
  userId: string;
  name: string;
  color: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: ICategory) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.color = data.color;
    this.type = data.type;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Validar se categoria é de receita
   */
  isIncome(): boolean {
    return this.type === 'income';
  }

  /**
   * Validar se categoria é de despesa
   */
  isExpense(): boolean {
    return this.type === 'expense';
  }
}
```

Crie `src/domain/entities/Transaction.ts`:

```typescript
import { Account } from './Account';

/**
 * Domain Entity: Transaction
 */
export interface ITransaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  amount: number;
  description?: string;
  type: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Transaction implements ITransaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  amount: number;
  description?: string;
  type: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: ITransaction) {
    this.id = data.id;
    this.userId = data.userId;
    this.accountId = data.accountId;
    this.categoryId = data.categoryId;
    this.amount = data.amount;
    this.description = data.description;
    this.type = data.type;
    this.date = data.date;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Lógica de negócio: validar transação
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.amount <= 0) {
      errors.push('Valor deve ser positivo');
    }

    if (!['income', 'expense', 'transfer'].includes(this.type)) {
      errors.push('Tipo de transação inválido');
    }

    if (this.date > new Date()) {
      errors.push('Data não pode ser no futuro');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calcular impacto na conta
   */
  getImpact(): number {
    return this.type === 'income' ? this.amount : -this.amount;
  }
}
```

#### Passo 2: Criar Repository Interfaces

Crie `src/domain/repositories/IUserRepository.ts`:

```typescript
import { User } from '../entities/User';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
```

Crie `src/domain/repositories/IAccountRepository.ts`:

```typescript
import { Account } from '../entities/Account';

export interface IAccountRepository {
  findById(id: string): Promise<Account | null>;
  findByUserId(userId: string): Promise<Account[]>;
  findByUserIdAndName(userId: string, name: string): Promise<Account | null>;
  create(account: Account): Promise<Account>;
  update(account: Account): Promise<Account>;
  delete(id: string): Promise<void>;
}
```

Crie `src/domain/repositories/ITransactionRepository.ts`:

```typescript
import { Transaction } from '../entities/Transaction';

export interface ITransactionFilters {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  type?: string;
  categoryId?: string;
  accountId?: string;
  search?: string;
  offset?: number;
  limit?: number;
}

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByFilters(filters: ITransactionFilters): Promise<{ data: Transaction[]; total: number }>;
  create(transaction: Transaction): Promise<Transaction>;
  update(transaction: Transaction): Promise<Transaction>;
  delete(id: string): Promise<void>;
}
```

#### Passo 3: Criar Infrastructure Repositories

Crie `src/infrastructure/repositories/PrismaUserRepository.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

/**
 * Implementação de IUserRepository usando Prisma
 */
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { id },
    });

    return data ? this.mapToEntity(data) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { email },
    });

    return data ? this.mapToEntity(data) : null;
  }

  async create(user: User): Promise<User> {
    const data = await this.prisma.user.create({
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
      },
    });

    return this.mapToEntity(data);
  }

  async update(user: User): Promise<User> {
    const data = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        name: user.name,
      },
    });

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  private mapToEntity(data: any): User {
    return new User({
      id: data.id,
      email: data.email,
      password: data.password,
      name: data.name,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
```

Crie `src/infrastructure/repositories/PrismaAccountRepository.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { Account } from '../../domain/entities/Account';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';

export class PrismaAccountRepository implements IAccountRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Account | null> {
    const data = await this.prisma.account.findUnique({
      where: { id },
    });

    return data ? this.mapToEntity(data) : null;
  }

  async findByUserId(userId: string): Promise<Account[]> {
    const data = await this.prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return data.map((item) => this.mapToEntity(item));
  }

  async findByUserIdAndName(userId: string, name: string): Promise<Account | null> {
    const data = await this.prisma.account.findFirst({
      where: { userId, name },
    });

    return data ? this.mapToEntity(data) : null;
  }

  async create(account: Account): Promise<Account> {
    const data = await this.prisma.account.create({
      data: {
        userId: account.userId,
        name: account.name,
        balance: account.balance,
        type: account.type,
      },
    });

    return this.mapToEntity(data);
  }

  async update(account: Account): Promise<Account> {
    const data = await this.prisma.account.update({
      where: { id: account.id },
      data: {
        name: account.name,
        balance: account.balance,
        type: account.type,
      },
    });

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.account.delete({
      where: { id },
    });
  }

  private mapToEntity(data: any): Account {
    return new Account({
      id: data.id,
      userId: data.userId,
      name: data.name,
      balance: parseFloat(data.balance.toString()),
      type: data.type,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
```

#### Passo 4: Criar Use Cases (Application Layer)

Crie `src/application/usecases/RegisterUserUseCase.ts`:

```typescript
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

/**
 * Use Case: Registrar novo usuário
 * Implementa lógica de aplicação para registro
 */
export class RegisterUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: {
    email: string;
    password: string;
    name: string;
  }): Promise<User> {
    // Validar entrada
    if (!input.email || !input.password || !input.name) {
      throw new Error('Email, senha e nome são obrigatórios');
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new Error('Email inválido');
    }

    // Validar senha
    const passwordValidation = User.validatePassword(input.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // Verificar se email já existe
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    // Criar novo usuário (sem fazer hash - isso é responsabilidade da camada de apresentação)
    const user = new User({
      id: '', // Será atribuído no banco
      email: input.email,
      password: input.password,
      name: input.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.userRepository.create(user);
  }
}
```

Crie `src/application/usecases/CreateTransactionUseCase.ts`:

```typescript
import { Transaction } from '../../domain/entities/Transaction';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';

export class CreateTransactionUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private accountRepository: IAccountRepository
  ) {}

  async execute(input: {
    userId: string;
    accountId: string;
    categoryId: string;
    amount: number;
    type: string;
    description?: string;
    date: Date;
  }): Promise<Transaction> {
    // Validar conta
    const account = await this.accountRepository.findById(input.accountId);
    if (!account || account.userId !== input.userId) {
      throw new Error('Conta não encontrada');
    }

    // Criar transação
    const transaction = new Transaction({
      id: '',
      userId: input.userId,
      accountId: input.accountId,
      categoryId: input.categoryId,
      amount: input.amount,
      type: input.type,
      description: input.description,
      date: input.date,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Validar regras de negócio
    const validation = transaction.validate();
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Atualizar saldo da conta
    account.deposit(transaction.getImpact());
    await this.accountRepository.update(account);

    // Persistir transação
    return this.transactionRepository.create(transaction);
  }
}
```

#### Passo 5: Criar Dependency Injection Container

Crie `src/infrastructure/di/Container.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../repositories/PrismaUserRepository';
import { PrismaAccountRepository } from '../repositories/PrismaAccountRepository';
import { RegisterUserUseCase } from '../../application/usecases/RegisterUserUseCase';
import { CreateTransactionUseCase } from '../../application/usecases/CreateTransactionUseCase';

/**
 * Container de Dependency Injection
 * Centraliza criação de todas as dependências
 */
export class Container {
  private static instance: Container;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * Repositories
   */
  getUserRepository() {
    return new PrismaUserRepository(this.prisma);
  }

  getAccountRepository() {
    return new PrismaAccountRepository(this.prisma);
  }

  /**
   * Use Cases
   */
  getRegisterUserUseCase(): RegisterUserUseCase {
    return new RegisterUserUseCase(this.getUserRepository());
  }

  getCreateTransactionUseCase(): CreateTransactionUseCase {
    return new CreateTransactionUseCase(
      // Retornar implementação real de ITransactionRepository
      // this.getTransactionRepository(),
      this.getAccountRepository()
    );
  }

  /**
   * Fechar conexão com banco
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
```

#### Passo 6: Criar Controllers Refatorados

Crie `src/presentation/controllers/RegisterController.ts`:

```typescript
import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/usecases/RegisterUserUseCase';
import { hashPassword, generateTokenPair } from '../../utils/auth';
import { storeRefreshToken } from '../../services/redis';

/**
 * Controller de Autenticação - Camada de Apresentação
 * Responsável apenas por HTTP concerns
 */
export class RegisterController {
  constructor(private registerUserUseCase: RegisterUserUseCase) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      // Use case retorna usuário
      const user = await this.registerUserUseCase.execute({
        email,
        password,
        name,
      });

      // Fazer hash da senha
      const hashedPassword = await hashPassword(password);

      // Gerar tokens
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
      });

      // Armazenar refresh token
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
    } catch (error: any) {
      console.error('Erro no registro:', error);
      res.status(400).json({ error: error.message });
    }
  }
}
```

---

## ✅ TESTES

### Testes Unitários

Crie `src/tests/RegisterUserUseCase.test.ts`:

```typescript
import { RegisterUserUseCase } from '../application/usecases/RegisterUserUseCase';
import { User } from '../domain/entities/User';

// Mock do repository
class MockUserRepository {
  users: User[] = [];

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email) || null;
  }

  async create(user: User) {
    user.id = Math.random().toString();
    this.users.push(user);
    return user;
  }
}

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let mockRepository: MockUserRepository;

  beforeEach(() => {
    mockRepository = new MockUserRepository();
    useCase = new RegisterUserUseCase(mockRepository as any);
  });

  test('deve registrar usuário com dados válidos', async () => {
    const result = await useCase.execute({
      email: 'test@test.com',
      password: 'Password123',
      name: 'Test User',
    });

    expect(result.email).toBe('test@test.com');
    expect(result.name).toBe('Test User');
  });

  test('deve rejeitar email inválido', async () => {
    await expect(
      useCase.execute({
        email: 'invalid-email',
        password: 'Password123',
        name: 'Test',
      })
    ).rejects.toThrow('Email inválido');
  });

  test('deve rejeitar senha fraca', async () => {
    await expect(
      useCase.execute({
        email: 'test@test.com',
        password: 'weak',
        name: 'Test',
      })
    ).rejects.toThrow();
  });

  test('deve rejeitar email duplicado', async () => {
    await useCase.execute({
      email: 'test@test.com',
      password: 'Password123',
      name: 'Test',
    });

    await expect(
      useCase.execute({
        email: 'test@test.com',
        password: 'Password123',
        name: 'Another',
      })
    ).rejects.toThrow('Email já cadastrado');
  });
});
```

Crie `src/tests/Transaction.test.ts`:

```typescript
import { Transaction } from '../domain/entities/Transaction';

describe('Transaction Entity', () => {
  test('deve validar transação com dados válidos', () => {
    const transaction = new Transaction({
      id: '1',
      userId: 'user1',
      accountId: 'account1',
      categoryId: 'category1',
      amount: 100,
      type: 'expense',
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const validation = transaction.validate();
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('deve rejeitar valor negativo', () => {
    const transaction = new Transaction({
      id: '1',
      userId: 'user1',
      accountId: 'account1',
      categoryId: 'category1',
      amount: -100,
      type: 'expense',
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const validation = transaction.validate();
    expect(validation.valid).toBe(false);
  });

  test('deve calcular impacto corretamente', () => {
    const income = new Transaction({
      id: '1',
      userId: 'user1',
      accountId: 'account1',
      categoryId: 'category1',
      amount: 100,
      type: 'income',
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const expense = new Transaction({
      id: '2',
      userId: 'user1',
      accountId: 'account1',
      categoryId: 'category1',
      amount: 100,
      type: 'expense',
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(income.getImpact()).toBe(100);
    expect(expense.getImpact()).toBe(-100);
  });
});
```

---

## 📚 CONCEITOS RELACIONADOS

1. **Domain-Driven Design**: Separação clara de responsabilidades
2. **Repository Pattern**: Abstração de acesso a dados
3. **Use Cases**: Lógica de aplicação independente de framework
4. **Dependency Injection**: Facilita testabilidade
5. **SOLID Principles**: Especialmente S, D, I

---

## ☑️ CHECKLIST

- [x] Domain entities criadas
- [x] Repository interfaces definidas
- [x] Implementações Prisma dos repositories
- [x] Use cases criados
- [x] Dependency Injection container
- [x] Controllers refatorados
- [x] Testes unitários básicos
- [x] Separação clara de camadas
- [x] Código testável e desacoplado
