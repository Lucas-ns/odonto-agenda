"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, CircleDollarSign, TrendingUp, Wallet } from "lucide-react";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DaySummary = {
  count: number;
  completedCount: number;
  confirmedCount: number;
  scheduledCount: number;
  noShowCount: number;
  forecastCents: number;
  completedCents: number;
  pendingPaymentCents: number;
  pendingPaymentCount: number;
};

type MonthSummary = {
  count: number;
  completedCount: number;
  completedCents: number;
  forecastCents: number;
  pendingCount: number;
  pendingCents: number;
  topServices: {
    serviceName: string;
    count: number;
    revenueCents: number;
  }[];
};

type Props = {
  mode: "day" | "month";
  date: string;
  yearMonth: string;
  day: DaySummary;
  month: MonthSummary;
};

export function PainelDashboard({ mode, date, yearMonth, day, month }: Props) {
  const router = useRouter();

  function setMode(next: "day" | "month") {
    if (next === "day") {
      router.push(`/painel?period=day&date=${date}`);
    } else {
      router.push(`/painel?period=month&month=${yearMonth}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-xl bg-muted p-1">
        <button
          type="button"
          onClick={() => setMode("day")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium",
            mode === "day"
              ? "bg-card text-primary shadow-sm"
              : "text-muted-foreground",
          )}
        >
          Hoje
        </button>
        <button
          type="button"
          onClick={() => setMode("month")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium",
            mode === "month"
              ? "bg-card text-primary shadow-sm"
              : "text-muted-foreground",
          )}
        >
          Mês
        </button>
      </div>

      {mode === "day" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Consultas hoje"
              value={String(day.count)}
              hint={`${day.completedCount} concluídas · ${day.confirmedCount} confirmadas`}
              icon={CalendarDays}
            />
            <StatCard
              label="Previsto"
              value={formatBRL(day.forecastCents)}
              hint="Agendados + confirmados"
              icon={TrendingUp}
            />
            <StatCard
              label="Concluído"
              value={formatBRL(day.completedCents)}
              hint={`${day.completedCount} atendimento(s)`}
              icon={CircleDollarSign}
              accent
            />
            <StatCard
              label="Pendências"
              value={formatBRL(day.pendingPaymentCents)}
              hint={`${day.pendingPaymentCount} pagamento(s)`}
              icon={Wallet}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Resumo do dia</CardTitle>
              <CardDescription>
                Apenas status concluído entra no faturamento realizado.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 text-sm">
              <Chip label="Agendadas" value={day.scheduledCount} />
              <Chip label="Confirmadas" value={day.confirmedCount} />
              <Chip label="Concluídas" value={day.completedCount} />
              <Chip label="Faltas" value={day.noShowCount} />
              <Link
                href={`/agenda?date=${date}&view=list`}
                className="ml-auto text-sm font-semibold text-primary hover:underline"
              >
                Ver agenda do dia →
              </Link>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Consultas no mês"
              value={String(month.count)}
              hint={`${month.completedCount} concluídas`}
              icon={CalendarDays}
            />
            <StatCard
              label="Faturamento"
              value={formatBRL(month.completedCents)}
              hint="Somente concluídos"
              icon={CircleDollarSign}
              accent
            />
            <StatCard
              label="Previsto restante"
              value={formatBRL(month.forecastCents)}
              hint="Ainda não concluídos"
              icon={TrendingUp}
            />
            <StatCard
              label="Pagamentos pendentes"
              value={formatBRL(month.pendingCents)}
              hint={`${month.pendingCount} registro(s)`}
              icon={Wallet}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">
                Serviços mais realizados
              </CardTitle>
              <CardDescription>
                Top 5 entre consultas concluídas no mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              {month.topServices.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma consulta concluída neste mês ainda.
                </p>
              ) : (
                <ul className="space-y-3">
                  {month.topServices.map((s, i) => (
                    <li
                      key={s.serviceName}
                      className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium">{s.serviceName}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.count}× realizados
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-sm">
                        {formatBRL(s.revenueCents)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 pt-6">
        <div>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {label}
          </p>
          <p
            className={cn(
              "mt-1 font-heading text-2xl font-bold tracking-tight",
              accent && "text-primary",
            )}
          >
            {value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl bg-surface-container-low text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function Chip({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
      <span className="text-muted-foreground">{label}</span>
      <strong>{value}</strong>
    </span>
  );
}
