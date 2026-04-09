/**
 * Add generationStatus column via raw SQL through Prisma Accelerate.
 * Usage: npx tsx scripts/add-generation-status.ts
 */
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

async function main() {
  const { prisma } = await import('../src/lib/prisma');

  console.log('Checking if generationStatus column exists...');

  // Check if column exists
  const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'pages' AND column_name = 'generationStatus'
  `;

  if (columns.length > 0) {
    console.log('Column already exists!');
  } else {
    console.log('Adding generationStatus column...');
    await prisma.$executeRawUnsafe(
      `ALTER TABLE pages ADD COLUMN "generationStatus" TEXT;`
    );
    console.log('Column added!');
  }

  await prisma.$disconnect();
  console.log('Done');
}

main().catch(console.error);
