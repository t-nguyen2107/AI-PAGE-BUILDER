import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
  });
  return new PrismaClient({ adapter });
}

export const prisma = new Proxy<PrismaClient>({} as PrismaClient, {
  get(_target, prop) {
    const client = globalForPrisma.prisma ?? createPrismaClient();
    if (!globalForPrisma.prisma && process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client;
    }
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
