import { prisma } from '../src/lib/prisma.js';
import { runSeed } from '../src/seedRunner.js';

runSeed()
  .catch((err) => {
    console.error('[MobilitiQ Seed Failed]', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

