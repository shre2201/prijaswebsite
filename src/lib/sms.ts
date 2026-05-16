// Twilio removed — replaced with WhatsApp Business API when ready.
// Booking notifications are handled via email (Resend) for now.

type SmsArgs = { to: string; name: string; date: string; timeSlot: string };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sendBookingSMS(_args: SmsArgs) { /* stub */ }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sendBookingWhatsApp(_args: SmsArgs) { /* stub */ }
