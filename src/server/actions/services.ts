"use server";

import { and, asc, eq, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { serviceSchema } from "@/lib/validations/service";

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

export async function listServices(query?: string, includeInactive = true) {
  const user = await requireUser();
  const conditions = [eq(services.userId, user.id)];

  if (!includeInactive) {
    conditions.push(eq(services.active, true));
  }
  if (query?.trim()) {
    conditions.push(ilike(services.name, `%${query.trim()}%`));
  }

  return db
    .select()
    .from(services)
    .where(and(...conditions))
    .orderBy(asc(services.name));
}

export async function seedDefaultServices(userId: string) {
  const existing = await db
    .select({ id: services.id })
    .from(services)
    .where(eq(services.userId, userId))
    .limit(1);

  if (existing.length > 0) return { seeded: false };

  await db.insert(services).values(
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

  return { seeded: true };
}

export type ServiceActionState = {
  error?: string;
  success?: string;
};

export async function createServiceAction(
  _prev: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const user = await requireUser();

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category") || "",
    defaultPriceCents: Number(formData.get("defaultPriceCents")),
    defaultDurationMin: Number(formData.get("defaultDurationMin")),
    color: formData.get("color") || "",
    active: formData.get("active") !== "false",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await db.insert(services).values({
    userId: user.id,
    name: parsed.data.name,
    category: parsed.data.category || null,
    defaultPriceCents: parsed.data.defaultPriceCents,
    defaultDurationMin: parsed.data.defaultDurationMin,
    color: parsed.data.color || null,
    active: parsed.data.active,
  });

  revalidatePath("/servicos");
  return { success: "Serviço criado." };
}

export async function updateServiceAction(
  _prev: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category") || "",
    defaultPriceCents: Number(formData.get("defaultPriceCents")),
    defaultDurationMin: Number(formData.get("defaultDurationMin")),
    color: formData.get("color") || "",
    active: formData.get("active") !== "false",
  });

  if (!id || !parsed.success) {
    return { error: parsed.success ? "ID inválido" : parsed.error.issues[0]?.message };
  }

  await db
    .update(services)
    .set({
      name: parsed.data.name,
      category: parsed.data.category || null,
      defaultPriceCents: parsed.data.defaultPriceCents,
      defaultDurationMin: parsed.data.defaultDurationMin,
      color: parsed.data.color || null,
      active: parsed.data.active,
      updatedAt: new Date(),
    })
    .where(and(eq(services.id, id), eq(services.userId, user.id)));

  revalidatePath("/servicos");
  return { success: "Serviço atualizado." };
}

export async function toggleServiceActiveAction(id: string, active: boolean) {
  const user = await requireUser();
  await db
    .update(services)
    .set({ active, updatedAt: new Date() })
    .where(and(eq(services.id, id), eq(services.userId, user.id)));
  revalidatePath("/servicos");
}
