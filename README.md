# Andre & Bebe Wedding Site

A polished Next.js wedding website with a guest experience and protected admin dashboard for managing households, guests, event invitations, RSVPs, registry links, FAQs, travel content, site copy, and CSV reports.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Prisma ORM
- PostgreSQL
- Zod validation
- Server actions for admin and RSVP mutations
- Cookie-based admin auth with bcrypt password hashes

## Local Setup

```bash
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Local defaults:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
ADMIN_SESSION_SECRET="replace-with-a-long-random-production-secret"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

For production, do not use the default `ADMIN_SESSION_SECRET`. Generate a long random value and set `NEXT_PUBLIC_SITE_URL` to the deployed URL.

## Local Admin Login

- URL: `http://localhost:3000/admin/login`
- Email: `andrerowell@outlook.com`
- Password: `AndreBebe2026!`

Change the password in `prisma/seed.js` before using real data. The seed script only runs against an empty database by default. To intentionally delete and reseed existing data, run it with `ALLOW_SEED_RESET=true`.

## Seed Data

The seed includes:

- 1 owner admin
- 3 households
- 8 guests
- 4 wedding events
- Invite-only and public event assignments
- Sample RSVP responses
- 2 registry links
- 10 FAQ items
- Travel/hotel/shuttle/local recommendation sections
- Gallery images

Useful RSVP lookup codes:

- `ROWELL2026`
- `JOHNSON2026`
- `CHEN2026`

## Main Routes

Guest:

- `/`
- `/invite/[token]`
- `/events`
- `/rsvp`
- `/story`
- `/registry`
- `/travel`
- `/faq`
- `/photos`
- `/guestbook`
- `/day-of`
- `/after`
- `/contact`

Admin:

- `/admin`
- `/admin/login`
- `/admin/manage/guests`
- `/admin/manage/households`
- `/admin/manage/rsvps`
- `/admin/manage/events`
- `/admin/manage/registry`
- `/admin/manage/content`
- `/admin/manage/faqs`
- `/admin/manage/travel`
- `/admin/manage/guestbook`
- `/admin/templates`
- `/admin/reports`

CSV exports:

- `/api/export/guests`
- `/api/export/rsvps`

Calendar:

- `/api/calendar/[eventId]`

## Premium Guest Features

- Personalized invite landing pages at `/invite/[inviteLinkToken]`
- Household-safe invited event list and RSVP links
- Google Calendar and Apple/Outlook `.ics` downloads for events
- RSVP confirmation copy generated from current household RSVP data
- Digital guestbook with admin moderation
- Day-of page for schedule, maps, parking, shuttle notes, and emergency contact
- After-wedding page with thank-you message, gallery highlights, shared album link, guestbook notes, and registry links
- Shared album URL and site mode managed through site settings
- Reduced-motion-safe animation polish

## Admin Premium Features

- Site mode control: wedding, day-of, after
- RSVP reminder templates generated per household
- RSVP confirmation and day-of message templates
- Guestbook moderation
- Improved dashboard analytics for RSVP completion, event attendance ratios, meal counts, complete households, and dietary notes

## Testing Checklist

1. Visit `/` on mobile and desktop widths and confirm hero, countdown, navigation, and CTAs render.
2. Visit `/events` and confirm only public events show without an invite code.
3. Visit `/rsvp`, search `JOHNSON2026`, and confirm household guests and invite-only events are shown.
4. Submit RSVPs for each guest and event. Reopen the same invite code and confirm responses update instead of duplicating.
5. Confirm uninvited private events are not visible from a different household.
6. Log into `/admin/login`.
7. Review dashboard counts, meal counts, dietary summaries, and recent RSVP activity.
8. Add a guest and household from admin management pages.
9. Add an event and assign a household to it.
10. Update an RSVP manually from `/admin/manage/rsvps`.
11. Add registry, FAQ, travel, and content entries, then confirm guest pages reflect active records.
12. Download guest and RSVP CSV exports from `/admin/reports`.

Before pushing to GitHub or connecting a host, run:

```bash
npm run verify
```

## Security Notes

- Admin routes call `requireAdmin()` server-side.
- Admin session cookies are HTTP-only and signed.
- Passwords are bcrypt-hashed in the database.
- RSVP lookup resolves to households and only renders invited guest-event pairs.
- RSVP writes upsert by unique `eventId + guestId`, preventing duplicate corruptions.
- Private/invite-only event visibility is enforced server-side.
- Replace `ADMIN_SESSION_SECRET` before production.
- Do not use seed credentials or placeholder invite tokens for real guests.

## Deployment Notes

- Use Node 22. The repo includes `.nvmrc` and `package.json` engines for this.
- Use PostgreSQL for persistent RSVP/admin data.
- Recommended path:
  - Put the app on Vercel.
  - Put the production database on Render PostgreSQL, Vercel Postgres, Neon, Supabase, or another hosted PostgreSQL provider.
  - Run `npm run db:deploy` against the production database before first launch.
  - Run `npm run db:seed` only on an empty database. To intentionally reset sample data, run `ALLOW_SEED_RESET=true npm run db:seed`.
- Add HTTPS at the hosting layer.
- Set a strong `ADMIN_SESSION_SECRET`.
- Set `NEXT_PUBLIC_SITE_URL` to the final deployed domain so invite links and email-ready templates use the right URL.
- Configure image domains or move uploaded assets to managed storage.
- Add email provider integration for password reset, RSVP confirmations, and reminders.
- Run `npm run verify` before deploy.
- Health check endpoint: `/api/health`.

## Pre-Launch Content To Replace

- Registry and hotel URLs in seed data currently use `example.com` placeholders.
- Shared album URL is a placeholder until the gallery is ready.
- Dowry and After Party Cookout intentionally show location/time TBD.
- Local seed admin password and invite tokens are for development only.
