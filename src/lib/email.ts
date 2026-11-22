import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
}

/**
 * Sender address. Resend's test sender (onboarding@resend.dev) ONLY delivers to the
 * email address that owns the Resend account — real clients won't receive anything.
 * Verify your domain in Resend, then set EMAIL_FROM, e.g. "Prijas Skincare <hello@yourdomain.in>".
 */
const FROM = process.env.EMAIL_FROM || "Prijas Skincare <onboarding@resend.dev>";

/** Where new-booking alerts go. */
const STUDIO_EMAIL = process.env.STUDIO_EMAIL || "prijasskincare@gmail.com";

const MODE_LABEL: Record<string, string> = { VIDEO: "Video call", PHONE: "Phone call", IN_PERSON: "In person, at the studio" };

/** Escape anything a visitor typed before it goes into an email. */
function esc(v: string) {
  return v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Send through Resend; never throws, logs why if it couldn't send. */
async function send(msg: { to: string; subject: string; html: string; replyTo?: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`[email] RESEND_API_KEY is not set — "${msg.subject}" to ${msg.to} was NOT sent.`);
    return { ok: false as const };
  }
  try {
    const { error } = await getResend().emails.send({ from: FROM, ...msg });
    if (error) {
      console.error(`[email] Resend rejected "${msg.subject}" to ${msg.to}:`, error.message);
      return { ok: false as const };
    }
    return { ok: true as const };
  } catch (e) {
    console.error(`[email] Failed to send "${msg.subject}" to ${msg.to}:`, e);
    return { ok: false as const };
  }
}

/** Shared layout in the website's palette (paper, ink, moss, clay). */
function layout(heading: string, body: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4EEE4;font-family:'Helvetica Neue',Arial,sans-serif;color:#25201B">
  <div style="max-width:540px;margin:0 auto;padding:40px 24px">
    <p style="margin:0 0 28px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#25201B">Prijas</p>
    <div style="background:#FBF8F3;border:1px solid #D9CDBA;padding:32px 28px">
      <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:26px;line-height:1.25;color:#25201B">${heading}</h1>
      ${body}
    </div>
    <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#665C51">
      Prijas Organic Skincare by Harsheen Kaur · +91 70218 27174 · prijasskincare@gmail.com
    </p>
  </div>
</body></html>`;
}

function detailsTable(rows: [string, string][]) {
  return `<table style="width:100%;border-collapse:collapse;margin:0 0 22px;border-top:1px solid #D9CDBA">
    ${rows
      .map(
        ([k, v]) => `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #D9CDBA;font-family:'Courier New',monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#A04B27;width:110px;vertical-align:top">${k}</td>
      <td style="padding:10px 0;border-bottom:1px solid #D9CDBA;font-size:14px;color:#25201B">${v}</td></tr>`
      )
      .join("")}
  </table>`;
}

const p = (t: string) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#25201B">${t}</p>`;
const muted = (t: string) => `<p style="margin:0 0 16px;font-size:13px;line-height:1.65;color:#665C51">${t}</p>`;

interface BookingMail {
  to: string;
  name: string;
  date: string;
  timeSlot: string;
  mode: string;
}

/** To the client, right after they book: request received (Harsheen confirms it next). */
export async function sendBookingConfirmation({ to, name, date, timeSlot, mode }: BookingMail) {
  return send({
    to,
    subject: "We’ve received your consultation request — Prijas",
    replyTo: STUDIO_EMAIL,
    html: layout(
      "Thank you — your request is in.",
      p(`Hi ${esc(name)}, thank you for booking a consultation with Harsheen.`) +
        detailsTable([["Date", esc(date)], ["Time", esc(timeSlot)], ["How", MODE_LABEL[mode] ?? esc(mode)]]) +
        p("Harsheen will confirm the time with you shortly. If anything needs to change, just reply to this email.") +
        muted("Before you talk: notice how your skin behaves for a day or two — where it gets oily or dry, and anything that irritates it. It makes the conversation far more useful.")
    ),
  });
}

/** To the studio: a new booking came in. Reply goes straight to the client. */
export async function sendBookingNotification(b: BookingMail & { phone: string; concerns: string[]; notes?: string | null }) {
  return send({
    to: STUDIO_EMAIL,
    replyTo: b.to,
    subject: `New consultation: ${b.name} — ${b.date}, ${b.timeSlot}`,
    html: layout(
      "New consultation booked",
      detailsTable([
        ["Name", esc(b.name)],
        ["Date", esc(b.date)],
        ["Time", esc(b.timeSlot)],
        ["How", MODE_LABEL[b.mode] ?? esc(b.mode)],
        ["Phone", `<a href="tel:${esc(b.phone)}" style="color:#2D3E2B">${esc(b.phone)}</a>`],
        ["Email", `<a href="mailto:${esc(b.to)}" style="color:#2D3E2B">${esc(b.to)}</a>`],
        ["Concerns", esc(b.concerns.join(", ") || "—")],
        ...(b.notes ? ([["Notes", esc(b.notes)]] as [string, string][]) : []),
      ]) + muted("Confirm it in the admin panel under Bookings — the client gets an email when you do."),
    ),
  });
}

/** To the client when Harsheen confirms or cancels in the admin panel. */
export async function sendBookingStatusUpdate({ to, name, date, timeSlot, mode, status }: BookingMail & { status: "CONFIRMED" | "CANCELLED" }) {
  const confirmed = status === "CONFIRMED";
  return send({
    to,
    replyTo: STUDIO_EMAIL,
    subject: confirmed ? "Your consultation is confirmed — Prijas" : "Your consultation has been cancelled — Prijas",
    html: layout(
      confirmed ? "You’re confirmed." : "Your consultation was cancelled.",
      p(`Hi ${esc(name)},`) +
        detailsTable([["Date", esc(date)], ["Time", esc(timeSlot)], ["How", MODE_LABEL[mode] ?? esc(mode)]]) +
        (confirmed
          ? p("See you then. You’ll get the call link or studio address before your session — reply to this email if you need to reschedule.")
          : p("If you’d like to pick another time, you can book again on the website or simply reply to this email."))
    ),
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
