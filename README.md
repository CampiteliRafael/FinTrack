# 💰 FinTrack - Gestão Financeira Pessoal

<div align="center">

![FinTrack Banner](https://img.shields.io/badge/FinTrack-Gestão_Financeira-blue?style=for-the-badge)
[![Deploy Status](https://img.shields.io/badge/deploy-success-brightgreen?style=for-the-badge)](https://fintrack.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**Sistema completo de gestão financeira pessoal com recursos avançados de planejamento e controle**

[🚀 Demo ao Vivo](https://fintrack.vercel.app) • [📚 API Docs](https://fintrack-9iaq.onrender.com/api-docs) • [📖 Documentação Técnica](#documentação-técnica)

</div>

---

## 📋 Sobre o Projeto

O **FinTrack** é uma aplicação full-stack desenvolvida para ajudar pessoas a organizarem suas finanças pessoais de forma simples e eficiente. Com uma interface moderna e intuitiva, permite controlar receitas, despesas, metas e parcelamentos em um único lugar.

### 🎯 Principais Funcionalidades

#### 💳 Gestão de Contas
- Crie múltiplas contas (bancária, carteira, poupança)
- Visualize saldo atual, disponível e valores reservados
- Configure renda mensal automática
- Acompanhe o histórico de transações por conta

#### 📊 Dashboard Inteligente
- Resumo financeiro em tempo real
- Saldo total e do mês atual
- Gráficos de despesas por categoria
- Transações recentes
- Visão geral de metas e parcelamentos

#### 🏷️ Categorias Personalizáveis
- Crie categorias com cores e ícones personalizados
- Organize suas transações por tipo
- Visualize relatórios por categoria

#### 💸 Controle de Transações
- Registre receitas e despesas
- Vincule a contas e categorias específicas
- Adicione descrições detalhadas
- Filtre e pesquise transações
- Paginação para grandes volumes de dados

#### 🎯 Metas Financeiras
- Defina objetivos financeiros com valor alvo
- Acompanhe o progresso em porcentagem
- Adicione valores conforme economiza
- Filtros por metas ativas ou concluídas
- Vincule metas a categorias específicas

#### 🔄 Gestão de Parcelamentos
- Registre compras parceladas
- Acompanhe parcelas pagas e pendentes
- Visualize o progresso do pagamento
- Receba lembretes de vencimento
- Marque parcelas como pagas individualmente

#### 🔔 Notificações
- Alertas de metas alcançadas
- Lembretes de parcelas
- Notificações do sistema
- Central de notificações com histórico

#### 👤 Perfil e Configurações
- Gerencie seus dados pessoais
- Altere senha com validação de segurança
- Tema claro/escuro
- Interface responsiva para mobile

---

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm ou yarn

### Instalação Rápida

```bash
# 1. Clone o repositório
git clone https://github.com/CampiteliRafael/FinTrack.git
cd FinTrack

# 2. Configure o Backend
cd Backend
cp .env.example .env
# Edite o .env com suas configurações
npm install
npx prisma migrate dev
npm run dev

# 3. Configure o Frontend (em outro terminal)
cd Frontend
cp .env.example .env
# Edite o .env com a URL do backend
npm install
npm run dev
```

Acesse:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:4000
- **API Docs:** http://localhost:4000/api-docs

---

## 🎨 Screenshots

### Dashboard
Visualização completa do seu panorama financeiro com gráficos e resumos.

### Contas
Gerencie todas as suas contas e acompanhe saldos em tempo real.

### Transações
Histórico completo de receitas e despesas com filtros avançados.

### Metas
Defina e acompanhe seus objetivos financeiros.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Interface moderna e reativa
- **TypeScript** - Tipagem estática e segurança
- **Vite** - Build rápido e HMR
- **TailwindCSS** - Estilização utilitária
- **React Router** - Navegação SPA
- **Axios** - Requisições HTTP
- **date-fns** - Manipulação de datas
- **lucide-react** - Ícones modernos

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **Prisma ORM** - Gestão de banco de dados
- **PostgreSQL** - Banco relacional
- **Redis** - Cache e filas
- **BullMQ** - Processamento assíncrono
- **JWT** - Autenticação segura
- **Zod** - Validação de schemas
- **Swagger** - Documentação da API

### DevOps & Deploy
- **Vercel** - Deploy do frontend
- **Render** - Deploy do backend
- **Neon** - PostgreSQL serverless
- **Upstash** - Redis serverless
- **GitHub Actions** - CI/CD (futuro)

---

## 📁 Estrutura do Projeto

```
FinTrack/
├── Frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── features/      # Módulos por funcionalidade
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── contexts/      # Context API
│   │   └── services/      # Serviços de API
│   └── README.md          # Docs técnicas do frontend
│
├── Backend/               # API Node.js
│   ├── src/
│   │   ├── modules/       # Módulos por domínio
│   │   ├── shared/        # Código compartilhado
│   │   ├── config/        # Configurações
│   │   ├── queues/        # Filas assíncronas
│   │   └── workers/       # Workers de processamento
│   ├── prisma/            # Schema e migrations
│   └── README.md          # Docs técnicas do backend
│
├── docs/                  # Documentação de estudo (não parte do projeto)
├── docker-compose.yml     # Ambiente de desenvolvimento
└── README.md              # Este arquivo
```

---

## 🔒 Segurança

O FinTrack implementa diversas práticas de segurança:

- ✅ Autenticação JWT com refresh tokens
- ✅ Senhas hasheadas com bcrypt
- ✅ Rate limiting para prevenir ataques
- ✅ CORS configurado adequadamente
- ✅ Validação de dados com schemas
- ✅ Headers de segurança (helmet)
- ✅ Sanitização de inputs
- ✅ Soft delete (dados não são perdidos)

---

## 🌐 Deploy

### Frontend (Vercel)
O frontend está configurado para deploy automático no Vercel:
1. Conecte seu repositório no Vercel
2. Configure `Root Directory: Frontend`
3. As variáveis de ambiente são configuradas no dashboard

### Backend (Render)
O backend usa o arquivo `render.yaml` para deploy automático:
1. Conecte seu repositório no Render
2. Configure as variáveis de ambiente no dashboard
3. O deploy acontece automaticamente em cada push

**Serviços Externos Necessários:**
- **Neon** - PostgreSQL (Free: 3GB)
- **Upstash** - Redis (Free: 10K comandos/dia)

Consulte `DEPLOY.md` para instruções detalhadas.

---

## 📚 Documentação Técnica

- [Frontend README](./Frontend/README.md) - Arquitetura, padrões e desenvolvimento do frontend
- [Backend README](./Backend/README.md) - Arquitetura, API e desenvolvimento do backend
- [Guia de Deploy](./DEPLOY.md) - Instruções completas de deploy
- [API Documentation](https://fintrack-9iaq.onrender.com/api-docs) - Swagger/OpenAPI docs

---

## 🎓 Conceitos Aplicados

Este projeto demonstra a aplicação prática de diversos conceitos avançados:

- **Clean Architecture** - Separação em camadas (Repository, Service, Controller)
- **Design Patterns** - Repository, Factory, Dependency Injection
- **SOLID Principles** - Código manutenível e escalável
- **RESTful API** - Endpoints bem estruturados
- **Authentication & Authorization** - JWT e proteção de rotas
- **Data Validation** - Schemas e sanitização
- **Error Handling** - Tratamento centralizado de erros
- **Async Processing** - Workers e filas
- **Caching Strategy** - Redis para performance
- **Database Migrations** - Versionamento do schema
- **Responsive Design** - Mobile-first approach
- **State Management** - Context API
- **Performance Optimization** - Memoization e lazy loading

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Rafael Campiteli**

- GitHub: [@CampiteliRafael](https://github.com/CampiteliRafael)
- LinkedIn: [Rafael Campiteli](https://www.linkedin.com/in/rafael-campiteli)
- Portfolio: [em breve]

---

## 🙏 Agradecimentos

- Inspiração em diversas ferramentas de gestão financeira
- Comunidade open-source por todas as bibliotecas utilizadas
- Feedback de usuários que ajudaram a melhorar o projeto

---

<div align="center">

**Feito com ❤️ e TypeScript**

⭐ Se este projeto te ajudou, considere dar uma estrela!

</div>
