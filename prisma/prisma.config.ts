import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// Load env files in the same order as Next.js:
// .env.local overrides .env (but don't override existing process.env vars)
const projectRoot = path.join(__dirname, '..');
const envLocalPath = path.join(projectRoot, '.env.local');
const envPath = path.join(projectRoot, '.env');

if (fs.existsSync(envLocalPath)) dotenv.config({ path: envLocalPath });
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),
  datasource: {
    // Direct URL first — Prisma CLI (db push, migrate, studio) needs direct connection.
    // Accelerate URL is used by the app at runtime via src/lib/prisma.ts.
    url: env("DATABASE_DIRECT_URL") || env("DATABASE_URL"),
  },
});
