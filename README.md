# ApnaMart

B2B lead-generation marketplace. Buyers contact suppliers by requirement form, dealer email, or WhatsApp Business. No payments on the platform.

**Host:** Vercel (frontend + `/api`) · **Database:** Neon Postgres

Demo logins (after seed): **100 sellers, 100 products with images, 100 buyers, 100 inquiries.**

| Role | Email | Password |
|---|---|---|
| Buyer | buyer@marketplace.local | BuyerPass123 |
| Seller | seller@marketplace.local | SellerPass123 |
| Admin | admin@marketplace.local | ChangeMeAdmin123 |

## GitHub → Vercel

1. Push this folder to GitHub.
2. Import the repo on Vercel. Root directory must contain `vercel.json`.
3. Add environment variables in the Vercel dashboard (Production + Preview):

- `DATABASE_URL` — Neon **pooled** connection string (`-pooler` in the host)
- `DIRECT_URL` — Neon **direct** connection string (same URI with `-pooler` removed from the host)
- `JWT_SECRET` — long random string
- `CLIENT_ORIGIN` — `https://your-app.vercel.app` (set after first deploy if needed)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — demo admin (`admin@marketplace.local` / `ChangeMeAdmin123`)
- `MAIL_FROM` — `noreply@example.com`
- `SENDGRID_API_KEY` — optional; leave empty for demo

4. Deploy. Seed/migrate from this machine (reads the parent `.env`):

```bash
cd server
npm run prisma:generate
npm run prisma:deploy
npm run db:seed
```

There is a single local env file, **outside this repo**: `Downloads/marketplace/.env` (the folder above `marketplace`). GitHub never sees it. Production secrets go only in the Vercel dashboard.

## Buyer / seller contact

- Buyers maintain company, city, phone, and WhatsApp on **My profile**. Those details are attached to emailed requirements.
- Sellers opt in on **Seller desk**: receive requirement emails on the registered dealer inbox, show email publicly, and publish WhatsApp Business.
- Product and supplier pages: **Email requirement**, **WhatsApp**, or **Submit requirement**.
