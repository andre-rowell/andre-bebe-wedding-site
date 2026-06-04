import Link from "next/link";
import { CalendarDays, ClipboardList, FileDown, Gift, HelpCircle, Home, Hotel, LogOut, Mail, MessageSquareHeart, Settings, UsersRound } from "lucide-react";
import { logoutAction } from "@/lib/actions";

const links = [
  ["Dashboard", "/admin", Home],
  ["Guests", "/admin/manage/guests", UsersRound],
  ["Households", "/admin/manage/households", UsersRound],
  ["RSVPs", "/admin/manage/rsvps", ClipboardList],
  ["Events", "/admin/manage/events", CalendarDays],
  ["Registry", "/admin/manage/registry", Gift],
  ["Content", "/admin/manage/content", Settings],
  ["FAQ", "/admin/manage/faqs", HelpCircle],
  ["Travel", "/admin/manage/travel", Hotel],
  ["Guestbook", "/admin/manage/guestbook", MessageSquareHeart],
  ["Templates", "/admin/templates", Mail],
  ["Reports", "/admin/reports", FileDown],
];

export function AdminShell({ children, adminName }: { children: React.ReactNode; adminName: string }) {
  return (
    <div className="min-h-screen bg-[#f7f1ec]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#eaded7] bg-[#241b18] p-4 text-white lg:block">
        <Link href="/admin" className="serif block px-3 py-4 text-3xl font-bold">
          Manage
        </Link>
        <nav className="mt-5 grid gap-1">
          {links.map(([label, href, Icon]) => (
            <Link key={href as string} href={href as string} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-[#f6e9e0] hover:bg-white/10">
              <Icon size={18} />
              {label as string}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="absolute bottom-4 left-4 right-4">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-[#f6e9e0] hover:bg-white/10">
            <LogOut size={18} />
            Logout
          </button>
        </form>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-[#eaded7] bg-[#fffaf7]/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <Link href="/admin" className="serif text-2xl font-bold lg:hidden">
              Manage
            </Link>
            <nav className="hidden flex-wrap gap-2 md:flex lg:hidden">
              {links.slice(1, 6).map(([label, href]) => (
                <Link key={href as string} href={href as string} className="rounded-full border border-[#eaded7] px-3 py-1.5 text-xs font-bold">
                  {label as string}
                </Link>
              ))}
            </nav>
            <p className="ml-auto text-sm font-semibold text-[#6a5c55]">{adminName}</p>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
