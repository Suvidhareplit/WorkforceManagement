import type { Config } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

export default {
  out: "./migrations",
  dialect: "postgresql",
  schema: "./schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL
  }
} satisfies Config;