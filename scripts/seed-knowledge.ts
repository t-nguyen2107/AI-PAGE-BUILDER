/**
 * Seed design knowledge into vector DB.
 * Run: npx tsx scripts/seed-knowledge.ts
 */
import { config } from 'dotenv';
import path from 'path';

// Load env vars first
config({ path: path.resolve(__dirname, '../.env.local') });

console.log('Seeding design knowledge into vector DB...');
console.log('  Embedding:', process.env.EMBEDDING_PROVIDER, process.env.EMBEDDING_MODEL);
console.log('  DB:', process.env.DATABASE_URL?.slice(0, 50) + '...');

// Dynamic import after env is loaded
const { seedDesignKnowledge } = await import('../src/lib/ai/knowledge/seed-knowledge.js');

seedDesignKnowledge()
  .then((r) => {
    console.log('\n✅ Seed complete!');
    console.log(JSON.stringify(r, null, 2));
    process.exit(0);
  })
  .catch((e) => {
    console.error('\n❌ Seed failed:', e);
    process.exit(1);
  });
