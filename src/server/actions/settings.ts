"use server";

import { and, asc, eq, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { combineLocalDateTime } from "@/lib/dates";
import { db } from "@/lib/db";
import { scheduleBlocks, settings, type WorkingHours } from "@/lib/db/schema";

export async function getSettings() {
  const user = await requireUser();
  let row = await db.query.settings.findFirst({
    where: eq(settings.userId, user.id),
  });
  if (!row) {
    const [created] = await db
      .insert(settings)
      .values({ userId: user.id })
      .returning();
    row = created;
  }
  return row;
}

export type SettingsActionState = {
  error?: string;
  success?: string;
};

export async function updateSettingsAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await requireUser();
  const clinicName = String(formData.get("clinicName") ?? "").trim();
  const slotMinutes = Number(formData.get("slotMinutes") || 15);
  const workingHoursRaw = formData.get("workingHoursJson");

  let workingHours: WorkingHours | undefined;
  if (typeof workingHoursRaw === "string" && workingHoursRaw) {
    try {
      workingHours = JSON.parse(workingHoursRaw) as WorkingHours;
    } catch {
      return { error: "Horários inválidos." };
    }
  }

  if (!clinicName) return { error: "Nome da clínica obrigatório." };
  if (![5, 10, 15, 20, 30, 60].includes(slotMinutes)) {
    return { error: "Intervalo de slot inválido." };
  }

  await db
    .update(settings)
    .set({
      clinicName,
      slotMinutes,
      ...(workingHours ? { workingHours } : {}),
      updatedAt: new Date(),
    })
    .where(eq(settings.userId, user.id));

  revalidatePath("/configuracoes");
  revalidatePath("/agenda");
  return { success: "Configurações salvas." };
}

export async function listScheduleBlocks() {
  const user = await requireUser();
  return db
    .select()
    .from(scheduleBlocks)
    .where(eq(scheduleBlocks.userId, user.id))
    .orderBy(asc(scheduleBlocks.startsAt));
}

export async function listScheduleBlocksInRange(start: Date, end: Date) {
  const user = await requireUser();
  return db
    .select()
    .from(scheduleBlocks)
    .where(
      and(
        eq(scheduleBlocks.userId, user.id),
        lte(scheduleBlocks.startsAt, end),
        gte(scheduleBlocks.endsAt, start),
      ),
    )
    .orderBy(asc(scheduleBlocks.startsAt));
}

export type BlockActionState = {
  error?: string;
  success?: string;
};

export async function createScheduleBlockAction(
  _prev: BlockActionState,
  formData: FormData,
): Promise<BlockActionState> {
  const user = await requireUser();
  const date = String(formData.get("date") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Data inválida." };
  if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
    return { error: "Horários inválidos." };
  }

  const startsAt = combineLocalDateTime(date, startTime);
  const endsAt = combineLocalDateTime(date, endTime);
  if (endsAt <= startsAt) {
    return { error: "Horário de término deve ser após o início." };
  }

  await db.insert(scheduleBlocks).values({
    userId: user.id,
    startsAt,
    endsAt,
    reason: reason || null,
  });

  revalidatePath("/configuracoes");
  revalidatePath("/agenda");
  return { success: "Bloqueio criado." };
}

export async function deleteScheduleBlockAction(id: string) {
  const user = await requireUser();
  await db
    .delete(scheduleBlocks)
    .where(and(eq(scheduleBlocks.id, id), eq(scheduleBlocks.userId, user.id)));
  revalidatePath("/configuracoes");
  revalidatePath("/agenda");
}
