import { AppHeader } from "@/components/layout/app-header";
import { ScheduleBlocksPanel } from "@/components/configuracoes/schedule-blocks-panel";
import { SettingsForm } from "@/components/configuracoes/settings-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { WorkingHours } from "@/lib/db/schema";
import {
  getSettings,
  listScheduleBlocks,
} from "@/server/actions/settings";

export const metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const [settings, blocks] = await Promise.all([
    getSettings(),
    listScheduleBlocks(),
  ]);

  const workingHours = (settings.workingHours ?? {}) as WorkingHours;

  return (
    <div>
      <AppHeader
        title="Configurações"
        description="Horários de atendimento, bloqueios e dados da clínica."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Clínica e agenda</CardTitle>
            <CardDescription>
              Nome, intervalo da grade e janelas de atendimento por dia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm
              clinicName={settings.clinicName ?? "Minha Clínica"}
              slotMinutes={settings.slotMinutes}
              workingHours={workingHours}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Bloqueios</CardTitle>
            <CardDescription>
              Períodos indisponíveis (férias, compromissos).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleBlocksPanel blocks={blocks} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
