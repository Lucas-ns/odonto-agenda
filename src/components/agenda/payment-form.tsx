"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
} from "@/lib/appointment-labels";
import { updatePaymentAction } from "@/server/actions/appointments";

type Props = {
  appointmentId: string;
  paymentStatus: string;
  paymentMethod: string | null;
};

export function PaymentForm({
  appointmentId,
  paymentStatus,
  paymentMethod,
}: Props) {
  const [state, action, pending] = useActionState(updatePaymentAction, {});

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={appointmentId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="paymentStatus">Status</Label>
          <select
            id="paymentStatus"
            name="paymentStatus"
            defaultValue={paymentStatus}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            {Object.entries(PAYMENT_STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Forma</Label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            defaultValue={paymentMethod ?? ""}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">—</option>
            {Object.entries(PAYMENT_METHOD_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Salvar pagamento"}
      </Button>
    </form>
  );
}
