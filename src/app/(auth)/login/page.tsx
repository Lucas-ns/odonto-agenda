import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-4 sm:p-6">
      <LoginForm />
    </main>
  );
}
