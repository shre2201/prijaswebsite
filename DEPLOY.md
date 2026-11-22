# Deploying Prijas on Railway

The site runs as one always-on Node.js service plus a managed Postgres database, both on Railway.
Every push to the deployed branch redeploys automatically. On each start the app:

1. applies database migrations (`prisma migrate deploy`)
2. creates the admin account once, from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
3. adds any of the 12 catalogue products that are missing (never overwrites your edits)
4. starts the site; Railway checks `/api/health` and restarts it if it stops responding

## One-time setup (about 15 minutes)

1. **Account.** Sign up at railway.com with GitHub and choose the **Hobby** plan ($5/month, includes usage; never sleeps).
2. **New project → Deploy from GitHub repo →** `shre2201/prijaswebsite`.
   In the service's **Settings → Source**, set the branch to `redesign` (switch to `master` after the merge below).
3. **Region.** Service **Settings → Region → Southeast Asia (Singapore)**. Do the same for the database in step 4.
4. **Database.** In the project, **+ New → Database → PostgreSQL**. Then, in the Postgres service, open **Backups** and turn on scheduled backups.
5. **Disk for photo uploads.** Right-click the website service → **Attach volume**, mount path `/data`.
6. **Variables.** In the website service → **Variables**, add:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (type it exactly; Railway links it over the private network) |
   | `AUTH_SECRET` | a long random string. Run `openssl rand -base64 32` on your Mac and paste the output |
   | `ADMIN_EMAIL` | the email Harsheen will sign in with |
   | `ADMIN_PASSWORD` | a strong password, 10+ characters (only used to create the account the first time) |
   | `UPLOAD_DIR` | `/data/uploads` |
   | `NEXT_PUBLIC_SITE_URL` | the site address, e.g. `https://prijas.in`, or the Railway address from step 7 |
   | `RESEND_API_KEY` | from resend.com → API Keys (emails) |
   | `EMAIL_FROM` | `Prijas Skincare <hello@your-domain>` once the domain is verified in Resend |
   | `STUDIO_EMAIL` | where new-booking alerts go (default `prijasskincare@gmail.com`) |

   `NEXT_PUBLIC_SITE_URL` is built into the site, so redeploy after changing it.
7. **Address.** Service **Settings → Networking → Generate Domain** (gives `…up.railway.app`), or **Custom Domain** to use your own.
   Add the DNS record Railway shows at your domain registrar. HTTPS is automatic.
8. **Deploy.** Railway builds and starts. In **Deployments → View logs** you should see
   `[setup] admin account created` and `catalogue: 12 product(s) added`.

## Emails

Resend only delivers to everyone once your domain is verified:
resend.com → Domains → Add domain, then add the DNS records it shows. Until then `onboarding@resend.dev`
delivers only to the Resend account owner, so clients won't get emails.

## After it's live (5 minutes)

- [ ] Open the site on your phone; book a test consultation as a guest
- [ ] Check the client email and the studio alert arrived (spam folder too)
- [ ] Sign in at `/admin`: the booking is on the dashboard and in the Calendar; confirm it and check the confirmation email
- [ ] Add a calendar event that blocks a time, and check that time is greyed out on the booking form
- [ ] Upload a product photo in Admin → Products, redeploy, and check the photo is still there (this confirms the volume)
- [ ] Leave a review and approve it in Admin → Reviews
- [ ] Share the link in WhatsApp and check the preview image shows
- [ ] Delete the test booking, event and review

## Going live on `master`

When the Railway site checks out: merge `redesign` into `master`, switch the Railway branch to `master`,
and remove the old Vercel project (Vercel → prijasskincare → Settings → Delete) so it stops deploying.

## Switches

- **Online ordering** is off. Set `ONLINE_ORDERS_ENABLED=true` only if you start selling online, and set real prices first.
- **`DB_POOL_MAX`** (default 10) is the number of database connections. Leave it unless Railway support suggests otherwise.
