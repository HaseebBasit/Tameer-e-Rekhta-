# Donation Payment & Receipt — Integration Notes

I don't have access to your actual `src/` source tree in this session (only the
root config files were shared), so these four files are built as self-contained
drop-ins that match the conventions from your README/changelog (Tailwind brand
tokens, `cn` utility, App Router, `nodemailer`). Copy them into your repo at
these exact paths:

```
src/app/api/donate/route.ts
src/components/donate/DonationPaymentForm.tsx
src/components/donate/DonationReceipt.tsx
src/components/donate/DonationSection.tsx
```

## 1. Wire it into `/donate`

In `src/app/donate/page.tsx`, import and render the single wrapper component
wherever you want the interactive checkout to sit (e.g. above or below the
existing copyable EasyPaisa/JazzCash/Bank badges, which the plan says to keep):

```tsx
import DonationSection from "@/components/donate/DonationSection";

// ...inside the page JSX:
<DonationSection />
```

That's the only change needed to the existing page — `DonationSection`
internally swaps between the form and the receipt, so nothing else on the
page needs to change state.

## 2. Environment variables (optional — email is test-mode-safe without them)

The API route only attempts to send email if SMTP credentials are present.
Without them, the route still validates the submission and returns a full
receipt (so the on-screen flow and Print/PDF button work in pure test mode
with zero setup). To actually send the dual email (donor + CC to
`haseebbasit2717@gmail.com`), add to `.env.local`:

```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM="Ta'meer-e-Rekhta <no-reply@tameererekhta.org>"
```

Any standard SMTP provider works (Gmail app password, SendGrid, Resend SMTP,
Mailgun, etc.) — `nodemailer` is already a dependency in your `package.json`.

## 3. What's simulated vs. real

- **No live payment gateway is called.** The dummy numbers (`0312-3456789`
  for EasyPaisa/JazzCash, Meezan Bank `0102-0105829103`, or "Test Card") are
  shown for realism only.
- **The receipt is real** — a genuine HTML receipt with a generated
  `TR-YYYY-NNNNN` transaction ID, timestamp (Asia/Karachi), and the donor's
  submitted details, rendered both on-screen and as the emailed HTML.
- **Print/Save PDF** uses `window.print()` with scoped `@media print` CSS so
  only the receipt card prints — use the browser's "Save as PDF" print
  destination to get a PDF file.

## 4. Verification checklist (matches the plan's Verification Plan)

- `npm.cmd run build` — confirms the new API route and client components
  compile with 0 TypeScript/lint errors.
- `POST /api/donate` with a test payload (curl or Postman) — confirms
  validation, `transactionId` generation, and (if SMTP is set) email dispatch.
- Fill out `/donate` locally: try a preset amount, then a custom amount;
  submit; confirm the receipt renders with correct data; test Print/Save PDF;
  confirm email arrives at the donor address and at
  `haseebbasit2717@gmail.com` if SMTP is configured.
- Commit and push — Vercel will redeploy `https://tameer-e-rekhta.vercel.app/donate`
  automatically. Remember to add the `SMTP_*` env vars in the Vercel project
  settings too, not just `.env.local`.

## Notes on assumptions I made

- I assumed `@/lib/utils` exports a `cn(...)` helper (clsx + tailwind-merge),
  as your changelog describes. If the real signature differs, the only usages
  are simple `cn("classA", condition && "classB")` calls in
  `DonationPaymentForm.tsx` and `DonationReceipt.tsx` — trivial to adjust.
- I deliberately did **not** depend on your existing `Button`, `Container`,
  or `Badge` components since I can't see their prop signatures — the new
  components use plain Tailwind classes with your brand color tokens instead,
  so they'll render correctly regardless of those components' exact APIs. You
  can swap them in later if you'd like tighter visual consistency.
- `paymentMethod` and `cause` are validated against fixed enums server-side
  (in `route.ts`) to prevent arbitrary label injection into the emailed
  receipt.