import { NextResponse } from "next/server";

const sample = [
  [
    "householdName",
    "firstName",
    "lastName",
    "email",
    "phone",
    "side",
    "relationshipGroup",
    "tags",
    "plusOneAllowed",
    "plusOneName",
    "isChild",
    "inviteCode",
    "inviteToken",
    "address",
    "city",
    "state",
    "zip",
    "notes",
  ],
  [
    "The Smith Household",
    "Jordan",
    "Smith",
    "jordan@example.com",
    "612-555-0199",
    "Andre",
    "Friends",
    "friends,out-of-town",
    "yes",
    "",
    "no",
    "SMITH2027",
    "smith-secure-token-2027",
    "123 Main St",
    "Minneapolis",
    "MN",
    "55414",
    "College friend",
  ],
  [
    "The Smith Household",
    "Taylor",
    "Smith",
    "taylor@example.com",
    "",
    "Both",
    "Friends",
    "friends",
    "no",
    "",
    "no",
    "SMITH2027",
    "smith-secure-token-2027",
    "123 Main St",
    "Minneapolis",
    "MN",
    "55414",
    "",
  ],
];

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function GET() {
  const body = sample.map((row) => row.map(csvEscape).join(",")).join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="andre-bebe-guest-import-template.csv"',
    },
  });
}
