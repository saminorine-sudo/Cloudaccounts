"use client";

import { useFormStatus } from "react-dom";

import { signOut } from "@/app/admin/login/actions";
import { Icon } from "@/components/ui/icon";

function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-brand-700 disabled:opacity-60"
    >
      <Icon name="external" className="h-3 w-3" />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

/**
 * A form, not a link. Signing out changes server state, so it must not sit
 * behind a GET that a prefetch or a crawler could follow.
 */
export function SignOut() {
  return (
    <form action={signOut}>
      <SignOutButton />
    </form>
  );
}
