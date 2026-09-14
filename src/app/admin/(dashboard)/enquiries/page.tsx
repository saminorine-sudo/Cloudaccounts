import { changeContactHandled } from "@/app/admin/actions";
import { AdminActionForm, SubmitButton } from "@/components/admin/action-form";
import { AdminPageHeader } from "@/components/admin/shell";
import { AdminEmptyState } from "@/components/admin/ui";
import { Card } from "@/components/ui/layout";
import { Icon } from "@/components/ui/icon";
import { formatDate } from "@/lib/format";
import { AccessDenied } from "@/components/admin/access-denied";
import {
  getCachedAdminAccess,
  getContactSubmissionsForAdmin,
} from "@/lib/admin/data";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Contact form messages.
 *
 * Rendered as cards rather than table rows because the message body is the
 * point, and a multi-line message in a table cell is unreadable.
 */
export default async function AdminEnquiriesPage() {
  const access = await getCachedAdminAccess();
  if (!access.allowed) return <AccessDenied reason={access.reason} />;

  const enquiries = await getContactSubmissionsForAdmin();
  const outstanding = enquiries.filter((entry) => !entry.isHandled);

  return (
    <>
      <AdminPageHeader
        title="Enquiries"
        description={
          enquiries.length === 0
            ? "Messages sent through the contact form."
            : `${outstanding.length} of ${enquiries.length} still to answer.`
        }
      />

      {enquiries.length === 0 ? (
        <AdminEmptyState
          icon="mail"
          title="No messages yet"
          description="Messages sent through the contact form will appear here."
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {enquiries.map((enquiry) => (
            <li key={enquiry.id}>
              {/*
                Answered messages are marked with the badge below, not with
                reduced opacity. Fading the card dropped the body text under
                the AA contrast threshold, and the badge already says it
                without relying on colour at all.
              */}
              <Card
                className={cn(
                  "p-5 sm:p-6",
                  enquiry.isHandled && "ring-brand-200",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-ink">
                      {enquiry.subject}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {enquiry.name} ·{" "}
                      <a
                        href={`mailto:${enquiry.email}`}
                        className="text-brand-700 hover:text-brand-800"
                      >
                        {enquiry.email}
                      </a>
                      {enquiry.phone ? ` · ${enquiry.phone}` : ""}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-muted">
                    {formatDate(enquiry.createdAt)}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-wrap rounded-xl bg-surface p-4 text-sm leading-relaxed text-ink-soft">
                  {enquiry.message}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {enquiry.isHandled ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800 ring-1 ring-brand-200">
                      <Icon name="check" className="h-3 w-3" />
                      Answered
                    </span>
                  ) : null}

                  <AdminActionForm action={changeContactHandled}>
                    <input
                      type="hidden"
                      name="submissionId"
                      value={enquiry.id}
                    />
                    <input
                      type="hidden"
                      name="isHandled"
                      value={enquiry.isHandled ? "false" : "true"}
                    />
                    <SubmitButton variant="secondary">
                      {enquiry.isHandled
                        ? "Mark as unanswered"
                        : "Mark as answered"}
                    </SubmitButton>
                  </AdminActionForm>

                  <a
                    href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Re: ${enquiry.subject}`)}`}
                    className="text-sm font-medium text-brand-700 hover:text-brand-800"
                  >
                    Reply by email
                  </a>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
