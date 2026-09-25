export const APPOINTMENT_STATUS_LABEL: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluído",
  no_show: "Faltou",
  canceled: "Cancelado",
};

export const APPOINTMENT_STATUS_CLASS: Record<string, string> = {
  scheduled: "bg-muted text-muted-foreground border-border",
  confirmed: "bg-accent text-accent-foreground border-primary/20",
  completed: "bg-secondary/15 text-secondary border-secondary/30",
  no_show: "bg-warning/15 text-warning border-warning/30",
  canceled: "bg-destructive/10 text-destructive border-destructive/20",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  partial: "Parcial",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  pix: "Pix",
  cash: "Dinheiro",
  credit: "Cartão crédito",
  debit: "Cartão débito",
  other: "Outro",
};
