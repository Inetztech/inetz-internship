# Project Knowledge

Last mapped: 2026-09-30. This is a navigation aid, not a substitute for reading
the few files involved in a task.

## Product and stack

Inetz is a training/internship platform with public program and marketing pages,
student enrollment/payment management, employer job management, and an admin
back office.

- Next.js 16 App Router, React 19, strict TypeScript
- Tailwind CSS 4; shared UI primitives in `src/components/ui`
- NextAuth 4 with credentials and Google providers; JWT sessions
- MongoDB through Mongoose
- Razorpay payments, SMTP receipt email, Cloudinary blog media
- Docker deployment to AWS ECR/ECS from `.github/workflows/aws.yml`

## Repository map

```text
src/app/                 App Router pages, layouts, and HTTP route handlers
  api/                   Backend endpoints grouped by domain
  admin/                 Admin dashboard
  student/dashboard/     Student profile, enrollments, balances, receipts
  employer/              Employer registration, jobs, and applicants
  programs/, blog/, ...  Public product/content pages
src/components/          Cross-page components and feature widgets
  ui/                    Low-level reusable UI primitives
  programs/, students/   Domain-specific components
src/lib/                 Auth, database, payment, email, and shared utilities
src/models/              Mongoose schemas and indexes
src/proxy.ts             Authentication/role routing at the page boundary
scripts/                 Focused maintenance and regression scripts
public/                  Static assets
Dockerfile               Multi-stage Node 20 Alpine production image
```

The root layout (`src/app/layout.tsx`) composes metadata/JSON-LD, providers,
theme, navbar, page content, footer, WhatsApp control, and toast rendering.
Global styling is in `src/app/globals.css`; `src/app/providers.tsx` owns global
client providers.

## Identity and authorization

Primary files:

- `src/lib/authOptions.ts`: NextAuth providers, sign-in rules, JWT/session role
  propagation, and `/login` configuration.
- `src/proxy.ts`: redirects unauthenticated users and prevents cross-role access
  to student, employer, admin, dashboard, and onboarding pages.
- `src/lib/api-auth.ts`: `requireRole(...roles)` for server/API authorization.
- `src/app/api/auth/register/route.ts`: student account registration.
- `src/app/api/employer/register/route.ts`: employer account creation.
- `src/app/api/auth/me/route.ts`: current account plus linked student data.
- `src/app/api/student/link-phone/route.ts`: links an authenticated account to
  an enrollment where needed.

Roles are `student`, `employer`, and `admin`. Google sign-in creates student
accounts. Employers have approval state. Page gating is convenience, not the
security boundary: protected route handlers must independently call
`requireRole` before reading input or mutating data.

## Core data ownership

- `User`: login identity, provider, role, and employer profile/approval fields.
- `Student`: enrollment/profile, course domain and duration, billing total,
  embedded installments, derived collection/balance/status, certificate state.
- `Program`: public catalog content, official price, syllabus, projects, reviews.
- `RazorpayOrder`: local order lock and audit trail (`creating`, `created`,
  `processed`, `expired`, `failed`), with unique lock/order/payment IDs.
- `Job`: employer-owned job post.
- `Application`: legacy/employer-side job application record; student-facing
  application/interview UI is currently outside the product flow.
- `Blog`: editorial content and Cloudinary-backed media references.

Important relationships are application-level rather than a single aggregate:
`User.email` identifies the account, while `Student` represents an enrollment.
Payment work must resolve the authenticated account to the correct enrollment,
not accept a student ID or email supplied by the client.

## Razorpay payment flow

```text
Student dashboard
  -> POST /api/apply
     -> authenticate student
     -> load official Program price and matching Student enrollment
     -> validate requested installment <= current balance
     -> acquire one active RazorpayOrder lock
     -> create Razorpay order and store its ID
  -> Razorpay Checkout
     -> POST /api/verify (browser signature confirmation)
        OR POST /api/razorpay/webhook (provider callback)
     -> recordRazorpayPayment(orderId, paymentId)
        -> fetch authoritative Razorpay order/payment
        -> require captured payment, INR, matching IDs and amount
        -> atomically append one Student installment
        -> mark RazorpayOrder processed
        -> email receipt
```

Key files:

- `src/components/RazorpayCheckout.tsx`: browser checkout launcher only.
- `src/app/api/apply/route.ts`: authenticated order creation, rate limit,
  enrollment resolution, balance ceiling, and active-order lock.
- `src/app/api/verify/route.ts`: verifies the checkout HMAC using the stored
  order ID, then delegates recording.
- `src/app/api/razorpay/webhook/route.ts`: verifies raw-body webhook HMAC and
  handles captured payments, then delegates recording.
- `src/lib/record-razorpay-payment.ts`: the single idempotent payment recorder.
- `src/lib/payment-receipt-email.ts`: SMTP receipt delivery.
- `src/models/RazorpayOrder.ts`: order state and uniqueness guarantees.
- `src/app/student/dashboard/components/CoursesTab.tsx`: balance/payment UI.
- `src/app/student/dashboard/components/TransactionsTab.tsx`: payment history
  and PDF receipt download using the established admin receipt format.
- `src/app/api/payments/route.ts` and `src/components/PaymentModel.tsx`: admin
  manual payment recording; keep its authorization and billing invariants.

The database row is retained after completion as an audit/idempotency record;
its active lock is released and status becomes `processed`. Never delete it as
part of normal success. Browser verification and webhook may race safely only
because they share the recorder and unique payment/installment checks.

Razorpay webhook configuration is an external operational step. Point it at
`/api/razorpay/webhook`, subscribe to `payment.captured`, and configure the same
secret as `RAZORPAY_WEBHOOK_SECRET`.

## Student dashboard

`src/app/student/dashboard/page.tsx` owns the three tabs and loads session-linked
data from `/api/auth/me`:

- `ProfileTab`: editable identity/enrollment details
- `CoursesTab`: enrolled track, fee summary, payment status, installment payment
- `TransactionsTab`: receipts and PDF downloads
- `PhoneLinkModal`: resolves an account missing its enrollment phone link

Applications, interviews, progress bars, resume uploads, GitHub, and LinkedIn
fields are intentionally absent from this UI. The dashboard visual language is
compact, professional, light, and blue-accented.

## Other feature entry points

- Programs: `src/app/programs`, `src/components/programs`,
  `/api/programs`, `/api/catalog`, `Program` model.
- Admin: `src/app/admin/page.tsx`; tracks, students, transactions, journals;
  `/api/tracks`, `/api/students`, `/api/payments`, `/api/blogs`.
- Employers/jobs: `src/app/employer`, `src/app/jobs`, `/api/employer/jobs`,
  `/api/jobs`, `Job` and `Application` models.
- Blogs: `src/app/blog`, admin journals, `/api/blogs`, Cloudinary configuration.
- Leads: `/api/send-lead` sends to a Google Sheet, email, and WhatsApp when
  configured.
- Certificates: `/certificate` and `/api/certificate/data`.
- Syllabus tools: `/api/process-syllabus` uses Gemini; `/api/download-pdf`
  serves generated/static PDFs.

## Environment contract

Names only; values belong in deployment secrets/local ignored environment files.

- Core: `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Google login: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Razorpay: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
  `RAZORPAY_WEBHOOK_SECRET`
- Mail: `EMAIL_USER`/`EMAIL_PASS` or `SMTP_USER`/`SMTP_PASS`, plus optional
  `SMTP_HOST`, `SMTP_PORT`
- Media/AI: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
  `CLOUDINARY_API_SECRET`, `GEMINI_API_KEY`
- Leads: `GOOGLE_SHEET_WEBAPP_URL`, `WHATSAPP_ACCESS_TOKEN`,
  `WHATSAPP_PHONE_NUMBER_ID`, `RECIPIENT_PHONE_NUMBER`

`next.config.ts` owns production security headers/CSP and the external origins
required by Razorpay and remote images. Recheck CSP whenever adding an external
browser resource.

## Change routing and validation

- Auth/roles: inspect `authOptions.ts`, `proxy.ts`, `api-auth.ts`, then the exact
  route/page. Run `npm run test:auth` and lint.
- Payment changes: inspect the full payment flow above. Test order creation,
  partial payment, duplicate verify/webhook delivery, balance ceiling, receipt,
  and authorization; then lint/build.
- Schema changes: inspect every writer and reader of the model, indexes, existing
  production data compatibility, and whether a migration is required.
- UI changes: reuse the nearest feature component and `src/components/ui`; check
  mobile and desktop layouts plus loading/error/empty states.
- API changes: test unauthenticated, wrong-role, invalid-input, success, and
  duplicate/retry behavior as applicable.

Do not update this file for ordinary component edits or bug fixes. Update it
when a file takes ownership of a concern, a critical flow changes, an invariant
is added/removed, or deployment configuration gains a required external step.
