import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppHeader } from "@/components/layout/app-header";
import { AgendaToolbar, type AgendaView } from "@/components/agenda/agenda-toolbar";
import { DayView } from "@/components/agenda/day-view";
import { ListView } from "@/components/agenda/list-view";
import { WeekView } from "@/components/agenda/week-view";
import { getWeekRange, todayDateString } from "@/lib/dates";
import {
  listAppointmentsForDay,
  listAppointmentsForWeek,
} from "@/server/actions/appointments";

export const metadata = { title: "Agenda" };

type Props = {
  searchParams: Promise<{ date?: string; view?: string }>;
};

function resolveView(raw: string | undefined): AgendaView {
  if (raw === "week" || raw === "list" || raw === "day") return raw;
  return "day";
}

export default async function AgendaPage({ searchParams }: Props) {
  const params = await searchParams;
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
    ? params.date
    : todayDateString();
  const view = resolveView(params.view);

  const appointments =
    view === "week" || view === "list"
      ? await listAppointmentsForWeek(date)
      : await listAppointmentsForDay(date);

  const title =
    view === "week"
      ? (() => {
          const { days } = getWeekRange(date);
          return `${format(parseISO(days[0]), "d MMM", { locale: ptBR })} – ${format(parseISO(days[6]), "d MMM yyyy", { locale: ptBR })}`;
        })()
      : format(parseISO(date), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div>
      <AppHeader
        title="Agenda"
        description={title.charAt(0).toUpperCase() + title.slice(1)}
      />
      <AgendaToolbar date={date} view={view} />
      {view === "day" ? (
        <DayView date={date} appointments={appointments} />
      ) : null}
      {view === "week" ? (
        <WeekView date={date} appointments={appointments} />
      ) : null}
      {view === "list" ? <ListView appointments={appointments} /> : null}
    </div>
  );
}
