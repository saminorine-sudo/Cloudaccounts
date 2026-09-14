import Link from "next/link";
import { notFound } from "next/navigation";

import {
  changeLeadFollowUp,
  changeLeadStatus,
  createLeadNote,
} from "@/app/admin/actions";
import {
  AdminActionForm,
  AutoSubmitSelect,
  SubmitButton,
} from "@/components/admin/action-form";
import { AdminPageHeader } from "@/components/admin/shell";
import { DetailRow, StatusPill } from "@/components/admin/ui";
import { Card } from "@/components/ui/layout";
import { Icon } from "@/components/ui/icon";
import { formatDate, formatDateShort } from "@/lib/format";
import { leadStatusLabels, leadStatuses } from "@/lib/server/crm";
import { AccessDenied } from "@/components/admin/access-denied";
import {
  getCachedAdminAccess,
  getLeadForAdmin,
  getLeadNotesForAdmin,
  getLeadStatusHistoryForAdmin,
} from "@/lib/admin/data";
import { businessTypes, serviceOptions, turnoverBands } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

const businessTypeLabels = Object.fromEntries(
  businessTypes.map((type) => [type.value, type.label]),
);
const turnoverLabels = Object.fromEntries(
  turnoverBands.map((band) => [band.value, band.label]),
);
const serviceLabels = Object.fromEntries(
  serviceOptions.map((service) => [service.value, service.label]),
);

type TimelineEntry = {
  id: string;
  at: string;
  title: string;
  body?: string;
  icon: "spark" | "tag" | "receipt";
};

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await getCachedAdminAccess();
  if (!access.allowed) return <AccessDenied reason={access.reason} />;

  const { id } = await params;
  const lead = await getLeadForAdmin(id);
  if (!lead) notFound();

  const [notes, history] = await Promise.all([
    getLeadNotesForAdmin(id),
    getLeadStatusHistoryForAdmin(id),
  ]);

  // One timeline from two sources, newest first, so the activity reads as a
  // single story rather than two lists the reader has to interleave.
  const timeline: TimelineEntry[] = [
    ...history.map((entry) => ({
      id: `status-${entry.id}`,
      at: entry.createdAt,
      title: entry.fromStatus
        ? `Status changed from ${leadStatusLabels[entry.fromStatus]} to ${leadStatusLabels[entry.toStatus]}`
        : "Lead created",
      icon: entry.fromStatus ? ("tag" as const) : ("spark" as const),
    })),
    ...notes.map((note) => ({
      id: `note-${note.id}`,
      at: note.createdAt,
      title: note.authorName ? `Note by ${note.authorName}` : "Note added",
      body: note.body,
      icon: "receipt" as const,
    })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  const followUpValue = lead.followUpAt
    ? lead.followUpAt.slice(0, 10)
    : "";

  return (
    <>
      <Link
        href="/admin/leads"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand-700"
      >
        <Icon name="arrow-right" className="h-3.5 w-3.5 rotate-180" />
        All leads
      </Link>

      <AdminPageHeader
        title={`${lead.firstName} ${lead.lastName}`}
        description={lead.businessName ?? undefined}
        action={
          <AdminActionForm action={changeLeadStatus}>
            <input type="hidden" name="leadId" value={lead.id} />
            <AutoSubmitSelect
              name="status"
              label="Lead status"
              value={lead.status}
              options={leadStatuses.map((value) => ({
                value,
                label: leadStatusLabels[value],
              }))}
            />
          </AdminActionForm>
        }
      />

      <div className="mb-6">
        <StatusPill
          kind="lead"
          status={lead.status}
          label={leadStatusLabels[lead.status]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-ink">Enquiry</h2>
            <dl className="mt-3 divide-y divide-line">
              <DetailRow term="Email">
                <a
                  href={`mailto:${lead.email}`}
                  className="text-brand-700 hover:text-brand-800"
                >
                  {lead.email}
                </a>
              </DetailRow>
              <DetailRow term="Phone">
                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone.replace(/\s/g, "")}`}
                    className="text-brand-700 hover:text-brand-800"
                  >
                    {lead.phone}
                  </a>
                ) : (
                  <span className="text-muted">Not provided</span>
                )}
              </DetailRow>
              <DetailRow term="Preferred contact">
                {lead.preferredContact}
              </DetailRow>
              <DetailRow term="Business">
                {lead.businessName ?? (
                  <span className="text-muted">Not provided</span>
                )}
              </DetailRow>
              <DetailRow term="Business type">
                {businessTypeLabels[lead.businessType] ?? lead.businessType}
              </DetailRow>
              <DetailRow term="Turnover">
                {turnoverLabels[lead.turnover] ?? lead.turnover}
              </DetailRow>
              <DetailRow term="Services">
                {lead.services.length > 0 ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {lead.services.map((service) => (
                      <li
                        key={service}
                        className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-800 ring-1 ring-brand-200"
                      >
                        {serviceLabels[service] ?? service}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted">None selected</span>
                )}
              </DetailRow>
              <DetailRow term="Source">{lead.source}</DetailRow>
              <DetailRow term="Received">
                {formatDate(lead.createdAt)}
              </DetailRow>
            </dl>

            {lead.message ? (
              <div className="mt-5 rounded-xl bg-surface p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Message
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                  {lead.message}
                </p>
              </div>
            ) : null}
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-ink">Activity</h2>

            <AdminActionForm action={createLeadNote} className="mt-4">
              <input type="hidden" name="leadId" value={lead.id} />
              <label htmlFor="note-body" className="sr-only">
                Add a note
              </label>
              <textarea
                id="note-body"
                name="body"
                rows={3}
                required
                placeholder="Add a note — what was discussed, what happens next."
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm leading-relaxed text-ink transition-colors placeholder:text-slate-400 hover:border-slate-300"
              />
              <div className="mt-2.5">
                <SubmitButton>Add note</SubmitButton>
              </div>
            </AdminActionForm>

            {timeline.length === 0 ? (
              <p className="mt-6 text-sm text-muted">No activity recorded.</p>
            ) : (
              <ol className="mt-6 flex flex-col gap-5 border-t border-line pt-5">
                {timeline.map((entry) => (
                  <li key={entry.id} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                      <Icon name={entry.icon} className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">
                        {entry.title}
                      </p>
                      {entry.body ? (
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                          {entry.body}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted">
                        {formatDate(entry.at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-ink">Follow-up</h2>
            <p className="mt-1.5 text-sm text-muted">
              The dashboard flags a lead once this date has passed.
            </p>

            <AdminActionForm action={changeLeadFollowUp} className="mt-4">
              <input type="hidden" name="leadId" value={lead.id} />
              <label htmlFor="follow-up" className="sr-only">
                Follow-up date
              </label>
              <input
                id="follow-up"
                type="date"
                name="followUpAt"
                defaultValue={followUpValue}
                className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink transition-colors hover:border-slate-300"
              />
              <div className="mt-2.5 flex gap-2">
                <SubmitButton>Save date</SubmitButton>
              </div>
            </AdminActionForm>

            {lead.followUpAt ? (
              <p className="mt-3 text-xs text-muted">
                Currently set for {formatDateShort(lead.followUpAt)}. Clear the
                field and save to remove it.
              </p>
            ) : null}
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-ink">Assignment</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Assigning a lead to a staff member needs user accounts, which
              arrive with sign-in. Until then, use a note to record who is
              handling it.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
