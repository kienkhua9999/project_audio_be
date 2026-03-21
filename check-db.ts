import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const series = await prisma.series.findMany();
  console.log('Series in DB:', JSON.stringify(series, null, 2));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
