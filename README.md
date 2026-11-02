# Blackpearl Yachts

Yacht brokerage and charter website. Next.js (App Router), MongoDB (Mongoose), pnpm.

## Run it

```bash
pnpm install
cp .env.example .env        # or use .env.local for local development
# edit MONGODB_URI, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
pnpm seed                   # creates the admin user and sample yachts, charter fleet and articles
pnpm dev                    # http://localhost:3000
```

Admin: `http://localhost:3000/admin` (sign in with the ADMIN_EMAIL and ADMIN_PASSWORD you set).
`pnpm seed --no-sample` creates only the admin user. Seeding never overwrites existing records.

### MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and add your development/deployment IP address under **Network Access**.
3. In **Connect → Drivers**, choose Node.js and copy the connection string.
4. Put it in `.env` as `MONGODB_URI`, replacing the placeholders and using `blackpearl` as the database name:

   ```text
   mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/blackpearl?retryWrites=true&w=majority
   ```

   URL-encode special characters in `USERNAME` or `PASSWORD`. Save the connection string in `.env` or `.env.local`, then run `pnpm seed`.

The app uses Mongoose and supports Atlas `mongodb+srv://` strings, local MongoDB, and Docker (`docker run -p 27017:27017 mongo`).

## What is included

| Area | What it does |
| --- | --- |
| Listings | Yachts for sale and the charter fleet live in MongoDB. Add, edit, unpublish and delete them in `/admin`. Photos upload from the admin (or paste URLs). Listings without photos show the drawn seascape. |
| Search | `GET /api/yachts` filters by kind, length, price, type, region, text and sort. The home page filters by length band. |
| Detail pages | `/yachts/[slug]` and `/charter/[slug]`, with SEO metadata and schema.org JSON-LD. |
| Enquiries and CRM | The form saves to MongoDB, emails the right team (sales or charter), emails the visitor, and posts to an optional webhook. In `/admin` staff set a stage (new, contacted, viewing, offer, won, lost), an assigned broker and notes. |
| Gated brochures | A listing's brochure PDF link is released only after the visitor submits the enquiry form. |
| Charter availability | Calendar per yacht, built from blocked dates you enter and confirmed bookings. |
| Rate calculator | `POST /api/quote`: weekly rate pro-rated by nights, VAT, expenses allowance (APA) and deposit. |
| Booking requests | Visitors request dates. Overlaps with confirmed bookings are rejected. Staff confirm or decline in `/admin`. |
| Stripe deposits | Confirming a booking emails a private payment link. `/pay/[id]` creates a Stripe Checkout session. The webhook marks the booking `deposit-paid` and emails both sides. |
| Newsletter and alerts | Sign-ups are stored. Publishing a new yacht for sale emails all active subscribers. |
| Journal | Articles written in `/admin`, shown on the home page and at `/journal/[slug]`. |
| Currency | EUR, USD, GBP, LKR and AED. Live rates from open.er-api.com, cached 12 hours, with fixed fallbacks. |
| Security | Signed httpOnly session cookie (jose), bcrypt passwords, `proxy.ts` guards `/admin` and `/api/admin`, delete limited to the admin role, zod validation, honeypot, time trap and IP rate limits. |
| SEO and consent | `sitemap.xml`, `robots.txt`, metadata, cookie banner. Google Analytics loads only after consent. |

## Configuration notes

- **Email**: with no SMTP settings, emails are printed to the server console. Set `SMTP_*` and `MAIL_FROM` for real delivery.
- **Stripe**: set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. Point a webhook for `checkout.session.completed` at `/api/stripe/webhook`. For local testing use `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
- **Uploads** go to `public/uploads` on the server's disk. On serverless hosts such as Vercel, switch `src/app/api/admin/upload/route.ts` to S3, Cloudinary or Vercel Blob.
- **Rate limiting** is in memory. Use Redis or Upstash if you run more than one instance.
- **Webhook**: `LEAD_WEBHOOK_URL` receives every enquiry and booking request as JSON (Slack incoming webhook, Zapier, Make).
- **WhatsApp**: set `NEXT_PUBLIC_WHATSAPP` to show a link in the footer.

## Not included

Client and owner portals, e-signature of charter agreements, multi-language content, calendar sync, listing-network feeds, and extra staff accounts beyond the seeded admin (add more `User` documents or extend `scripts/seed.ts`). The images are drawn placeholders until you upload real photos.

## Structure

```
src/app            pages and API routes
src/components     UI (listings, charter list, booking panel, admin, forms)
src/models         Mongoose models: Yacht, Enquiry, Booking, Article, Subscriber, User
src/lib            db, auth, mail, pricing, currency, validation, scene renderer
src/proxy.ts       admin route protection
scripts/seed.ts    admin user and sample data
```
