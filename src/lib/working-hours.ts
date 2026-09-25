import { formatInTimeZone } from "date-fns-tz";
import { APP_TIMEZONE } from "@/lib/dates";
import type { WorkingHours } from "@/lib/db/schema";

export const WEEKDAY_OPTIONS = [
  { key: "mon", label: "Segunda" },
  { key: "tue", label: "Terça" },
  { key: "wed", label: "Quarta" },
  { key: "thu", label: "Quinta" },
  { key: "fri", label: "Sexta" },
  { key: "sat", label: "Sábado" },
  { key: "sun", label: "Domingo" },
] as const;

const ISO_TO_KEY: Record<string, string> = {
  "1": "mon",
  "2": "tue",
  "3": "wed",
  "4": "thu",
  "5": "fri",
  "6": "sat",
  "7": "sun",
};

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function getWeekdayKey(date: Date): string {
  const iso = formatInTimeZone(date, APP_TIMEZONE, "i");
  return ISO_TO_KEY[iso] ?? "mon";
}

/** Verifica se o intervalo cabe nos horários de atendimento do dia. */
export function isWithinWorkingHours(
  startsAt: Date,
  endsAt: Date,
  workingHours: WorkingHours | null | undefined,
): boolean {
  if (!workingHours) return true;

  const key = getWeekdayKey(startsAt);
  const windows = workingHours[key] ?? [];
  if (windows.length === 0) return false;

  const startDay = formatInTimeZone(startsAt, APP_TIMEZONE, "yyyy-MM-dd");
  const endDay = formatInTimeZone(endsAt, APP_TIMEZONE, "yyyy-MM-dd");
  if (startDay !== endDay) return false;

  const startMin = timeToMinutes(
    formatInTimeZone(startsAt, APP_TIMEZONE, "HH:mm"),
  );
  const endMin = timeToMinutes(
    formatInTimeZone(endsAt, APP_TIMEZONE, "HH:mm"),
  );

  return windows.some(([from, to]) => {
    const a = timeToMinutes(from);
    const b = timeToMinutes(to);
    return startMin >= a && endMin <= b;
  });
}
