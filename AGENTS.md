# Inetz Engineering Guide

Start with `docs/PROJECT_KNOWLEDGE.md`. It is the repository map and source of
project-specific invariants; use it to avoid rediscovering the whole codebase.

## Working method

1. Read the knowledge entry relevant to the task.
2. Inspect only the named files and their direct imports/callers.
3. Reuse existing components, models, auth helpers, and payment services.
4. Make the smallest complete change; do not add speculative abstractions or
   dependencies.
5. Validate proportionally: focused checks first, then `npm run lint` and
   `npm run build` when the change warrants them.
6. Report what changed, what was verified, and any remaining operational step.

## Non-negotiable invariants

- This is a Next.js App Router application. Keep pages/routes under `src/app`.
- Use the `@/*` alias for `src/*` imports.
- Authentication is NextAuth JWT-based. UI route gating belongs in
  `src/proxy.ts`; every sensitive API route must also authorize on the server
  with `requireRole` from `src/lib/api-auth.ts`.
- Never trust payment amount, email, student identity, or Razorpay status from
  the browser. Program price, account identity, and captured payment details
  are established server-side.
- Both Razorpay confirmation paths must call
  `src/lib/record-razorpay-payment.ts`; do not create a second payment recorder.
- `RazorpayOrder` is the order lock/audit record. Preserve its unique indexes
  and idempotent processing behavior.
- `Student.installments` is the source of payment history. Its save hook derives
  collection, balance, and fee status; do not maintain competing totals.
- Student-facing applications/interviews and resume/GitHub/LinkedIn upload UI
  were deliberately removed. Do not restore them without an explicit product
  decision; legacy models/employer surfaces may still exist.
- Keep secrets server-only and out of source, logs, documentation, and
  `NEXT_PUBLIC_*`. Document environment variable names only.
- Preserve unrelated working-tree changes. Never rewrite user work to make a
  task easier.

## Code and UI conventions

- TypeScript is strict; avoid `any` in new work when a local type is practical.
- Prefer server components by default; add `"use client"` only for browser APIs,
  hooks, or interaction.
- Use Tailwind utilities and existing primitives in `src/components/ui`.
- Match the established professional light UI: restrained blue accents, solid
  colors, compact spacing, and consistent typography. Avoid gradients unless
  explicitly requested.
- Return structured JSON and appropriate HTTP status codes from route handlers.
- Keep MongoDB access through `src/lib/db.ts` and Mongoose models in
  `src/models`.

## Common commands

```text
npm run dev       # local server on port 3001
npm run lint      # ESLint / Next checks
npm run build     # production compilation
npm run test:auth # focused authorization regression script
```

## Maintaining the map

Update `docs/PROJECT_KNOWLEDGE.md` only when a change alters architecture,
ownership, a critical flow, an invariant, or an operational requirement. Do
not turn it into a changelog or copy implementation details into it.
