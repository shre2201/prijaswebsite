import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Mail, Clock, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-[2rem] font-light text-ink">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Current store configuration</p>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <p>These settings reflect the current configuration. To update contact details, consultation hours, or notification preferences, edit your <code className="font-mono text-xs bg-blue-100 px-1 py-0.5 rounded">.env</code> file or contact your developer.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Brand</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Brand Name" value="Prijas Skincare" />
          <Row label="Founder" value="Harsheen Kaur" />
          <Row label="Website" value="prijas.in" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" /> Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Customer email" value="hello@prijas.in" />
          <Row label="Email sender" value="onboarding@resend.dev" note="Verify prijas.in in Resend to use a custom address" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" /> Consultation Slots
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Available hours" value="9:00 AM – 6:00 PM" />
          <Row label="Slot duration" value="30 minutes" />
          <Row label="Modes" value="Video call, Phone call, In person" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" /> Active Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            "Booking confirmation → customer",
            "Order confirmation → customer",
            "Testimonial approval notification → customer",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1 border-b border-border/30 last:border-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <div className="text-right">
        <span className="font-medium">{value}</span>
        {note && <p className="text-[11px] text-muted-foreground mt-0.5">{note}</p>}
      </div>
    </div>
  );
}
