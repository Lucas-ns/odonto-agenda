import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(2, "Nome obrigatório").max(120),
  category: z.string().max(80).optional().or(z.literal("")),
  defaultPriceCents: z
    .number()
    .int("Valor deve ser inteiro em centavos")
    .min(0, "Valor não pode ser negativo"),
  defaultDurationMin: z
    .number()
    .int()
    .min(5, "Duração mínima de 5 min")
    .max(480, "Duração máxima de 8h"),
  color: z.string().max(20).optional().or(z.literal("")),
  active: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
