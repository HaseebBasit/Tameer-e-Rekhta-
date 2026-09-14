import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      donorName,
      donorEmail,
      donorPhone,
      amount,
      paymentMethod,
      cause,
      transactionId,
      notes,
    } = body;

    // Validate required fields
    if (!donorName || !donorEmail || !donorPhone || !amount || !paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide all required fields (Name, Email, Phone, Amount, and Payment Method).",
        },
        { status: 400 }
      );
    }

    const txId =
      transactionId ||
      `TR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const adminEmail =
      process.env.VOLUNTEER_RECIPIENT_EMAIL || "haseebbasit2717@gmail.com";
    const formattedAmount = `Rs. ${Number(amount).toLocaleString()} PKR`;
    const transactionDate = new Date().toLocaleString("en-PK", {
      timeZone: "Asia/Karachi",
      dateStyle: "full",
      timeStyle: "short",
    });

    const emailSubject = `Official Donation Receipt: ${formattedAmount} [${txId}] - Ta'meer-e-Rekhta`;

    // Plaintext format
    const plainText = `
==============================================
TA'MEER-E-REKHTA (تعمیرِ ریختہ)
Official Electronic Donation Receipt (Test Mode)
==============================================

Receipt / Transaction ID: ${txId}
Status: Verified & Completed (Simulation)
Date & Time: ${transactionDate}

DONOR INFORMATION:
- Donor Name: ${donorName}
- Email Address: ${donorEmail}
- Phone / WhatsApp: ${donorPhone}

DONATION DETAILS:
- Amount Paid: ${formattedAmount}
- Payment Method: ${paymentMethod}
- Cause / Initiative: ${cause || "General Welfare Fund"}
- Notes: ${notes || "None"}

Thank you for supporting Ta'meer-e-Rekhta. Your contribution helps empower youth, revive Urdu literature, and serve humanity in Pakistan.

For questions, contact us at: info@tameer-e-rekhta.org | WhatsApp: 0312-3456789
==============================================
    `.trim();

    // HTML Email Template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${emailSubject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; background-color: #f8fafc; color: #1e293b;">
  <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
    
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #0D5C3A 0%, #084028 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
      <span style="display: inline-block; background-color: rgba(255,255,255,0.15); font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em; padding: 4px 12px; border-radius: 9999px; margin-bottom: 8px;">
        Official Donation Receipt • Electronic Copy
      </span>
      <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">تعمیرِ ریختہ | Ta'meer-e-Rekhta</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Urdu Revival • Youth Leadership • Humanity</p>
    </div>

    <div style="padding: 32px 28px;">
      <!-- Hero Amount Box -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 12px; text-transform: uppercase; color: #15803d; font-weight: 700; letter-spacing: 0.05em;">Total Donation Amount</span>
        <div style="font-size: 32px; font-weight: 900; color: #0D5C3A; margin: 4px 0;">${formattedAmount}</div>
        <span style="display: inline-block; background-color: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px;">
          ✓ Payment Completed (Test Mode)
        </span>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-top: 0;">
        Dear <strong>${donorName}</strong>,<br>
        Thank you for your generous contribution to <strong>Ta'meer-e-Rekhta</strong>. Please retain this official receipt for your records.
      </p>

      <!-- Details Table -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
        <tbody>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 11px 8px; font-weight: 600; color: #64748b; width: 38%;">Receipt / Txn ID</td>
            <td style="padding: 11px 8px; font-weight: 700; font-family: monospace; color: #0f172a;">${txId}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 11px 8px; font-weight: 600; color: #64748b;">Donor Name</td>
            <td style="padding: 11px 8px; font-weight: 700; color: #0f172a;">${donorName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 11px 8px; font-weight: 600; color: #64748b;">Email Address</td>
            <td style="padding: 11px 8px; color: #0f172a;">${donorEmail}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 11px 8px; font-weight: 600; color: #64748b;">Phone / WhatsApp</td>
            <td style="padding: 11px 8px; color: #0f172a;">${donorPhone}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 11px 8px; font-weight: 600; color: #64748b;">Payment Method</td>
            <td style="padding: 11px 8px; font-weight: 700; color: #0D5C3A;">${paymentMethod} (Test Simulation)</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 11px 8px; font-weight: 600; color: #64748b;">Cause / Initiative</td>
            <td style="padding: 11px 8px; color: #0f172a;">${cause || "General Welfare Fund"}</td>
          </tr>
          ${
            notes
              ? `<tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 11px 8px; font-weight: 600; color: #64748b;">Special Note</td>
                  <td style="padding: 11px 8px; color: #334155;">${notes}</td>
                </tr>`
              : ""
          }
          <tr>
            <td style="padding: 11px 8px; font-weight: 600; color: #94a3b8;">Transaction Date</td>
            <td style="padding: 11px 8px; font-size: 13px; color: #64748b;">${transactionDate}</td>
          </tr>
        </tbody>
      </table>

      <!-- Bottom pledge card -->
      <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; margin-top: 24px; border: 1px dashed #cbd5e1; text-align: center;">
        <p style="margin: 0; font-size: 13px; color: #475569; font-style: italic;">
          &ldquo;We can&apos;t help everyone, but everyone can help someone.&rdquo;
        </p>
        <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8;">
          100% of public donations are allocated directly to verified welfare projects.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f1f5f9; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 12px; color: #64748b;">
      <p style="margin: 0 0 4px 0;"><strong>Ta'meer-e-Rekhta Welfare Society</strong> • Karachi, Pakistan</p>
      <p style="margin: 0; font-size: 11px; color: #94a3b8;">This is an automated system-generated electronic receipt.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const hasSmtpConfig =
      process.env.SMTP_USER &&
      process.env.SMTP_PASS;

    if (hasSmtpConfig) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Send receipt to donor and CC admin
      await transporter.sendMail({
        from: `"Ta'meer-e-Rekhta" <${process.env.SMTP_USER}>`,
        to: donorEmail,
        cc: adminEmail,
        subject: emailSubject,
        text: plainText,
        html: htmlContent,
      });

      return NextResponse.json({
        success: true,
        method: "smtp",
        receipt: {
          transactionId: txId,
          donorName,
          donorEmail,
          donorPhone,
          amount: formattedAmount,
          paymentMethod,
          cause: cause || "General Welfare Fund",
          date: transactionDate,
        },
      });
    } else {
      // Determine origin and referer for reliable delivery
      const host = req.headers.get("host") || "localhost:3000";
      const protocol = host.includes("localhost") ? "http" : "https";
      const origin = req.headers.get("origin") || `${protocol}://${host}`;
      const referer = req.headers.get("referer") || `${origin}/donate`;
      const userAgent =
        req.headers.get("user-agent") ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

      // Dispatch to admin with CC to donor's email so both receive the receipt
      const formSubmitResponse = await fetch(
        `https://formsubmit.co/ajax/${encodeURIComponent(adminEmail)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Origin: origin,
            Referer: referer,
            "User-Agent": userAgent,
          },
          body: JSON.stringify({
            _subject: emailSubject,
            _captcha: "false",
            _template: "table",
            _replyto: donorEmail,
            _cc: donorEmail,
            "Receipt Number": txId,
            "Donor Name": donorName,
            "Donor Email": donorEmail,
            "Donor Phone": donorPhone,
            "Donation Amount": formattedAmount,
            "Payment Method": `${paymentMethod} (Test Mode)`,
            "Cause / Initiative": cause || "General Welfare Fund",
            "Special Note": notes || "None",
            "Transaction Date": transactionDate,
            Status: "Payment Verified (Test Simulation)",
          }),
        }
      );

      const submitData = await formSubmitResponse.json().catch(() => null);

      if (!formSubmitResponse.ok || (submitData && submitData.success === "false")) {
        console.error("Donation receipt dispatch failed:", submitData);
        throw new Error(
          submitData?.message || "Unable to dispatch donation receipt via email service."
        );
      }

      return NextResponse.json({
        success: true,
        method: "direct",
        receipt: {
          transactionId: txId,
          donorName,
          donorEmail,
          donorPhone,
          amount: formattedAmount,
          paymentMethod,
          cause: cause || "General Welfare Fund",
          date: transactionDate,
        },
      });
    }
  } catch (error: any) {
    console.error("Error processing donation receipt:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to process donation receipt. Please try again.",
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// ---------------------------------------------------------------------------
// Ta'meer-e-Rekhta — Donation Receipt API
// POST /api/donate
//
// Runs in TEST / SIMULATION MODE: no live payment gateway is called. The
// route validates the submission, generates a branded HTML receipt, and
// (if SMTP env vars are configured) emails it to the donor with a CC to
// the organization's admin inbox. If SMTP isn't configured, email dispatch
// is skipped and the receipt is still returned so the on-screen flow works.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

const ADMIN_COPY_EMAIL = "haseebbasit2717@gmail.com";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  easypaisa: "EasyPaisa (Test Mode)",
  jazzcash: "JazzCash (Test Mode)",
  bank: "Bank Transfer — Meezan Bank Ltd (Test Mode)",
  card: "Test Card (Simulation)",
};

const CAUSE_LABELS: Record<string, string> = {
  food_drives: "Food Drives & Ration Relief",
  orphanage_care: "Orphanage Care",
  youth_leadership: "Youth Leadership",
  general_welfare: "General Welfare Fund",
};

interface DonationPayload {
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: number;
  paymentMethod: string;
  cause: string;
  transactionId: string;
  notes?: string;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateTransactionId() {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 89999);
  return `TR-${year}-${random}`;
}

function formatPKR(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generateReceiptHtml(payload: DonationPayload, dateStr: string) {
  const causeLabel = CAUSE_LABELS[payload.cause] ?? payload.cause;
  const methodLabel = PAYMENT_METHOD_LABELS[payload.paymentMethod] ?? payload.paymentMethod;

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;background:#FAF8F5;color:#151515;">
    <div style="background:#0f271a;padding:28px 32px;border-radius:12px 12px 0 0;">
      <div style="color:#e8f5e9;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Ta'meer-e-Rekhta</div>
      <div style="color:#FAF8F5;font-size:24px;font-weight:700;margin-top:4px;">تعمیرِ ریختہ</div>
      <div style="color:#6AA84F;font-size:13px;margin-top:8px;">Urdu Revival • Youth Leadership • Serving Humanity</div>
    </div>

    <div style="padding:24px 32px;background:#ffffff;">
      <div style="display:inline-block;background:#e8f5e9;color:#143022;font-size:12px;font-weight:600;
                  padding:6px 14px;border-radius:999px;margin-bottom:16px;">
        ✓ Payment Verified &bull; Test Simulation
      </div>

      <h2 style="font-size:18px;margin:8px 0 2px;color:#0f271a;">Donation Receipt</h2>
      <div style="font-size:13px;color:#5B9B45;margin-bottom:20px;">Reference: <strong>${escapeHtml(payload.transactionId)}</strong></div>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tbody>
          ${[
            ["Donor Name", payload.donorName],
            ["Email", payload.donorEmail],
            ["Phone / WhatsApp", payload.donorPhone || "—"],
            ["Amount", formatPKR(payload.amount)],
            ["Payment Channel", methodLabel],
            ["Cause / Initiative", causeLabel],
            ["Date & Time", dateStr],
          ]
            .map(
              ([label, value]) => `
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #F5F2EB;color:#5B9B45;width:40%;">${escapeHtml(label)}</td>
              <td style="padding:10px 0;border-bottom:1px solid #F5F2EB;font-weight:600;color:#151515;">${escapeHtml(String(value))}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>

      ${
        payload.notes
          ? `<div style="margin-top:16px;font-size:13px;color:#5B9B45;">
              <strong>Note:</strong> ${escapeHtml(payload.notes)}
            </div>`
          : ""
      }

      <div style="margin-top:24px;padding:14px 16px;background:#F5F2EB;border-radius:8px;font-size:12px;color:#5B9B45;line-height:1.5;">
        This receipt was generated in <strong>Test / Simulation Mode</strong>. No live payment gateway was
        contacted and no funds were actually transferred. For real donations, please use the manual
        EasyPaisa, JazzCash, or Bank Transfer details on our Donate page and share your payment
        screenshot with us for a verified receipt.
      </div>
    </div>

    <div style="padding:16px 32px;background:#0f271a;border-radius:0 0 12px 12px;text-align:center;">
      <div style="color:#e8f5e9;font-size:12px;">Thank you for supporting Ta'meer-e-Rekhta 🌱</div>
      <div style="color:#5B9B45;font-size:11px;margin-top:4px;">tameerekhta@gmail.com &bull; 0312-3456789</div>
    </div>
  </div>`;
}

export async function POST(req: NextRequest) {
  let body: Partial<DonationPayload>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const { donorName, donorEmail, donorPhone, amount, paymentMethod, cause, notes } = body;

  if (!donorName || !donorName.trim()) {
    return NextResponse.json({ ok: false, error: "Donor name is required." }, { status: 400 });
  }
  if (!donorEmail || !isValidEmail(donorEmail)) {
    return NextResponse.json({ ok: false, error: "A valid email address is required." }, { status: 400 });
  }
  if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json({ ok: false, error: "Amount must be greater than zero." }, { status: 400 });
  }
  if (!paymentMethod || !PAYMENT_METHOD_LABELS[paymentMethod]) {
    return NextResponse.json({ ok: false, error: "A valid payment method is required." }, { status: 400 });
  }
  if (!cause || !CAUSE_LABELS[cause]) {
    return NextResponse.json({ ok: false, error: "A valid cause / initiative is required." }, { status: 400 });
  }

  const transactionId = generateTransactionId();
  const now = new Date();
  const dateStr = now.toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  });

  const payload: DonationPayload = {
    donorName: donorName.trim(),
    donorEmail: donorEmail.trim(),
    donorPhone: (donorPhone ?? "").trim(),
    amount: Number(amount),
    paymentMethod,
    cause,
    transactionId,
    notes: notes?.trim() || undefined,
  };

  const receiptHtml = generateReceiptHtml(payload, dateStr);

  // ---------------------------------------------------------------------
  // Email dispatch — only attempted if SMTP credentials are configured.
  // Never blocks the receipt response: a failed/skipped email still
  // returns ok:true so the on-screen receipt + print flow always works.
  // ---------------------------------------------------------------------
  let emailStatus: "sent" | "skipped" | "failed" = "skipped";
  let emailError: string | undefined;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });

      await transporter.sendMail({
        from: SMTP_FROM || `"Ta'meer-e-Rekhta" <${SMTP_USER}>`,
        to: payload.donorEmail,
        cc: ADMIN_COPY_EMAIL,
        subject: `Donation Receipt — ${transactionId} | Ta'meer-e-Rekhta`,
        html: receiptHtml,
      });

      emailStatus = "sent";
    } catch (err) {
      emailStatus = "failed";
      emailError = err instanceof Error ? err.message : "Unknown email error";
      // eslint-disable-next-line no-console
      console.error("[/api/donate] email dispatch failed:", err);
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      "[/api/donate] SMTP_HOST / SMTP_USER / SMTP_PASS not set — skipping email dispatch (test mode)."
    );
  }

  return NextResponse.json({
    ok: true,
    transactionId,
    date: dateStr,
    emailStatus,
    emailError,
    receiptHtml,
  });
}