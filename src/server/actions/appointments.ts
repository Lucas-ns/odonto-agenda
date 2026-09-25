"use server";

import { and, asc, eq, gte, lt, lte, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  calcAppointmentTotal,
  calcItemsDurationMin,
  rangesOverlap,
} from "@/lib/appointment-math";
import { requireUser } from "@/lib/auth";
import { addMinutesUtc, combineLocalDateTime, getDayRange, getWeekRange } from "@/lib/dates";
import { db } from "@/lib/db";
import {
  appointmentItems,
  appointments,
  patients,
  type AppointmentStatus,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/db/schema";
import { appointmentInputSchema } from "@/lib/validations/appointment";

export type AppointmentWithRelations = Awaited<
  ReturnType<typeof getAppointment>
>;

export async function listAppointmentsInRange(start: Date, end: Date) {
  const user = await requireUser();
  return db.query.appointments.findMany({
    where: and(
      eq(appointments.userId, user.id),
      gte(appointments.startsAt, start),
      lte(appointments.startsAt, end),
    ),
    with: {
      patient: true,
      items: true,
    },
    orderBy: [asc(appointments.startsAt)],
  });
}

export async function listAppointmentsForDay(dateStr: string) {
  const { startUtc, endUtc } = getDayRange(dateStr);
  return listAppointmentsInRange(startUtc, endUtc);
}

export async function listAppointmentsForWeek(dateStr: string) {
  const { startUtc, endUtc } = getWeekRange(dateStr);
  return listAppointmentsInRange(startUtc, endUtc);
}

export async function listAppointmentsForPatient(patientId: string) {
  const user = await requireUser();
  return db.query.appointments.findMany({
    where: and(
      eq(appointments.userId, user.id),
      eq(appointments.patientId, patientId),
    ),
    with: { items: true },
    orderBy: [asc(appointments.startsAt)],
  });
}

export async function getAppointment(id: string) {
  const user = await requireUser();
  const row = await db.query.appointments.findFirst({
    where: and(eq(appointments.id, id), eq(appointments.userId, user.id)),
    with: {
      patient: true,
      items: true,
    },
  });
  return row ?? null;
}

export async function findConflicts(opts: {
  userId: string;
  startsAt: Date;
  endsAt: Date;
  excludeId?: string;
}) {
  const conditions = [
    eq(appointments.userId, opts.userId),
    ne(appointments.status, "canceled"),
    lt(appointments.startsAt, opts.endsAt),
    gte(appointments.endsAt, opts.startsAt),
  ];
  if (opts.excludeId) {
    conditions.push(ne(appointments.id, opts.excludeId));
  }

  const candidates = await db
    .select({
      id: appointments.id,
      startsAt: appointments.startsAt,
      endsAt: appointments.endsAt,
      status: appointments.status,
    })
    .from(appointments)
    .where(and(...conditions));

  return candidates.filter((c) =>
    rangesOverlap(opts.startsAt, opts.endsAt, c.startsAt, c.endsAt),
  );
}

export type AppointmentActionState = {
  error?: string;
  conflict?: boolean;
  success?: string;
};

function parseItemsFromForm(formData: FormData) {
  const raw = formData.get("itemsJson");
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export async function createAppointmentAction(
  _prev: AppointmentActionState,
  formData: FormData,
): Promise<AppointmentActionState> {
  const user = await requireUser();
  const items = parseItemsFromForm(formData);

  const parsed = appointmentInputSchema.safeParse({
    patientId: formData.get("patientId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    notes: formData.get("notes") || "",
    discountCents: Number(formData.get("discountCents") || 0),
    status: formData.get("status") || "scheduled",
    forceConflict: formData.get("forceConflict") === "true",
    items,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const patient = await db.query.patients.findFirst({
    where: and(
      eq(patients.id, parsed.data.patientId),
      eq(patients.userId, user.id),
    ),
  });
  if (!patient) return { error: "Paciente não encontrado." };

  const duration = calcItemsDurationMin(parsed.data.items);
  const startsAt = combineLocalDateTime(parsed.data.date, parsed.data.startTime);
  const endsAt = addMinutesUtc(startsAt, duration);
  const totalCents = calcAppointmentTotal(
    parsed.data.items,
    parsed.data.discountCents,
  );

  const conflicts = await findConflicts({
    userId: user.id,
    startsAt,
    endsAt,
  });

  if (conflicts.length > 0 && !parsed.data.forceConflict) {
    return {
      conflict: true,
      error: `Conflito com ${conflicts.length} agendamento(s) neste horário. Confirme para forçar o encaixe.`,
    };
  }

  const [created] = await db
    .insert(appointments)
    .values({
      userId: user.id,
      patientId: parsed.data.patientId,
      startsAt,
      endsAt,
      status: parsed.data.status,
      discountCents: parsed.data.discountCents,
      totalCents,
      notes: parsed.data.notes?.trim() || null,
    })
    .returning({ id: appointments.id });

  await db.insert(appointmentItems).values(
    parsed.data.items.map((item) => ({
      appointmentId: created.id,
      serviceId: item.serviceId ?? null,
      serviceName: item.serviceName,
      priceCents: item.priceCents,
      durationMin: item.durationMin,
      quantity: item.quantity ?? 1,
    })),
  );

  revalidatePath("/agenda");
  revalidatePath("/pacientes");
  redirect(`/agenda/${created.id}`);
}

export async function updateAppointmentAction(
  _prev: AppointmentActionState,
  formData: FormData,
): Promise<AppointmentActionState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const items = parseItemsFromForm(formData);

  if (!id) return { error: "ID inválido" };

  const parsed = appointmentInputSchema.safeParse({
    patientId: formData.get("patientId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    notes: formData.get("notes") || "",
    discountCents: Number(formData.get("discountCents") || 0),
    status: formData.get("status") || "scheduled",
    forceConflict: formData.get("forceConflict") === "true",
    items,
    paymentStatus: formData.get("paymentStatus") || undefined,
    paymentMethod: formData.get("paymentMethod") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const existing = await getAppointment(id);
  if (!existing) return { error: "Agendamento não encontrado." };

  const duration = calcItemsDurationMin(parsed.data.items);
  const startsAt = combineLocalDateTime(parsed.data.date, parsed.data.startTime);
  const endsAt = addMinutesUtc(startsAt, duration);
  const totalCents = calcAppointmentTotal(
    parsed.data.items,
    parsed.data.discountCents,
  );

  const conflicts = await findConflicts({
    userId: user.id,
    startsAt,
    endsAt,
    excludeId: id,
  });

  if (conflicts.length > 0 && !parsed.data.forceConflict) {
    return {
      conflict: true,
      error: `Conflito com ${conflicts.length} agendamento(s) neste horário. Confirme para forçar o encaixe.`,
    };
  }

  await db
    .update(appointments)
    .set({
      patientId: parsed.data.patientId,
      startsAt,
      endsAt,
      status: parsed.data.status,
      discountCents: parsed.data.discountCents,
      totalCents,
      notes: parsed.data.notes?.trim() || null,
      paymentStatus: (parsed.data.paymentStatus as PaymentStatus) ?? existing.paymentStatus,
      paymentMethod:
        (parsed.data.paymentMethod as PaymentMethod | null | undefined) ??
        existing.paymentMethod,
      updatedAt: new Date(),
    })
    .where(and(eq(appointments.id, id), eq(appointments.userId, user.id)));

  await db
    .delete(appointmentItems)
    .where(eq(appointmentItems.appointmentId, id));

  await db.insert(appointmentItems).values(
    parsed.data.items.map((item) => ({
      appointmentId: id,
      serviceId: item.serviceId ?? null,
      serviceName: item.serviceName,
      priceCents: item.priceCents,
      durationMin: item.durationMin,
      quantity: item.quantity ?? 1,
    })),
  );

  revalidatePath("/agenda");
  revalidatePath(`/agenda/${id}`);
  revalidatePath("/pacientes");
  redirect(`/agenda/${id}`);
}

export async function updateAppointmentStatusAction(
  id: string,
  status: AppointmentStatus,
  opts?: { paymentStatus?: PaymentStatus; paymentMethod?: PaymentMethod | null },
) {
  const user = await requireUser();
  await db
    .update(appointments)
    .set({
      status,
      ...(opts?.paymentStatus ? { paymentStatus: opts.paymentStatus } : {}),
      ...(opts?.paymentMethod !== undefined
        ? { paymentMethod: opts.paymentMethod }
        : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(appointments.id, id), eq(appointments.userId, user.id)));

  revalidatePath("/agenda");
  revalidatePath(`/agenda/${id}`);
  revalidatePath("/painel");
}

export async function cancelAppointmentAction(id: string) {
  await updateAppointmentStatusAction(id, "canceled");
  redirect(`/agenda/${id}`);
}

export async function updatePaymentAction(
  _prev: { error?: string; success?: string },
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const paymentStatus = String(formData.get("paymentStatus") ?? "pending") as PaymentStatus;
  const methodRaw = String(formData.get("paymentMethod") ?? "");
  const paymentMethod = (methodRaw || null) as PaymentMethod | null;

  if (!id) return { error: "ID inválido" };
  if (!["pending", "paid", "partial"].includes(paymentStatus)) {
    return { error: "Status de pagamento inválido." };
  }

  await db
    .update(appointments)
    .set({
      paymentStatus,
      paymentMethod: paymentStatus === "pending" ? null : paymentMethod,
      updatedAt: new Date(),
    })
    .where(and(eq(appointments.id, id), eq(appointments.userId, user.id)));

  revalidatePath(`/agenda/${id}`);
  revalidatePath("/painel");
  return { success: "Pagamento atualizado." };
}

export async function createQuickPatientAction(name: string, phone?: string) {
  const user = await requireUser();
  if (!name.trim() || name.trim().length < 2) {
    return { error: "Nome obrigatório" as const };
  }
  const [created] = await db
    .insert(patients)
    .values({
      userId: user.id,
      name: name.trim(),
      phone: phone?.trim() || null,
    })
    .returning();
  revalidatePath("/pacientes");
  return { patient: created };
}
