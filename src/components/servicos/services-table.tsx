"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Service } from "@/lib/db/schema";
import { formatBRL } from "@/lib/money";
import { toggleServiceActiveAction } from "@/server/actions/services";
import { ServiceFormDialog } from "./service-form-dialog";

type Props = {
  services: Service[];
};

export function ServicesTable({ services }: Props) {
  const [pending, startTransition] = useTransition();

  function onToggle(id: string, active: boolean) {
    startTransition(async () => {
      await toggleServiceActiveAction(id, active);
      toast.success(active ? "Serviço ativado." : "Serviço desativado.");
    });
  }

  if (services.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Nenhum serviço encontrado. Crie o primeiro ou aguarde o seed automático
        no login.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Serviço</TableHead>
            <TableHead className="hidden sm:table-cell">Categoria</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead className="hidden md:table-cell">Duração</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((s) => (
            <TableRow key={s.id} className={!s.active ? "opacity-60" : undefined}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: s.color ?? "#0284C7" }}
                  />
                  <span className="font-medium">{s.name}</span>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {s.category ? (
                  <Badge variant="secondary">{s.category}</Badge>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="font-mono text-sm tabular-nums">
                {formatBRL(s.defaultPriceCents)}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {s.defaultDurationMin} min
              </TableCell>
              <TableCell>
                <Switch
                  checked={s.active}
                  disabled={pending}
                  onCheckedChange={(v) => onToggle(s.id, v)}
                  aria-label={s.active ? "Desativar" : "Ativar"}
                />
              </TableCell>
              <TableCell>
                <ServiceFormDialog service={s} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
