"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, resetPasswordSchema } from "@/lib/validations/auth";
import { ensureProfileAndSeed } from "@/server/actions/bootstrap";

export type AuthState = {
  error?: string;
  success?: string;
};

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return {
        error:
          "Confirme seu e-mail antes de entrar (veja a caixa de entrada) ou desative a confirmação em Authentication → Providers → Email no Supabase.",
      };
    }
    if (error.message.toLowerCase().includes("invalid login")) {
      return { error: "E-mail ou senha incorretos." };
    }
    return { error: error.message };
  }

  await ensureProfileAndSeed();
  redirect("/agenda");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "E-mail inválido" };
  }

  const supabase = await createClient();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/configuracoes`,
  });

  if (error) {
    return { error: "Não foi possível enviar o e-mail de recuperação." };
  }

  return {
    success: "Se o e-mail existir, enviamos um link de recuperação.",
  };
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "");

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { name: name || email.split("@")[0] },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Conta já existia (Supabase não revela por segurança) ou e-mail precisa confirmar
  if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
    return {
      error: "Este e-mail já está cadastrado. Faça login ou recupere a senha.",
    };
  }

  if (!data.session) {
    return {
      success:
        "Conta criada. Confirme o e-mail pelo link enviado (ou desative “Confirm email” no Supabase para entrar direto em dev).",
    };
  }

  await ensureProfileAndSeed();
  revalidatePath("/", "layout");
  redirect("/agenda");
}
