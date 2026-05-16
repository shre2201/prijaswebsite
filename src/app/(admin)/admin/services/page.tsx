import { db } from "@/lib/db";
import { ServicesClient } from "./services-client";

export default async function AdminServicesPage() {
  const services = await db.service.findMany({ orderBy: { createdAt: "asc" } });
  const serialized = services.map((s) => ({ ...s, price: Number(s.price) }));
  return <ServicesClient services={serialized} />;
}
