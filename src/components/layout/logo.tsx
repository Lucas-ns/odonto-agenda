import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
};

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 44 44"
        className="h-9 w-9 shrink-0"
        aria-hidden
      >
        <rect width="44" height="44" rx="12" fill="#0284C7" />
        <path
          d="M14 12C14 9 17 7 22 7C27 7 30 9 30 12C30 16 27 18 27 23C27 28 26 33 24 33C22 33 21 27 20 27C19 27 18 33 16 33C14 33 13 28 13 23C13 18 14 16 14 12Z"
          fill="white"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M18 15C20 13 24 13 26 15"
          stroke="#0284C7"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark ? (
        <div className="flex flex-col leading-none">
          <span className="font-heading text-base font-bold tracking-tight text-foreground">
            Odonto<span className="text-primary">Flow</span>
          </span>
          <span className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Gestão Clínica
          </span>
        </div>
      ) : null}
    </div>
  );
}
