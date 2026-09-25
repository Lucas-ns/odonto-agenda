"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Patient } from "@/lib/db/schema";
import { toDateInputValue } from "@/lib/dates";
import {
  createPatientAction,
  updatePatientAction,
  type PatientActionState,
} from "@/server/actions/patients";

type Props = {
  patient?: Patient;
};

const initial: PatientActionState = {};

export function PatientForm({ patient }: Props) {
  const isEdit = Boolean(patient);
  const action = isEdit ? updatePatientAction : createPatientAction;
  const [state, formAction, pending] = useActionState(action, initial);
  const [consent, setConsent] = useState(Boolean(patient?.consentAt));

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form
      action={formAction}
      className="mx-auto max-w-2xl space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      {patient ? <input type="hidden" name="id" value={patient.id} /> : null}

      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={patient?.name}
          placeholder="Nome completo"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone / WhatsApp</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={patient?.phone ?? ""}
            placeholder="(11) 99999-0000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={patient?.email ?? ""}
            placeholder="paciente@email.com"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="birthDate">Data de nascimento</Label>
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            defaultValue={toDateInputValue(patient?.birthDate)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            name="cpf"
            defaultValue={patient?.cpf ?? ""}
            placeholder="000.000.000-00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={patient?.notes ?? ""}
          placeholder="Alergias, preferências, etc."
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <Checkbox
          checked={consent}
          onCheckedChange={(v) => setConsent(v === true)}
          className="mt-0.5"
        />
        <span>
          Paciente consente o tratamento dos dados pessoais para gestão da
          agenda clínica (LGPD).
        </span>
      </label>
      <input type="hidden" name="consent" value={consent ? "on" : ""} />

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : isEdit ? "Salvar alterações" : "Cadastrar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          render={
            <Link href={patient ? `/pacientes/${patient.id}` : "/pacientes"} />
          }
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
