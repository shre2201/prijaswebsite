# Deploying Prijas

Checklist for putting this version live on Vercel. Do the steps in order.

## 1. Environment variables (Vercel → Project → Settings → Environment Variables)

| Variable | Required | Value |
|---|---|---|
| `DATABASE_URL` | yes | Production Postgres URL (already set if the site is live) |
| `AUTH_SECRET` | yes | Long random string. Generate one with `npx auth secret` |
| `NEXT_PUBLIC_SITE_URL` | yes | Your live address, e.g. `https://prijas.in` (used by sharing previews and the sitemap) |
| `RESEND_API_KEY` | for emails | From resend.com → API Keys |
| `EMAIL_FROM` | for emails | A sender on a domain you have verified in Resend, e.g. `Prijas Skincare <hello@prijas.in>` |
| `STUDIO_EMAIL` | optional | Where new-booking alerts go (default `prijasskincare@gmail.com`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | only for seeding | Used once by `npm run seed` to create the admin account |

Until `EMAIL_FROM` uses a verified domain, Resend only delivers to the Resend account owner, so clients won't get emails.

## 2. Database

Run these from your computer with the **production** URL. They don't change anything until step 2b.

```bash
DATABASE_URL="<production url>" npx prisma migrate status
```

**2a. If it lists `0005_guest_bookings` and `0006_calendar_events` as not yet applied, and nothing else:**

```bash
DATABASE_URL="<production url>" npx prisma migrate deploy
```

**2b. If it says the database is not managed by Prisma Migrate (no migrations table), or lists 0001–0004 as not applied, even though the site already works:**
the tables were created another way. Mark the existing migrations as applied first, then deploy the new ones:

```bash
DATABASE_URL="<production url>" npx prisma migrate resolve --applied 0001_init
DATABASE_URL="<production url>" npx prisma migrate resolve --applied 0002_testimonials
DATABASE_URL="<production url>" npx prisma migrate resolve --applied 0003_services
DATABASE_URL="<production url>" npx prisma migrate resolve --applied 0004_seed_services
DATABASE_URL="<production url>" npx prisma migrate deploy
```

**2c. If it reports that a migration "was modified after it was applied" (`0001_init`):** that's the invisible
BOM character removed from the file. The database itself is fine; continue with `migrate deploy`.

Then load the 12 products (safe to re-run):

```bash
DATABASE_URL="<production url>" npm run import:catalog
```

## 3. Admin account

Make sure the production admin does **not** use the default password `prijas@admin123`.
Sign in at `/login` and change it, or re-seed with a strong `ADMIN_PASSWORD`.

## 4. Deploy

Commit and push. Vercel runs `prisma generate && next build`, which passes locally with no errors.
Do **not** commit `.env`, `fix-database.command`, `fix-database.log` or `setup-local.sh`.

## 5. After it's live (5 minutes)

- [ ] Open the site on your phone; book a test consultation as a guest
- [ ] Check the client email and the studio alert arrived (spam folder too)
- [ ] Sign in to `/admin`: the booking is on the dashboard and in the Calendar; confirm it and check the confirmation email arrives
- [ ] Add a calendar event that blocks a time, and check that time is greyed out on the booking form
- [ ] Leave a review, approve it in Admin → Reviews, and check it appears under the right filter
- [ ] Share the link in WhatsApp and check the preview image shows
- [ ] Delete the test booking, event and review

## Switches

- **Online ordering** is off. Set `ONLINE_ORDERS_ENABLED=true` only if you start selling online again, and set real prices first.
