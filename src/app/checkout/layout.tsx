import { redirect } from "next/navigation";
import { ONLINE_ORDERS_ENABLED } from "@/lib/features";

export const dynamic = "force-dynamic";

// Online ordering is off — send anyone who lands here to the consultation form.
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  if (!ONLINE_ORDERS_ENABLED) redirect("/#consultation");
  return <>{children}</>;
}
