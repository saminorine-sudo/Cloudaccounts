import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/shell";
import {
  AdminEmptyState,
  AdminTable,
  AdminTableRow,
  Cell,
  StatCard,
  StatusPill,
} from "@/components/admin/ui";
import { Alert } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import {
  appointmentStatusLabels,
  closedStatuses,
  leadStatusLabels,
} from "@/lib/server/crm";
import { isPersistent } from "@/lib/server/submissions";
import { AccessDenied } from "@/components/admin/access-denied";
import {
  getAppointmentsForAdmin,
  getCachedAdminAccess,
  getContactSubmissionsForAdmin,
  getLeadsForAdmin,
} from "@/lib/admin/data";
import { formatDateShort } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * Dashboard.
 *
 * Every figure here is counted from records that exist. There are no invented
 * revenue or client metrics: the business has not supplied that data, and a
 * dashboard that shows made-up numbers is worse than one that shows fewer
 * real ones.
 */
export default async function AdminDashboardPage() {
  // The layout's check governs display only — a layout that discards
  // `children` still renders this page into the RSC payload. Refusing here is
  // what keeps the records off the wire.
  const access = await getCachedAdminAccess();
  if (!access.allowed) return <AccessDenied reason={access.reason} />;

  const [leads, appointments, enquiries] = await Promise.all([
    getLeadsForAdmin(),
    getAppointmentsForAdmin(),
    getContactSubmissionsForAdmin(),
  ]);

  const now = new Date();
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();

  const newLeads = leads.filter((lead) => lead.status === "NEW");
  const leadsThisMonth = leads.filter((lead) => lead.createdAt >= startOfMonth);
  const appointmentsThisMonth = appointments.filter(
    (appointment) => appointment.createdAt >= startOfMonth,
  );
  const unhandledEnquiries = enquiries.filter((entry) => !entry.isHandled);

  const closed = leads.filter((lead) => closedStatuses.includes(lead.status));
  const won = leads.filter((lead) => lead.status === "WON");
  // Conversion is only meaningful against decided leads — counting those still
  // in the pipeline as failures would understate it permanently.
  const conversionRate =
    closed.length > 0 ? Math.round((won.length / closed.length) * 100) : null;

  const overdueFollowUps = leads.filter(
    (lead) =>
      lead.followUpAt !== null &&
      lead.followUpAt <= now.toISOString() &&
      !closedStatuses.includes(lead.status),
  );

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Everything that has come in through the website."
      />

      {!isPersistent ? (
        <Alert tone="warning" className="mb-6">
          <strong className="font-semibold">Using the in-memory store.</strong>{" "}
          No database is connected, so these records exist only until the
          server restarts. Submit the public forms to populate them. See{" "}
          <code className="font-mono text-xs">docs/SUPABASE-SETUP.md</code>.
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total leads"
          value={String(leads.length)}
          detail={`${leadsThisMonth.length} this month`}
          href="/admin/leads"
        />
        <StatCard
          label="New leads"
          value={String(newLeads.length)}
          detail="Not yet contacted"
          href="/admin/leads?status=NEW"
        />
        <StatCard
          label="Consultations"
          value={String(appointmentsThisMonth.length)}
          detail="Booked this month"
          href="/admin/appointments"
        />
        <StatCard
          label="Conversion"
          value={conversionRate === null ? "—" : `${conversionRate}%`}
          detail={
            conversionRate === null
              ? "No decided leads yet"
              : `${won.length} won of ${closed.length} decided`
          }
        />
      </div>

      {overdueFollowUps.length > 0 ? (
        <Alert tone="warning" className="mt-6">
          <strong className="font-semibold">
            {overdueFollowUps.length} follow-up
            {overdueFollowUps.length === 1 ? "" : "s"} due.
          </strong>{" "}
          <Link href="/admin/leads" className="underline underline-offset-2">
            Review them
          </Link>
          .
        </Alert>
      ) : null}

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="text-base font-semibold text-ink">Recent enquiries</h2>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            All leads
            <Icon name="arrow-right" className="h-3.5 w-3.5" />
          </Link>
        </div>

        {leads.length === 0 ? (
          <AdminEmptyState
            icon="people"
            title="No leads yet"
            description="New enquiries from the website will appear here."
          />
        ) : (
          <AdminTable
            caption="Most recent leads"
            headers={["Name", "Business", "Status", "Received", ""]}
          >
            {leads.slice(0, 5).map((lead) => (
              <AdminTableRow key={lead.id}>
                <Cell className="font-medium text-ink">
                  {lead.firstName} {lead.lastName}
                </Cell>
                <Cell muted>{lead.businessName ?? "—"}</Cell>
                <Cell>
                  <StatusPill
                    kind="lead"
                    status={lead.status}
                    label={leadStatusLabels[lead.status]}
                  />
                </Cell>
                <Cell muted>{formatDateShort(lead.createdAt)}</Cell>
                <Cell className="text-right">
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="text-sm font-medium text-brand-700 hover:text-brand-800"
                  >
                    Open
                  </Link>
                </Cell>
              </AdminTableRow>
            ))}
          </AdminTable>
        )}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-end justify-between gap-4">
            <h2 className="text-base font-semibold text-ink">
              Upcoming consultations
            </h2>
            <Link
              href="/admin/appointments"
              className="text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              All
            </Link>
          </div>

          {appointments.length === 0 ? (
            <AdminEmptyState
              icon="calendar"
              title="No bookings yet"
              description="Consultations booked through the website will appear here."
            />
          ) : (
            <AdminTable
              density="compact"
              caption="Upcoming consultations"
              headers={["Client", "When", "Status"]}
            >
              {appointments.slice(0, 5).map((appointment) => (
                <AdminTableRow key={appointment.id}>
                  <Cell className="font-medium text-ink">
                    {appointment.firstName} {appointment.lastName}
                  </Cell>
                  <Cell muted>
                    {formatDateShort(appointment.date)} · {appointment.time}
                  </Cell>
                  <Cell>
                    <StatusPill
                      kind="appointment"
                      status={appointment.status}
                      label={appointmentStatusLabels[appointment.status]}
                    />
                  </Cell>
                </AdminTableRow>
              ))}
            </AdminTable>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-end justify-between gap-4">
            <h2 className="text-base font-semibold text-ink">
              Unanswered messages
            </h2>
            <Link
              href="/admin/enquiries"
              className="text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              All
            </Link>
          </div>

          {unhandledEnquiries.length === 0 ? (
            <AdminEmptyState
              icon="mail"
              title="Nothing waiting"
              description="Messages from the contact form appear here until they are marked as handled."
            />
          ) : (
            <AdminTable
              density="compact"
              caption="Unanswered contact messages"
              headers={["From", "Subject", "Received"]}
            >
              {unhandledEnquiries.slice(0, 5).map((enquiry) => (
                <AdminTableRow key={enquiry.id}>
                  <Cell className="font-medium text-ink">{enquiry.name}</Cell>
                  <Cell muted>{enquiry.subject}</Cell>
                  <Cell muted>{formatDateShort(enquiry.createdAt)}</Cell>
                </AdminTableRow>
              ))}
            </AdminTable>
          )}
        </div>
      </section>
    </>
  );
}
