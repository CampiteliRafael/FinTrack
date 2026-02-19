# SEMANA 11-12: Processamento Assíncrono com BullMQ

## 🎯 OBJETIVOS

- Configurar BullMQ com Redis
- Criar jobs de envio de email
- Implementar jobs de relatórios
- Scheduling de recorrências
- Monitoramento de jobs
- Error handling e retries

## 📋 ENTREGAS

- Configuração BullMQ/Redis
- Job de envio de email com nodemailer
- Job de geração de relatórios
- Job de processamento de recorrências
- Dashboard de monitoramento (Bull Board)
- Error handling e retries automáticos
- Testes de processamento

## 🛠️ TECNOLOGIAS

- BullMQ para fila de jobs
- Redis
- nodemailer para emails
- Bull Board para UI de monitoramento
- node-schedule para cron

---

## 📝 PASSO A PASSO

### BACKEND

#### Passo 1: Instalar Dependências

```bash
npm install bullmq nodemailer bull-board
npm install -D @types/nodemailer
```

#### Passo 2: Configurar BullMQ

Crie `src/services/queue.ts`:

```typescript
import { Queue, Worker } from 'bullmq';
import Redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Criar conexão Redis para fila
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

/**
 * Definir tipos de jobs
 */
export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
}

export interface ReportJobData {
  userId: string;
  month: number;
  year: number;
  email: string;
}

export interface RecurringJobData {
  recurringId: string;
}

/**
 * Criar filas
 */
export const emailQueue = new Queue('email', { connection: redisConnection });
export const reportQueue = new Queue('report', { connection: redisConnection });
export const recurringQueue = new Queue('recurring', { connection: redisConnection });

/**
 * Evento: Job completado
 */
emailQueue.on('completed', (job) => {
  console.log(`Email job ${job.id} completado`);
});

/**
 * Evento: Job com erro
 */
emailQueue.on('failed', (job, err) => {
  console.error(`Email job ${job?.id} falhou: ${err.message}`);
});

/**
 * Limpar conexão
 */
export async function disconnectQueues() {
  await emailQueue.close();
  await reportQueue.close();
  await recurringQueue.close();
  await redisConnection.quit();
}
```

#### Passo 3: Criar Worker de Email

Crie `src/workers/emailWorker.ts`:

```typescript
import { Worker } from 'bullmq';
import Redis from 'redis';
import nodemailer from 'nodemailer';
import { EmailJobData } from '../services/queue';

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

/**
 * Configurar transporter de email
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Worker de Email
 */
export const emailWorker = new Worker<EmailJobData>(
  'email',
  async (job) => {
    console.log(`Processando email job ${job.id}`);

    try {
      // Enviar email
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: job.data.to,
        subject: job.data.subject,
        html: job.data.html,
      });

      console.log(`Email enviado: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error(`Erro ao enviar email: ${error.message}`);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // 5 emails simultâneos
  }
);

/**
 * Listeners
 */
emailWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completado com sucesso`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} falhou: ${err.message}`);
});

emailWorker.on('progress', (job, progress) => {
  console.log(`Job ${job.id} progresso: ${progress}%`);
});
```

#### Passo 4: Criar Worker de Relatórios

Crie `src/workers/reportWorker.ts`:

```typescript
import { Worker } from 'bullmq';
import Redis from 'redis';
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { ReportJobData } from '../services/queue';

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Gerar PDF de relatório
 */
async function generateReportPDF(
  userId: string,
  month: number,
  year: number
): Promise<string> {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Buscar dados
  const [transactions, user] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: firstDay, lte: lastDay },
      },
      include: {
        account: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
    }),
  ]);

  // Calcular totais
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  // Criar PDF
  const doc = new PDFDocument();
  const fileName = `report_${year}_${month + 1}_${userId}.pdf`;
  const filePath = path.join('/tmp', fileName);

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text('FinTrack - Relatório Mensal', { align: 'center' });
  doc.fontSize(12).text(
    `${new Date(year, month).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    })}`,
    { align: 'center' }
  );

  doc.moveDown();
  doc.fontSize(14).text('Resumo Financeiro');
  doc.fontSize(11).text(`Receitas: R$ ${totalIncome.toFixed(2)}`);
  doc.text(`Despesas: R$ ${totalExpense.toFixed(2)}`);
  doc.text(`Saldo Líquido: R$ ${(totalIncome - totalExpense).toFixed(2)}`);

  doc.moveDown();
  doc.fontSize(12).text('Transações');
  doc.fontSize(9).text('Data | Descrição | Valor');

  transactions.forEach((t) => {
    const date = new Date(t.date).toLocaleDateString('pt-BR');
    const amount = `${t.type === 'income' ? '+' : '-'} R$ ${parseFloat(t.amount.toString()).toFixed(2)}`;
    doc.text(`${date} | ${t.description || '-'} | ${amount}`);
  });

  doc.end();

  // Esperar conclusão
  return new Promise((resolve) => {
    doc.on('finish', () => {
      resolve(filePath);
    });
  });
}

/**
 * Worker de Relatórios
 */
export const reportWorker = new Worker<ReportJobData>(
  'report',
  async (job) => {
    console.log(`Gerando relatório para job ${job.id}`);

    try {
      const { userId, month, year, email } = job.data;

      // Gerar PDF
      const pdfPath = await generateReportPDF(userId, month, year);

      // Enviar email com anexo
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Relatório Financeiro - ${new Date(year, month).toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric',
        })}`,
        html: '<p>Segue em anexo seu relatório financeiro do mês.</p>',
        attachments: [
          {
            filename: `relatorio_${year}_${month + 1}.pdf`,
            path: pdfPath,
          },
        ],
      });

      // Limpar arquivo
      fs.unlinkSync(pdfPath);

      return { success: true };
    } catch (error: any) {
      console.error(`Erro ao gerar relatório: ${error.message}`);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

reportWorker.on('completed', (job) => {
  console.log(`Relatório job ${job.id} completado`);
});

reportWorker.on('failed', (job, err) => {
  console.error(`Relatório job ${job?.id} falhou: ${err.message}`);
});
```

#### Passo 5: Criar Worker de Recorrências

Crie `src/workers/recurringWorker.ts`:

```typescript
import { Worker } from 'bullmq';
import Redis from 'redis';
import { PrismaClient } from '@prisma/client';
import { RecurringJobData } from '../services/queue';

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

const prisma = new PrismaClient();

/**
 * Calcular próxima data de execução
 */
function calculateNextDate(frequency: string, currentDate: Date): Date {
  const next = new Date(currentDate);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}

/**
 * Worker de Recorrências
 */
export const recurringWorker = new Worker<RecurringJobData>(
  'recurring',
  async (job) => {
    console.log(`Processando recorrência job ${job.id}`);

    try {
      const { recurringId } = job.data;

      const recurring = await prisma.recurring.findUnique({
        where: { id: recurringId },
      });

      if (!recurring || !recurring.isActive) {
        return { skipped: true };
      }

      // Verificar se deve processar hoje
      const now = new Date();
      if (recurring.nextDate > now) {
        return { skipped: true, message: 'Ainda não é hora' };
      }

      // Verificar data de término
      if (recurring.endDate && now > recurring.endDate) {
        await prisma.recurring.update({
          where: { id: recurringId },
          data: { isActive: false },
        });
        return { completed: true, message: 'Recorrência finalizada' };
      }

      // Criar transação
      await prisma.transaction.create({
        data: {
          userId: recurring.userId,
          accountId: recurring.accountId,
          categoryId: recurring.categoryId,
          amount: recurring.amount,
          type: recurring.type,
          description: `${recurring.description} (automático)`,
          date: now,
        },
      });

      // Atualizar próxima data
      const nextDate = calculateNextDate(recurring.frequency, recurring.nextDate);
      await prisma.recurring.update({
        where: { id: recurringId },
        data: { nextDate },
      });

      return { success: true, nextDate };
    } catch (error: any) {
      console.error(`Erro ao processar recorrência: ${error.message}`);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 10,
  }
);

recurringWorker.on('completed', (job) => {
  console.log(`Recorrência job ${job.id} completado`);
});

recurringWorker.on('failed', (job, err) => {
  console.error(`Recorrência job ${job?.id} falhou: ${err.message}`);
});
```

#### Passo 6: Integrar Queue no Server

Edite `src/server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createBullBoard } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { emailQueue, reportQueue, recurringQueue, disconnectQueues } from './services/queue';
import { emailWorker } from './workers/emailWorker';
import { reportWorker } from './workers/reportWorker';
import { recurringWorker } from './workers/recurringWorker';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Rotas da aplicação
// ... imports de rotas

// Bull Board - Dashboard de monitoramento
const { router: bullBoardRouter } = createBullBoard({
  queues: [
    new BullAdapter(emailQueue),
    new BullAdapter(reportQueue),
    new BullAdapter(recurringQueue),
  ],
  options: {
    uiConfig: {
      defaultLanguage: 'pt',
    },
  },
});

// Adicionar dashboard
app.use('/admin/queues', bullBoardRouter);

// Server
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Bull Board em http://localhost:${PORT}/admin/queues`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM recebido, encerrando...');
  server.close();
  await disconnectQueues();
  process.exit(0);
});
```

#### Passo 7: Criar Endpoints para Enfileirar Jobs

Crie `src/routes/jobs.ts`:

```typescript
import { Router, Request, Response } from 'express';
import { authMiddleware, getUserId } from '../middleware/auth';
import { emailQueue, reportQueue } from '../services/queue';

const router = Router();

/**
 * POST /jobs/send-email
 */
router.post('/send-email', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { to, subject, html } = req.body;

    // Enfileirar job
    const job = await emailQueue.add(
      'send',
      { to, subject, html },
      {
        attempts: 3, // Tentar 3 vezes
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
      }
    );

    res.json({ jobId: job.id, status: 'enqueued' });
  } catch (error) {
    console.error('Erro ao enfileirar email:', error);
    res.status(500).json({ error: 'Erro ao enviar email' });
  }
});

/**
 * POST /jobs/generate-report
 */
router.post('/jobs/generate-report', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { month, year } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    const job = await reportQueue.add(
      'generate',
      {
        userId,
        month,
        year,
        email: user.email,
      },
      {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      }
    );

    res.json({ jobId: job.id, status: 'generating' });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

/**
 * GET /jobs/:id/status
 */
router.get('/jobs/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Procurar em todas as filas
    let job = await emailQueue.getJob(id);
    if (!job) job = await reportQueue.getJob(id);
    if (!job) job = await recurringQueue.getJob(id);

    if (!job) {
      res.status(404).json({ error: 'Job não encontrado' });
      return;
    }

    const state = await job.getState();
    const progress = job.progress();

    res.json({
      id: job.id,
      state,
      progress,
      data: job.data,
    });
  } catch (error) {
    console.error('Erro ao obter status do job:', error);
    res.status(500).json({ error: 'Erro ao obter status' });
  }
});

export default router;
```

#### Passo 8: Configurar Cron para Recorrências

Crie `src/services/scheduler.ts`:

```typescript
import schedule from 'node-schedule';
import { PrismaClient } from '@prisma/client';
import { recurringQueue } from './queue';

const prisma = new PrismaClient();

/**
 * Iniciar scheduler de recorrências
 * Executa a cada 5 minutos
 */
export function startRecurringScheduler() {
  schedule.scheduleJob('*/5 * * * *', async () => {
    console.log('Verificando recorrências...');

    try {
      // Buscar recorrências ativas que precisam executar
      const now = new Date();
      const recurring = await prisma.recurring.findMany({
        where: {
          isActive: true,
          nextDate: { lte: now },
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      });

      console.log(`Encontradas ${recurring.length} recorrências para processar`);

      // Enfileirar jobs
      for (const rec of recurring) {
        await recurringQueue.add(
          'process',
          { recurringId: rec.id },
          {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          }
        );
      }
    } catch (error) {
      console.error('Erro no scheduler:', error);
    }
  });

  console.log('Scheduler de recorrências iniciado');
}
```

---

## ✅ TESTES

### Testar Enfileiramento

```bash
# Enfileirar email
curl -X POST http://localhost:3000/jobs/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "to": "user@example.com",
    "subject": "Teste",
    "html": "<p>Teste de email</p>"
  }'

# Verificar status do job
curl -X GET http://localhost:3000/jobs/12345/status \
  -H "Authorization: Bearer token"

# Gerar relatório
curl -X POST http://localhost:3000/jobs/generate-report \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "month": 1,
    "year": 2024
  }'
```

### Acessar Bull Board

```
http://localhost:3000/admin/queues
```

---

## 🐛 TROUBLESHOOTING

**Redis não conecta**
- Verifique se Redis está rodando

**Emails não enviam**
- Verifique credenciais Gmail em .env
- Ative "app passwords" no Gmail

**Jobs não processam**
- Verifique se workers estão rodando
- Verifique logs de erros

---

## 📚 CONCEITOS RELACIONADOS

1. **Job Queues**: Processamento assíncrono
2. **Workers**: Consumidores de jobs
3. **Retries**: Estratégia de retry automático
4. **Concurrency**: Controle de paralelismo
5. **Monitoring**: Dashboard de filas

---

## ☑️ CHECKLIST

- [x] BullMQ configurado
- [x] Redis conectado
- [x] Worker de emails
- [x] Worker de relatórios
- [x] Worker de recorrências
- [x] Scheduler cron
- [x] Bull Board integrado
- [x] Endpoints de jobs
- [x] Testes de enfileiramento
