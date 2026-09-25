import Link from "next/link";
import {
  APPOINTMENT_STATUS_CLASS,
  APPOINTMENT_STATUS_LABEL,
} from "@/lib/appointment-labels";
import { formatDateTimeBR, formatTimeBR } from "@/lib/dates";
import { formatBRL } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Apt = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  status: string;
  totalCents: number;
  patient: { name: string; phone: string | null };
  items: { serviceName: string }[];
};

type Props = {
  appointments: Apt[];
};

export function ListView({ appointments }: Props) {
  if (appointments.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Nenhum agendamento neste período.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {appointments.map((a) => (
        <li key={a.id}>
          <Link
            href={`/agenda/${a.id}`}
            className={cn(
              "flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between",
              a.status === "canceled" && "opacity-60",
            )}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-heading font-semibold">{a.patient.name}</p>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                    APPOINTMENT_STATUS_CLASS[a.status],
                  )}
                >
                  {APPOINTMENT_STATUS_LABEL[a.status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDateTimeBR(a.startsAt)} – {formatTimeBR(a.endsAt)}
              </p>
              <p className="truncate text-sm">
                {a.items.map((i) => i.serviceName).join(", ") || "—"}
              </p>
            </div>
            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
              <Badge variant="secondary" className="font-mono">
                {formatBRL(a.totalCents)}
              </Badge>
              {a.patient.phone ? (
                <span className="text-xs text-muted-foreground">
                  {a.patient.phone}
                </span>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
