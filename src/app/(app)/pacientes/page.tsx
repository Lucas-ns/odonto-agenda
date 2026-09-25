import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PatientsTable } from "@/components/pacientes/patients-table";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { listPatients } from "@/server/actions/patients";

export const metadata = { title: "Pacientes" };

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function PacientesPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const patients = await listPatients(q);

  return (
    <div>
      <AppHeader
        title="Pacientes"
        description="Cadastro e busca rápida por nome ou telefone."
        actions={
          <Button render={<Link href="/pacientes/novo" />}>
            <Plus className="size-4" />
            Novo paciente
          </Button>
        }
      />
      <div className="mb-4">
        <Suspense fallback={null}>
          <SearchInput
            basePath="/pacientes"
            placeholder="Buscar por nome ou telefone…"
          />
        </Suspense>
      </div>
      <PatientsTable patients={patients} />
    </div>
  );
}
