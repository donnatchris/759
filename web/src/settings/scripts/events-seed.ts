import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { eventsSeed } from '../data/data.events';
import { sitePages } from '../data/data.pages';

const prisma = new PrismaClient();

async function main() {
  const page = sitePages.find((page) => page.slug === 'evenements')!;
  await prisma.sitePage.upsert({
    where: { slug: page.slug },
    create: page,
    update: {},
  });
  await prisma.event.upsert({
    where: { id: 'event-test-rentree-759' },
    create: { id: 'event-test-rentree-759', ...eventsSeed[0] },
    update: {},
  });
  console.log('Événement de test créé (aucun mail programmé).');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
