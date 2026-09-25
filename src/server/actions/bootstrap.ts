"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles, settings } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { seedDefaultServices } from "@/server/actions/services";

/** Garante profile/settings (caso o trigger não tenha rodado) e seed de serviços. */
export async function ensureProfileAndSeed() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!existing) {
    await db.insert(profiles).values({
      id: user.id,
      name:
        (user.user_metadata?.name as string | undefined) ??
        user.email?.split("@")[0] ??
        "Dentista",
      email: user.email ?? "",
    });
    await db.insert(settings).values({ userId: user.id });
  }

  await seedDefaultServices(user.id);
}
