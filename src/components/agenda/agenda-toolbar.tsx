"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { todayDateString } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { shiftDateString } from "@/lib/dates";

export type AgendaView = "day" | "week" | "list";

type Props = {
  date: string;
  view: AgendaView;
};

export function AgendaToolbar({ date, view }: Props) {
  const router = useRouter();
  const step = view === "week" ? 7 : 1;

  function go(delta: number) {
    const next = shiftDateString(date, delta * step);
    router.push(`/agenda?date=${next}&view=${view}`);
  }

  function setView(v: AgendaView) {
    router.push(`/agenda?date=${date}&view=${v}`);
  }

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="inline-flex rounded-xl bg-muted p-1">
        {(
          [
            ["day", "Dia"],
            ["week", "Semana"],
            ["list", "Lista"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              view === v
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => go(-1)}
            aria-label="Anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/agenda?date=${todayDateString()}&view=${view}`)
            }
          >
            Hoje
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => go(1)}
            aria-label="Próximo"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button render={<Link href={`/agenda/novo?date=${date}`} />}>
          <Plus className="size-4" />
          Agendar
        </Button>
      </div>
    </div>
  );
}
