import { formatLongDateBR } from "@/lib/dates";

type AppHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function AppHeader({ title, description, actions }: AppHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {formatLongDateBR()}
        </p>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
