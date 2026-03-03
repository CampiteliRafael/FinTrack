import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Aumentando precisão dos campos Decimal de 15 para 20 dígitos...\n');

  try {
    // Alterar precisão das colunas
    await prisma.$executeRaw`
      ALTER TABLE accounts
        ALTER COLUMN initial_balance TYPE DECIMAL(20, 2),
        ALTER COLUMN current_balance TYPE DECIMAL(20, 2),
        ALTER COLUMN available_balance TYPE DECIMAL(20, 2),
        ALTER COLUMN reserved_amount TYPE DECIMAL(20, 2);
    `;
    console.log('✅ Accounts atualizado');

    await prisma.$executeRaw`
      ALTER TABLE account_events
        ALTER COLUMN amount TYPE DECIMAL(20, 2),
        ALTER COLUMN balance_before TYPE DECIMAL(20, 2),
        ALTER COLUMN balance_after TYPE DECIMAL(20, 2);
    `;
    console.log('✅ AccountEvents atualizado');

    await prisma.$executeRaw`
      ALTER TABLE transactions
        ALTER COLUMN amount TYPE DECIMAL(20, 2);
    `;
    console.log('✅ Transactions atualizado');

    await prisma.$executeRaw`
      ALTER TABLE goals
        ALTER COLUMN target_amount TYPE DECIMAL(20, 2),
        ALTER COLUMN current_amount TYPE DECIMAL(20, 2);
    `;
    console.log('✅ Goals atualizado');

    await prisma.$executeRaw`
      ALTER TABLE installments
        ALTER COLUMN total_amount TYPE DECIMAL(20, 2);
    `;
    console.log('✅ Installments atualizado');

    console.log('\n✨ Migração concluída com sucesso!');
    console.log('📊 Novo limite: até 999.999.999.999.999.999,99 (quase 1 quintilhão)');

  } catch (error) {
    console.error('\n❌ Erro durante migração:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
