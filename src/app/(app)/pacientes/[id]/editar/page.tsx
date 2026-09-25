import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { PatientForm } from "@/components/pacientes/patient-form";
import { getPatient } from "@/server/actions/patients";

export const metadata = { title: "Editar paciente" };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarPacientePage({ params }: Props) {
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();

  return (
    <div>
      <AppHeader
        title="Editar paciente"
        description={patient.name}
      />
      <PatientForm patient={patient} />
    </div>
  );
}
