import type { AppointmentItemInput } from "@/lib/validations/appointment";

export function calcItemsSubtotal(
  items: Pick<AppointmentItemInput, "priceCents" | "quantity">[],
): number {
  return items.reduce(
    (sum, item) => sum + item.priceCents * (item.quantity ?? 1),
    0,
  );
}

export function calcItemsDurationMin(
  items: Pick<AppointmentItemInput, "durationMin" | "quantity">[],
): number {
  return items.reduce(
    (sum, item) => sum + item.durationMin * (item.quantity ?? 1),
    0,
  );
}

/** Total = subtotal - desconto, nunca negativo (regra do servidor). */
export function calcAppointmentTotal(
  items: Pick<AppointmentItemInput, "priceCents" | "quantity">[],
  discountCents: number,
): number {
  const subtotal = calcItemsSubtotal(items);
  return Math.max(0, subtotal - Math.max(0, discountCents));
}

/** Conflito: novo.starts < existente.ends AND novo.ends > existente.starts */
export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && aEnd > bStart;
}
