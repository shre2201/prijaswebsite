import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
}

// Use onboarding@resend.dev until prijas.in domain is verified in Resend dashboard
// After verifying the domain, change to: Prijas Skincare <hello@prijas.in>
const FROM = "Prijas Skincare <onboarding@resend.dev>";

export async function sendBookingConfirmation({
  to,
  name,
  date,
  timeSlot,
  mode,
}: {
  to: string;
  name: string;
  date: string;
  timeSlot: string;
  mode: string;
}) {
  const modeLabel: Record<string, string> = {
    VIDEO: "Video call",
    PHONE: "Phone call",
    IN_PERSON: "In-person visit",
  };

  return getResend().emails.send({
    from: FROM,
    to,
    subject: "Your skin consultation is confirmed ✓ — Prijas",
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#2d6a4f,#40916c);padding:32px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:600;letter-spacing:-0.3px">Your consultation is confirmed 🌿</h1>
    </div>
    <div style="padding:32px">
      <p style="color:#374151;font-size:15px;margin:0 0 24px">Hi <strong>${name}</strong>, we're looking forward to meeting you!</p>

      <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;width:90px">Date</td>
            <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600">${date}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;border-top:1px solid #e5e7eb">Time</td>
            <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;border-top:1px solid #e5e7eb">${timeSlot}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;border-top:1px solid #e5e7eb">Mode</td>
            <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;border-top:1px solid #e5e7eb">${modeLabel[mode] ?? mode}</td>
          </tr>
        </table>
      </div>

      <p style="color:#6b7280;font-size:13px;line-height:1.7;margin:0 0 16px">
        We'll send you joining details (link or address) <strong>24 hours before</strong> your session. If you need to reschedule, just reply to this email.
      </p>

      <div style="background:#f0fdf4;border-left:3px solid #2d6a4f;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:24px">
        <p style="margin:0;color:#166534;font-size:13px;font-weight:500">💡 Before your session</p>
        <p style="margin:6px 0 0;color:#15803d;font-size:12px;line-height:1.6">
          Try to observe your skin for a day or two — redness, oiliness patterns, reactions to products. It helps us give you a much better consultation.
        </p>
      </div>

      <p style="color:#9ca3af;font-size:12px;margin:0">See you soon,<br><strong style="color:#2d6a4f">The Prijas Team</strong></p>
    </div>
  </div>
</body>
</html>`,
  });
}

export async function sendOrderConfirmation({
  to,
  name,
  orderId,
  total,
}: {
  to: string;
  name: string;
  orderId: string;
  total: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Order confirmed #${orderId.slice(-8).toUpperCase()} — Prijas`,
    html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#2d6a4f,#40916c);padding:32px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:600">Thank you for your order 🧴</h1>
    </div>
    <div style="padding:32px">
      <p style="color:#374151;font-size:15px;margin:0 0 20px">Hi <strong>${name}</strong>, your order has been confirmed.</p>
      <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="margin:0;color:#6b7280;font-size:13px">Order ID</p>
        <p style="margin:4px 0 0;color:#111827;font-size:15px;font-weight:700">#${orderId.slice(-8).toUpperCase()}</p>
        <p style="margin:12px 0 0;color:#6b7280;font-size:13px">Total paid</p>
        <p style="margin:4px 0 0;color:#2d6a4f;font-size:18px;font-weight:700">${total}</p>
      </div>
      <p style="color:#6b7280;font-size:13px;line-height:1.7">We'll update you with tracking details once your order ships. Questions? Just reply to this email.</p>
      <p style="color:#9ca3af;font-size:12px;margin:20px 0 0">With love,<br><strong style="color:#2d6a4f">The Prijas Team</strong></p>
    </div>
  </div>
</body>
</html>`,
  });
}

export async function sendTestimonialApproved({ to, name }: { to: string; name: string }) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: "Your review is now live on Prijas ✓",
    html: `<div style="font-family:sans-serif;max-width:480px;margin:40px auto;padding:32px;background:#fff;border-radius:16px">
      <h2 style="color:#2d6a4f;margin:0 0 12px">Your review is live 🌿</h2>
      <p style="color:#374151;font-size:14px">Hi <strong>${name}</strong>, thank you for sharing your experience with Prijas. Your review has been approved and is now visible on our website.</p>
      <p style="color:#6b7280;font-size:13px;margin-top:16px">— The Prijas Team</p>
    </div>`,
  });
}

export async function sendTestimonialFollowUp({ to, name }: { to: string; name: string }) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: "We'd love to hear more — Prijas",
    html: `<div style="font-family:sans-serif;max-width:480px;margin:40px auto;padding:32px;background:#fff;border-radius:16px">
      <h2 style="color:#2d6a4f;margin:0 0 12px">We'd love to connect 💬</h2>
      <p style="color:#374151;font-size:14px">Hi <strong>${name}</strong>, thank you for sharing your feedback with us. We noticed some concerns in your review and we'd love to understand better and help resolve them.</p>
      <p style="color:#374151;font-size:14px;margin-top:12px">Please reply to this email or reach out to us — we're here to make things right.</p>
      <p style="color:#6b7280;font-size:13px;margin-top:16px">— The Prijas Team</p>
    </div>`,
  });
}
