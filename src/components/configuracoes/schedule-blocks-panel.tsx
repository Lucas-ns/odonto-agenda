"use client";

import { useActionState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTimeBR, formatTimeBR, todayDateString } from "@/lib/dates";
import type { ScheduleBlock } from "@/lib/db/schema";
import {
  createScheduleBlockAction,
  deleteScheduleBlockAction,
  type BlockActionState,
} from "@/server/actions/settings";

type Props = {
  blocks: ScheduleBlock[];
};

const initial: BlockActionState = {};

export function ScheduleBlocksPanel({ blocks }: Props) {
  const [state, action, pending] = useActionState(
    createScheduleBlockAction,
    initial,
  );

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <div className="space-y-6">
      <form
        action={action}
        className="space-y-4 rounded-xl border border-border bg-muted/30 p-4"
      >
        <h3 className="font-heading text-base font-semibold">
          Novo bloqueio
        </h3>
        <p className="text-sm text-muted-foreground">
          Férias, compromissos etc. Agendamentos nesses horários geram aviso,
          não impedem o salvamento.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="block-date">Data</Label>
            <Input
              id="block-date"
              name="date"
              type="date"
              required
              defaultValue={todayDateString()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="block-start">Início</Label>
            <Input
              id="block-start"
              name="startTime"
              type="time"
              required
              defaultValue="12:00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="block-end">Fim</Label>
            <Input
              id="block-end"
              name="endTime"
              type="time"
              required
              defaultValue="13:30"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="block-reason">Motivo</Label>
          <Input
            id="block-reason"
            name="reason"
            placeholder="Almoço, férias, congresso…"
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Adicionar bloqueio"}
        </Button>
      </form>

      {blocks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum bloqueio cadastrado.
        </p>
      ) : (
        <ul className="space-y-2">
          {blocks.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {formatDateTimeBR(b.startsAt)} – {formatTimeBR(b.endsAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {b.reason || "Sem motivo"}
                </p>
              </div>
              <form action={deleteScheduleBlockAction.bind(null, b.id)}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Excluir bloqueio"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
