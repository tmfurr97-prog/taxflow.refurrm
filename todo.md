# TaxFlow (SmartBooks24 by ReFurrm) — Project TODO

## Core Infrastructure
- [x] Full-stack scaffold (React 19 + tRPC + Drizzle + MySQL)
- [x] Authentication via Manus OAuth
- [x] Database schema: 13 tables (users, receipts, transactions, documents, quarterly_payments, business_entities, crypto_transactions, audit_items, backups, notary_sessions, chat_messages, efile_submissions, mileage_logs)
- [x] Database migration pushed (pnpm db:push)
- [x] Dark theme (slate/emerald palette)
- [x] AppShell sidebar navigation

## Routing
- [x] Public routes: Landing, Pricing, Features, Blog, Terms, Privacy
- [x] Auth routes: Login, Signup, Verify Email, Password Reset
- [x] App routes: Dashboard, TaxGPT, Receipts, Quarterly, Business Entities, Crypto, Audit Defense, E-File, Notary, Backups, Profile

## TaxGPT AI
- [x] TaxGPT chat page (full UI with quick questions)
- [x] tRPC backend: taxgpt.chat mutation (LLM-powered)
- [x] Chat history persistence in DB
- [x] Context-aware system prompt (filing status, state, self-employed)
- [x] Streaming markdown rendering with Streamdown

## Tax Features (migrated from GitHub repo)
- [x] Dashboard page (Plaid bank linking, transaction review, document upload, AI assistant)
- [x] Receipts & Mileage tracking page
- [x] Quarterly Tax Payments page
- [x] Business Entities management page
- [x] Crypto Taxes page (portfolio, Form 8949)
- [x] Audit Defense hub (IRS correspondence tracking)
- [x] E-File page (validation, signature, IRS submission)
- [x] Backups page

## Notary Services (new module)
- [x] NotaryServices page with booking UI
- [x] RON (Remote Online Notarization) service types and pricing
- [x] General Notary service types
- [x] tRPC backend: notary.list, notary.book, notary.cancel
- [x] Session management (upcoming/past sessions)
- [x] Meeting link generation for RON sessions

## Backend tRPC Routers
- [x] auth (me, logout)
- [x] taxgpt (chat, history)
- [x] receipts (list, create, delete)
- [x] documents (list, analyze with AI)
- [x] quarterly (list, markPaid, estimate with AI)
- [x] notary (list, book, cancel)
- [x] entities (list, create)
- [x] audit (list, create, getAdvice with AI)
- [x] efile (list, submit)
- [x] profile (get, update)

## Public Pages (migrated from GitHub repo)
- [x] Landing page (full marketing sections)
- [x] Pricing page (weekly/monthly/annual tiers)
- [x] Features page
- [x] Blog list and blog post pages
- [x] Terms of Service
- [x] Privacy Policy

## Auth Pages (migrated from GitHub repo)
- [x] Login
- [x] Signup
- [x] Verify Email
- [x] Password Reset

## Profile & Subscriptions
- [x] Profile page (personal info, tax details, security, referral)
- [x] Subscriptions page

## Pending / Future
- [ ] Stripe payment integration (webdev_add_feature stripe)
- [ ] Plaid bank account linking (real API integration)
- [ ] Receipt OCR scanning (image upload + AI extraction)
- [ ] IRS e-file API integration (real submission)
- [ ] Email scanning for tax documents
- [ ] Mobile app (React Native)
- [ ] Push notifications for tax deadlines
- [ ] Vitest unit tests for all tRPC routers

## Remote Returns Portal (Human-Assisted Filing)
- [x] RemoteReturns page with onboarding checklist wizard
- [x] Checklist categories: Personal Info, Income Documents, Deductions, Business (if applicable), Prior Year, Special Situations
- [x] Per-item upload slots with status indicators (Not Started / Uploaded / Verified)
- [x] Progress bar showing overall checklist completion %
- [x] Notes/instructions field for client to leave messages for preparer
- [x] Document vault: list of all uploaded files with preview/delete
- [x] Return status tracker (Submitted → Documents Received → In Review → Ready to Sign → Filed)
- [x] DB schema: remote_returns table and return_documents table
- [x] tRPC backend: remoteReturns.create, list, getById, updateStatus, uploadDocument
- [x] Admin view: see all client submissions, update status, add preparer notes
- [x] Route: /remote-returns (client portal) and /admin/returns (preparer dashboard)
- [x] Add "Remote Returns" to AppShell sidebar navigation
- [x] "Prior Year Return" checklist item for new clients (upload last filed return for carryover data, AGI, depreciation schedules)
- [x] "First-time client" flag on remote return to highlight prior year return as required

## SmartBooks Academy - Learning Portal
- [x] Academy landing page with 4 course tracks and free/premium gating
- [x] Course track 1: Tax Basics for Gig Workers (4 lessons)
- [x] Course track 2: Self-Employed & Freelancer Finances (4 lessons)
- [x] Course track 3: Small Business Bookkeeping 101 (4 lessons)
- [x] Course track 4: Start & Protect Your Business (4 lessons)
- [x] Lesson viewer page with progress tracking
- [x] Free lesson preview (first lesson of each track unlocked)
- [x] Premium gating with upgrade CTA for locked lessons
- [x] Upsell CTAs: Remote Returns after tax lessons, Notary after business lessons
- [x] Lead magnet: Free "Gig Worker Tax Starter Kit" email capture
- [x] Course progress saved to database per user
- [x] DB schema: courses, lessons, user_progress tables
- [x] tRPC backend: academy router with course/lesson/progress procedures
- [x] Add Academy to AppShell sidebar navigation
- [x] Affiliate link placeholders in lesson content

## Pricing Page Rebuild
- [x] Free tier ($0) with limited features
- [x] Essential tier ($9.99/mo or $99/yr)
- [x] Pro tier ($24.99/mo or $199/yr)
- [x] Business tier ($39.99/mo or $349/yr)
- [x] À la carte add-ons section (Remote Return, State Return, Notary, Audit Defense, Bookkeeping Cleanup, Prior Year Return)
- [x] Annual/monthly toggle with savings callout
- [x] "Less than a tank of gas" messaging

## Stripe Integration
- [x] Check existing Stripe products/prices in account
- [x] Create products: Free, Essential, Pro, Business subscription tiers
- [x] Create prices: monthly and annual for each tier
- [x] Create à la carte payment links (Remote Return, State Return, Notary, Audit Defense, Bookkeeping Cleanup, Prior Year Return)
- [x] Add Stripe feature scaffold to project
- [x] Add STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY secrets (auto-injected)
- [x] Wire up subscription checkout flow from Pricing page
- [x] Add subscription status to user profile (subscriptionTier, subscriptionStatus in DB)
- [x] Add webhook handler for subscription events (created, updated, cancelled)
- [ ] Gate premium features based on subscription tier (future)
- [x] Add billing tRPC router: getSubscription, createCheckout, createAlacarteCheckout, cancelSubscription

## Phase 2 - Finishing Touches
- [x] Real S3 file uploads for Remote Returns checklist items
- [x] Admin Returns Dashboard at /admin/returns
- [x] Subscription feature gating (Free vs paid tiers)
- [x] Landing page full polish and conversion optimization

## Legal Compliance (EFIN/PTIN)
- [x] Update e-file copy: "filed through our authorized e-file partner (TaxxSavage)" — not direct IRS submission
- [x] Update Remote Returns copy: "prepared by SmartBooks24, e-filed through licensed partner"
- [x] Add preparer disclosure footer: PTIN + EIN + "E-filing performed by authorized ERO partner"
- [x] Remove any language implying direct EFIN ownership until obtained

## Beta Promo Code System
- [x] DB schema: promo_codes table (code, tier, max_uses, used_count, expires_at, created_by)
- [x] DB schema: promo_redemptions table (user_id, code_id, redeemed_at)
- [x] tRPC backend: promoCodes.generate (admin only), adminList, redeem, revoke, myRedemption
- [x] Feature gating: recognize "beta_pro" tier as equivalent to Pro for all platform features
- [x] Admin UI: /admin/promo-codes page to generate, view, and revoke codes
- [x] User UI: redeem code from Profile → Subscription tab
- [x] Pre-generate codes on demand from admin page (no limit, max 5 active at a time recommended)
- [x] Exclusions: Remote Returns and à la carte services remain paid even with promo tier

## Founder Story Section
- [x] Add founder story section to Landing page (Harley story, built by a real preparer)

## Logo Update
- [ ] Recreate Teresa's badge logo as SVG (TERESA FURR top arc, SmartBooks script center, TAXFLOW bottom arc)
- [ ] Replace emoji logo in nav with SVG badge logo
- [ ] Update favicon

## Bugs
- [x] Receipts page: "Upload New" / "All Receipts" tab text unreadable (grey on grey) — fixed muted-foreground to oklch(0.72)

## Calendly Integration
- [x] Add "Book a Free Consultation" button to landing page hero linking to https://calendly.com/refurrm-llc/30min

## Bugs
- [x] beta_pro not in subscriptionTier enum — added to mysqlEnum and pushed migration

## Profile Fixes
- [ ] Profile/tax info not saving — fix the save mutation
- [ ] Split name into First Name, Middle Initial, Last Name (IRS form layout)
- [ ] Split address into Street Address, Apt/Suite, City, State, ZIP (IRS form layout)
- [ ] Add SSN/ITIN field (masked, for tax prep use)
- [ ] Add Date of Birth field
- [ ] Add Phone Number field

## Profile Page Rewrite
- [ ] Completely rewrite Profile.tsx using tRPC (remove all Supabase references)
- [ ] Fix profile save — currently broken
- [ ] IRS-layout fields: First / Middle Initial / Last Name
- [ ] Proper address: Street Address, Apt/Suite, City, State, ZIP
- [ ] Add: DOB, Phone, SSN Last 4, Business Name, Business Type, EIN

## Nav Logo Fix
- [x] Swap nav/footer logo from full circular logo to favicon (TF monogram only) — full logo too fine at small size

## Notary Services Update
- [x] Mark RON (Remote Online Notarization) as "Coming Soon" — mobile & in-person available locally

## Logo & Branding Update
- [x] Replace nav dollar-sign icon with TF badge SVG logo (uploaded by Teresa)
- [x] Update favicon with TF favicon SVG
- [x] Rewrite/remove corny founder section (emoji, 1997/Harley/Now cards) — replaced with real photo + professional copy
