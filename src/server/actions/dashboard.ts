"use server";

import { and, eq, gte, lte, ne, sql } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { getDayRange } from "@/lib/dates";
import { db } from "@/lib/db";
import { appointmentItems, appointments } from "@/lib/db/schema";
import { endOfMonth, startOfMonth, format } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { APP_TIMEZONE } from "@/lib/dates";

function monthRange(yearMonth: string) {
  // yearMonth: YYYY-MM
  const [y, m] = yearMonth.split("-").map(Number);
  const localMid = fromZonedTime(
    `${yearMonth}-15T12:00:00`,
    APP_TIMEZONE,
  );
  const zoned = toZonedTime(localMid, APP_TIMEZONE);
  const start = startOfMonth(zoned);
  const end = endOfMonth(zoned);
  const startUtc = fromZonedTime(
    format(start, "yyyy-MM-dd") + "T00:00:00",
    APP_TIMEZONE,
  );
  const endUtc = fromZonedTime(
    format(end, "yyyy-MM-dd") + "T23:59:59",
    APP_TIMEZONE,
  );
  return { startUtc, endUtc, year: y, month: m };
}

export async function getDaySummary(dateStr: string) {
  const user = await requireUser();
  const { startUtc, endUtc } = getDayRange(dateStr);

  const rows = await db
    .select({
      id: appointments.id,
      status: appointments.status,
      totalCents: appointments.totalCents,
      paymentStatus: appointments.paymentStatus,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.userId, user.id),
        gte(appointments.startsAt, startUtc),
        lte(appointments.startsAt, endUtc),
        ne(appointments.status, "canceled"),
      ),
    );

  const count = rows.length;
  const completed = rows.filter((r) => r.status === "completed");
  const forecast = rows.filter(
    (r) => r.status === "scheduled" || r.status === "confirmed",
  );
  const pendingPayment = rows.filter(
    (r) =>
      r.paymentStatus === "pending" || r.paymentStatus === "partial",
  );

  return {
    count,
    completedCount: completed.length,
    confirmedCount: rows.filter((r) => r.status === "confirmed").length,
    scheduledCount: rows.filter((r) => r.status === "scheduled").length,
    noShowCount: rows.filter((r) => r.status === "no_show").length,
    forecastCents: forecast.reduce((s, r) => s + r.totalCents, 0),
    completedCents: completed.reduce((s, r) => s + r.totalCents, 0),
    pendingPaymentCents: pendingPayment.reduce((s, r) => s + r.totalCents, 0),
    pendingPaymentCount: pendingPayment.length,
  };
}

export async function getMonthSummary(yearMonth: string) {
  const user = await requireUser();
  const { startUtc, endUtc } = monthRange(yearMonth);

  const rows = await db
    .select({
      id: appointments.id,
      status: appointments.status,
      totalCents: appointments.totalCents,
      paymentStatus: appointments.paymentStatus,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.userId, user.id),
        gte(appointments.startsAt, startUtc),
        lte(appointments.startsAt, endUtc),
        ne(appointments.status, "canceled"),
      ),
    );

  const completed = rows.filter((r) => r.status === "completed");
  const pending = rows.filter(
    (r) =>
      (r.status === "scheduled" || r.status === "confirmed") ||
      r.paymentStatus === "pending" ||
      r.paymentStatus === "partial",
  );

  const topServices = await db
    .select({
      serviceName: appointmentItems.serviceName,
      count: sql<number>`sum(${appointmentItems.quantity})::int`,
      revenueCents: sql<number>`sum(${appointmentItems.priceCents} * ${appointmentItems.quantity})::int`,
    })
    .from(appointmentItems)
    .innerJoin(
      appointments,
      eq(appointmentItems.appointmentId, appointments.id),
    )
    .where(
      and(
        eq(appointments.userId, user.id),
        gte(appointments.startsAt, startUtc),
        lte(appointments.startsAt, endUtc),
        eq(appointments.status, "completed"),
      ),
    )
    .groupBy(appointmentItems.serviceName)
    .orderBy(sql`sum(${appointmentItems.quantity}) desc`)
    .limit(5);

  return {
    count: rows.length,
    completedCount: completed.length,
    completedCents: completed.reduce((s, r) => s + r.totalCents, 0),
    forecastCents: rows
      .filter((r) => r.status === "scheduled" || r.status === "confirmed")
      .reduce((s, r) => s + r.totalCents, 0),
    pendingCount: pending.length,
    pendingCents: rows
      .filter(
        (r) =>
          r.paymentStatus === "pending" || r.paymentStatus === "partial",
      )
      .reduce((s, r) => s + r.totalCents, 0),
    topServices,
  };
}
