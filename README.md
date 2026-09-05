# Andre & Bebe Wedding Site

A custom, editorial wedding website for Andre and Bebe. The public experience is intentionally small: one self-contained homepage plus handoffs to Zola for RSVP and registry management.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Zola for guest RSVPs and registry
- Vercel for hosting

The application has no database, admin dashboard, guest records, or server-side mutations.

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

To use a different canonical URL locally, create `.env` with:

```bash
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Routes

- `/` contains the complete custom wedding website.
- `/registry` redirects to the couple's Zola registry.
- `/rsvp` redirects to the couple's Zola RSVP search.

Previous content routes redirect to the relevant section of the homepage so old links do not break. The retired `/admin` and `/api` routes return `404`.

## Verification

Run linting and a production build before deployment:

```bash
npm run verify
```

## Deployment

The project deploys to Vercel and requires Node.js 22 or newer. `npm run vercel-build` performs a static Next.js build; no database environment variables or migration step are required.

Before sharing RSVP or registry links with guests, confirm that the Zola wedding website is published, the RSVP page is visible, events accept online responses, and the registry is ready.
