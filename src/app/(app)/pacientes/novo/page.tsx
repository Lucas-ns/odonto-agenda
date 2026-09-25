import { AppHeader } from "@/components/layout/app-header";
import { PatientForm } from "@/components/pacientes/patient-form";

export const metadata = { title: "Novo paciente" };

export default function NovoPacientePage() {
  return (
    <div>
      <AppHeader
        title="Novo paciente"
        description="Cadastro completo. No agendamento também haverá cadastro rápido."
      />
      <PatientForm />
    </div>
  );
}
