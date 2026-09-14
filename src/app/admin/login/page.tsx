import { redirect } from "next/navigation";

import { LoginForm } from "@/app/admin/login/login-form";
import { safeRedirectTarget } from "@/lib/admin/redirect";
import { getAdminAccess } from "@/lib/admin/access";
import { isSupabaseConfigured } from "@/lib/supabase/clients";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Staff sign-in.
 *
 * Sits outside the `(dashboard)` gate, because someone who is not signed in
 * has to be able to reach it. Anyone who already has staff access is sent
 * straight on rather than shown a form they do not need.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = safeRedirectTarget(next);

  const access = await getAdminAccess();
  if (access.allowed) redirect(target);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-lg font-semibold tracking-tight text-ink">
            CloudAccounts
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
            Staff sign-in
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            This area is for CloudAccounts staff. Client accounts cannot sign in
            here.
          </p>
        </div>

        <div className="rounded-card bg-white p-7 shadow-card ring-1 ring-line">
          {isSupabaseConfigured() ? (
            <LoginForm next={target} />
          ) : (
            <p className="text-sm leading-relaxed text-muted">
              Authentication is not configured on this deployment, so there is
              nothing to sign in to.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
