import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const base = new PrismaClient();
  return base.$extends(withAccelerate()) as unknown as PrismaClient;
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
