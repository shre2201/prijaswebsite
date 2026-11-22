import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface PublicService {
  id: string;
  name: string;
  description: string;
}

// Laid out like a treatment-room menu.
export function ServicesSection({ services }: { services: PublicService[] }) {
  if (services.length === 0) return null;

  return (
    <section id="services" className="bg-moss text-paper">
      <div className="shell py-20 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-6 mb-14 items-end">
          <div className="lg:col-span-6">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[#E8B796] mb-5">Treatments</p>
            <h2 className="display-lg text-paper text-balance">In the treatment room.</h2>
          </div>
          <p className="lg:col-span-5 lg:col-start-8 text-[1rem] leading-[1.7] text-paper/75">
            Facials, peels and scalp treatments, done in person. The customised ones use the same
            organic ingredients that go into your jars.
          </p>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-16 border-t border-paper/20">
          {services.map((svc) => (
            <li key={svc.id} className="py-7 border-b border-paper/20">
              <h3 className="font-display text-[1.2rem] sm:text-[1.3rem] leading-snug text-paper">{svc.name}</h3>
              <p className="mt-2 text-[0.95rem] leading-[1.65] text-paper/70 max-w-[32rem]">{svc.description}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <Link
            href="/#consultation"
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-paper text-ink text-[0.92rem] hover:bg-white transition-colors self-start"
          >
            Book a treatment <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <p className="text-[0.92rem] text-paper/70">Not sure which? Ask during your consultation.</p>
        </div>
      </div>
    </section>
  );
}
