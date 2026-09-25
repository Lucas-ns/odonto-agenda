import {
  addDays,
  addMinutes,
  endOfWeek,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const APP_TIMEZONE = "America/Sao_Paulo";

export function formatDateBR(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatInTimeZone(d, APP_TIMEZONE, "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTimeBR(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatInTimeZone(d, APP_TIMEZONE, "dd/MM/yyyy HH:mm", {
    locale: ptBR,
  });
}

export function formatTimeBR(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatInTimeZone(d, APP_TIMEZONE, "HH:mm");
}

export function formatLongDateBR(date: Date = new Date()): string {
  const zoned = toZonedTime(date, APP_TIMEZONE);
  return format(zoned, "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function formatWeekdayShort(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatInTimeZone(d, APP_TIMEZONE, "EEE", { locale: ptBR });
}

export function parseDateInput(value: string): Date | null {
  if (!value) return null;
  const d = parseISO(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toDateInputValue(
  date: Date | string | null | undefined,
): string {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatInTimeZone(d, APP_TIMEZONE, "yyyy-MM-dd");
}

export function toTimeInputValue(
  date: Date | string | null | undefined,
): string {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatInTimeZone(d, APP_TIMEZONE, "HH:mm");
}

/** Combina data (YYYY-MM-DD) + hora (HH:mm) no fuso America/Sao_Paulo → UTC Date. */
export function combineLocalDateTime(date: string, time: string): Date {
  return fromZonedTime(`${date}T${time}:00`, APP_TIMEZONE);
}

export function addMinutesUtc(date: Date, minutes: number): Date {
  return addMinutes(date, minutes);
}

export function todayDateString(): string {
  return formatInTimeZone(new Date(), APP_TIMEZONE, "yyyy-MM-dd");
}

export function getWeekRange(dateStr: string) {
  const local = fromZonedTime(`${dateStr}T12:00:00`, APP_TIMEZONE);
  const weekStart = startOfWeek(toZonedTime(local, APP_TIMEZONE), {
    weekStartsOn: 1,
  });
  const weekEnd = endOfWeek(toZonedTime(local, APP_TIMEZONE), {
    weekStartsOn: 1,
  });
  const startUtc = fromZonedTime(
    format(weekStart, "yyyy-MM-dd") + "T00:00:00",
    APP_TIMEZONE,
  );
  const endUtc = fromZonedTime(
    format(weekEnd, "yyyy-MM-dd") + "T23:59:59",
    APP_TIMEZONE,
  );
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    return format(d, "yyyy-MM-dd");
  });
  return { startUtc, endUtc, days, weekStart, weekEnd };
}

export function getDayRange(dateStr: string) {
  const startUtc = fromZonedTime(`${dateStr}T00:00:00`, APP_TIMEZONE);
  const endUtc = fromZonedTime(`${dateStr}T23:59:59`, APP_TIMEZONE);
  return { startUtc, endUtc };
}

export function shiftDateString(dateStr: string, days: number): string {
  const local = fromZonedTime(`${dateStr}T12:00:00`, APP_TIMEZONE);
  const zoned = toZonedTime(local, APP_TIMEZONE);
  return format(addDays(zoned, days), "yyyy-MM-dd");
}

export function generateTimeSlots(
  startHour = 7,
  endHour = 20,
  stepMin = 30,
): string[] {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += stepMin) {
      slots.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      );
    }
  }
  return slots;
}

export { startOfDay };
