import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().min(2, "Nome obrigatório").max(160),
  phone: z.string().max(20).optional().or(z.literal("")),
  email: z.union([z.literal(""), z.email("E-mail inválido")]).optional(),
  birthDate: z.string().optional().or(z.literal("")),
  cpf: z.string().max(14).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  consent: z.boolean().optional(),
});

export type PatientInput = z.infer<typeof patientSchema>;
