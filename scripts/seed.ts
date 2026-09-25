/**
 * Seed CLI: popula serviços padrão para um user_id.
 * Uso: USER_ID=<uuid> npm run db:seed
 *
 * Em produção o seed também roda automaticamente no primeiro login
 * (ensureProfileAndSeed) se o usuário ainda não tiver serviços.
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/db/schema";

const DEFAULT_SERVICES = [
  {
    name: "Avaliação",
    category: "Consulta",
    defaultPriceCents: 15000,
    defaultDurationMin: 30,
    color: "#0284C7",
  },
  {
    name: "Limpeza",
    category: "Prevenção",
    defaultPriceCents: 20000,
    defaultDurationMin: 45,
    color: "#006c49",
  },
  {
    name: "Restauração",
    category: "Restaurador",
    defaultPriceCents: 35000,
    defaultDurationMin: 60,
    color: "#007bb9",
  },
  {
    name: "Extração",
    category: "Cirurgia",
    defaultPriceCents: 40000,
    defaultDurationMin: 45,
    color: "#ba1a1a",
  },
  {
    name: "Clareamento",
    category: "Estética",
    defaultPriceCents: 80000,
    defaultDurationMin: 90,
    color: "#a36700",
  },
  {
    name: "Canal",
    category: "Endodontia",
    defaultPriceCents: 90000,
    defaultDurationMin: 90,
    color: "#825100",
  },
] as const;

async function main() {
  const userId = process.env.USER_ID;
  if (!userId) {
    console.error("Defina USER_ID=<uuid do auth.users> para rodar o seed.");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("Defina DATABASE_URL.");
    process.exit(1);
  }

  const client = postgres(process.env.DATABASE_URL, { prepare: false });
  const db = drizzle(client, { schema });

  const existing = await db
    .select({ id: schema.services.id })
    .from(schema.services)
    .where(eq(schema.services.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    console.log("Usuário já possui serviços. Nada a fazer.");
    await client.end();
    return;
  }

  await db.insert(schema.services).values(
    DEFAULT_SERVICES.map((s) => ({
      userId,
      name: s.name,
      category: s.category,
      defaultPriceCents: s.defaultPriceCents,
      defaultDurationMin: s.defaultDurationMin,
      color: s.color,
      active: true,
    })),
  );

  console.log(`Seed OK: ${DEFAULT_SERVICES.length} serviços para ${userId}`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
