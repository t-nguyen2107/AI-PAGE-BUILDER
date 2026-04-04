import path from 'node:path';
import "dotenv/config";
import { defineConfig, env} from 'prisma/config';

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    // Use direct URL for schema operations (migrations/push), Accelerate for queries
    url: env("DATABASE_URL") || env("DATABASE_DIRECT_URL"),
  },
});
