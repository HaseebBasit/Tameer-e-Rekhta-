import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
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
      process.env.VOLUNTEER_RECIPIENT_EMAIL || "haseebbasit2717@gmail.com";
    const submissionDate = new Date().toLocaleString("en-PK", {
      timeZone: "Asia/Karachi",
      dateStyle: "full",
      timeStyle: "short",
    });

    const emailSubject = `New Volunteer Application: ${fullName} - ${areaOfInterest}`;

    // Plaintext fallback
    const plainText = `
New Volunteer Application - Ta'meer-e-Rekhta

Full Name: ${fullName}
Email: ${email}
Phone / WhatsApp: ${phone}
City: ${city}
Age: ${age || "Not specified"}
Area of Interest: ${areaOfInterest}
Motivation: ${motivation || "None provided"}
Submitted At: ${submissionDate}
    `.trim();

    // HTML Email Template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${emailSubject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="background: #0D5C3A; padding: 28px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">تعمیرِ ریختہ | Ta'meer-e-Rekhta</h1>
      <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; font-weight: 500;">New Volunteer Application Received</p>
    </div>

    <div style="padding: 28px 24px;">
      <p style="margin-top: 0; font-size: 15px; line-height: 1.6; color: #475569;">
        A new volunteer has submitted their registration through the website. Here are their details:
      </p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
        <tbody>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 8px; font-weight: 600; color: #64748b; width: 38%;">Full Name</td>
            <td style="padding: 12px 8px; font-weight: 700; color: #0f172a;">${fullName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 8px; font-weight: 600; color: #64748b;">Email Address</td>
            <td style="padding: 12px 8px;">
              <a href="mailto:${email}" style="color: #0D5C3A; text-decoration: none; font-weight: 600;">${email}</a>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 8px; font-weight: 600; color: #64748b;">Phone / WhatsApp</td>
            <td style="padding: 12px 8px; font-weight: 600; color: #0f172a;">
              <a href="https://wa.me/${phone.replace(/[^0-9]/g, "")}" target="_blank" style="color: #0D5C3A; text-decoration: none;">${phone}</a>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 8px; font-weight: 600; color: #64748b;">City</td>
            <td style="padding: 12px 8px; color: #0f172a;">${city}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 8px; font-weight: 600; color: #64748b;">Age</td>
            <td style="padding: 12px 8px; color: #0f172a;">${age || "Not specified"}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 8px; font-weight: 600; color: #64748b;">Area of Interest</td>
            <td style="padding: 12px 8px;">
              <span style="display: inline-block; background-color: #ecfdf5; color: #065f46; font-weight: 700; padding: 4px 10px; border-radius: 9999px; font-size: 13px;">
                ${areaOfInterest}
              </span>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 8px; font-weight: 600; color: #64748b; vertical-align: top;">Why Join / Motivation</td>
            <td style="padding: 12px 8px; color: #334155; line-height: 1.5; white-space: pre-wrap;">${motivation || "None provided"}</td>
          </tr>
          <tr>
            <td style="padding: 12px 8px; font-weight: 600; color: #94a3b8;">Submission Date</td>
            <td style="padding: 12px 8px; font-size: 13px; color: #64748b;">${submissionDate}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
      This email was automatically generated by the <strong>Ta'meer-e-Rekhta</strong> web platform.
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
      // Send via Nodemailer SMTP
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
        from: `"${fullName} (Ta'meer Volunteer)" <${process.env.SMTP_USER}>`,
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
      // Determine request origin and referer so the external service accepts the dispatch
      const host = req.headers.get("host") || "localhost:3000";
      const protocol = host.includes("localhost") ? "http" : "https";
      const origin = req.headers.get("origin") || `${protocol}://${host}`;
      const referer = req.headers.get("referer") || `${origin}/volunteer`;
      const userAgent =
        req.headers.get("user-agent") ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

      // Send via server-side direct delivery endpoint to recipient email
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
            _template: "table",
            _replyto: email,
            "Full Name": fullName,
            "Email Address": email,
            "Phone / WhatsApp": phone,
            "City": city,
            "Age": age || "Not specified",
            "Area of Interest": areaOfInterest,
            "Why Join / Motivation": motivation || "None provided",
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
