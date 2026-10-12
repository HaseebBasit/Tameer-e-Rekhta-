import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      instagramId,
      city,
      age,
      areaOfInterest,
      motivation,
    } = body;

    // Validate required fields
    if (!fullName || !email || !phone || !city || !areaOfInterest) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide all required fields (Name, Email, Phone, City, and Area of Interest).",
        },
        { status: 400 }
      );
    }

    const recipientEmail =
      process.env.VOLUNTEER_RECIPIENT_EMAIL || "taameer.e.rekhta@gmail.com";
    const submissionDate = new Date().toLocaleString("en-PK", {
      timeZone: "Asia/Karachi",
      dateStyle: "full",
      timeStyle: "short",
    });

    const emailSubject = `New Volunteer Registration: ${fullName} (${city}) - Ta'meer-e-Rekhta`;

    // Plaintext format
    const plainText = `
==============================================
TA'MEER-E-REKHTA (تعمیرِ ریختہ)
New Volunteer Registration Application
==============================================

APPLICANT DETAILS:
- Full Name: ${fullName}
- Email: ${email}
- Phone / WhatsApp: ${phone}
- Instagram ID: ${instagramId || "Not specified"}
- City: ${city}
- Age: ${age || "Not specified"}
- Area of Interest: ${areaOfInterest}

MOTIVATION / WHY JOIN:
${motivation || "None provided"}

SUBMISSION INFO:
- Date: ${submissionDate}
- Sent to: ${recipientEmail}
==============================================
    `.trim();

    // Responsive HTML Email Template (Tested for Mobile Gmail, Apple Mail, Outlook)
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${emailSubject}</title>
  <style>
    * {
      box-sizing: border-box;
      -webkit-text-size-adjust: 100%;
    }
    body, html {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
    }
    .wrapper {
      width: 100% !important;
      max-width: 600px !important;
      margin: 20px auto !important;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    .header {
      background: #0D5C3A;
      background: linear-gradient(135deg, #0D5C3A 0%, #063c24 100%);
      padding: 30px 24px;
      text-align: center;
      color: #ffffff;
    }
    .badge {
      display: inline-block;
      background-color: rgba(255,255,255,0.18);
      color: #ecfdf5;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 4px 14px;
      border-radius: 9999px;
      margin-bottom: 10px;
    }
    .title {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.01em;
      line-height: 1.3;
      color: #ffffff;
    }
    .urdu-sub {
      margin: 6px 0 0 0;
      font-size: 15px;
      color: #a7f3d0;
      font-weight: 600;
    }
    .content {
      padding: 24px 20px;
    }
    .data-row {
      margin-bottom: 12px;
      padding: 12px 14px;
      background-color: #f8fafc;
      border-radius: 10px;
      border: 1px solid #edf2f7;
    }
    .data-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 3px;
      display: block;
    }
    .data-val {
      font-size: 15px;
      font-weight: 600;
      color: #0f172a;
      word-break: break-word !important;
      overflow-wrap: anywhere !important;
      line-height: 1.4;
    }
    .data-val a {
      color: #0D5C3A;
      text-decoration: underline;
    }
    .interest-pill {
      display: inline-block;
      background-color: #ecfdf5;
      color: #065f46;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 13px;
    }
    .message-box {
      margin-top: 14px;
      padding: 16px;
      background-color: #f8fafc;
      border-radius: 12px;
      border-left: 4px solid #0D5C3A;
    }
    .footer {
      padding: 20px;
      text-align: center;
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }
    @media only screen and (max-width: 480px) {
      .wrapper {
        margin: 8px auto !important;
        border-radius: 10px !important;
      }
      .header {
        padding: 22px 16px !important;
      }
      .title {
        font-size: 19px !important;
      }
      .content {
        padding: 16px 12px !important;
      }
      .data-row {
        padding: 10px 12px !important;
      }
      .data-val {
        font-size: 14px !important;
      }
    }
  </style>
</head>
<body>
  <div style="padding: 12px;">
    <div class="wrapper">
      <!-- Header -->
      <div class="header">
        <span class="badge">Volunteer Application</span>
        <h1 class="title">تعمیرِ ریختہ | Ta'meer-e-Rekhta</h1>
        <p class="urdu-sub">Urdu Revival • Youth Leadership • Humanity</p>
      </div>

      <!-- Main Content -->
      <div class="content">
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569; line-height: 1.5;">
          A new volunteer registration has been submitted on the Ta'meer-e-Rekhta portal.
        </p>

        <!-- Name -->
        <div class="data-row">
          <span class="data-label">Applicant Name</span>
          <div class="data-val" style="font-size: 17px; font-weight: 700; color: #0D5C3A;">${fullName}</div>
        </div>

        <!-- Email -->
        <div class="data-row">
          <span class="data-label">Email Address</span>
          <div class="data-val">
            <a href="mailto:${email}">${email}</a>
          </div>
        </div>

        <!-- Phone / WhatsApp -->
        <div class="data-row">
          <span class="data-label">Phone / WhatsApp</span>
          <div class="data-val">
            <a href="https://wa.me/${phone.replace(/[^0-9]/g, "")}">${phone}</a>
          </div>
        </div>

        <!-- Instagram ID -->
        <div class="data-row">
          <span class="data-label">Instagram ID</span>
          <div class="data-val">
            ${
              instagramId
                ? `<a href="https://instagram.com/${instagramId.replace(/^@/, "")}" target="_blank" style="color: #0D5C3A; font-weight: 600;">${
                    instagramId.startsWith("@") ? instagramId : "@" + instagramId
                  }</a>`
                : `<span style="color: #94a3b8; font-weight: 400;">Not specified</span>`
            }
          </div>
        </div>

        <!-- City & Age -->
        <div class="data-row">
          <span class="data-label">City &amp; Age</span>
          <div class="data-val">${city} ${age ? `• ${age} years old` : ""}</div>
        </div>

        <!-- Area of Interest -->
        <div class="data-row">
          <span class="data-label">Area of Interest</span>
          <div class="data-val">
            <span class="interest-pill">${areaOfInterest}</span>
          </div>
        </div>

        <!-- Motivation -->
        <div class="message-box">
          <span class="data-label" style="color: #0D5C3A;">Motivation / Why Join</span>
          <div class="data-val" style="font-weight: 400; color: #334155; margin-top: 6px; white-space: pre-wrap;">
            ${motivation ? motivation : "No additional statement provided."}
          </div>
        </div>

        <!-- Timestamp -->
        <div style="margin-top: 16px; font-size: 12px; color: #94a3b8; text-align: right;">
          Submitted on ${submissionDate}
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <strong>Ta'meer-e-Rekhta Administration</strong><br>
        Direct Inquiries: <a href="mailto:${recipientEmail}" style="color: #0D5C3A;">${recipientEmail}</a>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    // Check if SMTP credentials exist in environment
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

      await transporter.sendMail({
        from: `"${fullName} (Volunteer Applicant)" <${process.env.SMTP_USER}>`,
        replyTo: email,
        to: recipientEmail,
        subject: emailSubject,
        text: plainText,
        html: htmlContent,
      });

      return NextResponse.json({
        success: true,
        method: "smtp",
        message: "Volunteer application received and sent successfully via SMTP.",
      });
    } else {
      const host = req.headers.get("host") || "localhost:3000";
      const protocol = host.includes("localhost") ? "http" : "https";
      const origin = req.headers.get("origin") || `${protocol}://${host}`;
      const referer = req.headers.get("referer") || `${origin}/volunteer`;
      const userAgent =
        req.headers.get("user-agent") ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

      // FormSubmit box template provides a clean responsive vertical stack that never cuts text
      const formSubmitResponse = await fetch(
        `https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`,
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
            _replyto: email,
            "Applicant Name": fullName,
            "Email Address": email,
            "Phone / WhatsApp": phone,
            "Instagram ID": instagramId || "Not specified",
            "City": city,
            "Age": age || "Not specified",
            "Area of Interest": areaOfInterest,
            "Motivation / Why Join": motivation || "None provided",
            "Submitted At": submissionDate,
          }),
        }
      );

      const submitData = await formSubmitResponse.json().catch(() => null);

      if (!formSubmitResponse.ok || (submitData && submitData.success === "false")) {
        console.error("FormSubmit response failed:", submitData);
        throw new Error(
          submitData?.message || "Unable to deliver volunteer details via email service."
        );
      }

      return NextResponse.json({
        success: true,
        method: "direct",
        message: "Volunteer application received and dispatched successfully.",
      });
    }
  } catch (error: any) {
    console.error("Error submitting volunteer form:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to submit volunteer application. Please try again or reach out directly.",
      },
      { status: 500 }
    );
  }
}
