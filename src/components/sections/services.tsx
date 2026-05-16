"use client";
import { motion } from "framer-motion";
import { Clock, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export interface PublicService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

export function ServicesSection({ services }: { services: PublicService[] }) {
  if (services.length === 0) return null;

  return (
    <section id="services" className="bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">Treatments</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">Our Services</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs sm:text-right leading-relaxed">
            Book a consultation to discuss which treatment is right for your skin.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((svc, i) => (
            <motion.div
              key={svc.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="group bg-gradient-to-br from-green-50 to-emerald-50/60 border border-green-200/60 rounded-2xl p-5 hover:shadow-lg hover:shadow-green-100/60 hover:-translate-y-1 hover:border-green-300/70 transition-all duration-200 flex flex-col"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
              </div>

              <h3 className="font-semibold text-foreground text-[15px] mb-2 leading-snug">{svc.name}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed flex-1 mb-4">{svc.description}</p>

              <div className="flex items-center justify-between pt-3 border-t border-green-200/50">
                <div>
                  <p className="font-bold text-foreground">{formatPrice(svc.price)}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" /> {svc.duration} min
                  </p>
                </div>
                <Link
                  href="/#consultation"
                  className="flex items-center gap-1 text-[12px] font-medium text-primary border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  Book <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
