"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Service } from "@/lib/db/schema";
import { centsToDecimalString, parseBRLToCents } from "@/lib/money";
import {
  createServiceAction,
  updateServiceAction,
  type ServiceActionState,
} from "@/server/actions/services";

type Props = {
  service?: Service;
};

const initial: ServiceActionState = {};

export function ServiceFormDialog({ service }: Props) {
  const [open, setOpen] = useState(false);
  const [priceDisplay, setPriceDisplay] = useState(
    service ? centsToDecimalString(service.defaultPriceCents) : "",
  );
  const [active, setActive] = useState(service?.active ?? true);
  const isEdit = Boolean(service);

  const action = isEdit ? updateServiceAction : createServiceAction;
  const [state, formAction, pending] = useActionState(action, initial);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      setOpen(false);
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isEdit ? (
        <DialogTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Editar serviço" />
          }
        >
          <Pencil className="size-4" />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button />}>
          <Plus className="size-4" />
          Novo serviço
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isEdit ? "Editar serviço" : "Novo serviço"}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {service ? <input type="hidden" name="id" value={service.id} /> : null}
          <input
            type="hidden"
            name="defaultPriceCents"
            value={parseBRLToCents(priceDisplay)}
          />

          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={service?.name}
              placeholder="Limpeza"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              name="category"
              defaultValue={service?.category ?? ""}
              placeholder="Prevenção"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="price">Valor (R$)</Label>
              <Input
                id="price"
                inputMode="decimal"
                required
                value={priceDisplay}
                onChange={(e) => setPriceDisplay(e.target.value)}
                placeholder="150,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (min)</Label>
              <Input
                id="duration"
                name="defaultDurationMin"
                type="number"
                min={5}
                max={480}
                required
                defaultValue={service?.defaultDurationMin ?? 30}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Cor</Label>
            <Input
              id="color"
              name="color"
              type="color"
              defaultValue={service?.color ?? "#0284C7"}
              className="h-10 w-20 cursor-pointer p-1"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <Label htmlFor="active">Ativo</Label>
            <Switch
              id="active"
              checked={active}
              onCheckedChange={setActive}
            />
          </div>
          <input type="hidden" name="active" value={active ? "true" : "false"} />

          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
