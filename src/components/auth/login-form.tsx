"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loginAction,
  resetPasswordAction,
  type AuthState,
} from "@/server/actions/auth";

const initial: AuthState = {};

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const [loginState, loginFormAction, loginPending] = useActionState(
    loginAction,
    initial,
  );
  const [resetState, resetFormAction, resetPending] = useActionState(
    resetPasswordAction,
    initial,
  );

  const state = mode === "login" ? loginState : resetState;
  const pending = loginPending || resetPending;
  const action = mode === "login" ? loginFormAction : resetFormAction;

  return (
    <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-card shadow-xl lg:grid-cols-12">
      <div className="flex flex-col justify-between p-8 sm:p-10 lg:col-span-7 lg:p-12">
        <div>
          <div className="mb-8 flex items-center justify-between gap-3">
            <Logo />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-2.5 py-1 text-[11px] font-semibold tracking-wide text-secondary uppercase">
              <span className="size-1.5 animate-pulse rounded-full bg-secondary" />
              Portal clínico
            </span>
          </div>

          <p className="mb-1 text-xs font-semibold tracking-wider text-primary uppercase">
            Portal do Cirurgião-Dentista
          </p>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {mode === "reset" ? "Recuperar senha" : "Bem-vindo ao OdontoFlow"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "reset"
              ? "Informe seu e-mail para receber o link de redefinição."
              : "Acesso exclusivo por convite. Gerencie agenda, pacientes e serviços."}
          </p>
        </div>

        <form action={action} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail profissional</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="voce@clinica.com.br"
                className="pl-10"
              />
            </div>
          </div>

          {mode !== "reset" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <button
                  type="button"
                  className="text-xs font-semibold text-primary hover:underline"
                  onClick={() => setMode("reset")}
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pr-10 pl-10"
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Alternar visibilidade da senha"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>
          ) : null}

          {mode === "login" ? (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={remember}
                onCheckedChange={(v) => setRemember(v === true)}
              />
              Lembrar neste dispositivo
            </label>
          ) : null}

          {state.error ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p className="rounded-lg bg-secondary/10 px-3 py-2 text-sm text-secondary">
              {state.success}
            </p>
          ) : null}

          <Button type="submit" className="h-11 w-full" disabled={pending}>
            {pending
              ? "Aguarde…"
              : mode === "reset"
                ? "Enviar link"
                : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "reset" ? (
            <button
              type="button"
              className="font-semibold text-primary hover:underline"
              onClick={() => setMode("login")}
            >
              Voltar ao login
            </button>
          ) : (
            <>Acesso apenas por convite do administrador.</>
          )}
        </p>
      </div>

      <div className="relative hidden bg-gradient-to-br from-primary via-[#0369a1] to-[#0c4a6e] p-10 text-primary-foreground lg:col-span-5 lg:flex lg:flex-col lg:justify-end">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-16 right-10 size-40 rounded-full bg-white/30 blur-2xl" />
          <div className="absolute bottom-24 left-8 size-56 rounded-full bg-secondary/40 blur-3xl" />
        </div>
        <div className="relative space-y-3">
          <p className="text-sm font-semibold tracking-wide text-white/80 uppercase">
            Agenda odontológica
          </p>
          <h2 className="font-heading text-3xl font-bold leading-tight">
            Pacientes, serviços e valores em menos de 30 segundos.
          </h2>
          <p className="text-sm text-white/75">
            Feito para o dentista que atende sozinho e precisa de rapidez no
            celular e no consultório.
          </p>
        </div>
      </div>
    </div>
  );
}
