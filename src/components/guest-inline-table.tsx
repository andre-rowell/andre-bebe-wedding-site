"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type GuestTableRow = {
  id: string;
  householdId: string;
  householdName: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  guestSide: "ANDRE" | "BEBE" | "BOTH";
  relationshipGroup: string | null;
  tags: string | null;
  isAdult: boolean;
  isChild: boolean;
  plusOneAllowed: boolean;
  plusOneName: string | null;
  notes: string | null;
};

type HouseholdOption = {
  id: string;
  name: string;
};

type GuestInlineTableProps = {
  guests: GuestTableRow[];
  households: HouseholdOption[];
  action: (formData: FormData) => Promise<void>;
};

type SortKey = keyof GuestTableRow;

const relationshipGroups = ["Family", "Friends", "Wedding Party", "Work", "Out-of-town"];
const tagOptions = [
  "",
  "family",
  "friends",
  "work",
  "wedding-party",
  "out-of-town",
  "child",
  "family,out-of-town",
  "friends,out-of-town",
  "friends,wedding-party",
  "family,child",
];

const columns: Array<{ key: SortKey; label: string; className?: string }> = [
  { key: "firstName", label: "First", className: "min-w-36" },
  { key: "lastName", label: "Last", className: "min-w-36" },
  { key: "householdName", label: "Household", className: "min-w-56" },
  { key: "email", label: "Email", className: "min-w-56" },
  { key: "phone", label: "Phone", className: "min-w-40" },
  { key: "guestSide", label: "Side", className: "min-w-32" },
  { key: "relationshipGroup", label: "Group", className: "min-w-40" },
  { key: "tags", label: "Tags", className: "min-w-48" },
  { key: "isAdult", label: "Adult", className: "min-w-24" },
  { key: "isChild", label: "Child", className: "min-w-24" },
  { key: "plusOneAllowed", label: "+1", className: "min-w-24" },
  { key: "plusOneName", label: "+1 Name", className: "min-w-44" },
  { key: "notes", label: "Notes", className: "min-w-64" },
];

function sortValue(guest: GuestTableRow, key: SortKey) {
  const value = guest[key];
  if (typeof value === "boolean") return value ? "1" : "0";
  return String(value || "").toLowerCase();
}

function tagChoices(current: string | null) {
  if (!current || tagOptions.includes(current)) return tagOptions;
  return [...tagOptions, current];
}

export function GuestInlineTable({ guests, households, action }: GuestInlineTableProps) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("lastName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const sortedGuests = useMemo(() => {
    return [...guests].sort((a, b) => {
      const left = sortValue(a, sortKey);
      const right = sortValue(b, sortKey);
      const result = left.localeCompare(right, undefined, { numeric: true });
      return sortDirection === "asc" ? result : -result;
    });
  }, [guests, sortDirection, sortKey]);

  const changeSort = (key: SortKey) => {
    if (key === sortKey) setSortDirection((current) => current === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  return (
    <section className="card overflow-hidden">
      <div className="border-b border-[#eaded7] p-5">
        <h2 className="serif text-3xl font-bold">Guest table</h2>
        <p className="mt-1 text-sm text-[#6a5c55]">Sort by any column, edit individual fields, then save the row.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1900px] border-collapse text-sm">
          <thead>
            <tr className="bg-[#fbf7f0] text-left text-xs font-bold uppercase tracking-[0.12em] text-[#6a5c55]">
              {columns.map((column) => (
                <th key={column.key} className={`border-b border-[#eaded7] px-3 py-3 ${column.className || ""}`}>
                  <button className="flex items-center gap-1 font-bold" type="button" onClick={() => changeSort(column.key)}>
                    {column.label}
                    <span className="text-[#9b7039]">{sortKey === column.key ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}</span>
                  </button>
                </th>
              ))}
              <th className="min-w-28 border-b border-[#eaded7] px-3 py-3">Save</th>
            </tr>
          </thead>
          <tbody>
            {sortedGuests.map((guest) => {
              const formId = `guest-row-${guest.id}`;
              return (
                <tr key={guest.id} className="border-b border-[#eaded7] align-top">
                  <td className="px-3 py-2"><input form={formId} aria-label="First name" name="firstName" defaultValue={guest.firstName} required /></td>
                  <td className="px-3 py-2"><input form={formId} aria-label="Last name" name="lastName" defaultValue={guest.lastName} required /></td>
                  <td className="px-3 py-2">
                    <select form={formId} aria-label="Household" name="householdId" defaultValue={guest.householdId} required>
                      {households.map((household) => <option key={household.id} value={household.id}>{household.name}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2"><input form={formId} aria-label="Email" name="email" type="email" defaultValue={guest.email || ""} /></td>
                  <td className="px-3 py-2"><input form={formId} aria-label="Phone" name="phone" type="tel" defaultValue={guest.phone || ""} /></td>
                  <td className="px-3 py-2">
                    <select form={formId} aria-label="Side" name="guestSide" defaultValue={guest.guestSide}>
                      <option value="ANDRE">Andre</option>
                      <option value="BEBE">Bebe</option>
                      <option value="BOTH">Both</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select form={formId} aria-label="Relationship group" name="relationshipGroup" defaultValue={guest.relationshipGroup || ""}>
                      <option value="">Select group</option>
                      {relationshipGroups.map((group) => <option key={group}>{group}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select form={formId} aria-label="Tags" name="tags" defaultValue={guest.tags || ""}>
                      {tagChoices(guest.tags).map((tag) => <option key={tag} value={tag}>{tag || "No tags"}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-center"><input form={formId} aria-label="Adult" className="h-4 w-4" name="isAdult" type="checkbox" defaultChecked={guest.isAdult} /></td>
                  <td className="px-3 py-2 text-center"><input form={formId} aria-label="Child" className="h-4 w-4" name="isChild" type="checkbox" defaultChecked={guest.isChild} /></td>
                  <td className="px-3 py-2 text-center"><input form={formId} aria-label="Plus-one allowed" className="h-4 w-4" name="plusOneAllowed" type="checkbox" defaultChecked={guest.plusOneAllowed} /></td>
                  <td className="px-3 py-2"><input form={formId} aria-label="Plus-one name" name="plusOneName" defaultValue={guest.plusOneName || ""} /></td>
                  <td className="px-3 py-2"><input form={formId} aria-label="Notes" name="notes" defaultValue={guest.notes || ""} /></td>
                  <td className="px-3 py-2">
                    <form
                      id={formId}
                      action={async (formData) => {
                        setPendingId(guest.id);
                        setSavedId(null);
                        try {
                          await action(formData);
                          setSavedId(guest.id);
                          router.refresh();
                        } finally {
                          setPendingId(null);
                        }
                      }}
                      className="grid gap-1"
                    >
                      <input type="hidden" name="id" value={guest.id} />
                      <button className="btn btn-secondary min-h-9 px-3 py-2" disabled={pendingId === guest.id}>{pendingId === guest.id ? "Saving" : "Save"}</button>
                      {savedId === guest.id ? <span className="text-xs font-bold text-[#3f7040]">Saved</span> : null}
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
