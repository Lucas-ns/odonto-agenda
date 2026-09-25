"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { AppointmentStatus, PaymentMethod } from "@/lib/db/schema";
import {
  cancelAppointmentAction,
  updateAppointmentStatusAction,
} from "@/server/actions/appointments";

type Props = {
  id: string;
  status: string;
};

export function AppointmentStatusActions({ id, status }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function setStatus(
    next: AppointmentStatus,
    opts?: { paymentStatus?: "paid"; paymentMethod?: PaymentMethod },
  ) {
    start(async () => {
      await updateAppointmentStatusAction(id, next, opts);
      toast.success("Status atualizado.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "scheduled" || status === "confirmed" ? (
        <>
          {status === "scheduled" ? (
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setStatus("confirmed")}
            >
              Confirmar
            </Button>
          ) : null}
          <Button
            type="button"
            disabled={pending}
            onClick={() =>
              setStatus("completed", {
                paymentStatus: "paid",
                paymentMethod: "pix",
              })
            }
          >
            Concluir
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => setStatus("no_show")}
          >
            Faltou
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await cancelAppointmentAction(id);
              })
            }
          >
            Cancelar
          </Button>
        </>
      ) : null}
      {status === "canceled" ? (
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => setStatus("scheduled")}
        >
          Reabrir
        </Button>
      ) : null}
    </div>
  );
}
