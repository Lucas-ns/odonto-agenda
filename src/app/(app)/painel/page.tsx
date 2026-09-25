import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppHeader } from "@/components/layout/app-header";
import { PainelDashboard } from "@/components/painel/painel-dashboard";
import { todayDateString } from "@/lib/dates";
import {
  getDaySummary,
  getMonthSummary,
} from "@/server/actions/dashboard";

export const metadata = { title: "Painel" };

type Props = {
  searchParams: Promise<{ period?: string; date?: string; month?: string }>;
};

export default async function PainelPage({ searchParams }: Props) {
  const params = await searchParams;
  const date =
    params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? params.date
      : todayDateString();
  const yearMonth =
    params.month && /^\d{4}-\d{2}$/.test(params.month)
      ? params.month
      : date.slice(0, 7);
  const mode = params.period === "month" ? "month" : "day";

  const [day, month] = await Promise.all([
    getDaySummary(date),
    getMonthSummary(yearMonth),
  ]);

  const description =
    mode === "day"
      ? format(parseISO(date), "EEEE, d 'de' MMMM", { locale: ptBR })
      : format(parseISO(`${yearMonth}-01`), "MMMM 'de' yyyy", {
          locale: ptBR,
        });

  return (
    <div>
      <AppHeader
        title="Painel"
        description={
          description.charAt(0).toUpperCase() + description.slice(1)
        }
      />
      <PainelDashboard
        mode={mode}
        date={date}
        yearMonth={yearMonth}
        day={day}
        month={month}
      />
    </div>
  );
}
