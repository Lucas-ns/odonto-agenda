import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { AppointmentStatusActions } from "@/components/agenda/appointment-status-actions";
import { PaymentForm } from "@/components/agenda/payment-form";
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
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
} from "@/lib/appointment-labels";
import { formatDateTimeBR, formatTimeBR } from "@/lib/dates";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";
import { getAppointment } from "@/server/actions/appointments";

export const metadata = { title: "Agendamento" };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AgendamentoDetailPage({ params }: Props) {
  const { id } = await params;
  const apt = await getAppointment(id);
  if (!apt) notFound();

  return (
    <div>
      <AppHeader
        title={apt.patient.name}
        description={`${formatDateTimeBR(apt.startsAt)} – ${formatTimeBR(apt.endsAt)}`}
        actions={
          <Button render={<Link href={`/agenda/${apt.id}/editar`} />}>
            <Pencil className="size-4" />
            Editar / remarcar
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-sm font-medium",
            APPOINTMENT_STATUS_CLASS[apt.status],
          )}
        >
          {APPOINTMENT_STATUS_LABEL[apt.status]}
        </span>
        <Badge variant="secondary">
          Pagamento: {PAYMENT_STATUS_LABEL[apt.paymentStatus]}
          {apt.paymentMethod
            ? ` · ${PAYMENT_METHOD_LABEL[apt.paymentMethod]}`
            : ""}
        </Badge>
      </div>

      <AppointmentStatusActions id={apt.id} status={apt.status} />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Serviços</CardTitle>
            <CardDescription>Snapshot no momento do agendamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {apt.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{item.serviceName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.durationMin} min
                    {item.quantity > 1 ? ` · qtd ${item.quantity}` : ""}
                  </p>
                </div>
                <p className="font-mono text-sm">
                  {formatBRL(item.priceCents * item.quantity)}
                </p>
              </div>
            ))}
            {apt.discountCents > 0 ? (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Desconto</span>
                <span className="font-mono">
                  −{formatBRL(apt.discountCents)}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-border pt-3 font-heading text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatBRL(apt.totalCents)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Paciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <Link
                  href={`/pacientes/${apt.patient.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {apt.patient.name}
                </Link>
              </p>
              <p className="text-muted-foreground">
                {apt.patient.phone || "Sem telefone"}
              </p>
              {apt.notes ? (
                <div className="border-t border-border pt-3">
                  <p className="mb-1 text-muted-foreground">Observações</p>
                  <p className="whitespace-pre-wrap">{apt.notes}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Pagamento</CardTitle>
              <CardDescription>
                Status e forma (Pix, dinheiro, cartão…)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentForm
                appointmentId={apt.id}
                paymentStatus={apt.paymentStatus}
                paymentMethod={apt.paymentMethod}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
