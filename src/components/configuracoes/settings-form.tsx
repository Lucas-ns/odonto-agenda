"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WorkingHours } from "@/lib/db/schema";
import { WEEKDAY_OPTIONS } from "@/lib/working-hours";
import {
  updateSettingsAction,
  type SettingsActionState,
} from "@/server/actions/settings";

type Props = {
  clinicName: string;
  slotMinutes: number;
  workingHours: WorkingHours;
};

type DayWindows = [string, string][];

const initial: SettingsActionState = {};

export function SettingsForm({
  clinicName,
  slotMinutes,
  workingHours: initialHours,
}: Props) {
  const [state, action, pending] = useActionState(updateSettingsAction, initial);
  const [hours, setHours] = useState<Record<string, DayWindows>>(() => {
    const map: Record<string, DayWindows> = {};
    for (const { key } of WEEKDAY_OPTIONS) {
      map[key] = (initialHours?.[key] as DayWindows) ?? [];
    }
    return map;
  });

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  function addWindow(day: string) {
    setHours((prev) => ({
      ...prev,
      [day]: [...(prev[day] ?? []), ["08:00", "12:00"]],
    }));
  }

  function removeWindow(day: string, idx: number) {
    setHours((prev) => ({
      ...prev,
      [day]: (prev[day] ?? []).filter((_, i) => i !== idx),
    }));
  }

  function updateWindow(
    day: string,
    idx: number,
    which: 0 | 1,
    value: string,
  ) {
    setHours((prev) => {
      const list = [...(prev[day] ?? [])];
      const current = [...(list[idx] ?? ["08:00", "12:00"])] as [
        string,
        string,
      ];
      current[which] = value;
      list[idx] = current;
      return { ...prev, [day]: list };
    });
  }

  return (
    <form action={action} className="space-y-6">
      <input
        type="hidden"
        name="workingHoursJson"
        value={JSON.stringify(hours)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clinicName">Nome da clínica</Label>
          <Input
            id="clinicName"
            name="clinicName"
            required
            defaultValue={clinicName}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slotMinutes">Intervalo da grade (min)</Label>
          <select
            id="slotMinutes"
            name="slotMinutes"
            defaultValue={slotMinutes}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            {[5, 10, 15, 20, 30, 60].map((n) => (
              <option key={n} value={n}>
                {n} minutos
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-heading text-base font-semibold">
            Horários de atendimento
          </h3>
          <p className="text-sm text-muted-foreground">
            Dias sem janelas = fechado. Intervalo de almoço = duas janelas no
            mesmo dia.
          </p>
        </div>

        {WEEKDAY_OPTIONS.map(({ key, label }) => (
          <div
            key={key}
            className="rounded-xl border border-border p-3 sm:p-4"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{label}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addWindow(key)}
              >
                + Janela
              </Button>
            </div>
            {(hours[key] ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">Fechado</p>
            ) : (
              <ul className="space-y-2">
                {(hours[key] ?? []).map((w, idx) => (
                  <li
                    key={`${key}-${idx}`}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <Input
                      type="time"
                      value={w[0]}
                      onChange={(e) =>
                        updateWindow(key, idx, 0, e.target.value)
                      }
                      className="w-auto"
                    />
                    <span className="text-muted-foreground">até</span>
                    <Input
                      type="time"
                      value={w[1]}
                      onChange={(e) =>
                        updateWindow(key, idx, 1, e.target.value)
                      }
                      className="w-auto"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWindow(key, idx)}
                    >
                      Remover
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Salvar configurações"}
      </Button>
    </form>
  );
}
