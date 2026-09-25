"use server";

import { and, asc, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { patients } from "@/lib/db/schema";
import { patientSchema } from "@/lib/validations/patient";

export async function listPatients(query?: string) {
  const user = await requireUser();
  const conditions = [eq(patients.userId, user.id)];

  if (query?.trim()) {
    const q = `%${query.trim()}%`;
    conditions.push(or(ilike(patients.name, q), ilike(patients.phone, q))!);
  }

  return db
    .select()
    .from(patients)
    .where(and(...conditions))
    .orderBy(asc(patients.name));
}

export async function getPatient(id: string) {
  const user = await requireUser();
  const row = await db.query.patients.findFirst({
    where: and(eq(patients.id, id), eq(patients.userId, user.id)),
  });
  return row ?? null;
}

export type PatientActionState = {
  error?: string;
  success?: string;
};

function emptyToNull(v: string | undefined) {
  return v && v.trim() ? v.trim() : null;
}

export async function createPatientAction(
  _prev: PatientActionState,
  formData: FormData,
): Promise<PatientActionState> {
  const user = await requireUser();

  const parsed = patientSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || "",
    email: formData.get("email") || "",
    birthDate: formData.get("birthDate") || "",
    cpf: formData.get("cpf") || "",
    notes: formData.get("notes") || "",
    consent: formData.get("consent") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const [created] = await db
    .insert(patients)
    .values({
      userId: user.id,
      name: parsed.data.name,
      phone: emptyToNull(parsed.data.phone),
      email: emptyToNull(parsed.data.email),
      birthDate: emptyToNull(parsed.data.birthDate),
      cpf: emptyToNull(parsed.data.cpf),
      notes: emptyToNull(parsed.data.notes),
      consentAt: parsed.data.consent ? new Date() : null,
    })
    .returning({ id: patients.id });

  revalidatePath("/pacientes");
  redirect(`/pacientes/${created.id}`);
}

export async function updatePatientAction(
  _prev: PatientActionState,
  formData: FormData,
): Promise<PatientActionState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  const parsed = patientSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || "",
    email: formData.get("email") || "",
    birthDate: formData.get("birthDate") || "",
    cpf: formData.get("cpf") || "",
    notes: formData.get("notes") || "",
    consent: formData.get("consent") === "on",
  });

  if (!id || !parsed.success) {
    return {
      error: parsed.success
        ? "ID inválido"
        : (parsed.error.issues[0]?.message ?? "Dados inválidos"),
    };
  }

  const existing = await getPatient(id);
  if (!existing) return { error: "Paciente não encontrado." };

  await db
    .update(patients)
    .set({
      name: parsed.data.name,
      phone: emptyToNull(parsed.data.phone),
      email: emptyToNull(parsed.data.email),
      birthDate: emptyToNull(parsed.data.birthDate),
      cpf: emptyToNull(parsed.data.cpf),
      notes: emptyToNull(parsed.data.notes),
      consentAt:
        parsed.data.consent && !existing.consentAt
          ? new Date()
          : existing.consentAt,
      updatedAt: new Date(),
    })
    .where(and(eq(patients.id, id), eq(patients.userId, user.id)));

  revalidatePath("/pacientes");
  revalidatePath(`/pacientes/${id}`);
  return { success: "Paciente atualizado." };
}

export async function deletePatientAction(id: string) {
  const user = await requireUser();
  await db
    .delete(patients)
    .where(and(eq(patients.id, id), eq(patients.userId, user.id)));
  revalidatePath("/pacientes");
  redirect("/pacientes");
}
