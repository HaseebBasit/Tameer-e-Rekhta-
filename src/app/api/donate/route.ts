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
      // const host = req.headers.get("host") || "localhost:3000";
      // const protocol = host.includes("localhost") ? "http" : "https";
      // const origin = req.headers.get("origin") || `${protocol}://${host}`;
      // const referer = req.headers.get("referer") || `${origin}/donate`;
      // const userAgent =
      //   req.headers.get("user-agent") ||
      //   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

      const host = req.headers.get("host") || "localhost:3000";

const protocol = host.includes("localhost") ? "http" : "https";

const origin =
  req.headers.get("origin") || "https://tameer-e-rekhta.vercel.app";

const referer =
  req.headers.get("referer") || `${origin}/donate`;

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