import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import os from "os";

let memoryReceiptCounter = 0;

async function getNextReceiptNumber(): Promise<string> {
  // 1. Try remote persistent cloud counter (persists across Vercel serverless deployments & cold starts)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(
      "https://abacus.jasoncameron.dev/hit/tameer-e-rekhta-production/receipts",
      {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      }
    );
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.value === "number" && data.value > 0) {
        return `TMR-${String(data.value).padStart(2, "0")}`;
      }
    }
  } catch (cloudErr) {
    console.warn("Persistent cloud counter unavailable, falling back to local store:", cloudErr);
  }

  // 2. Try file storage (/tmp for serverless Vercel, and project data directory for local dev)
  const candidatePaths = [
    path.join(process.cwd(), "src", "data", "receipt-counter.json"),
    path.join(os.tmpdir(), "tameer-receipt-counter.json"),
  ];

  for (const filePath of candidatePaths) {
    try {
      let current = 0;
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(fileContent);
        current = Number(parsed.lastReceiptNumber) || 0;
      }
      const nextNum = current + 1;
      fs.writeFileSync(
        filePath,
        JSON.stringify({ lastReceiptNumber: nextNum }, null, 2),
        "utf-8"
      );
      return `TMR-${String(nextNum).padStart(2, "0")}`;
    } catch {
      // Continue to next path
    }
  }

  // 3. Fallback: in-memory sequential counter starting at 1 (NEVER random timestamp math)
  memoryReceiptCounter += 1;
  return `TMR-${String(memoryReceiptCounter).padStart(2, "0")}`;
}

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

    const receiptNo = await getNextReceiptNumber();
    const referenceId = transactionId && transactionId.trim() !== "" ? transactionId : receiptNo;

    const adminEmail =
      process.env.VOLUNTEER_RECIPIENT_EMAIL || "taameer.e.rekhta@gmail.com";
    const formattedAmount = `Rs. ${Number(amount).toLocaleString()} PKR`;
    const transactionDate = new Date().toLocaleString("en-PK", {
      timeZone: "Asia/Karachi",
      dateStyle: "full",
      timeStyle: "short",
    });

    const emailSubject = `Official Donation Receipt: ${formattedAmount} [${receiptNo}] - Ta'meer-e-Rekhta`;

    // Plaintext format
    const plainText = `
==============================================
TA'MEER-E-REKHTA (تعمیرِ ریختہ)
Official Electronic Donation Receipt
==============================================

RECEIPT DETAILS:
- Receipt Number: ${receiptNo}
- Transaction / Reference ID: ${referenceId}
- Status: Donation Confirmed & Recorded
- Date & Time: ${transactionDate}

DONOR INFORMATION:
- Donor Name: ${donorName}
- Email Address: ${donorEmail}
- Phone / WhatsApp: ${donorPhone}

DONATION PARTICULARS:
- Amount Donated: ${formattedAmount}
- Payment Method: ${paymentMethod}
- Cause / Initiative: ${cause || "General Welfare Fund"}
- Special Note: ${notes || "None provided"}

Thank you for supporting Ta'meer-e-Rekhta. Your contribution directly fuels on-ground humanitarian relief, youth leadership, and cultural preservation across Pakistan.

For any inquiries or ledger confirmation, contact us at:
Email: taameer.e.rekhta@gmail.com | WhatsApp: +92 370 1972002
==============================================
    `.trim();

    // Responsive HTML Email Template matching visual guide
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${emailSubject}</title>

  <style>
    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      padding: 24px;
    }

    .email-wrapper {
      width: 100%;
      max-width: 620px;
      margin: 0 auto;
    }

    .email-card {
      width: 100%;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
    }

    .header {
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
      background: #0D5C3A;
      background: linear-gradient(135deg, #0D5C3A 0%, #084028 100%);
    }

    .header h1 {
      margin: 0;
      font-size: 26px;
      line-height: 1.3;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .header p {
      margin: 6px 0 0;
      font-size: 13px;
      line-height: 1.5;
      opacity: 0.9;
    }

    .content {
      padding: 32px 28px;
    }

    .amount-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      margin-bottom: 24px;
    }

    .amount-label {
      display: block;
      font-size: 12px;
      line-height: 1.4;
      text-transform: uppercase;
      color: #15803d;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .amount {
      font-size: 34px;
      line-height: 1.2;
      font-weight: 900;
      color: #0D5C3A;
      margin: 6px 0;
      word-break: break-word;
    }

    .status {
      display: inline-block;
      background-color: #dcfce7;
      color: #166534;
      font-size: 11px;
      line-height: 1.4;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 9999px;
      border: 1px solid #bbf7d0;
    }

    .message {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 16px 0;
    }

    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
      font-size: 14px;
      table-layout: fixed;
    }

    .details-table td {
      padding: 12px 10px;
      vertical-align: top;
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .details-table tr {
      border-bottom: 1px solid #f1f5f9;
    }

    .details-table td:first-child {
      width: 40%;
      font-weight: 600;
      color: #64748b;
      font-size: 13px;
    }

    .details-table td:last-child {
      width: 60%;
      color: #0f172a;
      font-size: 14px;
    }

    .receipt-number {
      font-weight: 800;
      font-size: 16px;
      color: #0D5C3A !important;
      letter-spacing: 0.02em;
    }

    .payment-method {
      font-weight: 700;
      color: #0D5C3A !important;
    }

    .pledge-card {
      background-color: #f8fafc;
      border-radius: 12px;
      padding: 16px;
      margin-top: 24px;
      border: 1px dashed #cbd5e1;
      text-align: center;
    }

    .pledge-card .quote {
      margin: 0;
      font-size: 13px;
      line-height: 1.5;
      color: #475569;
      font-style: italic;
    }

    .pledge-card .pledge-note {
      margin: 6px 0 0;
      font-size: 11px;
      line-height: 1.5;
      color: #94a3b8;
    }

    .footer {
      background-color: #f1f5f9;
      border-top: 1px solid #e2e8f0;
      padding: 18px 24px;
      text-align: center;
      font-size: 12px;
      line-height: 1.5;
      color: #64748b;
    }

    .footer p {
      margin: 0 0 4px;
    }

    .footer .small {
      margin: 0;
      font-size: 11px;
      color: #94a3b8;
    }

    @media only screen and (max-width: 600px) {
      body {
        padding: 12px;
      }
      .email-card {
        border-radius: 14px;
      }
      .header {
        padding: 24px 16px;
      }
      .header h1 {
        font-size: 21px;
      }
      .content {
        padding: 22px 16px;
      }
      .amount-box {
        padding: 16px 12px;
      }
      .amount {
        font-size: 28px;
      }
      .details-table td {
        padding: 10px 6px;
      }
    }
  </style>
</head>

<body>
  <div class="email-wrapper">
    <div class="email-card">

      <!-- Header Banner -->
      <div class="header">
        <span style="
          display: inline-block;
          background-color: rgba(255,255,255,0.18);
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.1em;
          padding: 4px 14px;
          border-radius: 9999px;
          margin-bottom: 8px;
        ">
          OFFICIAL DONATION RECEIPT • ELECTRONIC COPY
        </span>

        <h1>تعمیرِ ریختہ | Ta'meer-e-Rekhta</h1>
        <p>Urdu Revival • Youth Leadership • Humanity</p>
      </div>

      <!-- Content -->
      <div class="content">

        <!-- Hero Amount Box -->
        <div class="amount-box">
          <span class="amount-label">Total Donation Amount</span>
          <div class="amount">${formattedAmount}</div>
          <span class="status">✓ Donation Recorded &amp; Confirmed</span>
        </div>

        <p class="message">
          Dear <strong>${donorName}</strong>,<br>
          Thank you for your generous contribution to <strong>Ta'meer-e-Rekhta</strong>.
          Please retain this official receipt for your records.
        </p>

        <!-- Details Table matching donate form fields -->
        <table class="details-table">
          <tbody>
            <tr>
              <td>Receipt Number</td>
              <td class="receipt-number">${receiptNo}</td>
            </tr>

            <tr>
              <td>Transaction / Ref ID</td>
              <td style="font-family: monospace; font-weight: 600;">${referenceId}</td>
            </tr>

            <tr>
              <td>Donor Name</td>
              <td style="font-weight: 700;">${donorName}</td>
            </tr>

            <tr>
              <td>Email Address</td>
              <td><a href="mailto:${donorEmail}" style="color: #0D5C3A;">${donorEmail}</a></td>
            </tr>

            <tr>
              <td>Phone / WhatsApp</td>
              <td><a href="https://wa.me/${donorPhone.replace(/[^0-9]/g, "")}" style="color: #0D5C3A;">${donorPhone}</a></td>
            </tr>

            <tr>
              <td>Payment Method</td>
              <td class="payment-method">${paymentMethod}</td>
            </tr>

            <tr>
              <td>Cause / Initiative</td>
              <td>${cause || "General Welfare Fund"}</td>
            </tr>

            ${
              notes
                ? `
            <tr>
              <td>Special Note</td>
              <td style="color: #334155;">${notes}</td>
            </tr>
                `
                : ""
            }

            <tr>
              <td>Transaction Date</td>
              <td style="font-size: 13px; color: #64748b;">${transactionDate}</td>
            </tr>
          </tbody>
        </table>

        <!-- Bottom pledge card -->
        <div class="pledge-card">
          <p class="quote">
            &ldquo;We can&apos;t help everyone, but everyone can help someone.&rdquo;
          </p>
          <p class="pledge-note">
            100% of public donations are allocated directly to verified welfare projects.
          </p>
        </div>

      </div>

      <!-- Footer -->
      <div class="footer">
        <p>
          <strong>Ta'meer-e-Rekhta Welfare Society</strong> • Pakistan
        </p>
        <p class="small">
          Official Helpline: <a href="https://wa.me/923701972002" style="color: #0D5C3A;">+92 370 1972002</a> • <a href="mailto:taameer.e.rekhta@gmail.com" style="color: #0D5C3A;">taameer.e.rekhta@gmail.com</a>
        </p>
      </div>

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

      // Send to both donor and Ta'meer-e-Rekhta admin
      await transporter.sendMail({
        from: `"Ta'meer-e-Rekhta" <${process.env.SMTP_USER}>`,
        to: [donorEmail, adminEmail],
        subject: emailSubject,
        text: plainText,
        html: htmlContent,
      });

      return NextResponse.json({
        success: true,
        method: "smtp",
        receipt: {
          receiptNo,
          transactionId: referenceId,
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
      const origin = "https://tameer-e-rekhta.vercel.app";
      const referer = `${origin}/donate`;
      const userAgent =
        req.headers.get("user-agent") ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

      // 1. Dispatch official receipt copy to Ta'meer-e-Rekhta administration with CC to donor
      const adminDispatch = await fetch(
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
            _template: "box",
            _replyto: donorEmail,
            _cc: donorEmail,
            "Receipt Number": receiptNo,
            "Transaction / Ref ID": referenceId,
            "Donor Name": donorName,
            "Donor Email": donorEmail,
            "Donor Phone": donorPhone,
            "Donation Amount": formattedAmount,
            "Payment Method": paymentMethod,
            "Cause / Initiative": cause || "General Welfare Fund",
            "Special Note": notes || "None provided",
            "Transaction Date": transactionDate,
            "Status": "Payment Recorded & Verified",
          }),
        }
      );

      const adminSubmitData = await adminDispatch.json().catch(() => null);

      if (!adminDispatch.ok || (adminSubmitData && adminSubmitData.success === "false")) {
        console.error("Donation receipt dispatch failed:", adminSubmitData);
        throw new Error(
          adminSubmitData?.message || "Unable to dispatch donation receipt via email service."
        );
      }

      // 2. Also dispatch a direct copy to the donor's personal email so they receive it immediately
      if (donorEmail && donorEmail.toLowerCase() !== adminEmail.toLowerCase()) {
        await fetch(
          `https://formsubmit.co/ajax/${encodeURIComponent(donorEmail)}`,
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
              _subject: `Official Donation Receipt [${receiptNo}] - Ta'meer-e-Rekhta`,
              _captcha: "false",
              _template: "box",
              _replyto: adminEmail,
              "Receipt Number": receiptNo,
              "Transaction / Ref ID": referenceId,
              "Donor Name": donorName,
              "Donation Amount": formattedAmount,
              "Payment Method": paymentMethod,
              "Cause / Initiative": cause || "General Welfare Fund",
              "Transaction Date": transactionDate,
              "Status": "Donation Confirmed & Recorded",
              "Message": "Thank you for your generous contribution to Ta'meer-e-Rekhta! Please retain this electronic receipt for your records.",
            }),
          }
        ).catch((err) => console.warn("Direct donor email dispatch warning:", err));
      }

      return NextResponse.json({
        success: true,
        method: "direct",
        receipt: {
          receiptNo,
          transactionId: referenceId,
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