# Módulo 8: Testes

## Objetivos deste Módulo

- Entender Test Pyramid
- Escrever Unit Tests com Jest
- Escrever Integration Tests com Supertest
- Escrever E2E Tests com Playwright
- Aplicar TDD (Test-Driven Development)
- Mocks, stubs e spies
- Code coverage
- Test patterns e boas práticas

## Índice

1. [Test Pyramid](#test-pyramid)
2. [Unit Tests com Jest](#unit-tests-com-jest)
3. [Integration Tests com Supertest](#integration-tests-com-supertest)
4. [E2E Tests com Playwright](#e2e-tests-com-playwright)
5. [TDD - Red, Green, Refactor](#tdd---red-green-refactor)
6. [Mocks, Stubs e Spies](#mocks-stubs-e-spies)
7. [Code Coverage](#code-coverage)
8. [Checklist de Conhecimentos](#checklist-de-conhecimentos)

---

## Test Pyramid

### Conceito - Equilibrar Testes

```
                      ▲
                     ╱│╲
                    ╱ │ ╲         E2E Tests (poucos)
                   ╱  │  ╲        Lentos, quebram fácil
                  ╱   │   ╲
                 ╱    │    ╲
                ╱─────┼─────╲     Integration Tests (alguns)
               ╱      │      ╲    Médios, confiáveis
              ╱───────┼───────╲
             ╱         │        ╲   Unit Tests (muitos)
            ╱──────────┼────────╲ Rápidos, específicos
           ╱───────────┴────────╲

Proporção ideal: 70% Unit, 20% Integration, 10% E2E
```

### Por que essa proporção?

| Tipo | Velocidade | Confiabilidade | Custo | Quantidade |
|------|-----------|----------------|-------|-----------|
| Unit | 🟢 Rápido | 🟢 Alta | 🟢 Baixo | ⬆️ Muitos |
| Integration | 🟡 Médio | 🟡 Média | 🟡 Médio | ⬆️ Alguns |
| E2E | 🔴 Lento | 🔴 Baixa | 🔴 Alto | ⬆️ Poucos |

---

## Unit Tests com Jest

### Setup

```bash
npm install --save-dev jest @babel/preset-env babel-jest

# package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Básico de Jest

```javascript
// src/utils/calcular.js
function somar(a, b) {
  return a + b;
}

function subtrair(a, b) {
  return a - b;
}

module.exports = { somar, subtrair };

// src/utils/calcular.test.js
const { somar, subtrair } = require('./calcular');

describe('Funções Matemáticas', () => {
  // ✅ Teste simples
  test('deve somar dois números', () => {
    expect(somar(2, 3)).toBe(5);
  });

  test('deve subtrair dois números', () => {
    expect(subtrair(5, 3)).toBe(2);
  });

  // ✅ Teste com múltiplos cenários (only roda este)
  test.only('somar com números negativos', () => {
    expect(somar(-2, 3)).toBe(1);
  });

  // ✅ Teste ignorado (skip pula este)
  test.skip('algo para depois', () => {
    expect(true).toBe(true);
  });
});
```

### Matchers Jest

```javascript
describe('Matchers Jest', () => {
  // Igualdade
  test('toBe - igualdade exata (primitivos)', () => {
    expect(2 + 2).toBe(4);
  });

  test('toEqual - igualdade profunda (objetos)', () => {
    expect({ nome: 'João' }).toEqual({ nome: 'João' });
  });

  // Truthiness
  test('toBeNull / toBeUndefined / toBeDefined', () => {
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
    expect('algo').toBeDefined();
  });

  test('toBeTruthy / toBeFalsy', () => {
    expect(1).toBeTruthy();
    expect(0).toBeFalsy();
  });

  // Números
  test('toBeGreaterThan / toBeLessThan', () => {
    expect(10).toBeGreaterThan(5);
    expect(5).toBeLessThan(10);
  });

  test('toBeCloseTo - números com casas decimais', () => {
    expect(0.1 + 0.2).toBeCloseTo(0.3);
  });

  // Strings
  test('toMatch - regex', () => {
    expect('Fintrack').toMatch(/track/i);
  });

  // Arrays
  test('toContain - contem elemento', () => {
    expect([1, 2, 3]).toContain(2);
  });

  test('toHaveLength - comprimento', () => {
    expect([1, 2, 3]).toHaveLength(3);
  });

  // Objetos
  test('toHaveProperty - tem propriedade', () => {
    expect({ nome: 'João' }).toHaveProperty('nome');
  });

  // Exceções
  test('toThrow - joga erro', () => {
    expect(() => {
      throw new Error('Algo deu errado');
    }).toThrow('Algo deu errado');
  });

  // Negação
  test('not - negação', () => {
    expect(5).not.toBe(3);
  });
});
```

### Testando Funções Assíncronas

```javascript
// ❌ ERRADO: Não esperar Promise
test('buscar usuário', () => {
  const promise = buscarUsuario(1);
  expect(promise).toBeDefined();  // ❌ Promise sim, dados não!
});

// ✅ CORRETO: Retornar Promise
test('buscar usuário', () => {
  return buscarUsuario(1).then(usuario => {
    expect(usuario.nome).toBe('João');
  });
});

// ✅ COM async/await
test('buscar usuário com async', async () => {
  const usuario = await buscarUsuario(1);
  expect(usuario.nome).toBe('João');
});

// ✅ COM resolves
test('buscar usuário com resolves', () => {
  return expect(buscarUsuario(1)).resolves.toEqual({
    id: 1,
    nome: 'João'
  });
});

// ✅ Teste que rejeição (erro)
test('erro ao buscar usuário inválido', () => {
  return expect(buscarUsuario(-1)).rejects.toThrow('ID inválido');
});
```

### Setup e Teardown

```javascript
describe('Operações com Banco de Dados', () => {
  // ✅ Antes de todos os testes
  beforeAll(() => {
    console.log('Conectando ao BD...');
    // Conectar BD, carregar fixtures
  });

  // ✅ Depois de todos os testes
  afterAll(() => {
    console.log('Desconectando BD...');
    // Fechar conexões
  });

  // ✅ Antes de cada teste
  beforeEach(() => {
    console.log('Limpando BD...');
    // Limpar tabelas, resetar estado
  });

  // ✅ Depois de cada teste
  afterEach(() => {
    console.log('Verificando limpeza...');
    // Validar estado
  });

  test('criar usuário', async () => {
    const usuario = await criarUsuario({ nome: 'João' });
    expect(usuario.id).toBeDefined();
  });

  test('buscar usuário', async () => {
    const usuario = await buscarUsuario(1);
    expect(usuario.nome).toBe('João');
  });
});
```

---

## Integration Tests com Supertest

### Setup

```bash
npm install --save-dev supertest
```

### Testando APIs HTTP

```javascript
// tests/integration/usuarios.test.js
const request = require('supertest');
const app = require('../../src/app');
const { prisma } = require('../../src/config/database');

describe('Endpoints de Usuários', () => {
  beforeAll(async () => {
    // Conectar BD
    await prisma.$connect();
  });

  afterAll(async () => {
    // Limpar e desconectar
    await prisma.usuario.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Limpar BD antes de cada teste
    await prisma.usuario.deleteMany();
  });

  // ✅ Teste de POST - Criar usuário
  test('POST /api/usuarios - Criar novo usuário', async () => {
    const response = await request(app)
      .post('/api/usuarios')
      .send({
        email: 'joao@example.com',
        nome: 'João Silva',
        senha: 'Senha123!'
      })
      .expect(201);  // Esperar status 201

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe('joao@example.com');
    expect(response.body).not.toHaveProperty('senha');  // Nunca retornar senha
  });

  // ✅ Teste de validação
  test('POST /api/usuarios - Rejeitar email inválido', async () => {
    const response = await request(app)
      .post('/api/usuarios')
      .send({
        email: 'email-invalido',
        nome: 'João',
        senha: 'Senha123!'
      })
      .expect(400);  // Bad request

    expect(response.body).toHaveProperty('erro');
  });

  // ✅ Teste de GET
  test('GET /api/usuarios/:id - Obter usuário', async () => {
    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        email: 'joao@example.com',
        nome: 'João',
        senhaHash: 'hash'
      }
    });

    // Fazer requisição
    const response = await request(app)
      .get(`/api/usuarios/${usuario.id}`)
      .set('Authorization', `Bearer ${token}`)  // Com autenticação
      .expect(200);

    expect(response.body.email).toBe('joao@example.com');
  });

  // ✅ Teste de DELETE
  test('DELETE /api/usuarios/:id - Deletar usuário', async () => {
    const usuario = await prisma.usuario.create({
      data: {
        email: 'joao@example.com',
        nome: 'João',
        senhaHash: 'hash'
      }
    });

    await request(app)
      .delete(`/api/usuarios/${usuario.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);  // No content

    // Verificar que foi deletado
    const usuarioDeletado = await prisma.usuario.findUnique({
      where: { id: usuario.id }
    });
    expect(usuarioDeletado).toBeNull();
  });

  // ✅ Teste de autenticação
  test('GET /api/usuarios/perfil - Sem token retorna 401', async () => {
    const response = await request(app)
      .get('/api/usuarios/perfil')
      .expect(401);

    expect(response.body).toHaveProperty('erro');
  });
});
```

### Testando com Dados Reais vs Mock

```javascript
// ❌ Com dados reais (mais lento)
test('criar transação', async () => {
  const usuario = await prisma.usuario.create({
    data: { email: 'test@example.com', nome: 'Test', senhaHash: 'hash' }
  });

  const conta = await prisma.conta.create({
    data: { usuarioId: usuario.id, nome: 'Conta', saldo: 1000 }
  });

  const response = await request(app)
    .post('/api/transacoes')
    .set('Authorization', `Bearer ${token}`)
    .send({
      contaId: conta.id,
      tipo: 'despesa',
      valor: 100,
      categoria: 'alimentação',
      data: new Date()
    })
    .expect(201);

  expect(response.body.valor).toBe(100);
});

// ✅ Com fixtures (mais rápido)
describe('Com fixtures', () => {
  let usuario, conta;

  beforeEach(async () => {
    usuario = await criadorUsuario.criar({ email: 'test@example.com' });
    conta = await criadorConta.criar({ usuarioId: usuario.id, saldo: 1000 });
  });

  test('criar transação com fixture', async () => {
    const response = await request(app)
      .post('/api/transacoes')
      .set('Authorization', `Bearer ${gerarToken(usuario.id)}`)
      .send({
        contaId: conta.id,
        tipo: 'despesa',
        valor: 100,
        categoria: 'alimentação',
        data: new Date()
      })
      .expect(201);

    expect(response.body.valor).toBe(100);
  });
});
```

---

## E2E Tests com Playwright

### Setup

```bash
npm install --save-dev @playwright/test

# playwright.config.js
export default {
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
};
```

### Escrevendo E2E Tests

```javascript
// tests/e2e/login.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Login User', () => {
  test.beforeEach(async ({ page }) => {
    // Antes de cada teste, ir para página
    await page.goto('http://localhost:3000/login');
  });

  test('deve fazer login com credenciais válidas', async ({ page }) => {
    // Preencher form
    await page.fill('input[name="email"]', 'joao@example.com');
    await page.fill('input[name="senha"]', 'Senha123!');

    // Clique no botão
    await page.click('button:has-text("Entrar")');

    // Esperar navegação
    await page.waitForNavigation();

    // Verificar que foi para dashboard
    expect(page.url()).toContain('/dashboard');

    // Verificar elemento na página
    await expect(page.locator('text=Bem-vindo')).toBeVisible();
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalido@example.com');
    await page.fill('input[name="senha"]', 'SenhaErrada123!');
    await page.click('button:has-text("Entrar")');

    // Verificar mensagem de erro
    await expect(page.locator('text=Credenciais inválidas')).toBeVisible();

    // Verificar que ficou na mesma página
    expect(page.url()).toContain('/login');
  });

  test('Deve validar email obrigatório', async ({ page }) => {
    // Deixar email vazio
    await page.fill('input[name="senha"]', 'Senha123!');
    await page.click('button:has-text("Entrar")');

    // Verificar mensagem de validação
    await expect(page.locator('text=Email obrigatório')).toBeVisible();
  });
});

// tests/e2e/dashboard.spec.js
test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'joao@example.com');
    await page.fill('input[name="senha"]', 'Senha123!');
    await page.click('button:has-text("Entrar")');
    await page.waitForNavigation();
  });

  test('deve criar nova transação', async ({ page }) => {
    // Clique no botão de nova transação
    await page.click('button:has-text("Nova Transação")');

    // Preencher form
    await page.selectOption('select[name="tipo"]', 'despesa');
    await page.fill('input[name="valor"]', '100.50');
    await page.selectOption('select[name="categoria"]', 'alimentacao');
    await page.fill('input[name="descricao"]', 'Almoço');

    // Enviar
    await page.click('button:has-text("Salvar")');

    // Verificar sucesso
    await expect(page.locator('text=Transação criada')).toBeVisible();

    // Verificar transação na lista
    await expect(page.locator('text=Almoço')).toBeVisible();
  });

  test('deve visualizar saldo atualizado', async ({ page }) => {
    const saldoAnterior = await page.locator('[data-testid="saldo"]').textContent();

    // Criar transação
    await page.click('button:has-text("Nova Transação")');
    await page.selectOption('select[name="tipo"]', 'receita');
    await page.fill('input[name="valor"]', '1000');
    await page.click('button:has-text("Salvar")');

    // Aguardar atualização
    await page.waitForTimeout(1000);

    const saldoNovo = await page.locator('[data-testid="saldo"]').textContent();

    expect(saldoNovo).not.toBe(saldoAnterior);
  });
});
```

### Técnicas Úteis

```javascript
const { test, expect } = require('@playwright/test');

test('técnicas úteis', async ({ page }) => {
  // Navegação
  await page.goto('http://localhost:3000');
  await page.goBack();
  await page.goForward();

  // Esperas
  await page.waitForNavigation();
  await page.waitForSelector('.loading-spinner', { state: 'hidden' });
  await page.waitForTimeout(1000);
  await page.waitForFunction(() => document.body.innerText.includes('Carregado'));

  // Cliques
  await page.click('button');
  await page.dblclick('button');
  await page.rightClick('button');

  // Preenchimento
  await page.fill('input', 'texto');
  await page.type('input', 'texto', { delay: 100 });
  await page.press('input', 'Enter');

  // Seleção
  await page.selectOption('select', 'value');

  // Upload
  await page.setInputFiles('input[type="file"]', 'path/to/file.pdf');

  // Screenshots
  await page.screenshot({ path: 'screenshot.png' });

  // Verificações
  await expect(page).toHaveTitle('Fintrack');
  await expect(page).toHaveURL(/login/);
  await expect(page.locator('h1')).toContainText('Bem-vindo');
  await expect(page.locator('button')).toBeVisible();
  await expect(page.locator('button')).toBeDisabled();
  await expect(page.locator('input')).toHaveValue('João');
});
```

---

## TDD - Red, Green, Refactor

### Conceito

```
RED:       ❌ Escrever teste que falha
GREEN:     ✅ Escrever código mínimo para passar
REFACTOR:  ♻️  Melhorar código mantendo testes verdes
```

### Exemplo Prático - Criar Função

```javascript
// 1. RED ❌ - Escrever teste ANTES do código
describe('CriarTransacao', () => {
  test('deve criar transação com saldo correto', () => {
    const transacao = new Transacao();
    const resultado = transacao.criar({
      contaId: 1,
      tipo: 'despesa',
      valor: 100,
      categoria: 'alimentação'
    });

    expect(resultado.id).toBeDefined();
    expect(resultado.valor).toBe(100);
  });
});
// Teste falha porque classe não existe!

// 2. GREEN ✅ - Escrever código mínimo para passar
class Transacao {
  criar(dados) {
    return {
      id: Math.random(),
      valor: dados.valor
    };
  }
}
// Teste passa!

// 3. REFACTOR ♻️ - Melhorar mantendo testes verdes
class Transacao {
  constructor(repository) {
    this.repository = repository;
  }

  async criar(dados) {
    // Validar
    if (!dados.valor || dados.valor <= 0) {
      throw new Error('Valor inválido');
    }

    // Criar
    const transacao = {
      id: uuid(),
      ...dados,
      criadoEm: new Date()
    };

    // Persistir
    return await this.repository.salvar(transacao);
  }
}

// Atualizar teste se necessário
describe('CriarTransacao', () => {
  let mockRepository;
  let useCase;

  beforeEach(() => {
    mockRepository = {
      salvar: jest.fn().mockResolvedValue({ id: 1, valor: 100 })
    };
    useCase = new Transacao(mockRepository);
  });

  test('deve criar transação válida', async () => {
    const resultado = await useCase.criar({
      contaId: 1,
      tipo: 'despesa',
      valor: 100,
      categoria: 'alimentação'
    });

    expect(resultado.id).toBeDefined();
    expect(mockRepository.salvar).toHaveBeenCalled();
  });

  test('deve rejeitar valor inválido', async () => {
    expect(async () => {
      await useCase.criar({
        contaId: 1,
        tipo: 'despesa',
        valor: -100,  // Inválido
        categoria: 'alimentação'
      });
    }).rejects.toThrow('Valor inválido');
  });
});
```

---

## Mocks, Stubs e Spies

### Mocks - Simular Objetos

```javascript
// ✅ Mock de repositório
const mockRepository = {
  criar: jest.fn(),
  obter: jest.fn(),
  listar: jest.fn()
};

mockRepository.criar.mockResolvedValue({ id: 1, nome: 'João' });
mockRepository.obter.mockRejectedValue(new Error('Não encontrado'));

describe('UsuarioService com mock', () => {
  test('deve criar usuário', async () => {
    const service = new UsuarioService(mockRepository);
    const resultado = await service.criar({ nome: 'João' });

    expect(resultado.id).toBe(1);
    expect(mockRepository.criar).toHaveBeenCalledWith({ nome: 'João' });
    expect(mockRepository.criar).toHaveBeenCalledTimes(1);
  });
});
```

### Stubs - Substituir Funções

```javascript
// ✅ Stub de função
const fs = require('fs');
jest.mock('fs');

test('deve ler arquivo', async () => {
  fs.readFile.mockImplementation((path, callback) => {
    callback(null, 'conteúdo do arquivo');
  });

  const conteudo = await lerArquivo('test.txt');
  expect(conteudo).toBe('conteúdo do arquivo');
});
```

### Spies - Monitorar Chamadas

```javascript
// ✅ Spy em função existente
const moduloOriginal = require('./modulo');
const spy = jest.spyOn(moduloOriginal, 'funcao');

test('monitorar chamadas', () => {
  moduloOriginal.funcao();
  moduloOriginal.funcao('arg1');

  expect(spy).toHaveBeenCalled();
  expect(spy).toHaveBeenCalledTimes(2);
  expect(spy).toHaveBeenCalledWith('arg1');

  spy.mockRestore();  // Restaurar função original
});
```

### Exemplo Completo - Transação Service

```javascript
// ✅ Testando com mocks
describe('TransacaoService', () => {
  let service;
  let mockTransacaoRepo;
  let mockContaRepo;
  let mockEmail;

  beforeEach(() => {
    mockTransacaoRepo = {
      criar: jest.fn(),
      obter: jest.fn()
    };

    mockContaRepo = {
      obter: jest.fn(),
      atualizarSaldo: jest.fn()
    };

    mockEmail = {
      enviar: jest.fn()
    };

    service = new TransacaoService(
      mockTransacaoRepo,
      mockContaRepo,
      mockEmail
    );
  });

  test('deve criar transação e atualizar saldo', async () => {
    // Arrange - Preparar dados
    const dados = {
      contaId: 1,
      tipo: 'despesa',
      valor: 100,
      categoria: 'alimentação'
    };

    mockContaRepo.obter.mockResolvedValue({
      id: 1,
      saldo: 1000
    });

    mockTransacaoRepo.criar.mockResolvedValue({
      id: 1,
      ...dados
    });

    // Act - Executar
    const resultado = await service.criar(dados);

    // Assert - Verificar
    expect(resultado.id).toBe(1);
    expect(mockTransacaoRepo.criar).toHaveBeenCalledWith(dados);
    expect(mockContaRepo.atualizarSaldo).toHaveBeenCalledWith(1, 900);
    expect(mockEmail.enviar).toHaveBeenCalled();
  });

  test('deve rejeitar se saldo insuficiente', async () => {
    mockContaRepo.obter.mockResolvedValue({
      id: 1,
      saldo: 50  // Insuficiente
    });

    await expect(
      service.criar({
        contaId: 1,
        tipo: 'despesa',
        valor: 100
      })
    ).rejects.toThrow('Saldo insuficiente');

    expect(mockTransacaoRepo.criar).not.toHaveBeenCalled();
  });
});
```

---

## Code Coverage

### Executar Coverage

```bash
npm run test:coverage

# Gera relatório em coverage/
```

### Interpretar Relatório

```
----------|----------|----------|----------|----------|
File      |  % Stmts | % Branch | % Funcs  | % Lines  |
----------|----------|----------|----------|----------|
All files |    85.2  |   78.1   |   90.5   |   84.8   |
 usuario. |    95.5  |   92.3   |   100    |   95.2   |
 service. |    75.0  |   60.0   |   85.0   |   74.0   |
----------|----------|----------|----------|----------|

% Stmts  - Linhas de código executadas
% Branch - Caminhos de decision (if/else)
% Funcs  - Funções testadas
% Lines  - Linhas totais
```

### Boas Práticas

```javascript
// ✅ Alvo: 80% de cobertura
// ❌ Não: 100% (teste de tudo, incluindo trivial)

describe('Cobertura útil', () => {
  test('caso de sucesso', () => {
    // ✅ Teste importante
  });

  test('caso de erro', () => {
    // ✅ Teste importante
  });

  test('validação de input', () => {
    // ✅ Teste importante
  });

  // ❌ Evitar testes triviais
  test('getter retorna valor', () => {
    // Dispensável, getter é trivial
  });
});

// package.json
{
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/index.js",
      "!src/**/*.test.js"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

---

## Checklist de Conhecimentos

- [ ] Test Pyramid - proporcionar testes
- [ ] Jest - setup e básico
- [ ] Matchers Jest (toBe, toEqual, etc)
- [ ] Testes assíncronos (async/await, resolves, rejects)
- [ ] beforeEach, afterEach, beforeAll, afterAll
- [ ] Supertest para testes de API
- [ ] Playwright para E2E tests
- [ ] TDD - Red, Green, Refactor
- [ ] Mocks de dependências
- [ ] Stubs de funções
- [ ] Spies para monitorar
- [ ] Code coverage
- [ ] Test patterns
- [ ] Fixtures e factories
- [ ] Cobertura apropriada (80%)

---

## Próximo Módulo

Agora que seu código é testado e confiável, explore **Módulo 9: DevOps e Deployment** para colocar em produção com segurança.
