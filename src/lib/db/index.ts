import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "[db] DATABASE_URL não definida. Operações de banco falharão até configurar.",
  );
}

const client = postgres(connectionString ?? "postgresql://localhost:5432/odontoflow", {
  prepare: false,
  max: 10,
});

export const db = drizzle(client, { schema });
