import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Pencil, Plus } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  APPOINTMENT_STATUS_CLASS,
  APPOINTMENT_STATUS_LABEL,
} from "@/lib/appointment-labels";
import { formatDateBR, formatDateTimeBR, formatTimeBR } from "@/lib/dates";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";
import { listAppointmentsForPatient } from "@/server/actions/appointments";
import { getPatient, deletePatientAction } from "@/server/actions/patients";

export const metadata = { title: "Paciente" };

type Props = {
  params: Promise<{ id: string }>;
};

function whatsappHref(phone: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

export default async function PacienteDetailPage({ params }: Props) {
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();

  const history = await listAppointmentsForPatient(id);
  const wa = whatsappHref(patient.phone);

  return (
    <div>
      <AppHeader
        title={patient.name}
        description="Dados cadastrais e histórico de consultas."
        actions={
          <>
            {wa ? (
              <Button
                variant="outline"
                render={
                  <a href={wa} target="_blank" rel="noopener noreferrer" />
                }
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </Button>
            ) : null}
            <Button
              variant="outline"
              render={
                <Link href={`/agenda/novo?patientId=${patient.id}`} />
              }
            >
              <Plus className="size-4" />
              Agendar
            </Button>
            <Button
              render={<Link href={`/pacientes/${patient.id}/editar`} />}
            >
              <Pencil className="size-4" />
              Editar
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Dados</CardTitle>
            <CardDescription>Informações de contato e cadastro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Telefone" value={patient.phone} />
            <Row label="E-mail" value={patient.email} />
            <Row
              label="Nascimento"
              value={
                patient.birthDate ? formatDateBR(patient.birthDate) : null
              }
            />
            <Row label="CPF" value={patient.cpf} />
            <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
              <span className="text-muted-foreground">Consentimento LGPD</span>
              {patient.consentAt ? (
                <Badge variant="secondary">
                  Em {formatDateTimeBR(patient.consentAt)}
                </Badge>
              ) : (
                <span className="text-muted-foreground">Não registrado</span>
              )}
            </div>
            {patient.notes ? (
              <div className="border-t border-border pt-3">
                <p className="mb-1 text-muted-foreground">Observações</p>
                <p className="whitespace-pre-wrap text-foreground">
                  {patient.notes}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Histórico</CardTitle>
            <CardDescription>
              {history.length} consulta{history.length === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                Nenhuma consulta registrada.
              </p>
            ) : (
              <ul className="space-y-2">
                {history.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/agenda/${a.id}`}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted/40"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {formatDateTimeBR(a.startsAt)} –{" "}
                          {formatTimeBR(a.endsAt)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {a.items.map((i) => i.serviceName).join(", ") || "—"}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                            APPOINTMENT_STATUS_CLASS[a.status],
                          )}
                        >
                          {APPOINTMENT_STATUS_LABEL[a.status]}
                        </span>
                        <span className="font-mono text-xs">
                          {formatBRL(a.totalCents)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <form
        action={deletePatientAction.bind(null, patient.id)}
        className="mt-8"
      >
        <Button type="submit" variant="destructive">
          Excluir paciente
        </Button>
      </form>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">
        {value || "—"}
      </span>
    </div>
  );
}
