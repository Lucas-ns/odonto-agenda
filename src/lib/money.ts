/** Valores monetários sempre em centavos (inteiro). */

export function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

/** Converte string pt-BR (ex.: "150,00" ou "R$ 1.250,50") para centavos. */
export function parseBRLToCents(value: string): number {
  const cleaned = value
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const num = Number.parseFloat(cleaned);
  if (Number.isNaN(num)) return 0;
  return Math.round(num * 100);
}

export function centsToDecimalString(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}
