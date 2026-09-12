import { changeAppointmentStatus } from "@/app/admin/actions";
import {
  AdminActionForm,
  AutoSubmitSelect,
} from "@/components/admin/action-form";
import { AdminPageHeader } from "@/components/admin/shell";
import {
  AdminEmptyState,
  AdminTable,
  AdminTableRow,
  Cell,
} from "@/components/admin/ui";
import { formatDateShort } from "@/lib/format";
import { appointmentStatusLabels } from "@/lib/server/crm";
import type { AppointmentRecord } from "@/lib/server/submissions";
import { AccessDenied } from "@/components/admin/access-denied";
import {
  getAppointmentsForAdmin,
  getCachedAdminAccess,
} from "@/lib/admin/data";
import { formatSlotTime } from "@/lib/booking/availability";

export const dynamic = "force-dynamic";

const statusOptions = (
  Object.keys(appointmentStatusLabels) as (keyof typeof appointmentStatusLabels)[]
).map((value) => ({ value, label: appointmentStatusLabels[value] }));

export default async function AdminAppointmentsPage() {
  const access = await getCachedAdminAccess();
  if (!access.allowed) return <AccessDenied reason={access.reason} />;

  const appointments = await getAppointmentsForAdmin();

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = appointments.filter((entry) => entry.date >= today);
  const past = appointments.filter((entry) => entry.date < today);

  return (
    <>
      <AdminPageHeader
        title="Appointments"
        description={`${appointments.length} consultation${appointments.length === 1 ? "" : "s"} booked through the website.`}
      />

      {appointments.length === 0 ? (
        <AdminEmptyState
          icon="calendar"
          title="No bookings yet"
          description="Consultations booked on the website will appear here, newest first."
        />
      ) : (
        <div className="flex flex-col gap-8">
          <AppointmentGroup
            heading="Upcoming"
            appointments={upcoming}
            emptyMessage="Nothing booked ahead."
          />
          <AppointmentGroup
            heading="Past"
            appointments={past}
            emptyMessage="No past consultations."
          />
        </div>
      )}
    </>
  );
}

function AppointmentGroup({
  heading,
  appointments,
  emptyMessage,
}: {
  heading: string;
  appointments: AppointmentRecord[];
  emptyMessage: string;
}) {
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-ink">
        {heading}{" "}
        <span className="font-normal text-muted">({appointments.length})</span>
      </h2>

      {appointments.length === 0 ? (
        <p className="rounded-card border border-dashed border-line bg-white px-5 py-8 text-center text-sm text-muted">
          {emptyMessage}
        </p>
      ) : (
        <AdminTable
          caption={`${heading} consultations`}
          headers={["Client", "Contact", "When", "Type", "Status"]}
        >
          {appointments.map((appointment) => (
            <AdminTableRow key={appointment.id}>
              <Cell className="font-medium text-ink">
                {appointment.firstName} {appointment.lastName}
                {appointment.businessName ? (
                  <span className="mt-0.5 block text-xs font-normal text-muted">
                    {appointment.businessName}
                  </span>
                ) : null}
              </Cell>
              <Cell muted>
                <a
                  href={`mailto:${appointment.email}`}
                  className="text-brand-700 hover:text-brand-800"
                >
                  {appointment.email}
                </a>
                {appointment.phone ? (
                  <span className="mt-0.5 block text-xs">
                    {appointment.phone}
                  </span>
                ) : null}
              </Cell>
              <Cell>
                <span className="font-medium text-ink">
                  {formatDateShort(appointment.date)}
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  {formatSlotTime(appointment.time)}
                </span>
              </Cell>
              <Cell muted>{appointment.consultationTypeSlug}</Cell>
              <Cell>
                <AdminActionForm action={changeAppointmentStatus}>
                  <input
                    type="hidden"
                    name="appointmentId"
                    value={appointment.id}
                  />
                  <AutoSubmitSelect
                    name="status"
                    label={`Status for ${appointment.firstName} ${appointment.lastName}`}
                    value={appointment.status}
                    options={statusOptions}
                  />
                </AdminActionForm>
              </Cell>
            </AdminTableRow>
          ))}
        </AdminTable>
      )}
    </section>
  );
}
