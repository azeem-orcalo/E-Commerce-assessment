import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Prisma 7: seed is configured here, not in package.json
    // ts-node uses the project tsconfig.json (module: CommonJS) so no override needed
    seed: "npx ts-node prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"] as string,
  },
});
