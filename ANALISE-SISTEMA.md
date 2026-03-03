# ANÁLISE COMPLETA DO SISTEMA - FINTRACK

## SCHEMA DO BANCO DE DADOS (Prisma)

### Modelos e Campos

#### User
- ✅ Campos: id, email, passwordHash, name, createdAt, updatedAt
- ❌ NÃO TEM: lastLoginAt (usado incorretamente em cleanup.worker.ts)

#### Account
- ✅ Campos: id, userId, name, initialBalance, currentBalance, availableBalance, reservedAmount, monthlyIncome, monthlyIncomeDay, lastTransactionAt, type, createdAt, updatedAt, deletedAt
- ✅ type: AccountType (checking, savings, cash)

#### Category
- ✅ Campos: id, userId, name, color, icon, createdAt, updatedAt, deletedAt
- ❌ NÃO TEM: type (usado incorretamente em CategoryRepositoryImpl.ts)

#### Transaction
- ✅ Campos: id, userId, accountId, categoryId, type, amount, description, date, createdAt, updatedAt, deletedAt
- ✅ type: TransactionType (income, expense)

#### AccountEvent
- ✅ Campos: id, accountId, type, amount, transactionId, installmentId, description, balanceBefore, balanceAfter, createdAt
- ✅ type: AccountEventType (transaction_income, transaction_expense, installment_payment, transfer_in, transfer_out, adjustment, initial_balance)
- ❌ NÃO TEM: INCOME ou BALANCE_UPDATE

#### Goal
- ✅ Campos: id, userId, name, targetAmount, currentAmount, deadline, categoryId, createdAt, updatedAt, deletedAt

#### Installment
- ✅ Campos: id, userId, transactionId, description, totalAmount, installments, currentInstallment, accountId, categoryId, startDate, createdAt, updatedAt, deletedAt

#### Notification
- ✅ Campos: id, userId, type, title, message, read, createdAt
- ✅ type: NotificationType (GOAL_ACHIEVED, REPORT_READY, WELCOME, SYSTEM)

---

## ERROS IDENTIFICADOS E CORREÇÕES NECESSÁRIAS

### 1. cleanup.worker.ts
**Erro:** Usa `lastLoginAt` que não existe no modelo User
**Correção:** Usar `updatedAt` como critério de inatividade
```typescript
where: {
  updatedAt: {
    lt: sixMonthsAgo,
  },
}
```

### 2. monthly-income.worker.ts
**Erro:** Usa tipo 'INCOME' que não existe em AccountEventType
**Correção:** Usar 'transaction_income'
```typescript
type: 'transaction_income'
```

### 3. CategoryRepositoryImpl.ts
**Erro:** Tenta usar campo 'type' que não existe no modelo Category
**Correção:** Remover o campo 'type' da criação
```typescript
data: {
  userId: category.userId,
  name: category.name,
  color: category.color,
  icon: category.icon,
}
```

### 4. notification.controller.ts e transaction.controller.ts
**Erro:** `req.params.id` pode ser `string | string[]`
**Correção:** Garantir que seja string
```typescript
const id = String(req.params.id);
```

### 5. password.validator.ts
**Erro:** `result.error.errors` não existe no Zod v4
**Correção:** Usar `result.error.issues`
```typescript
errors: result.error.issues.map((err) => err.message)
```

### 6. query.validator.ts
**Erro:** Sintaxe do Zod v4 mudou
**Correção:** Atualizar sintaxe de erro
```typescript
z.string({ message: 'ID é obrigatório' })

z.enum(['income', 'expense'], {
  errorMap: () => ({ message: 'Tipo inválido' })
})
```

### 7. jwt.util.ts
**Erro:** Type mismatch no expiresIn
**Correção:** Usar string diretamente (está correto)
```typescript
expiresIn: jwtConfig.accessTokenExpiresIn
```

### 8. AccountMapper.ts
**Erro:** Conversão de Account domain para Prisma faltando campos
**Correção:** Incluir todos os campos obrigatórios
```typescript
return {
  id: domain.id,
  userId: domain.userId,
  name: domain.name,
  initialBalance: new Decimal(domain.initialBalance),
  currentBalance: new Decimal(domain.currentBalance),
  availableBalance: new Decimal(domain.availableBalance),
  reservedAmount: new Decimal(domain.reservedAmount),
  monthlyIncome: domain.monthlyIncome ? new Decimal(domain.monthlyIncome) : null,
  monthlyIncomeDay: domain.monthlyIncomeDay,
  lastTransactionAt: domain.lastTransactionAt,
  type: domain.type,
  createdAt: domain.createdAt,
  updatedAt: domain.updatedAt,
  deletedAt: domain.deletedAt,
}
```

### 9. TransactionController.ts (infrastructure)
**Erro:** Arquivo não usado causando imports quebrados
**Correção:** Remover arquivo
```bash
rm Backend/src/infrastructure/http/controllers/TransactionController.ts
```

---

## ENUMS CORRETOS DO SISTEMA

### AccountType
```typescript
'checking' | 'savings' | 'cash'
```

### TransactionType
```typescript
'income' | 'expense'
```

### AccountEventType
```typescript
'transaction_income' | 'transaction_expense' | 'installment_payment' |
'transfer_in' | 'transfer_out' | 'adjustment' | 'initial_balance'
```

### NotificationType
```typescript
'GOAL_ACHIEVED' | 'REPORT_READY' | 'WELCOME' | 'SYSTEM'
```

---

## ARQUITETURA DO PROJETO

### Backend
```
Backend/
├── src/
│   ├── modules/          # Módulos principais (usado)
│   │   ├── accounts/
│   │   ├── auth/
│   │   ├── categories/
│   │   ├── transactions/
│   │   ├── goals/
│   │   ├── installments/
│   │   └── notifications/
│   ├── core/             # Domain entities (usado parcialmente)
│   │   ├── entities/
│   │   └── value-objects/
│   ├── infrastructure/   # ⚠️ Parcialmente obsoleto
│   │   ├── database/
│   │   │   ├── mappers/     # Usado
│   │   │   └── repositories/ # Usado
│   │   └── http/
│   │       └── controllers/ # ❌ NÃO USADO (remover)
│   ├── shared/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   └── validators/
│   ├── workers/
│   └── queues/
```

### Frontend
```
Frontend/
├── src/
│   ├── features/         # Módulos por feature
│   │   ├── accounts/
│   │   ├── auth/
│   │   ├── categories/
│   │   ├── transactions/
│   │   ├── goals/
│   │   └── installments/
│   ├── components/       # Componentes reutilizáveis
│   ├── contexts/         # Context API
│   └── services/         # API calls
```

---

## COMUNICAÇÃO FRONTEND <-> BACKEND

### Endpoints API

#### Auth
- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/refresh`
- POST `/api/v1/auth/logout`

#### Accounts
- GET `/api/v1/accounts`
- POST `/api/v1/accounts`
- GET `/api/v1/accounts/:id`
- PATCH `/api/v1/accounts/:id`
- DELETE `/api/v1/accounts/:id`

#### Categories
- GET `/api/v1/categories`
- POST `/api/v1/categories`
- GET `/api/v1/categories/:id`
- PATCH `/api/v1/categories/:id`
- DELETE `/api/v1/categories/:id`

#### Transactions
- GET `/api/v1/transactions`
- POST `/api/v1/transactions`
- GET `/api/v1/transactions/:id`
- PATCH `/api/v1/transactions/:id`
- DELETE `/api/v1/transactions/:id`

#### Goals
- GET `/api/v1/goals`
- POST `/api/v1/goals`
- GET `/api/v1/goals/:id`
- PATCH `/api/v1/goals/:id`
- DELETE `/api/v1/goals/:id`

#### Notifications
- GET `/api/v1/notifications`
- PATCH `/api/v1/notifications/:id/read`
- PATCH `/api/v1/notifications/read-all`
- DELETE `/api/v1/notifications/:id`

#### Dashboard
- GET `/api/v1/dashboard`

---

## PRÓXIMAS AÇÕES (EM ORDEM)

1. ✅ Documentar informações de deploy (DEPLOY-INFO.md)
2. ✅ Analisar schema e arquitetura (este arquivo)
3. ⏳ Corrigir erros baseados na análise real:
   - cleanup.worker.ts (lastLoginAt → updatedAt)
   - monthly-income.worker.ts (INCOME → transaction_income)
   - CategoryRepositoryImpl.ts (remover campo type)
   - Controllers (String conversion)
   - Validators (Zod v4 syntax)
   - AccountMapper.ts (campos completos)
4. ⏳ Rodar testes localmente
5. ⏳ Commit e push
6. ⏳ Verificar GitHub Actions
7. ⏳ Continuar deploy (Frontend Vercel)

---

**Última atualização:** 2026-03-03
