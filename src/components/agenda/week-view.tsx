import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  APPOINTMENT_STATUS_CLASS,
  APPOINTMENT_STATUS_LABEL,
} from "@/lib/appointment-labels";
import { formatTimeBR, getWeekRange, toDateInputValue, todayDateString } from "@/lib/dates";
import { cn } from "@/lib/utils";

type Apt = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  status: string;
  patient: { name: string };
  items: { serviceName: string }[];
};

type Props = {
  date: string;
  appointments: Apt[];
};

export function WeekView({ date, appointments }: Props) {
  const { days } = getWeekRange(date);
  const today = todayDateString();
  const active = appointments.filter((a) => a.status !== "canceled");

  const byDay = new Map<string, Apt[]>();
  for (const d of days) byDay.set(d, []);
  for (const a of active) {
    const key = toDateInputValue(a.startsAt);
    if (byDay.has(key)) byDay.get(key)!.push(a);
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <div className="grid min-w-[720px] grid-cols-7 divide-x divide-border">
        {days.map((d) => {
          const dayApts = byDay.get(d) ?? [];
          const label = format(parseISO(d), "EEE d", { locale: ptBR });
          const isToday = d === today;
          return (
            <div key={d} className="min-h-[420px] bg-card">
              <div
                className={cn(
                  "border-b border-border px-2 py-2.5 text-center",
                  isToday && "bg-primary/10",
                )}
              >
                <p
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wide",
                    isToday ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {label}
                </p>
              </div>
              <div className="space-y-1.5 p-1.5">
                <Link
                  href={`/agenda/novo?date=${d}&time=09:00`}
                  className="flex min-h-9 items-center justify-center rounded-md border border-dashed border-border text-[11px] text-muted-foreground hover:border-primary hover:text-primary"
                >
                  + Horário
                </Link>
                {dayApts.map((a) => (
                  <Link
                    key={a.id}
                    href={`/agenda/${a.id}`}
                    className={cn(
                      "block rounded-lg border px-2 py-1.5 text-left transition hover:shadow-sm",
                      APPOINTMENT_STATUS_CLASS[a.status],
                    )}
                  >
                    <p className="font-mono text-[10px] opacity-80">
                      {formatTimeBR(a.startsAt)}
                    </p>
                    <p className="truncate text-xs font-semibold">
                      {a.patient.name}
                    </p>
                    <p className="truncate text-[10px] opacity-75">
                      {a.items[0]?.serviceName ??
                        APPOINTMENT_STATUS_LABEL[a.status]}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
