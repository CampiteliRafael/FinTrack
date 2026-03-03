import { Worker } from 'bullmq';
import { queueConnection } from '../queues/queue.config';
import prisma from '../config/database';

/**
 * Worker para limpeza automática de dados
 *
 * Funções:
 * - Deletar usuários após 24h da criação
 * - Manter usuários marcados como permanentes (ex: demo)
 * - Deletar dados relacionados em cascata
 */
export const cleanupWorker = new Worker(
  'cleanup',
  async (job) => {
    const { type } = job.data;

    switch (type) {
      case 'delete-expired-users':
        return await deleteExpiredUsers();

      case 'delete-old-transactions':
        return await deleteOldTransactions();

      default:
        throw new Error(`Unknown cleanup type: ${type}`);
    }
  },
  {
    connection: queueConnection,
    concurrency: 1, // Um job por vez para evitar conflitos
  }
);

/**
 * Deleta usuários criados há mais de 24 horas
 * Exceto usuários marcados como permanentes
 */
async function deleteExpiredUsers() {
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  const expiredUsers = await prisma.user.findMany({
    where: {
      createdAt: {
        lt: twentyFourHoursAgo,
      },
      email: {
        not: 'campitelir8@gmail.com',
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (expiredUsers.length === 0) {
    return {
      deletedUsers: 0,
      users: [],
    };
  }

  const deletedUsers: string[] = [];

  for (const user of expiredUsers) {
    try {
      await prisma.user.delete({
        where: { id: user.id },
      });

      deletedUsers.push(user.email);
    } catch (error) {
      console.error(`[CLEANUP] Erro ao deletar usuário ${user.email}:`, error);
    }
  }

  return {
    deletedUsers: deletedUsers.length,
    users: deletedUsers,
  };
}

/**
 * Deleta transações antigas (> 1 ano) de usuários inativos (> 6 meses)
 * Útil para economizar espaço em produção
 */
async function deleteOldTransactions() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const inactiveUsers = await prisma.user.findMany({
    where: {
      updatedAt: {
        lt: sixMonthsAgo,
      },
    },
    select: { id: true },
  });

  if (inactiveUsers.length === 0) {
    return { deletedTransactions: 0 };
  }

  const result = await prisma.transaction.deleteMany({
    where: {
      createdAt: {
        lt: oneYearAgo,
      },
      userId: {
        in: inactiveUsers.map((u) => u.id),
      },
    },
  });

  return {
    deletedTransactions: result.count,
    inactiveUsers: inactiveUsers.length,
  };
}

cleanupWorker.on('failed', (job, err) => {
  console.error(`[CLEANUP] Job ${job?.id} falhou:`, err.message);
});

cleanupWorker.on('error', (err) => {
  console.error('[CLEANUP] Worker error:', err);
});
