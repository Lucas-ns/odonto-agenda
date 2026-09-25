import { cache } from "react";
import { eq } from "drizzle-orm";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

/** Deduplica auth + profile no mesmo request RSC (layout + pages). */
const getShellUser = cache(async () => {
  const user = await requireUser();
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
    columns: { name: true, email: true },
  });
  return {
    name:
      profile?.name ??
      (user.user_metadata?.name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Dentista",
    email: profile?.email ?? user.email ?? "",
  };
});

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const shell = await getShellUser();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userName={shell.name} userEmail={shell.email} />
      <div className="lg:pl-64">
        <main className="mx-auto min-h-screen max-w-7xl px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pb-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
