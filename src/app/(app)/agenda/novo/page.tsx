import { AppHeader } from "@/components/layout/app-header";
import { AppointmentForm } from "@/components/agenda/appointment-form";
import { getDayRange, todayDateString } from "@/lib/dates";
import type { WorkingHours } from "@/lib/db/schema";
import { listPatients } from "@/server/actions/patients";
import { listServices } from "@/server/actions/services";
import {
  getSettings,
  listScheduleBlocksInRange,
} from "@/server/actions/settings";

export const metadata = { title: "Novo agendamento" };

type Props = {
  searchParams: Promise<{ date?: string; time?: string; patientId?: string }>;
};

export default async function NovoAgendamentoPage({ searchParams }: Props) {
  const params = await searchParams;
  const date = params.date || todayDateString();
  const { startUtc, endUtc } = getDayRange(date);

  const [patients, services, settings, blocks] = await Promise.all([
    listPatients(),
    listServices(undefined, false),
    getSettings(),
    listScheduleBlocksInRange(startUtc, endUtc),
  ]);

  return (
    <div>
      <AppHeader
        title="Novo agendamento"
        description="Paciente, horário e serviços com valores pré-preenchidos."
      />
      <AppointmentForm
        patients={patients}
        services={services}
        defaults={{
          date,
          time: params.time || "09:00",
          patientId: params.patientId,
        }}
        workingHours={(settings.workingHours ?? null) as WorkingHours | null}
        scheduleBlocks={blocks}
      />
    </div>
  );
}
