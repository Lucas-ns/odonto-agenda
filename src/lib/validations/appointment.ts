import { z } from "zod";

export const appointmentStatusSchema = z.enum([
  "scheduled",
  "confirmed",
  "completed",
  "no_show",
  "canceled",
]);

export const paymentStatusSchema = z.enum(["pending", "paid", "partial"]);
export const paymentMethodSchema = z.enum([
  "pix",
  "cash",
  "credit",
  "debit",
  "other",
]);

export const appointmentItemInputSchema = z.object({
  serviceId: z.string().uuid().nullable().optional(),
  serviceName: z.string().min(1).max(160),
  priceCents: z.number().int().min(0),
  durationMin: z.number().int().min(5).max(480),
  quantity: z.number().int().min(1).max(20).default(1),
});

export const appointmentInputSchema = z.object({
  patientId: z.string().uuid("Selecione um paciente"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
  notes: z.string().max(2000).optional().or(z.literal("")),
  discountCents: z.number().int().min(0).default(0),
  status: appointmentStatusSchema.default("scheduled"),
  forceConflict: z.boolean().default(false),
  items: z
    .array(appointmentItemInputSchema)
    .min(1, "Adicione pelo menos um serviço"),
  paymentStatus: paymentStatusSchema.optional(),
  paymentMethod: paymentMethodSchema.nullable().optional(),
});

export type AppointmentInput = z.infer<typeof appointmentInputSchema>;
export type AppointmentItemInput = z.infer<typeof appointmentItemInputSchema>;
