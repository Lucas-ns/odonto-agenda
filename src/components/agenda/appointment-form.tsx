"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  calcAppointmentTotal,
  calcItemsDurationMin,
  calcItemsSubtotal,
  rangesOverlap,
} from "@/lib/appointment-math";
import { APPOINTMENT_STATUS_LABEL } from "@/lib/appointment-labels";
import { addMinutesUtc, combineLocalDateTime, formatTimeBR } from "@/lib/dates";
import type { Patient, ScheduleBlock, Service, WorkingHours } from "@/lib/db/schema";
import { centsToDecimalString, formatBRL, parseBRLToCents } from "@/lib/money";
import { isWithinWorkingHours } from "@/lib/working-hours";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createAppointmentAction,
  createQuickPatientAction,
  updateAppointmentAction,
  type AppointmentActionState,
} from "@/server/actions/appointments";

type FormItem = {
  key: string;
  serviceId: string | null;
  serviceName: string;
  priceCents: number;
  durationMin: number;
  quantity: number;
  priceDisplay: string;
};

type ExistingAppointment = {
  id: string;
  patientId: string;
  startsAt: Date | string;
  status: string;
  discountCents: number;
  notes: string | null;
  items: {
    serviceId: string | null;
    serviceName: string;
    priceCents: number;
    durationMin: number;
    quantity: number;
  }[];
};

type Props = {
  patients: Patient[];
  services: Service[];
  defaults?: {
    date?: string;
    time?: string;
    patientId?: string;
  };
  appointment?: ExistingAppointment;
  workingHours?: WorkingHours | null;
  scheduleBlocks?: Pick<ScheduleBlock, "id" | "startsAt" | "endsAt" | "reason">[];
};

const initial: AppointmentActionState = {};

function newKey() {
  return Math.random().toString(36).slice(2);
}

export function AppointmentForm({
  patients: initialPatients,
  services,
  defaults,
  appointment,
  workingHours,
  scheduleBlocks = [],
}: Props) {
  const isEdit = Boolean(appointment);
  const action = isEdit ? updateAppointmentAction : createAppointmentAction;
  const [state, formAction, pending] = useActionState(action, initial);

  const [patients, setPatients] = useState(initialPatients);
  const [patientId, setPatientId] = useState(
    appointment?.patientId ?? defaults?.patientId ?? "",
  );
  const [date, setDate] = useState(defaults?.date ?? "");
  const [startTime, setStartTime] = useState(defaults?.time ?? "09:00");
  const [notes, setNotes] = useState(appointment?.notes ?? "");
  const [status, setStatus] = useState(appointment?.status ?? "scheduled");
  const [discountDisplay, setDiscountDisplay] = useState(
    appointment ? centsToDecimalString(appointment.discountCents) : "0,00",
  );
  const [forceConflict, setForceConflict] = useState(false);
  const [servicePick, setServicePick] = useState("");
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [showQuick, setShowQuick] = useState(false);
  const [quickPending, startQuick] = useTransition();

  // Sync date/time from appointment on edit (timezone-aware via props from server)
  useEffect(() => {
    if (appointment && defaults?.date) setDate(defaults.date);
    if (appointment && defaults?.time) setStartTime(defaults.time);
  }, [appointment, defaults?.date, defaults?.time]);

  const [items, setItems] = useState<FormItem[]>(() =>
    appointment?.items.map((i) => ({
      key: newKey(),
      serviceId: i.serviceId,
      serviceName: i.serviceName,
      priceCents: i.priceCents,
      durationMin: i.durationMin,
      quantity: i.quantity,
      priceDisplay: centsToDecimalString(i.priceCents),
    })) ?? [],
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.conflict) setForceConflict(false);
  }, [state]);

  const discountCents = parseBRLToCents(discountDisplay);
  const durationMin = calcItemsDurationMin(items);
  const subtotal = calcItemsSubtotal(items);
  const total = calcAppointmentTotal(items, discountCents);

  const endsAtPreview = useMemo(() => {
    if (!date || !startTime || durationMin <= 0) return null;
    try {
      const start = combineLocalDateTime(date, startTime);
      return formatTimeBR(addMinutesUtc(start, durationMin));
    } catch {
      return null;
    }
  }, [date, startTime, durationMin]);

  const scheduleWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (!date || !startTime || durationMin <= 0) return warnings;
    try {
      const startsAt = combineLocalDateTime(date, startTime);
      const endsAt = addMinutesUtc(startsAt, durationMin);

      if (workingHours && !isWithinWorkingHours(startsAt, endsAt, workingHours)) {
        warnings.push(
          "Horário fora da janela de atendimento configurada (aviso — não impede salvar).",
        );
      }

      const hitBlocks = scheduleBlocks.filter((b) =>
        rangesOverlap(
          startsAt,
          endsAt,
          new Date(b.startsAt),
          new Date(b.endsAt),
        ),
      );
      if (hitBlocks.length > 0) {
        const reasons = hitBlocks
          .map((b) => b.reason || "bloqueio")
          .join(", ");
        warnings.push(
          `Sobreposição com bloqueio de agenda (${reasons}). Aviso — não impede salvar.`,
        );
      }
    } catch {
      /* ignore parse errors */
    }
    return warnings;
  }, [date, startTime, durationMin, workingHours, scheduleBlocks]);

  function addService(serviceId: string) {
    const s = services.find((x) => x.id === serviceId);
    if (!s) return;
    setItems((prev) => [
      ...prev,
      {
        key: newKey(),
        serviceId: s.id,
        serviceName: s.name,
        priceCents: s.defaultPriceCents,
        durationMin: s.defaultDurationMin,
        quantity: 1,
        priceDisplay: centsToDecimalString(s.defaultPriceCents),
      },
    ]);
    setServicePick("");
  }

  function createQuickPatient() {
    startQuick(async () => {
      const res = await createQuickPatientAction(quickName, quickPhone);
      if ("error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      if ("patient" in res && res.patient) {
        setPatients((p) =>
          [...p, res.patient].sort((a, b) => a.name.localeCompare(b.name)),
        );
        setPatientId(res.patient.id);
        setShowQuick(false);
        setQuickName("");
        setQuickPhone("");
        toast.success("Paciente cadastrado.");
      }
    });
  }

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-6">
      {appointment ? <input type="hidden" name="id" value={appointment.id} /> : null}
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="startTime" value={startTime} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="discountCents" value={discountCents} />
      <input type="hidden" name="forceConflict" value={forceConflict ? "true" : "false"} />
      <input type="hidden" name="itemsJson" value={JSON.stringify(
        items.map(({ serviceId, serviceName, priceCents, durationMin, quantity }) => ({
          serviceId,
          serviceName,
          priceCents,
          durationMin,
          quantity,
        })),
      )} />

      <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-heading text-lg font-semibold">Paciente</h2>
        <div className="space-y-2">
          <Label htmlFor="patient">Selecionar</Label>
          <select
            id="patient"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          >
            <option value="">Buscar paciente…</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.phone ? ` · ${p.phone}` : ""}
              </option>
            ))}
          </select>
        </div>
        {!showQuick ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowQuick(true)}
          >
            <UserPlus className="size-4" />
            Cadastro rápido
          </Button>
        ) : (
          <div className="grid gap-3 rounded-lg bg-muted/50 p-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label>Nome *</Label>
              <Input
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                placeholder="Nome do paciente"
              />
            </div>
            <div className="space-y-1">
              <Label>Telefone</Label>
              <Input
                value={quickPhone}
                onChange={(e) => setQuickPhone(e.target.value)}
                placeholder="(11) 99999-0000"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                type="button"
                onClick={createQuickPatient}
                disabled={quickPending}
              >
                Salvar
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowQuick(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-heading text-lg font-semibold">Data e horário</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startTime">Início</Label>
            <Input
              id="startTime"
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Término</Label>
            <div className="flex h-10 items-center rounded-lg border border-border bg-muted/40 px-3 font-mono text-sm">
              {endsAtPreview ?? "—"}
              {durationMin > 0 ? (
                <span className="ml-2 text-muted-foreground">
                  ({durationMin} min)
                </span>
              ) : null}
            </div>
          </div>
        </div>
        {isEdit ? (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {Object.entries(APPOINTMENT_STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {scheduleWarnings.length > 0 ? (
          <div className="space-y-1 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
            {scheduleWarnings.map((w) => (
              <p key={w}>{w}</p>
            ))}
          </div>
        ) : null}
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-heading text-lg font-semibold">Serviços</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
            value={servicePick}
            onChange={(e) => {
              if (e.target.value) addService(e.target.value);
            }}
          >
            <option value="">Adicionar serviço do catálogo…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {formatBRL(s.defaultPriceCents)} ·{" "}
                {s.defaultDurationMin} min
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            disabled={!servicePick}
            onClick={() => servicePick && addService(servicePick)}
          >
            <Plus className="size-4" />
            Adicionar
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Adicione ao menos um serviço. Valor e duração vêm do catálogo e
            podem ser ajustados.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item, idx) => (
              <li
                key={item.key}
                className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_100px_80px_40px]"
              >
                <div>
                  <p className="font-medium">{item.serviceName}</p>
                  <p className="text-xs text-muted-foreground">
                    Snapshot do catálogo
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Valor (R$)</Label>
                  <Input
                    value={item.priceDisplay}
                    onChange={(e) => {
                      const priceDisplay = e.target.value;
                      const priceCents = parseBRLToCents(priceDisplay);
                      setItems((prev) =>
                        prev.map((x, i) =>
                          i === idx ? { ...x, priceDisplay, priceCents } : x,
                        ),
                      );
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Min</Label>
                  <Input
                    type="number"
                    min={5}
                    value={item.durationMin}
                    onChange={(e) => {
                      const durationMin = Number(e.target.value) || 5;
                      setItems((prev) =>
                        prev.map((x, i) =>
                          i === idx ? { ...x, durationMin } : x,
                        ),
                      );
                    }}
                  />
                </div>
                <div className="flex items-end justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remover"
                    onClick={() =>
                      setItems((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>Desconto (R$)</Label>
            <Input
              value={discountDisplay}
              onChange={(e) => setDiscountDisplay(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Subtotal</Label>
            <p className="flex h-10 items-center font-mono text-sm">
              {formatBRL(subtotal)}
            </p>
          </div>
          <div className="space-y-1">
            <Label>Total</Label>
            <p className="flex h-10 items-center font-heading text-lg font-bold text-primary">
              {formatBRL(total)}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2 rounded-xl border border-border bg-card p-5 shadow-sm">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações da consulta"
        />
      </section>

      {state.conflict ? (
        <label className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
          <Checkbox
            checked={forceConflict}
            onCheckedChange={(v) => setForceConflict(v === true)}
            className="mt-0.5"
          />
          <span>
            <strong>Forçar encaixe:</strong> há conflito de horário. Marque
            para salvar mesmo assim e envie de novo.
          </span>
        </label>
      ) : null}

      {state.error && !state.conflict ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending || items.length === 0 || !patientId}>
          {pending
            ? "Salvando…"
            : isEdit
              ? "Salvar alterações"
              : "Criar agendamento"}
        </Button>
        <Button
          type="button"
          variant="outline"
          render={
            <Link
              href={appointment ? `/agenda/${appointment.id}` : "/agenda"}
            />
          }
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
