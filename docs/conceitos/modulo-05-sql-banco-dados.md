# Módulo 5: SQL e Banco de Dados

## Objetivos deste Módulo

- Dominar SQL desde o básico até queries avançadas
- Entender todos os tipos de JOINs
- Dominar agregações e GROUP BY
- Trabalhar com subqueries e CTEs
- Criar índices eficientes
- Garantir consistência com ACID e Transações
- Otimizar queries e resolver N+1 Problem
- Implementar paginação corretamente

## Índice

1. [SQL Básico](#sql-básico)
2. [Manipulação de Dados (CRUD)](#manipulação-de-dados-crud)
3. [JOINs - Combinando Tabelas](#joins---combinando-tabelas)
4. [Agregações e GROUP BY](#agregações-e-group-by)
5. [Subqueries e CTEs](#subqueries-e-ctes)
6. [Índices e Performance](#índices-e-performance)
7. [Transações e ACID](#transações-e-acid)
8. [Query Optimization](#query-optimization)
9. [N+1 Problem](#n1-problem)
10. [Paginação](#paginação)
11. [Checklist de Conhecimentos](#checklist-de-conhecimentos)

---

## SQL Básico

### O que é SQL?

SQL (Structured Query Language) é a linguagem padrão para comunicar com bancos de dados relacionais.

```
┌──────────────────────────────────┐
│      Aplicação (Node.js)         │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│    Escrever Query em SQL         │
│  SELECT * FROM usuarios          │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│    Banco de Dados (PostgreSQL)   │
│  - Processa query                │
│  - Busca dados                   │
│  - Retorna resultado             │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│    JSON/Objetos em Código        │
│  [{ id: 1, nome: 'João' }, ...] │
└──────────────────────────────────┘
```

### Estrutura de um Banco Relacional

```
┌─────────────────────────────────┐
│  BANCO DE DADOS: fintrack       │
└────────────┬────────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌─────────────┐  ┌──────────────┐
│ TABELA      │  │ TABELA       │
│ usuarios    │  │ transacoes   │
├─────────────┤  ├──────────────┤
│ id (pk)     │  │ id (pk)      │
│ email       │  │ usuarioId(fk)│
│ nome        │  │ valor        │
│ senha       │  │ data         │
└─────────────┘  └──────────────┘

PK = Primary Key (identificador único)
FK = Foreign Key (referência a outra tabela)
```

### Criar Tabelas

```sql
-- ✅ Criar tabela de usuários
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,           -- Auto-incremento
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ Criar tabela de contas
CREATE TABLE contas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(50),
  saldo DECIMAL(15, 2) DEFAULT 0,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ✅ Criar tabela de transações
CREATE TABLE transacoes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  conta_id INTEGER NOT NULL,
  tipo VARCHAR(20) NOT NULL,        -- 'receita' ou 'despesa'
  categoria VARCHAR(100) NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (conta_id) REFERENCES contas(id) ON DELETE CASCADE
);
```

### Tipos de Dados SQL

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| INT, SERIAL | Número inteiro | `1, 42, 1000` |
| DECIMAL(15,2) | Número decimal | `1234.56` |
| VARCHAR(255) | Texto variável | `'João Silva'` |
| TEXT | Texto longo | Descrições, comentários |
| BOOLEAN | Verdadeiro/Falso | `true, false` |
| DATE | Data | `2025-02-19` |
| TIMESTAMP | Data e hora | `2025-02-19 14:30:00` |
| UUID | ID único | `550e8400-e29b-41d4-a716-446655440000` |

---

## Manipulação de Dados (CRUD)

### CREATE - Inserir Dados

```sql
-- ✅ Inserir um usuário
INSERT INTO usuarios (email, nome, senha)
VALUES ('joao@example.com', 'João Silva', 'hash_senha');

-- ✅ Inserir múltiplos usuários
INSERT INTO usuarios (email, nome, senha)
VALUES
  ('maria@example.com', 'Maria Santos', 'hash_senha'),
  ('pedro@example.com', 'Pedro Costa', 'hash_senha');

-- ✅ Inserir e retornar ID gerado
INSERT INTO usuarios (email, nome, senha)
VALUES ('ana@example.com', 'Ana Oliveira', 'hash_senha')
RETURNING id, email;
-- Resultado: id: 4, email: 'ana@example.com'
```

### READ - Consultar Dados

```sql
-- ✅ Básico: Selecionar tudo
SELECT * FROM usuarios;

-- ✅ Selecionar colunas específicas
SELECT id, nome, email FROM usuarios;

-- ✅ Com apelidos (alias)
SELECT
  id AS usuario_id,
  nome AS nome_completo,
  email AS endereco_email
FROM usuarios;

-- ✅ Filtrar com WHERE
SELECT * FROM usuarios
WHERE ativo = true;

SELECT * FROM transacoes
WHERE valor > 100;

SELECT * FROM usuarios
WHERE email LIKE '%@gmail.com';

-- ✅ Múltiplas condições
SELECT * FROM transacoes
WHERE tipo = 'despesa'
  AND valor > 50
  AND data >= '2025-01-01';

-- ✅ OR (uma OU outra)
SELECT * FROM usuarios
WHERE email = 'joao@example.com'
   OR email = 'maria@example.com';

-- ✅ IN (está em lista)
SELECT * FROM transacoes
WHERE categoria IN ('aluguel', 'alimentação', 'transporte');

-- ✅ BETWEEN (entre valores)
SELECT * FROM transacoes
WHERE valor BETWEEN 100 AND 1000;

-- ✅ NULL check
SELECT * FROM usuarios
WHERE descricao IS NULL;
SELECT * FROM usuarios
WHERE descricao IS NOT NULL;

-- ✅ ORDER BY (ordenar)
SELECT * FROM usuarios
ORDER BY nome ASC;  -- Ascendente (A-Z)

SELECT * FROM transacoes
ORDER BY valor DESC; -- Descendente (Z-A)

-- ✅ LIMIT (limitar resultados)
SELECT * FROM usuarios
LIMIT 10;

-- ✅ OFFSET (pular resultados)
SELECT * FROM usuarios
LIMIT 10 OFFSET 20;  -- Pular 20, pegar 10
```

### UPDATE - Atualizar Dados

```sql
-- ✅ Atualizar um usuário
UPDATE usuarios
SET nome = 'João Silva Santos'
WHERE id = 1;

-- ✅ Atualizar múltiplas colunas
UPDATE usuarios
SET
  nome = 'João Silva',
  atualizado_em = CURRENT_TIMESTAMP
WHERE id = 1;

-- ✅ Atualizar múltiplos registros
UPDATE usuarios
SET ativo = false
WHERE email LIKE '%@hotmail.com';

-- ✅ Atualizar com cálculos
UPDATE contas
SET saldo = saldo + 100
WHERE id = 5;

-- ✅ Atualizar e retornar
UPDATE usuarios
SET nome = 'Novo Nome'
WHERE id = 1
RETURNING id, nome;
```

### DELETE - Remover Dados

```sql
-- ✅ Deletar um usuário
DELETE FROM usuarios
WHERE id = 1;

-- ✅ Deletar múltiplos
DELETE FROM usuarios
WHERE criado_em < '2024-01-01';

-- ⚠️ CUIDADO - Deletar TUDO
DELETE FROM usuarios; -- Isso deleta TODA a tabela!

-- ✅ Verificar antes de deletar
SELECT COUNT(*) FROM usuarios
WHERE criado_em < '2024-01-01'; -- Ver quantos serão deletados

-- DEPOIS deletar com segurança
DELETE FROM usuarios
WHERE criado_em < '2024-01-01';
```

---

## JOINs - Combinando Tabelas

### Visualização dos JOINs

```
Tabela A (usuarios)        Tabela B (contas)
┌──────────────┐          ┌──────────────┐
│ id │ nome    │          │ id │ user_id │
├──────────────┤          ├──────────────┤
│ 1  │ João    │          │ 1  │ 1       │
│ 2  │ Maria   │          │ 2  │ 1       │
│ 3  │ Pedro   │          │ 3  │ 2       │
└──────────────┘          │ 4  │ 2       │
                          └──────────────┘

INNER JOIN (A ∩ B)         LEFT JOIN (A → B)
┌────────────┐            ┌──────────────┐
│ 1, João    │            │ 1, João      │
│ 2, Maria   │            │ 2, Maria     │
└────────────┘            │ 3, Pedro     │
                          └──────────────┘
```

### INNER JOIN - Apenas Registros Comuns

```sql
-- ✅ Buscar usuários COM contas (ambos existem)
SELECT u.id, u.nome, c.id, c.nome
FROM usuarios u
INNER JOIN contas c ON u.id = c.usuario_id;

-- Resultado:
-- usuario_id | usuario_nome | conta_id | conta_nome
-- 1          | João         | 1        | Conta Corrente
-- 1          | João         | 2        | Poupança
-- 2          | Maria        | 3        | Conta Corrente
```

### LEFT JOIN - Todos de A + Correspondentes de B

```sql
-- ✅ Todos usuários MAIS suas contas (mesmo sem contas)
SELECT u.id, u.nome, COUNT(c.id) as total_contas
FROM usuarios u
LEFT JOIN contas c ON u.id = c.usuario_id
GROUP BY u.id, u.nome;

-- Resultado:
-- usuario_id | usuario_nome | total_contas
-- 1          | João         | 2
-- 2          | Maria        | 2
-- 3          | Pedro        | 0        (sem contas)
```

### RIGHT JOIN - Todos de B + Correspondentes de A

```sql
-- ✅ Todas contas MAIS seu usuário (mesmo se usuário deletado)
SELECT c.id, c.nome, u.nome as usuario_nome
FROM usuarios u
RIGHT JOIN contas c ON u.id = c.usuario_id;

-- Resultado: Mesmo que LEFT JOIN, mas com ênfase em contas
```

### FULL OUTER JOIN - Todos de ambos

```sql
-- ✅ Todos usuários E todas contas
SELECT u.id as user_id, u.nome, c.id as conta_id, c.nome
FROM usuarios u
FULL OUTER JOIN contas c ON u.id = c.usuario_id;

-- Resultado:
-- user_id | user_nome | conta_id | conta_nome
-- 1       | João      | 1        | Corrente
-- 1       | João      | 2        | Poupança
-- 2       | Maria     | 3        | Corrente
-- 3       | Pedro     | NULL     | NULL
-- NULL    | NULL      | 4        | Conta Extra (sem usuário)
```

### Cross Join - Produto Cartesiano

```sql
-- ⚠️ Cuidado: Multiplica todos com todos!
SELECT u.nome, c.nome
FROM usuarios u
CROSS JOIN contas c;

-- Resultado: 3 usuários × 4 contas = 12 linhas!
```

### JOINs com Múltiplas Tabelas

```sql
-- ✅ FinTrack: Usuário → Contas → Transações
SELECT
  u.nome as usuario,
  c.nome as conta,
  t.descricao,
  t.valor,
  t.data
FROM usuarios u
INNER JOIN contas c ON u.id = c.usuario_id
INNER JOIN transacoes t ON c.id = t.conta_id
WHERE t.data >= '2025-01-01'
ORDER BY t.data DESC;
```

---

## Agregações e GROUP BY

### Funções de Agregação

```sql
-- ✅ COUNT - Contar registros
SELECT COUNT(*) FROM usuarios;              -- Total: 3
SELECT COUNT(id) FROM usuarios;             -- Não-NULL: 3
SELECT COUNT(DISTINCT usuario_id) FROM transacoes; -- Únicos

-- ✅ SUM - Somar valores
SELECT SUM(valor) FROM transacoes
WHERE tipo = 'receita';
-- Resultado: 5000 (total de receitas)

-- ✅ AVG - Média
SELECT AVG(valor) FROM transacoes
WHERE tipo = 'despesa';
-- Resultado: 250.50 (ticket médio)

-- ✅ MIN/MAX - Menor/Maior
SELECT
  MIN(valor) as menor_transacao,
  MAX(valor) as maior_transacao
FROM transacoes;

-- ✅ STRING_AGG - Concatenar strings (PostgreSQL)
SELECT
  usuario_id,
  STRING_AGG(categoria, ', ') as categorias
FROM transacoes
GROUP BY usuario_id;
-- Resultado: "alimentação, transporte, aluguel"
```

### GROUP BY - Agrupar Dados

```sql
-- ✅ Despesas por categoria
SELECT
  categoria,
  COUNT(*) as total_transacoes,
  SUM(valor) as total_gasto,
  AVG(valor) as ticket_medio
FROM transacoes
WHERE tipo = 'despesa'
GROUP BY categoria
ORDER BY total_gasto DESC;

-- Resultado:
-- categoria    | total_trans | total_gasto | ticket_medio
-- alimentação  | 15          | 1500        | 100
-- aluguel      | 1           | 2000        | 2000
-- transporte   | 8           | 400         | 50

-- ✅ Receitas por mês
SELECT
  DATE_TRUNC('month', data)::date as mes,
  SUM(valor) as total_receitas,
  COUNT(*) as numero_transacoes
FROM transacoes
WHERE tipo = 'receita'
GROUP BY DATE_TRUNC('month', data)
ORDER BY mes DESC;

-- ✅ Com múltiplas colunas de agrupamento
SELECT
  usuario_id,
  tipo,
  COUNT(*) as total
FROM transacoes
GROUP BY usuario_id, tipo;
```

### HAVING - Filtrar Agregações

```sql
-- ❌ ERRADO: WHERE não funciona com agregações
SELECT categoria, COUNT(*) as total
FROM transacoes
WHERE COUNT(*) > 5       -- ❌ ERRO!
GROUP BY categoria;

-- ✅ CORRETO: Usar HAVING
SELECT categoria, COUNT(*) as total
FROM transacoes
GROUP BY categoria
HAVING COUNT(*) > 5;     -- ✅ Funciona!

-- ✅ Mais exemplos
SELECT
  usuario_id,
  COUNT(*) as transacoes,
  SUM(valor) as total_gasto
FROM transacoes
WHERE tipo = 'despesa'
GROUP BY usuario_id
HAVING SUM(valor) > 1000 -- Apenas usuários que gastaram > 1000
ORDER BY total_gasto DESC;
```

---

## Subqueries e CTEs

### Subqueries Simples

```sql
-- ✅ Usuários com mais de 1 conta
SELECT * FROM usuarios
WHERE id IN (
  SELECT usuario_id FROM contas
  GROUP BY usuario_id
  HAVING COUNT(*) > 1
);

-- ✅ Transações acima da média
SELECT * FROM transacoes
WHERE valor > (
  SELECT AVG(valor) FROM transacoes
);

-- ✅ Subquery no SELECT
SELECT
  nome,
  (SELECT COUNT(*) FROM contas WHERE usuario_id = u.id) as total_contas,
  (SELECT SUM(valor) FROM transacoes WHERE usuario_id = u.id) as total_gasto
FROM usuarios u;
```

### CTEs - Common Table Expressions (WITH)

```sql
-- ✅ CTE simples
WITH usuario_com_mais_contas AS (
  SELECT usuario_id, COUNT(*) as total
  FROM contas
  GROUP BY usuario_id
  ORDER BY total DESC
  LIMIT 1
)
SELECT u.nome, c.total as total_contas
FROM usuarios u
JOIN usuario_com_mais_contas c ON u.id = c.usuario_id;

-- ✅ Múltiplas CTEs
WITH receitas AS (
  SELECT usuario_id, SUM(valor) as total
  FROM transacoes
  WHERE tipo = 'receita'
  GROUP BY usuario_id
),
despesas AS (
  SELECT usuario_id, SUM(valor) as total
  FROM transacoes
  WHERE tipo = 'despesa'
  GROUP BY usuario_id
)
SELECT
  r.usuario_id,
  COALESCE(r.total, 0) as receitas,
  COALESCE(d.total, 0) as despesas,
  COALESCE(r.total, 0) - COALESCE(d.total, 0) as saldo
FROM receitas r
FULL OUTER JOIN despesas d ON r.usuario_id = d.usuario_id;

-- ✅ CTE Recursiva (para árvores)
WITH RECURSIVE sequencia AS (
  SELECT 1 as numero
  UNION ALL
  SELECT numero + 1
  FROM sequencia
  WHERE numero < 10
)
SELECT * FROM sequencia;
-- Resultado: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
```

---

## Índices e Performance

### O que é Índice?

```
┌─────────────────────────────────────┐
│ Sem Índice (Varredura Completa)    │
├─────────────────────────────────────┤
│ id │ email        │ nome            │
│ 1  │ a@email.com  │ João            │
│ 2  │ b@email.com  │ Maria           │ ← Buscar por email
│ 3  │ c@email.com  │ Pedro           │   precisa ler todas
│ 4  │ d@email.com  │ Ana             │   as linhas!
│ 5  │ e@email.com  │ Carlos          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Com Índice B-tree (Busca Rápida)    │
├─────────────────────────────────────┤
│      ÍNDICE (ordenado)              │
│    a@email.com  → linha 1           │
│    b@email.com  → linha 2           │
│    c@email.com  → linha 3  ← Acesso direto!
│    d@email.com  → linha 4
│    e@email.com  → linha 5
└─────────────────────────────────────┘
```

### Criar Índices

```sql
-- ✅ Índice simples (coluna única)
CREATE INDEX idx_usuarios_email ON usuarios(email);
-- Agora: SELECT * FROM usuarios WHERE email = '...' é rápido!

-- ✅ Índice único (força unicidade + melhora busca)
CREATE UNIQUE INDEX idx_usuarios_email_unico ON usuarios(email);

-- ✅ Índice composto (múltiplas colunas)
CREATE INDEX idx_transacoes_usuario_data ON transacoes(usuario_id, data);
-- Otimiza: WHERE usuario_id = 1 AND data > '2025-01-01'

-- ✅ Índice parcial (apenas alguns registros)
CREATE INDEX idx_usuarios_ativos ON usuarios(id)
WHERE ativo = true;
-- Mais rápido que índice completo

-- ✅ Ver índices
SELECT * FROM pg_indexes WHERE tablename = 'usuarios';

-- ✅ Remover índice
DROP INDEX idx_usuarios_email;
```

### Quando Criar Índices

```
✅ Crie índice para:
- Colunas usadas em WHERE frequentemente
- Colunas usadas em JOINs (FOREIGN KEYS)
- Colunas ordenadas com ORDER BY
- Colunas com LIKE '%termo'

❌ NÃO crie índice para:
- Colunas booleanas (poucas variações)
- Tabelas muito pequenas
- Colunas raramente consultadas
- Colunas com muitos NULLs
```

### EXPLAIN - Analisar Performance

```sql
-- ✅ Analisar como query é executada
EXPLAIN SELECT * FROM usuarios WHERE email = 'joao@example.com';

-- Resultado sem índice:
-- Seq Scan on usuarios (cost=0.00..35.00 rows=1 width=100)
--   Filter: (email = 'joao@example.com')

-- Resultado COM índice:
-- Index Scan using idx_usuarios_email (cost=0.29..8.30 rows=1 width=100)
--   Index Cond: (email = 'joao@example.com')

-- ✅ EXPLAIN ANALYZE - Executar e medir tempo real
EXPLAIN ANALYZE
SELECT * FROM transacoes
WHERE usuario_id = 1 AND valor > 100;
-- Mostra tempo de execução real vs planejado
```

---

## Transações e ACID

### O que é Transação?

Transação é um conjunto de operações que deve acontecer atomicamente (tudo ou nada).

```
┌────────────────────────────────────┐
│  BEGIN TRANSACTION                 │
│  ├─ Operação 1: UPDATE             │
│  ├─ Operação 2: INSERT             │
│  ├─ Operação 3: DELETE             │
│  └─ Se alguma falhar...            │
│     ROLLBACK (desfaz tudo)          │
│     ou                             │
│     COMMIT (confirma tudo)          │
└────────────────────────────────────┘
```

### Propriedades ACID

| Propriedade | O que é | Exemplo |
|------------|---------|---------|
| **A**tomicity | Tudo ou nada | Transferência de dinheiro: débito + crédito |
| **C**onsistency | Dados válidos | Saldo nunca fica negativo |
| **I**solation | Operações isoladas | User A não vê mudanças de User B até confirmar |
| **D**urability | Dados persistem | Se servidor cair, dados mantêm |

### Transações Básicas

```sql
-- ✅ Simples
BEGIN;
UPDATE contas SET saldo = saldo - 100 WHERE id = 1;
UPDATE contas SET saldo = saldo + 100 WHERE id = 2;
COMMIT;  -- Ambas confirmadas

-- ✅ Com rollback se erro
BEGIN;
UPDATE contas SET saldo = saldo - 100 WHERE id = 1;
-- Oops, conta errada!
ROLLBACK;  -- Desfaz a atualização

-- ✅ Transferência com validação
BEGIN;
  -- Debitar
  UPDATE contas
  SET saldo = saldo - 500
  WHERE id = 1 AND saldo >= 500;

  IF @@rowcount = 0 THEN
    ROLLBACK;  -- Saldo insuficiente!
  ELSE
    -- Creditar
    UPDATE contas
    SET saldo = saldo + 500
    WHERE id = 2;
    COMMIT;
  END IF;
```

### Níveis de Isolamento

```sql
-- 1. READ UNCOMMITTED (Não recomendado)
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

-- 2. READ COMMITTED (Padrão, recomendado)
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 3. REPEATABLE READ
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- 4. SERIALIZABLE (Mais seguro, mais lento)
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

### Savepoints - Desfazer Parcialmente

```sql
BEGIN;
INSERT INTO transacoes VALUES (...);
SAVEPOINT primeiro_insert;

INSERT INTO transacoes VALUES (...);
-- Oops, erro no segundo insert

ROLLBACK TO primeiro_insert;  -- Volta ao primeiro
-- Primeiro insert mantém, segundo é desfeito

COMMIT;  -- Confirma apenas o primeiro
```

---

## Query Optimization

### Problemas Comuns

```sql
-- ❌ 1. SELECT * (pega colunas não usadas)
SELECT * FROM usuarios WHERE id = 1;

-- ✅ CORRETO: Selecionar apenas necessário
SELECT id, nome, email FROM usuarios WHERE id = 1;

-- ❌ 2. LIKE no início (não usa índice)
SELECT * FROM usuarios WHERE nome LIKE '%Silva';

-- ✅ CORRETO: LIKE no final
SELECT * FROM usuarios WHERE nome LIKE 'Silva%';

-- ❌ 3. Função em coluna indexada (perde índice)
SELECT * FROM transacoes
WHERE YEAR(data) = 2025;

-- ✅ CORRETO: Comparação direta
SELECT * FROM transacoes
WHERE data >= '2025-01-01' AND data < '2026-01-01';

-- ❌ 4. OR sem índice no segundo termo
SELECT * FROM usuarios
WHERE email = 'joao@example.com' OR nome = 'João';

-- ✅ CORRETO: UNION se possível
SELECT * FROM usuarios WHERE email = 'joao@example.com'
UNION
SELECT * FROM usuarios WHERE nome = 'João';

-- ❌ 5. Agregação em subquery ineficiente
SELECT u.nome,
  (SELECT COUNT(*) FROM transacoes t WHERE t.usuario_id = u.id) as total
FROM usuarios u;

-- ✅ CORRETO: LEFT JOIN + GROUP BY
SELECT u.nome, COUNT(t.id) as total
FROM usuarios u
LEFT JOIN transacoes t ON u.id = t.usuario_id
GROUP BY u.id, u.nome;
```

### Query Reescrita - Comparação

```sql
-- ❌ Lento: Múltiplas subqueries
SELECT
  (SELECT SUM(valor) FROM transacoes WHERE usuario_id = u.id AND tipo = 'receita'),
  (SELECT SUM(valor) FROM transacoes WHERE usuario_id = u.id AND tipo = 'despesa'),
  (SELECT AVG(valor) FROM transacoes WHERE usuario_id = u.id)
FROM usuarios u;

-- ✅ Rápido: Uma única query
SELECT
  u.id,
  SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) as receitas,
  SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as despesas,
  AVG(valor) as media
FROM usuarios u
LEFT JOIN transacoes t ON u.id = t.usuario_id
GROUP BY u.id;
```

---

## N+1 Problem

### O que é N+1?

```
Você quer dados de 100 usuários com suas contas.

❌ N+1 QUERIES (MAU):
Query 1: SELECT * FROM usuarios;  → 100 usuários
Query 2: SELECT * FROM contas WHERE usuario_id = 1;
Query 3: SELECT * FROM contas WHERE usuario_id = 2;
Query 4: SELECT * FROM contas WHERE usuario_id = 3;
...
Query 101: SELECT * FROM contas WHERE usuario_id = 100;
Total: 101 queries! (1 + N)

✅ JOIN (BOM):
Query 1: SELECT u.*, c.* FROM usuarios u
         LEFT JOIN contas c ON u.id = c.usuario_id;
Total: 1 query!
```

### Exemplo Prático

```javascript
// ❌ PROBLEMA: N+1 queries
async function obterUsuariosComContas() {
  const usuarios = await prisma.usuario.findMany();
  // Query 1: SELECT * FROM usuarios

  const usuariosComContas = [];
  for (const user of usuarios) {
    const contas = await prisma.conta.findMany({
      where: { usuarioId: user.id }
    });
    // Queries 2, 3, 4... para cada usuário!
    usuariosComContas.push({ ...user, contas });
  }

  return usuariosComContas; // Fez 101 queries!
}

// ✅ SOLUÇÃO: Include
async function obterUsuariosComContas() {
  return await prisma.usuario.findMany({
    include: {
      contas: true  // Faz JOIN automaticamente
    }
  });
  // Apenas 1-2 queries!
}
```

### Identificar N+1 no Backend

```javascript
// Em produção, ative logs para detectar N+1
// src/config/database.js

const prisma = new PrismaClient({
  log: ['query'] // Log todas as queries
});

// Saída:
// Query 1: SELECT ... FROM usuarios (50ms)
// Query 2: SELECT ... FROM contas WHERE usuario_id = 1 (10ms)
// Query 3: SELECT ... FROM contas WHERE usuario_id = 2 (9ms)
// ... (padrão N+1 óbvio!)

// Também monitore com ferramentas como:
// - Query Insights do PostgreSQL
// - Sentry
// - DataDog
```

---

## Paginação

### Offset-Based Pagination

```sql
-- ✅ Página 1 (10 itens por página)
SELECT * FROM transacoes
ORDER BY data DESC
LIMIT 10 OFFSET 0;

-- ✅ Página 2
SELECT * FROM transacoes
ORDER BY data DESC
LIMIT 10 OFFSET 10;

-- ✅ Página 5
SELECT * FROM transacoes
ORDER BY data DESC
LIMIT 10 OFFSET 40;

-- ✅ Com total de registros
SELECT COUNT(*) as total FROM transacoes;
-- Usuário sabe que tem 500 registros = 50 páginas
```

### Cursor-Based Pagination (Melhor)

```sql
-- ❌ PROBLEMA com offset: Lento em páginas grandes
SELECT * FROM transacoes
LIMIT 10 OFFSET 1000000;
-- Precisa ler 1 MILHÃO de linhas para pular!

-- ✅ SOLUÇÃO: Cursor (próxima página começa depois do último ID)
-- Primeira página
SELECT * FROM transacoes
WHERE id > 0  -- Começa do 0
ORDER BY id ASC
LIMIT 10;
-- Retorna IDs: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

-- Próxima página (usa cursor = 10)
SELECT * FROM transacoes
WHERE id > 10  -- Começa depois do último
ORDER BY id ASC
LIMIT 10;
-- Retorna: 11, 12, 13, ..., 20

-- Próxima (cursor = 20)
SELECT * FROM transacoes
WHERE id > 20
ORDER BY id ASC
LIMIT 10;
-- Rápido mesmo que sejam MILHÕES de registros!
```

### Implementação em Node.js

```javascript
// ✅ Offset pagination
async function obterTransacoes(pagina = 1, limite = 20) {
  const offset = (pagina - 1) * limite;

  const [transacoes, total] = await Promise.all([
    prisma.transacao.findMany({
      skip: offset,
      take: limite,
      orderBy: { data: 'desc' }
    }),
    prisma.transacao.count()
  ]);

  return {
    dados: transacoes,
    paginacao: {
      pagina,
      limite,
      total,
      paginas: Math.ceil(total / limite)
    }
  };
}

// ✅ Cursor pagination
async function obterTransacoesCursor(cursor = 0, limite = 20) {
  const transacoes = await prisma.transacao.findMany({
    where: { id: { gt: cursor } },
    take: limite + 1, // Pega um a mais para verificar se tem próxima
    orderBy: { id: 'asc' }
  });

  const temProxima = transacoes.length > limite;
  const dados = transacoes.slice(0, limite);
  const proximoCursor = dados.length > 0 ? dados[dados.length - 1].id : null;

  return {
    dados,
    paginacao: {
      proximoCursor,
      temProxima
    }
  };
}

// API Routes
app.get('/api/transacoes', async (req, res) => {
  const { pagina = 1, limite = 20 } = req.query;
  const resultado = await obterTransacoes(Number(pagina), Number(limite));
  res.json(resultado);
});

app.get('/api/transacoes/cursor', async (req, res) => {
  const { cursor = 0, limite = 20 } = req.query;
  const resultado = await obterTransacoesCursor(Number(cursor), Number(limite));
  res.json(resultado);
});
```

### Frontend com Paginação

```javascript
function ListaTransacoes() {
  const [pagina, setPagina] = React.useState(1);
  const [transacoes, setTransacoes] = React.useState([]);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    buscarTransacoes(pagina);
  }, [pagina]);

  const buscarTransacoes = async (page) => {
    const response = await fetch(`/api/transacoes?pagina=${page}&limite=20`);
    const { dados, paginacao } = await response.json();
    setTransacoes(dados);
    setTotal(paginacao.total);
  };

  const proxima = () => setPagina(p => p + 1);
  const anterior = () => setPagina(p => Math.max(1, p - 1));

  return (
    <div>
      {transacoes.map(t => <TransacaoCard key={t.id} {...t} />)}
      <button onClick={anterior} disabled={pagina === 1}>Anterior</button>
      <span>Página {pagina}</span>
      <button onClick={proxima}>Próxima</button>
    </div>
  );
}
```

---

## Checklist de Conhecimentos

- [ ] Criar e entender tabelas relacionais
- [ ] CRUD completo (CREATE, READ, UPDATE, DELETE)
- [ ] WHERE, ORDER BY, LIMIT, OFFSET
- [ ] Todos os tipos de JOIN (INNER, LEFT, RIGHT, FULL)
- [ ] GROUP BY, HAVING, agregações (COUNT, SUM, AVG)
- [ ] Subqueries e CTEs
- [ ] Criar índices apropriados
- [ ] EXPLAIN para analisar performance
- [ ] Transações e ACID
- [ ] Evitar N+1 queries
- [ ] Paginação (offset vs cursor)
- [ ] Query optimization
- [ ] Lidar com NULLs apropriadamente
- [ ] Funções de data/hora
- [ ] Backups e recovery

---

## Próximo Módulo

Agora que você domina SQL, explore **Módulo 6: Arquitetura e Design Patterns** para estruturar seu código de forma profissional e escalável.
