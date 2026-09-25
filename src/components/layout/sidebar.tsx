"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Settings,
  Stethoscope,
  Users,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/server/actions/auth";

const nav = [
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/servicos", label: "Serviços", icon: Stethoscope },
  { href: "/painel", label: "Painel", icon: LayoutDashboard },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

type SidebarProps = {
  userName?: string;
  userEmail?: string;
};

function NavPendingDot() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span className="ml-auto size-1.5 animate-pulse rounded-full bg-current opacity-70" />
  );
}

export function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <div className="px-4 pb-2">
        <p className="px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Navegação
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              prefetch
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-surface-container-high hover:text-foreground",
              )}
            >
              <Icon className="size-5 shrink-0" />
              {label}
              <NavPendingDot />
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-sidebar-border p-4">
        <div className="rounded-xl bg-surface-container-low px-3 py-2.5">
          <p className="truncate text-sm font-semibold text-foreground">
            {userName ?? "Dentista"}
          </p>
          <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
        </div>
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground"
          >
            <LogOut className="size-4" />
            Sair
          </Button>
        </form>
      </div>
    </aside>
  );
}
