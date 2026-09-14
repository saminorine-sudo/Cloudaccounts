import { AccessDenied } from "@/components/admin/access-denied";
import { AdminShell } from "@/components/admin/shell";
import { getCachedAdminAccess } from "@/lib/admin/data";

/**
 * The admin area must never be cached or prerendered — every response depends
 * on who is asking. `force-dynamic` also stops a denial page being cached and
 * served to someone who should have been let in.
 */
export const dynamic = "force-dynamic";

/**
 * This gate controls what is DISPLAYED. It is not the security boundary:
 * refusing to render `children` here does not stop the page component from
 * running and being serialized into the RSC payload. Each page refuses for
 * itself, and `lib/admin/data.ts` authorises every read.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getCachedAdminAccess();

  if (!access.allowed) return <AccessDenied reason={access.reason} />;

  return <AdminShell access={access}>{children}</AdminShell>;
}
