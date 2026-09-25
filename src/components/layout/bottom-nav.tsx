"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  Plus,
  Stethoscope,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/servicos", label: "Serviços", icon: Stethoscope },
  { href: "/painel", label: "Painel", icon: LayoutDashboard },
];

function PendingHint() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span className="absolute top-1 right-1/2 size-1 translate-x-3 rounded-full bg-primary" />
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      <Link
        href="/agenda/novo"
        prefetch
        className="fixed right-4 bottom-20 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition active:scale-95 lg:hidden"
        aria-label="Novo agendamento"
      >
        <Plus className="size-7" />
      </Link>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-md lg:hidden">
        <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  prefetch
                  className={cn(
                    "relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" />
                  {label}
                  <PendingHint />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
