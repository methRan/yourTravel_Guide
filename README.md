# Ceylon Trails

A responsive Sri Lanka travel website for a family-owned guide business. Built with React, TypeScript, Vite, React Router, and Supabase. The default **Demo Mode** needs no backend credentials.

## Start locally

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open the address printed by Vite (the default project path is `/yourTravel_Guide/`).

```sh
npm run lint
npm test
npm run build
npm run preview
# Browser tests:
npx playwright install chromium
npm run test:e2e
# If a system browser is installed:
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e
```

## What works

- Home, Our Story, three tours, four guide profiles, six destinations, contact, login/sign-up, customer account, booking request, and owner workspace.
- Responsive navigation, editable content/theme, tour itineraries, contact context, sharing, and review galleries.
- Demo account → pending request → demo owner accept/decline → completed journey → review submission → owner moderation → guide profile display.
- Live Supabase registration/login, persistent bookings, contact enquiries, owner approval, completed-booking reviews, and private photo storage with expiring public links.

**Requests are never automatically confirmed.** No payment processing or notification email delivery is implemented. Live enquiries/bookings are stored in the owner workspace; owners must check it and communicate directly with customers. Accepted requests still need final pricing and travel arrangements.

## Demo data is local only

Leave both Supabase variables empty. Demo profiles do not use passwords or represent secure accounts. Requests, reviews, and session data stay in this browser under `ceylon:*` localStorage keys. Nothing is delivered to the business. Demo owner tools are intentionally available to every demo account. Do not enter sensitive information. To reset the demo, remove `ceylon:*` keys through your browser’s developer tools.

Sample reviews are explicitly identified in Demo Mode and **excluded in Live Mode**. Guide identities, experience, biographies, portraits, tours, contacts, and sample trip photographs must be replaced/verified before public launch. Demo review photos are stored locally and may hit browser storage limits; the form reports this honestly.

## Change branding and content

| File                       | Edit here                                                  |
| -------------------------- | ---------------------------------------------------------- |
| `src/config/site.ts`       | Name, location, hero image, WhatsApp, email, social URLs   |
| `src/styles/theme.css`     | All colours, fonts, radius, shadow, and content width      |
| `src/data/packages.ts`     | Three tour packages, itineraries, destinations, inclusions |
| `src/data/guides.ts`       | Guide names, languages, portraits, specialties, galleries  |
| `src/data/destinations.ts` | Six destinations and their activities                      |
| `src/data/reviews.ts`      | Clearly marked demo-only reviews                           |

Set your real WhatsApp number with international country code (digits only), email, and `contactsConfigured: true` in `site.ts`. Until configured, WhatsApp buttons explain that no message can be sent, and email is labelled as a sample rather than delivering enquiries to an unrelated person. Social links only appear after their URLs are set. All configured WhatsApp links include an encoded message relevant to the selected guide or tour.

Images can be replaced with your own licensed photographs in `public/images/`. Reference local assets using `import.meta.env.BASE_URL + 'images/filename.webp'` so GitHub Pages subpaths work. See `ASSETS.md`. Bundled AI-generated sample landscapes and portraits work without external image services. Replace them with genuine licensed business/destination photographs before launch. Fonts are bundled locally under their SIL Open Font Licenses. The layout also has system fallbacks.

## Connect Supabase (Live Mode)

1. Create a Supabase project. Keep its service-role/secret keys private; **never** put them in Vite variables, GitHub Pages, or the browser.
2. Run `supabase/migrations/001_initial.sql` once in the SQL editor, or use the Supabase CLI migration workflow. It creates bookings, reviews, enquiries, owner membership, RLS policies, and a private `review-photos` bucket.
3. Copy `.env.example` to `.env`. Add your public project URL and browser-safe publishable/anon key:

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
   VITE_BASE_PATH=/yourTravel_Guide/
   ```

4. In Supabase Authentication → URL Configuration, set the Site URL to your deployed site and add your deployed base URL and local Vite URL to allowed redirect URLs. HashRouter uses `#/account`; the hostname and base path must be allowed. Enable email confirmation and configure SMTP for dependable confirmation emails. Set a minimum password length of 8 or more.
5. Register the owner using the normal sign-up form, confirm the email, then use the **SQL editor** to grant owner membership by that user’s UUID:

   ```sql
   insert into public.owners (user_id) values ('OWNER_AUTH_USER_UUID');
   ```

   Nobody can self-assign owner privileges from the browser. Sign out and log back in after assigning the role. Open `#/owner`.

6. Restart Vite after changing variables. On Pages, configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository Actions **variables** and rebuild. These public values are expected in the frontend; security comes from RLS, not hiding the public key.
7. Replace sample business/guide content and contact details. Before public launch, use two separate customer accounts and an owner to execute the security checklist below against your actual project.

The PostgreSQL migration and access policies are covered by local PGlite tests with auth/storage schema stubs (customer isolation, owner permissions, completed-trip reviews, and private photos). This is not hosted integration testing. Live integration is implemented but **has not been validated against a real Supabase project** in this environment because credentials were not supplied. Demo/browser tests do not prove deployed RLS policies. Never enable live mode before applying the migration.

### Security validation before launch

- Customer A can insert only their own Pending request, and cannot read Customer B’s requests or change statuses. Attempt direct REST calls with each account’s access token to verify denial, not merely hidden buttons.
- Only the owner can accept/decline/complete requests, read enquiries, or moderate reviews.
- Reviews require an owned Completed booking; one review per booking. A guide booking must review that guide. Tour bookings allow the customer to select the guide they travelled with.
- Pending review rows/photos are private to the submitter and owner; approved review content/photos are publicly accessible. Customer emails and phone numbers are never in public reviews.
- Files are limited to 5 images per review, 5 MB each, JPG/PNG/WebP. The browser decodes and re-encodes uploads as JPEG (stripping EXIF metadata); bucket MIME and file size restrictions also apply. Storage upload paths are scoped to the authenticated user. Client checks are UX checks, not a general malware scanner. Add server-side image validation/scanning and upload quotas before accepting unrestricted public uploads.
- Public enquiry inserts have field limits and RLS but no CAPTCHA/rate limiter. Add an Edge Function with CAPTCHA/rate limiting before an advertised launch to prevent spam. Authentication rate limits should also be configured in Supabase.
- Define a privacy/retention policy for your actual business, contact data, and photo consent. The included form consent is a starting point, not a substitute for your own policy.

## Deploy free on GitHub Pages

The workflow is prepared, but this project has not been pushed or deployed automatically.

1. Commit the project and push it to your repository’s `main` branch:

   ```sh
   git add .
   git commit -m "Build Ceylon Trails travel website"
   git branch -M main
   git push -u origin main
   ```

2. In GitHub Settings → Pages, choose **GitHub Actions** as the build source.
3. The included `.github/workflows/deploy.yml` installs with the lockfile, runs lint/unit tests/build, and deploys `dist`. Its base path follows your repository name.
4. Browse `https://methran.github.io/yourTravel_Guide/` after Actions reports successful deployment. Hash routes such as `#/tours/discover` refresh correctly on static Pages hosting.

Demo is the default for Actions unless **both** Supabase public variables are set. Hash routing gives reliable static refreshes, but hash detail URLs have limited search-engine indexing. The root has metadata; migrate to prerendering or server-supported routing if detailed destination SEO becomes a priority.

### Custom domain or other hosting

You do not need a domain to use Pages. Later, configure one in Pages settings, follow GitHub’s DNS instructions, and enable HTTPS. For a root domain set `VITE_BASE_PATH: /` in the workflow build environment. Add a `public/CNAME` only when you own the domain. On Netlify, Cloudflare Pages, or another static host, use `npm ci && npm run build`, output directory `dist`, and base `/`; hash routes do not require rewrite rules. Update Supabase allowed redirect URLs when hosting changes.

## Structure and extension

`src/components` holds reusable layouts/cards; `src/pages` holds routes; `src/lib/backend.ts` provides demo/live persistence; `src/lib/auth.tsx` manages sessions. Content is separate from views so a future admin CMS can replace the data arrays without rebuilding page layouts. Owner UI is deliberately limited to request statuses, enquiry viewing, and review moderation. No service-role credential belongs in this app.
