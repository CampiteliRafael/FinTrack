# Módulo 4: React e Desenvolvimento Frontend

## Objetivos deste Módulo

- Dominar React fundamentals e componentes
- Entender TODOS os Hooks do React
- Criar Custom Hooks reutilizáveis
- Implementar React Router v6
- Gerenciar formulários com React Hook Form + Zod
- State management (Context API e Zustand)
- Performance optimization (code splitting, lazy loading)
- Design Patterns em React

## Índice

1. [React Fundamentals](#react-fundamentals)
2. [Componentes React](#componentes-react)
3. [Todos os Hooks Explicados](#todos-os-hooks-explicados)
4. [Custom Hooks](#custom-hooks)
5. [React Router v6](#react-router-v6)
6. [Formulários com React Hook Form](#formulários-com-react-hook-form)
7. [State Management](#state-management)
8. [Performance Optimization](#performance-optimization)
9. [Design Patterns](#design-patterns)
10. [Checklist de Conhecimentos](#checklist-de-conhecimentos)

---

## React Fundamentals

### O que é React?

React é uma biblioteca JavaScript para construir interfaces de usuário. Usa uma abordagem declarativa baseada em componentes.

```
┌─────────────────────────────────────┐
│      Estado da Aplicação            │
│    (dados, variáveis)               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│    Componentes React                │
│  (funções que retornam JSX)         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│      Virtual DOM                    │
│  (representação em memória)         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│      DOM Real (HTML)                │
│   (o que o usuário vê)              │
└─────────────────────────────────────┘
```

### JSX - JavaScript XML

```javascript
// ❌ SEM JSX (feio e confuso)
import React from 'react';

const elemento = React.createElement(
  'div',
  { className: 'container' },
  React.createElement('h1', null, 'Olá'),
  React.createElement('p', null, 'Bem-vindo')
);

// ✅ COM JSX (limpo e legível)
const elemento = (
  <div className="container">
    <h1>Olá</h1>
    <p>Bem-vindo</p>
  </div>
);

// JSX é convertido para JavaScript pelo transpilador
// <div className="title">{variavel}</div>
// ↓
// React.createElement('div', { className: 'title' }, variavel)
```

### Props - Passar dados entre componentes

```javascript
// ✅ Componente aceita props
function Cartao({ titulo, descricao, valor }) {
  return (
    <div className="cartao">
      <h3>{titulo}</h3>
      <p>{descricao}</p>
      <strong>R$ {valor}</strong>
    </div>
  );
}

// ✅ Usar o componente passando props
export default function App() {
  return (
    <>
      <Cartao
        titulo="Receita"
        descricao="Salário"
        valor={3000}
      />
      <Cartao
        titulo="Despesa"
        descricao="Aluguel"
        valor={1500}
      />
    </>
  );
}

// ✅ Props com default values
function Botao({ texto = 'Clique', cor = 'azul' }) {
  return <button className={`btn-${cor}`}>{texto}</button>;
}

// ✅ Props com destructuring
function Usuario({ usuario: { nome, email } }) {
  return (
    <div>
      <p>{nome}</p>
      <p>{email}</p>
    </div>
  );
}
```

### Renderização Condicional

```javascript
function Componente({ estaCarregando, erros, dados }) {
  // ❌ Forma verbosa
  if (estaCarregando) {
    return <div>Carregando...</div>;
  }
  if (erros) {
    return <div>Erro: {erros}</div>;
  }
  if (!dados) {
    return <div>Sem dados</div>;
  }
  return <div>{dados}</div>;
}

// ✅ Ternário (para 2 opções)
<div>
  {estaCarregando ? <Spinner /> : <Conteudo />}
</div>

// ✅ AND lógico (mostrar apenas se true)
{estaCarregando && <Spinner />}

// ✅ Switch para múltiplas opções
function Status({ estado }) {
  switch (estado) {
    case 'carregando':
      return <Spinner />;
    case 'erro':
      return <Erro />;
    case 'sucesso':
      return <Dados />;
    default:
      return null;
  }
}
```

### Listas e Keys

```javascript
function ListaTransacoes({ transacoes }) {
  return (
    <ul>
      {transacoes.map((transacao) => (
        // ⚠️ IMPORTANTE: key deve ser única e estável
        <li key={transacao.id}>
          <span>{transacao.descricao}</span>
          <span>R$ {transacao.valor}</span>
        </li>
      ))}
    </ul>
  );
}

// ❌ NUNCA use index como key (problema com re-ordenação)
transacoes.map((t, index) => <li key={index}>...</li>)

// ✅ Use ID único
transacoes.map((t) => <li key={t.id}>...</li>)

// ✅ Se sem ID, gere hash
import { v4 as uuidv4 } from 'uuid';
const transacoes = dados.map(t => ({ ...t, id: uuidv4() }));
```

---

## Componentes React

### Functional Components (moderno)

```javascript
// ✅ Functional component com hooks
function Usuario({ id }) {
  const [usuario, setUsuario] = React.useState(null);

  React.useEffect(() => {
    buscarUsuario(id).then(setUsuario);
  }, [id]);

  if (!usuario) return <div>Carregando...</div>;

  return (
    <div>
      <h2>{usuario.nome}</h2>
      <p>{usuario.email}</p>
    </div>
  );
}

export default Usuario;
```

### Class Components (legado)

```javascript
// ❌ Class component (evite, use functional)
class Contador extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  componentDidMount() {
    console.log('Componente montou');
  }

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          +1
        </button>
      </div>
    );
  }
}

// ✅ Versão com Functional Component
function Contador() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    console.log('Componente montou');
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

### Composição de Componentes

```javascript
// ✅ Componentes pequenos e reutilizáveis
function BotaoPrimario({ texto, onClick, desabilitado }) {
  return (
    <button
      onClick={onClick}
      disabled={desabilitado}
      className="btn btn-primary"
    >
      {texto}
    </button>
  );
}

function InputTexto({ label, valor, onChange, erro }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        type="text"
        value={valor}
        onChange={onChange}
        className={erro ? 'input-erro' : ''}
      />
      {erro && <span className="erro-msg">{erro}</span>}
    </div>
  );
}

// ✅ Composição
function FormularioTransacao() {
  const [descricao, setDescricao] = React.useState('');
  const [erroDescricao, setErroDescricao] = React.useState('');

  const validar = () => {
    if (!descricao) {
      setErroDescricao('Descrição obrigatória');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validar()) {
      console.log('Enviando:', descricao);
    }
  };

  return (
    <div>
      <InputTexto
        label="Descrição"
        valor={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        erro={erroDescricao}
      />
      <BotaoPrimario
        texto="Salvar"
        onClick={handleSubmit}
      />
    </div>
  );
}
```

---

## Todos os Hooks Explicados

### 1. useState - Estado Local

```javascript
function Contador() {
  // const [estado, setEstado] = useState(valorInicial)
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <p>Contagem: {count}</p>
      <button onClick={() => setCount(count + 1)}>Incrementar</button>
    </div>
  );
}

// ✅ Estado com objeto
function FormularioUsuario() {
  const [usuario, setUsuario] = React.useState({
    nome: '',
    email: '',
    idade: 0
  });

  const handleChange = (campo, valor) => {
    setUsuario(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  return (
    <>
      <input
        value={usuario.nome}
        onChange={(e) => handleChange('nome', e.target.value)}
      />
      <input
        value={usuario.email}
        onChange={(e) => handleChange('email', e.target.value)}
      />
    </>
  );
}

// ✅ setState com função (para lógica complexa)
function Carrinho() {
  const [itens, setItens] = React.useState([]);

  const adicionarItem = (item) => {
    setItens(prevItens => [...prevItens, item]);
  };

  const removerItem = (index) => {
    setItens(prevItens =>
      prevItens.filter((_, i) => i !== index)
    );
  };

  return <div>{itens.length} itens</div>;
}
```

### 2. useEffect - Efeitos Colaterais

```javascript
// useEffect(callback, dependências)
function BuscadorUsuarios() {
  const [usuarios, setUsuarios] = React.useState([]);
  const [busca, setBusca] = React.useState('');
  const [carregando, setCarregando] = React.useState(false);

  // ✅ Executar quando componente monta (uma vez)
  React.useEffect(() => {
    console.log('Componente montou');
    return () => {
      console.log('Componente vai desmontar (cleanup)');
    };
  }, []); // Array vazio = executar uma vez

  // ✅ Executar quando 'busca' muda
  React.useEffect(() => {
    if (!busca) {
      setUsuarios([]);
      return;
    }

    setCarregando(true);
    buscarUsuariosAPI(busca)
      .then(setUsuarios)
      .finally(() => setCarregando(false));
  }, [busca]); // Dependência: busca

  // ✅ Cleanup - executado quando desmonta ou antes de rodar novamente
  React.useEffect(() => {
    const timer = setTimeout(() => {
      console.log('2 segundos passaram');
    }, 2000);

    return () => clearTimeout(timer); // Limpar timeout
  }, []);

  return (
    <div>
      <input
        placeholder="Buscar..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />
      {carregando && <p>Carregando...</p>}
      {usuarios.map(u => <div key={u.id}>{u.nome}</div>)}
    </div>
  );
}

// ❌ ERRO COMUM: useEffect sem dependências
React.useEffect(() => {
  // Isso executa TODA vez que componente renderiza
  console.log('Executando constantemente'); // Problema de performance!
});

// ✅ CORRETO: Passar array de dependências
React.useEffect(() => {
  console.log('Executar uma vez');
}, []);
```

### 3. useContext - Compartilhar Estado Globalmente

```javascript
// Criar contexto
const UsuarioContext = React.createContext();

// Provider - fornece dados
function UsuarioProvider({ children }) {
  const [usuario, setUsuario] = React.useState(null);

  const fazerLogin = (dados) => {
    setUsuario(dados);
  };

  const fazerLogout = () => {
    setUsuario(null);
  };

  return (
    <UsuarioContext.Provider value={{ usuario, fazerLogin, fazerLogout }}>
      {children}
    </UsuarioContext.Provider>
  );
}

// Hook customizado para usar contexto
function useUsuario() {
  return React.useContext(UsuarioContext);
}

// App.js
function App() {
  return (
    <UsuarioProvider>
      <Dashboard />
    </UsuarioProvider>
  );
}

// Em qualquer componente dentro do Provider
function Header() {
  const { usuario, fazerLogout } = useUsuario();

  if (!usuario) {
    return <div>Não logado</div>;
  }

  return (
    <header>
      <p>Bem-vindo, {usuario.nome}</p>
      <button onClick={fazerLogout}>Sair</button>
    </header>
  );
}
```

### 4. useReducer - Estado Complexo

```javascript
// Semelhante a useState, mas para lógica complexa
function Carrinho() {
  const initialState = {
    itens: [],
    total: 0
  };

  function reducer(state, action) {
    switch (action.type) {
      case 'ADICIONAR_ITEM':
        return {
          itens: [...state.itens, action.payload],
          total: state.total + action.payload.preco
        };
      case 'REMOVER_ITEM':
        const item = state.itens[action.payload];
        return {
          itens: state.itens.filter((_, i) => i !== action.payload),
          total: state.total - item.preco
        };
      case 'LIMPAR':
        return initialState;
      default:
        return state;
    }
  }

  const [carrinho, dispatch] = React.useReducer(reducer, initialState);

  const adicionarItem = (item) => {
    dispatch({ type: 'ADICIONAR_ITEM', payload: item });
  };

  const removerItem = (index) => {
    dispatch({ type: 'REMOVER_ITEM', payload: index });
  };

  return (
    <div>
      <p>Total: R$ {carrinho.total}</p>
      <button onClick={() => adicionarItem({ nome: 'Produto', preco: 50 })}>
        Adicionar
      </button>
    </div>
  );
}
```

### 5. useMemo - Cachear Valores

```javascript
function ListaPesada() {
  const [lista, setLista] = React.useState([...Array(1000).keys()]);
  const [filtro, setFiltro] = React.useState('');

  // ❌ Recalcula a cada renderização
  const listaFiltrada = lista.filter(n => n.toString().includes(filtro));

  // ✅ Só recalcula quando 'lista' ou 'filtro' mudam
  const listaFiltradaMemo = React.useMemo(() => {
    console.log('Filtrando lista...');
    return lista.filter(n => n.toString().includes(filtro));
  }, [lista, filtro]); // Dependências

  return (
    <div>
      <input
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        placeholder="Filtrar..."
      />
      <p>Resultados: {listaFiltradaMemo.length}</p>
    </div>
  );
}

// ✅ useMemo com objetos complexos
function Componente({ dados }) {
  const usuarioFormatado = React.useMemo(() => {
    return {
      ...dados,
      nomeCompleto: `${dados.nome} ${dados.sobrenome}`,
      idade: new Date().getFullYear() - dados.anoNascimento
    };
  }, [dados]);

  return <div>{usuarioFormatado.nomeCompleto}</div>;
}
```

### 6. useCallback - Cachear Funções

```javascript
function ListaTarefas() {
  const [tarefas, setTarefas] = React.useState([]);
  const [filtro, setFiltro] = React.useState('');

  // ❌ Nova função a cada renderização
  const adicionarTarefa = (texto) => {
    setTarefas(prev => [...prev, { id: Date.now(), texto }]);
  };

  // ✅ Função é cacheada, só muda se dependências mudarem
  const adicionarTarefaMemo = React.useCallback((texto) => {
    setTarefas(prev => [...prev, { id: Date.now(), texto }]);
  }, []); // Sem dependências = nunca muda

  return (
    <>
      <FormularioTarefa onAdicionar={adicionarTarefaMemo} />
      <ListaFiltragemTarefas tarefas={tarefas} filtro={filtro} />
    </>
  );
}

// ✅ Sem useCallback, componente filho renderiza desnecessariamente
function Botao({ onClick, label }) {
  console.log('Renderizando botão'); // Isso rodaria MUITO sem useCallback

  return <button onClick={onClick}>{label}</button>;
}
```

### 7. useRef - Referência Mutável

```javascript
function Cronometro() {
  const [segundos, setSegundos] = React.useState(0);
  const intervalRef = React.useRef(null);

  const iniciar = () => {
    // useRef permite guardar referência que persiste entre renders
    intervalRef.current = setInterval(() => {
      setSegundos(s => s + 1);
    }, 1000);
  };

  const parar = () => {
    clearInterval(intervalRef.current);
  };

  return (
    <div>
      <p>{segundos}s</p>
      <button onClick={iniciar}>Iniciar</button>
      <button onClick={parar}>Parar</button>
    </div>
  );
}

// ✅ useRef para acessar elementos DOM
function Formulario() {
  const inputRef = React.useRef(null);

  const focusInput = () => {
    inputRef.current.focus();
  };

  const limpiarInput = () => {
    inputRef.current.value = '';
  };

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focar</button>
      <button onClick={limpiarInput}>Limpar</button>
    </div>
  );
}
```

### 8. useLayoutEffect - Sincronizado com DOM

```javascript
// Similar a useEffect, mas executado ANTES do navegador pintar
function ComponenteComMedicao() {
  const [altura, setAltura] = React.useState(0);
  const divRef = React.useRef(null);

  React.useLayoutEffect(() => {
    // Executado antes do paint, garante medições corretas
    if (divRef.current) {
      setAltura(divRef.current.offsetHeight);
    }
  }, []);

  return (
    <div ref={divRef}>
      <p>Altura: {altura}px</p>
    </div>
  );
}
```

### 9. useId - IDs Únicas

```javascript
function Formulario() {
  const emailId = React.useId();
  const senhaId = React.useId();

  return (
    <>
      <label htmlFor={emailId}>Email:</label>
      <input id={emailId} type="email" />

      <label htmlFor={senhaId}>Senha:</label>
      <input id={senhaId} type="password" />
    </>
  );
}
```

### 10. useTransition - Atualizações Não-Urgentes

```javascript
function ListaPesquisavel() {
  const [busca, setBusca] = React.useState('');
  const [resultados, setResultados] = React.useState([]);
  const [isPending, startTransition] = React.useTransition();

  const handleBusca = (valor) => {
    setBusca(valor);

    // startTransition marca como atualização não-urgente
    // Permite manter UI responsiva enquanto processa
    startTransition(() => {
      const resultadosFiltrados = buscarResultados(valor);
      setResultados(resultadosFiltrados);
    });
  };

  return (
    <div>
      <input
        value={busca}
        onChange={(e) => handleBusca(e.target.value)}
        placeholder="Buscar..."
      />
      {isPending && <p>Carregando resultados...</p>}
      {resultados.map(r => <div key={r.id}>{r.nome}</div>)}
    </div>
  );
}
```

---

## Custom Hooks

### Por que Custom Hooks?

Reutilizar lógica entre componentes de forma elegante e testável.

```javascript
// ✅ Custom Hook para formulários
function useFormulario(inicial) {
  const [valores, setValores] = React.useState(inicial);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValores(prev => ({ ...prev, [name]: value }));
  };

  const reset = () => {
    setValores(inicial);
  };

  return { valores, handleChange, reset };
}

// Usar em qualquer componente
function FormularioLogin() {
  const { valores, handleChange, reset } = useFormulario({
    email: '',
    senha: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login com:', valores);
    reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={valores.email}
        onChange={handleChange}
      />
      <input
        name="senha"
        value={valores.senha}
        onChange={handleChange}
        type="password"
      />
      <button type="submit">Entrar</button>
    </form>
  );
}
```

### Custom Hook - Fetch com Cache

```javascript
function useFetch(url) {
  const [dados, setDados] = React.useState(null);
  const [carregando, setCarregando] = React.useState(false);
  const [erro, setErro] = React.useState(null);

  React.useEffect(() => {
    let abortController = new AbortController();

    async function buscar() {
      try {
        setCarregando(true);
        const response = await fetch(url, {
          signal: abortController.signal
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}`);
        }

        const dados = await response.json();
        setDados(dados);
        setErro(null);
      } catch (erro) {
        if (erro.name !== 'AbortError') {
          setErro(erro.message);
        }
      } finally {
        setCarregando(false);
      }
    }

    buscar();

    return () => {
      abortController.abort(); // Cancelar requisição ao desmontar
    };
  }, [url]);

  return { dados, carregando, erro };
}

// Usar:
function ListaUsuarios() {
  const { dados, carregando, erro } = useFetch('/api/usuarios');

  if (carregando) return <p>Carregando...</p>;
  if (erro) return <p>Erro: {erro}</p>;

  return (
    <ul>
      {dados?.map(u => <li key={u.id}>{u.nome}</li>)}
    </ul>
  );
}
```

### Custom Hook - LocalStorage Sincronizado

```javascript
function useLocalStorage(chave, inicial) {
  const [valor, setValor] = React.useState(() => {
    const item = window.localStorage.getItem(chave);
    return item ? JSON.parse(item) : inicial;
  });

  const setValue = (novoValor) => {
    const valor = novoValor instanceof Function ? novoValor(valor) : novoValor;
    setValor(valor);
    window.localStorage.setItem(chave, JSON.stringify(valor));
  };

  return [valor, setValue];
}

// Usar:
function Preferencias() {
  const [tema, setTema] = useLocalStorage('tema', 'claro');
  const [idioma, setIdioma] = useLocalStorage('idioma', 'pt-BR');

  return (
    <div>
      <button onClick={() => setTema(tema === 'claro' ? 'escuro' : 'claro')}>
        Tema atual: {tema}
      </button>
      <select value={idioma} onChange={(e) => setIdioma(e.target.value)}>
        <option value="pt-BR">Português</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}
```

---

## React Router v6

### Setup

```bash
npm install react-router-dom
```

### Estrutura Básica

```javascript
// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// App.jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Transacoes from './pages/Transacoes';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/transacoes" element={<Transacoes />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
```

### Rotas Dinâmicas

```javascript
// App.jsx
function App() {
  return (
    <Routes>
      {/* :id é um parâmetro dinâmico */}
      <Route path="/usuarios/:id" element={<DetalhesUsuario />} />
      <Route path="/transacoes/:id" element={<DetalhesTransacao />} />
    </Routes>
  );
}

// pages/DetalhesUsuario.jsx
import { useParams } from 'react-router-dom';

function DetalhesUsuario() {
  const { id } = useParams();

  return <div>Detalhes do usuário {id}</div>;
}
```

### Navegação

```javascript
import { Link, useNavigate } from 'react-router-dom';

function Menu() {
  const navigate = useNavigate();

  return (
    <nav>
      {/* ✅ Link - renderiza <a> */}
      <Link to="/">Home</Link>
      <Link to="/dashboard">Dashboard</Link>

      {/* ✅ useNavigate - programático */}
      <button onClick={() => navigate('/dashboard')}>
        Ir para Dashboard
      </button>

      {/* ✅ Navegar e voltar */}
      <button onClick={() => navigate(-1)}>Voltar</button>

      {/* ✅ Com estado */}
      <button onClick={() => navigate('/detalhes', { state: { id: 1 } })}>
        Ver Detalhes
      </button>
    </nav>
  );
}

// Acessar estado passado
import { useLocation } from 'react-router-dom';

function Detalhes() {
  const location = useLocation();
  const { id } = location.state || {};

  return <div>ID: {id}</div>;
}
```

### Rotas Protegidas

```javascript
// ✅ Component para proteger rotas
function RotaPrivada({ element }) {
  const { usuario } = useUsuario(); // Do contexto

  return usuario ? element : <Navigate to="/login" replace />;
}

// App.jsx
import { Navigate } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={<RotaPrivada element={<Dashboard />} />}
      />
    </Routes>
  );
}
```

### Nested Routes

```javascript
function App() {
  return (
    <Routes>
      <Route path="/admin" element={<LayoutAdmin />}>
        <Route path="usuarios" element={<GerenciarUsuarios />} />
        <Route path="relatorios" element={<Relatorios />} />
      </Route>
    </Routes>
  );
}

function LayoutAdmin() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main>
        <Outlet /> {/* Renderiza a rota aninhada */}
      </main>
    </div>
  );
}
```

---

## Formulários com React Hook Form

### Setup

```bash
npm install react-hook-form zod @hookform/resolvers
```

### Básico

```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Definir schema
const usuarioSchema = z.object({
  nome: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmacao: z.string()
}).refine(data => data.senha === data.confirmacao, {
  message: 'Senhas não conferem',
  path: ['confirmacao']
});

// 2. Component
function FormularioRegistro() {
  const {
    register,      // Registrar inputs
    handleSubmit,  // Validar e enviar
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(usuarioSchema)
  });

  const onSubmit = async (dados) => {
    console.log('Dados válidos:', dados);
    // Enviar para API
    await api.post('/usuarios', dados);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input
          {...register('nome')}
          placeholder="Nome"
        />
        {errors.nome && <span>{errors.nome.message}</span>}
      </div>

      <div>
        <input
          {...register('email')}
          placeholder="Email"
        />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <div>
        <input
          {...register('senha')}
          type="password"
          placeholder="Senha"
        />
        {errors.senha && <span>{errors.senha.message}</span>}
      </div>

      <div>
        <input
          {...register('confirmacao')}
          type="password"
          placeholder="Confirme a Senha"
        />
        {errors.confirmacao && <span>{errors.confirmacao.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Registrar'}
      </button>
    </form>
  );
}
```

### Watch e Control

```javascript
function FormularioAvancado() {
  const { register, watch, control, handleSubmit } = useForm({
    defaultValues: {
      tipo: 'receita',
      valor: 0
    }
  });

  // ✅ Watch - observar mudanças em tempo real
  const tipoSelecionado = watch('tipo');
  const valorDigitado = watch('valor');

  return (
    <form>
      <select {...register('tipo')}>
        <option value="receita">Receita</option>
        <option value="despesa">Despesa</option>
      </select>

      <input
        type="number"
        {...register('valor', { valueAsNumber: true })}
      />

      {tipoSelecionado === 'despesa' && (
        <p>Despesa de R$ {valorDigitado}</p>
      )}
    </form>
  );
}
```

### Arrays Dinâmicos

```javascript
import { useFieldArray } from 'react-hook-form';

function FormularioTransacoes() {
  const { register, control } = useForm({
    defaultValues: {
      transacoes: [{ descricao: '', valor: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'transacoes'
  });

  return (
    <form>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`transacoes.${index}.descricao`)} />
          <input {...register(`transacoes.${index}.valor`)} />
          <button type="button" onClick={() => remove(index)}>
            Remover
          </button>
        </div>
      ))}
      <button type="button" onClick={() => append({ descricao: '', valor: 0 })}>
        Adicionar Transação
      </button>
    </form>
  );
}
```

---

## State Management

### Context API (Built-in)

```javascript
// contexts/AuthContext.jsx
import React from 'react';

const AuthContext = React.createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = React.useState(null);
  const [carregando, setCarregando] = React.useState(true);

  React.useEffect(() => {
    // Verificar se usuário já está logado
    verificarAutenticacao();
  }, []);

  const verificarAutenticacao = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const usuario = await buscarDadosUsuario(token);
      setUsuario(usuario);
    }
    setCarregando(false);
  };

  const login = async (email, senha) => {
    const { token, usuario } = await api.post('/login', { email, senha });
    localStorage.setItem('token', token);
    setUsuario(usuario);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}

// App.jsx
function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
```

### Zustand (Recomendado)

```bash
npm install zustand
```

```javascript
// store/useAuthStore.js
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  usuario: null,
  token: null,

  login: async (email, senha) => {
    const { token, usuario } = await api.post('/login', { email, senha });
    set({ usuario, token });
    localStorage.setItem('token', token);
  },

  logout: () => {
    set({ usuario: null, token: null });
    localStorage.removeItem('token');
  },

  verificarAutenticacao: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const usuario = await buscarDadosUsuario(token);
      set({ usuario, token });
    }
  }
}));

// Usar em qualquer componente
function Header() {
  const usuario = useAuthStore(state => state.usuario);
  const logout = useAuthStore(state => state.logout);

  return (
    <header>
      <p>{usuario?.nome}</p>
      <button onClick={logout}>Sair</button>
    </header>
  );
}
```

### Zustand vs Context API

| Aspecto | Context API | Zustand |
|--------|-------------|---------|
| Performance | Pode re-renderizar muito | Otimizado, só componentes que usam estado |
| Boilerplate | Mais código | Menos código |
| DevTools | Não nativo | Suporte a DevTools |
| Bundle Size | 0KB (built-in) | ~2KB |
| Curva de Aprendizado | Fácil | Muito fácil |

---

## Performance Optimization

### Code Splitting com Lazy Loading

```javascript
import { lazy, Suspense } from 'react';

// ✅ Lazy load de componentes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transacoes = lazy(() => import('./pages/Transacoes'));

function App() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<p>Carregando...</p>}>
            <Dashboard />
          </Suspense>
        }
      />
    </Routes>
  );
}
```

### Memoização de Componentes

```javascript
import { memo } from 'react';

// ❌ Renderiza sempre que props mudam (mesmo que não usadas)
function Cartao({ titulo, onClick }) {
  console.log('Renderizando Cartao');
  return <div onClick={onClick}>{titulo}</div>;
}

// ✅ Memoizado - só renderiza se props realmente mudam
const CartaoMemo = memo(Cartao);

// ✅ Com comparação customizada
const CartaoCustom = memo(
  Cartao,
  (propsAnterior, propsNovo) => {
    return propsAnterior.titulo === propsNovo.titulo;
  }
);

// Usar:
function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <CartaoMemo titulo="Título" /> {/* Não re-renderiza */}
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>Incrementar</button>
    </div>
  );
}
```

### Virtual List para Muitos Itens

```bash
npm install react-window
```

```javascript
import { FixedSizeList } from 'react-window';

function ListaMuitos({ itens }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {itens[index].nome}
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={itens.length}
      itemSize={35}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

---

## Design Patterns

### Compound Components

```javascript
// ✅ Padrão Compound - componentes cooperam
function Card({ children }) {
  return <div className="card">{children}</div>;
}

Card.Header = ({ children }) => <div className="card-header">{children}</div>;
Card.Body = ({ children }) => <div className="card-body">{children}</div>;
Card.Footer = ({ children }) => <div className="card-footer">{children}</div>;

// Usar:
<Card>
  <Card.Header>Título</Card.Header>
  <Card.Body>Conteúdo</Card.Body>
  <Card.Footer>Ação</Card.Footer>
</Card>
```

### Render Props

```javascript
// ✅ Render Props - passar função como prop
function ComMouse({ children }) {
  const [posicao, setPosicao] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setPosicao({ x: e.clientX, y: e.clientY });
  };

  return (
    <div onMouseMove={handleMouseMove}>
      {children(posicao)}
    </div>
  );
}

// Usar:
<ComMouse>
  {({ x, y }) => (
    <p>Mouse em ({x}, {y})</p>
  )}
</ComMouse>
```

### Higher-Order Components

```javascript
// HOC - envolver componente com lógica adicional
function comAutenticacao(Component) {
  return function ProtectedComponent(props) {
    const { usuario } = useAuth();

    if (!usuario) {
      return <p>Acesso negado</p>;
    }

    return <Component {...props} />;
  };
}

// Usar:
const DashboardProtegido = comAutenticacao(Dashboard);

<DashboardProtegido />
```

---

## Checklist de Conhecimentos

- [ ] JSX e renderização básica
- [ ] Props e prop drilling
- [ ] useState para estado local
- [ ] useEffect para efeitos colaterais
- [ ] useContext para estado global
- [ ] useReducer para lógica complexa
- [ ] useMemo e useCallback para performance
- [ ] useRef para referências DOM
- [ ] Custom Hooks reutilizáveis
- [ ] React Router v6 routing
- [ ] Rotas protegidas
- [ ] React Hook Form com Zod
- [ ] Context API vs Zustand
- [ ] Lazy loading e code splitting
- [ ] Memoização de componentes
- [ ] Compound Components pattern
- [ ] Tratamento de erros
- [ ] Testing React components

---

## Próximo Módulo

Agora que você domina React, explore **Módulo 5: SQL e Banco de Dados** para entender como os dados são armazenados e consultados.
