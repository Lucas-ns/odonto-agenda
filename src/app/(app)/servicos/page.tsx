import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { SearchInput } from "@/components/shared/search-input";
import { ServiceFormDialog } from "@/components/servicos/service-form-dialog";
import { ServicesTable } from "@/components/servicos/services-table";
import { listServices } from "@/server/actions/services";

export const metadata = { title: "Serviços" };

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ServicosPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const services = await listServices(q);

  return (
    <div>
      <AppHeader
        title="Serviços"
        description="Catálogo com valores em R$ e duração padrão."
        actions={<ServiceFormDialog />}
      />
      <div className="mb-4">
        <Suspense fallback={null}>
          <SearchInput
            basePath="/servicos"
            placeholder="Buscar por nome…"
          />
        </Suspense>
      </div>
      <ServicesTable services={services} />
    </div>
  );
}
