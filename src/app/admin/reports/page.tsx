import { FileDown } from "lucide-react";
import { requireAdmin } from "@/lib/auth";

export default async function ReportsPage() {
  await requireAdmin();
  const reports = [
    ["Full guest list", "/api/export/guests", "Names, households, contact details, tags, and invitation status."],
    ["RSVP report", "/api/export/rsvps", "Guest-event responses, meal choices, dietary notes, accessibility needs, song requests, and travel notes."],
    ["Meal count report", "/api/export/rsvps?type=meals", "A CSV-friendly filtered source for meal tallying."],
    ["Mailing address list", "/api/export/guests?type=mailing", "Household mailing addresses for invitations and thank-you notes."],
  ];
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b76768]">Exports</p>
        <h1 className="serif text-5xl font-bold">Reports</h1>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {reports.map(([title, href, copy]) => (
          <a key={href} href={href} className="card p-6 hover:-translate-y-1">
            <FileDown className="text-[#b76768]" />
            <h2 className="serif mt-4 text-3xl font-bold">{title}</h2>
            <p className="mt-2 leading-7 text-[#6a5c55]">{copy}</p>
            <span className="btn btn-primary mt-5">Download CSV</span>
          </a>
        ))}
      </div>
      <section className="card p-5">
        <h2 className="serif text-3xl font-bold">Reminder workflow</h2>
        <p className="mt-2 leading-7 text-[#6a5c55]">For MVP, reminder sending is handled by exporting RSVP data and filtering guests with missing responses. This avoids storing email provider credentials until deployment.</p>
      </section>
    </div>
  );
}
