import Link from "next/link";
import {
  APPOINTMENT_STATUS_CLASS,
  APPOINTMENT_STATUS_LABEL,
} from "@/lib/appointment-labels";
import { formatTimeBR, generateTimeSlots } from "@/lib/dates";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";

type Apt = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  status: string;
  totalCents: number;
  patient: { name: string };
  items: { serviceName: string }[];
};

type Props = {
  date: string;
  appointments: Apt[];
};

export function DayView({ date, appointments }: Props) {
  const slots = generateTimeSlots(7, 20, 30);
  const active = appointments.filter((a) => a.status !== "canceled");

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="divide-y divide-border">
        {slots.map((slot) => {
          const [h, m] = slot.split(":").map(Number);
          const slotStartMin = h * 60 + m;
          const inSlot = active.filter((a) => {
            const t = formatTimeBR(a.startsAt);
            const [ah, am] = t.split(":").map(Number);
            const startMin = ah * 60 + am;
            return startMin >= slotStartMin && startMin < slotStartMin + 30;
          });

          return (
            <div
              key={slot}
              className="grid min-h-[56px] grid-cols-[64px_1fr] hover:bg-muted/30"
            >
              <div className="flex items-start justify-center pt-3 font-mono text-xs text-muted-foreground">
                {slot}
              </div>
              <div className="relative p-1.5">
                {inSlot.length === 0 ? (
                  <Link
                    href={`/agenda/novo?date=${date}&time=${slot}`}
                    className="flex h-full min-h-11 items-center rounded-lg px-2 text-xs text-muted-foreground/70 hover:bg-accent hover:text-accent-foreground"
                  >
                    Disponível
                  </Link>
                ) : (
                  <div className="flex flex-col gap-1">
                    {inSlot.map((a) => (
                      <Link
                        key={a.id}
                        href={`/agenda/${a.id}`}
                        className={cn(
                          "rounded-lg border px-2.5 py-2 transition hover:shadow-sm",
                          APPOINTMENT_STATUS_CLASS[a.status] ??
                            APPOINTMENT_STATUS_CLASS.scheduled,
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold">
                            {a.patient.name}
                          </span>
                          <span className="shrink-0 font-mono text-[11px]">
                            {formatTimeBR(a.startsAt)}–{formatTimeBR(a.endsAt)}
                          </span>
                        </div>
                        <p className="truncate text-xs opacity-80">
                          {a.items.map((i) => i.serviceName).join(", ") ||
                            APPOINTMENT_STATUS_LABEL[a.status]}
                          {" · "}
                          {formatBRL(a.totalCents)}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
