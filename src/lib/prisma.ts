import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

/** PrismaClient extended with Accelerate — type is opaque after $extends(). */
type ExtendedClient = PrismaClient;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedClient | undefined;
};

function createPrismaClient(): ExtendedClient {
  const base = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
  });

  // $extends() returns a different type, but we treat it as PrismaClient for downstream compatibility.
  return base.$extends(withAccelerate()) as unknown as ExtendedClient;
}

export const prisma: ExtendedClient = new Proxy<ExtendedClient>({} as ExtendedClient, {
  get(_target, prop) {
    const client = globalForPrisma.prisma ?? createPrismaClient();
    if (!globalForPrisma.prisma && process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client;
    }
    const value = Reflect.get(client as object, prop);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
