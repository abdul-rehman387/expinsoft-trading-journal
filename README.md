# ExpinSoft Trading Journal

Next.js App Router trading journal with Supabase SSR authentication and server-side trade queries. Dashboard: /dashboard. Journal: /trades. Existing settings, analytics, CSV import/export, profile and password screens are preserved.

## Setup

1. Install dependencies with npm install.
2. Copy .env.example to .env.local and set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY from your Supabase project. Never use a service-role key here.
3. Run supabase/migrations/202610130001_trades.sql in your project's SQL editor (or apply it with the Supabase CLI). It creates the trades table and per-user RLS policies. The server queries rely on those policies to restrict reads.
4. Enable email/password authentication. Set the Supabase Auth Site URL to the application's origin. For confirmation emails, configure the confirmation template link as {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email. Configure the email-change template similarly with type=email_change. Signup displays a confirmation message if email verification is enabled.
5. Run npm run dev. Use npm test and npm run build to verify changes. After building, npm run test:ssr checks forms, server auth actions, cookie sessions, route protection and server trade queries against a local mock Supabase service. Use npm start for production.

## Architecture

src/utils/supabase/client.js uses createBrowserClient; server.js uses createServerClient with async cookies() and getAll/setAll (including empty-value removals). middleware.js (loaded by src/middleware.js for the src/app directory) refreshes verified auth claims, preserves refreshed cookies on redirects, and protects journal routes. Next.js 16 still supports middleware.js, although the convention is deprecated in favor of proxy.js.

The journal App Router server page verifies the user and fetches trades ordered by created_at. Shared Client Components receive the server records. Server Actions verify users, validate payloads, assign user_id from the verified session, enforce ownership on edits/deletes, and revalidate dashboard, journal, analytics and data settings. UI changes follow successful writes. CSV imports validate before one atomic insert. Profile and password updates use Supabase Auth server actions.

No PocketBase or custom browser-local authentication/trade persistence remains. Theme, display preferences and mock sync settings still use browser storage. Existing local/PocketBase records are not automatically migrated; export CSV from the previous app before switching and import it after signing in. Exchange connections and the Add User screen remain frontend mock features.

## Vercel

Select the Next.js framework preset. Remove Vite build/output overrides (use npm run build and the default Next.js output). Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for each intended environment, apply the SQL migration, and configure the Supabase Auth Site URL/confirmation email template for your production domain before deploying. No live credentials are included in the repository.

## Shared devices

The account menu offers Switch account and Create another account. Both end only the current session before opening login or signup. Any number of accounts can use one device with distinct email addresses; one account is active per browser session. Journal state resets when the user changes, and database RLS keeps records private to each user. Use separate browser profiles for simultaneous sessions.
