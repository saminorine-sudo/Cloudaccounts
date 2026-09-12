import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/shell";
import {
  AdminEmptyState,
  AdminTable,
  AdminTableRow,
  Cell,
  StatusPill,
} from "@/components/admin/ui";
import { Icon } from "@/components/ui/icon";
import { formatDateShort } from "@/lib/format";
import { leadStatusLabels, leadStatuses } from "@/lib/server/crm";
import type { LeadRecord } from "@/lib/server/submissions";
import { AccessDenied } from "@/components/admin/access-denied";
import { getCachedAdminAccess, getLeadsForAdmin } from "@/lib/admin/data";
import { businessTypes, turnoverBands } from "@/lib/validation/schemas";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const businessTypeLabels = Object.fromEntries(
  businessTypes.map((type) => [type.value, type.label]),
);
const turnoverLabels = Object.fromEntries(
  turnoverBands.map((band) => [band.value, band.label]),
);

type SearchParams = Promise<{
  q?: string;
  status?: string;
  page?: string;
}>;

/**
 * Filtering happens in memory after loading the leads.
 *
 * Fine at this scale and it keeps one code path across both storage modes.
 * Once the table is large enough for that to matter, the filters move into
 * the query and the pagination becomes a range request — the signature here
 * does not have to change for that.
 */
function filterLeads(
  leads: LeadRecord[],
  query: string,
  status: string | null,
): LeadRecord[] {
  const needle = query.trim().toLowerCase();

  return leads.filter((lead) => {
    if (status && lead.status !== status) return false;
    if (!needle) return true;

    return [
      lead.firstName,
      lead.lastName,
      lead.email,
      lead.businessName ?? "",
      lead.phone ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const access = await getCachedAdminAccess();
  if (!access.allowed) return <AccessDenied reason={access.reason} />;

  const params = await searchParams;
  const query = params.q ?? "";
  const status =
    params.status && leadStatuses.includes(params.status as never)
      ? params.status
      : null;

  const allLeads = await getLeadsForAdmin();
  const filtered = filterLeads(allLeads, query, status);

  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const buildHref = (next: Record<string, string | null>) => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (status) search.set("status", status);
    for (const [key, value] of Object.entries(next)) {
      if (value === null) search.delete(key);
      else search.set(key, value);
    }
    const queryString = search.toString();
    return queryString ? `/admin/leads?${queryString}` : "/admin/leads";
  };

  return (
    <>
      <AdminPageHeader
        title="Leads"
        description={`${allLeads.length} enquir${allLeads.length === 1 ? "y" : "ies"} received through the website.`}
      />

      {/* Search and filters. A plain GET form, so results are linkable and
          the back button behaves. */}
      <form method="get" className="mb-5 flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 sm:max-w-xs">
          <label
            htmlFor="lead-search"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Search
          </label>
          <div className="relative">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            />
            <input
              id="lead-search"
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Name, email or business"
              className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm text-ink transition-colors placeholder:text-slate-400 hover:border-slate-300"
            />
          </div>
        </div>

        {status ? <input type="hidden" name="status" value={status} /> : null}

        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-lg bg-brand-700 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-800"
        >
          Search
        </button>

        {query || status ? (
          <Link
            href="/admin/leads"
            className="inline-flex h-10 items-center text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            Clear
          </Link>
        ) : null}
      </form>

      <nav aria-label="Filter by status" className="mb-5">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href={buildHref({ status: null, page: null })}
              aria-current={!status ? "page" : undefined}
              className={cn(
                "inline-flex rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors",
                !status
                  ? "bg-brand-700 text-white ring-brand-700"
                  : "bg-white text-ink-soft ring-line hover:ring-brand-300",
              )}
            >
              All ({allLeads.length})
            </Link>
          </li>
          {leadStatuses.map((value) => {
            const count = allLeads.filter(
              (lead) => lead.status === value,
            ).length;
            const isActive = status === value;

            return (
              <li key={value}>
                <Link
                  href={buildHref({ status: value, page: null })}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors",
                    isActive
                      ? "bg-brand-700 text-white ring-brand-700"
                      : "bg-white text-ink-soft ring-line hover:ring-brand-300",
                  )}
                >
                  {leadStatusLabels[value]} ({count})
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {filtered.length === 0 ? (
        <AdminEmptyState
          icon={allLeads.length === 0 ? "people" : "search"}
          title={
            allLeads.length === 0 ? "No leads yet" : "Nothing matches that"
          }
          description={
            allLeads.length === 0
              ? "New enquiries will appear here. Submit the quote form on the website to see one."
              : "Try a different search term, or clear the filters."
          }
        />
      ) : (
        <>
          <AdminTable
            caption="Leads"
            headers={[
              "Name",
              "Business",
              "Type",
              "Turnover",
              "Status",
              "Follow-up",
              "Received",
              "",
            ]}
          >
            {visible.map((lead) => (
              <AdminTableRow key={lead.id}>
                <Cell className="font-medium text-ink">
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="hover:text-brand-700"
                  >
                    {lead.firstName} {lead.lastName}
                  </Link>
                  <span className="mt-0.5 block text-xs font-normal text-muted">
                    {lead.email}
                  </span>
                </Cell>
                <Cell muted>{lead.businessName ?? "—"}</Cell>
                <Cell muted>
                  {businessTypeLabels[lead.businessType] ?? lead.businessType}
                </Cell>
                <Cell muted>
                  {turnoverLabels[lead.turnover] ?? lead.turnover}
                </Cell>
                <Cell>
                  <StatusPill
                    kind="lead"
                    status={lead.status}
                    label={leadStatusLabels[lead.status]}
                  />
                </Cell>
                <Cell muted>
                  {lead.followUpAt ? formatDateShort(lead.followUpAt) : "—"}
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

          {pageCount > 1 ? (
            <nav
              aria-label="Pagination"
              className="mt-4 flex items-center justify-between gap-4"
            >
              <p className="text-xs text-muted">
                Page {safePage} of {pageCount} · {filtered.length} lead
                {filtered.length === 1 ? "" : "s"}
              </p>
              <div className="flex gap-2">
                {safePage > 1 ? (
                  <Link
                    href={buildHref({ page: String(safePage - 1) })}
                    className="inline-flex h-9 items-center rounded-lg bg-white px-3 text-sm font-medium text-ink-soft ring-1 ring-line transition-colors hover:ring-brand-300"
                  >
                    Previous
                  </Link>
                ) : null}
                {safePage < pageCount ? (
                  <Link
                    href={buildHref({ page: String(safePage + 1) })}
                    className="inline-flex h-9 items-center rounded-lg bg-white px-3 text-sm font-medium text-ink-soft ring-1 ring-line transition-colors hover:ring-brand-300"
                  >
                    Next
                  </Link>
                ) : null}
              </div>
            </nav>
          ) : null}
        </>
      )}
    </>
  );
}
