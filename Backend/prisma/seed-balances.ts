import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Calculando saldos das contas existentes...\n');

  const accounts = await prisma.account.findMany({
    where: { deletedAt: null },
    include: {
      transactions: {
        where: { deletedAt: null },
        orderBy: { date: 'asc' },
      },
    },
  });

  console.log(`📊 Encontradas ${accounts.length} contas para processar\n`);

  for (const account of accounts) {
    console.log(`\n🏦 Processando conta: ${account.name} (${account.id})`);
    console.log(`   Saldo inicial: R$ ${account.initialBalance}`);

    let currentBalance = Number(account.initialBalance);
    let lastTransactionDate: Date | null = null;
    const events: any[] = [];

    // Criar evento de saldo inicial
    events.push({
      accountId: account.id,
      type: 'initial_balance',
      amount: account.initialBalance,
      description: 'Saldo inicial da conta',
      balanceBefore: 0,
      balanceAfter: account.initialBalance,
      createdAt: account.createdAt,
    });

    // Processar cada transação
    for (const transaction of account.transactions) {
      const balanceBefore = currentBalance;
      const amount = Number(transaction.amount);

      if (transaction.type === 'income') {
        currentBalance += amount;
      } else {
        currentBalance -= amount;
      }

      const eventType = transaction.type === 'income'
        ? 'transaction_income'
        : 'transaction_expense';

      events.push({
        accountId: account.id,
        type: eventType,
        amount: transaction.amount,
        transactionId: transaction.id,
        description: transaction.description || `Transação ${transaction.type}`,
        balanceBefore,
        balanceAfter: currentBalance,
        createdAt: transaction.date,
      });

      lastTransactionDate = transaction.date;
    }

    console.log(`   Total de transações: ${account.transactions.length}`);
    console.log(`   Saldo calculado: R$ ${currentBalance}`);

    // Atualizar conta com saldo calculado
    await prisma.$transaction([
      // Criar todos os eventos
      prisma.accountEvent.createMany({
        data: events,
      }),

      // Atualizar saldo da conta
      prisma.account.update({
        where: { id: account.id },
        data: {
          currentBalance,
          availableBalance: currentBalance,
          reservedAmount: 0,
          lastTransactionAt: lastTransactionDate,
        },
      }),
    ]);

    console.log(`   ✅ Conta atualizada com sucesso!`);
  }

  console.log('\n\n✨ Migração concluída com sucesso!');
  console.log(`📈 Total de contas processadas: ${accounts.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante migração:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
