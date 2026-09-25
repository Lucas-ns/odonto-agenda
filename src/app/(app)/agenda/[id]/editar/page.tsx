import { notFound } from "next/navigation";
import { AppointmentForm } from "@/components/agenda/appointment-form";
import { AppHeader } from "@/components/layout/app-header";
import { getDayRange, toDateInputValue, toTimeInputValue } from "@/lib/dates";
import type { WorkingHours } from "@/lib/db/schema";
import { getAppointment } from "@/server/actions/appointments";
import { listPatients } from "@/server/actions/patients";
import { listServices } from "@/server/actions/services";
import {
  getSettings,
  listScheduleBlocksInRange,
} from "@/server/actions/settings";

export const metadata = { title: "Editar agendamento" };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarAgendamentoPage({ params }: Props) {
  const { id } = await params;
  const apt = await getAppointment(id);
  if (!apt) notFound();

  const date = toDateInputValue(apt.startsAt);
  const { startUtc, endUtc } = getDayRange(date);

  const [patients, services, settings, blocks] = await Promise.all([
    listPatients(),
    listServices(undefined, true),
    getSettings(),
    listScheduleBlocksInRange(startUtc, endUtc),
  ]);

  return (
    <div>
      <AppHeader title="Editar agendamento" description={apt.patient.name} />
      <AppointmentForm
        patients={patients}
        services={services.filter((s) => s.active)}
        defaults={{
          date,
          time: toTimeInputValue(apt.startsAt),
          patientId: apt.patientId,
        }}
        workingHours={(settings.workingHours ?? null) as WorkingHours | null}
        scheduleBlocks={blocks}
        appointment={{
          id: apt.id,
          patientId: apt.patientId,
          startsAt: apt.startsAt,
          status: apt.status,
          discountCents: apt.discountCents,
          notes: apt.notes,
          items: apt.items.map((i) => ({
            serviceId: i.serviceId,
            serviceName: i.serviceName,
            priceCents: i.priceCents,
            durationMin: i.durationMin,
            quantity: i.quantity,
          })),
        }}
      />
    </div>
  );
}
