import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Iniciando migração: Remover campo "type" da categoria...\n');

  try {
    // 1. Verificar categorias duplicadas (mesmo nome, mesmo user, tipos diferentes)
    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: [{ userId: 'asc' }, { name: 'asc' }, { createdAt: 'asc' }],
    });

    console.log(`📊 Total de categorias: ${categories.length}\n`);

    // 2. Agrupar por userId + name
    const grouped = new Map<string, any[]>();
    for (const cat of categories) {
      const key = `${cat.userId}:${cat.name.toLowerCase()}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(cat);
    }

    // 3. Encontrar duplicatas
    const duplicates = Array.from(grouped.entries()).filter(([_, cats]) => cats.length > 1);
    console.log(`🔍 Encontradas ${duplicates.length} categorias duplicadas:\n`);

    for (const [key, cats] of duplicates) {
      console.log(`   "${cats[0].name}" - ${cats.length} versões`);
      cats.forEach((c, i) => {
        console.log(`      ${i + 1}. ${(c as any).type} - ${c.id}`);
      });
    }

    if (duplicates.length > 0) {
      console.log('\n⚠️  Mesclando categorias duplicadas...\n');

      for (const [key, cats] of duplicates) {
        // Manter a primeira categoria (mais antiga)
        const keepCategory = cats[0];
        const removeCategories = cats.slice(1);

        console.log(`   Mantendo: "${keepCategory.name}" (${keepCategory.id})`);

        for (const removeCat of removeCategories) {
          // Atualizar todas transações para usar a categoria mantida
          const transactionCount = await prisma.transaction.updateMany({
            where: { categoryId: removeCat.id },
            data: { categoryId: keepCategory.id },
          });

          // Atualizar metas
          const goalCount = await prisma.goal.updateMany({
            where: { categoryId: removeCat.id },
            data: { categoryId: keepCategory.id },
          });

          // Atualizar parcelas
          const installmentCount = await prisma.installment.updateMany({
            where: { categoryId: removeCat.id },
            data: { categoryId: keepCategory.id },
          });

          console.log(`      Removendo: "${removeCat.name}" (${removeCat.id})`);
          console.log(`         - ${transactionCount.count} transações atualizadas`);
          console.log(`         - ${goalCount.count} metas atualizadas`);
          console.log(`         - ${installmentCount.count} parcelas atualizadas`);

          // Soft delete da categoria duplicada
          await prisma.category.update({
            where: { id: removeCat.id },
            data: { deletedAt: new Date() },
          });
        }
      }
    }

    // 4. Executar SQL para remover coluna
    console.log('\n📝 Executando SQL para remover coluna "type"...');
    await prisma.$executeRaw`
      ALTER TABLE categories DROP COLUMN IF EXISTS type;
    `;

    // 5. Remover índice se existir
    console.log('📝 Removendo índice "type"...');
    await prisma.$executeRaw`
      DROP INDEX IF EXISTS "categories_type_idx";
    `;

    console.log('\n✅ Migração concluída com sucesso!');
    console.log('   ✓ Categorias duplicadas mescladas');
    console.log('   ✓ Coluna "type" removida');
    console.log('   ✓ Índice removido');
    console.log('\n💡 Categorias agora são neutras - tipo definido apenas na transação!');

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
