"use client";
import { motion } from "framer-motion";
import { Calendar, MessageSquare, Package, RefreshCcw } from "lucide-react";

const STEPS = [
  {
    icon: Calendar,
    num: "01",
    title: "Book a consultation",
    desc: "Pick a time that works. Video, phone, or in-person, your choice.",
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    icon: MessageSquare,
    num: "02",
    title: "Skin analysis",
    desc: "A 30-minute session about your skin type, concerns, lifestyle, and goals.",
    color: "bg-primary/8 text-primary border-primary/15",
  },
  {
    icon: Package,
    num: "03",
    title: "Receive your products",
    desc: "Your formula is handcrafted and delivered within 5–7 days.",
    color: "bg-orange-50 text-orange-600 border-orange-100",
  },
  {
    icon: RefreshCcw,
    num: "04",
    title: "Refine & reorder",
    desc: "We track your progress. Formulas evolve as your skin does.",
    color: "bg-purple-50 text-purple-600 border-purple-100",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-cream/25">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">The Process</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-3">
            From conversation to custom skincare
          </h2>
          <p className="text-[14px] text-muted-foreground max-w-sm mx-auto">
            Four simple steps from knowing nothing about your skin to having products made exactly for it.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector */}
          <div className="absolute top-10 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px bg-gradient-to-r from-transparent via-border to-transparent hidden lg:block" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="flex flex-col items-center text-center"
              >
                <div className={`relative z-10 h-20 w-20 rounded-2xl border ${step.color} flex flex-col items-center justify-center mb-4 shadow-sm`}>
                  <step.icon className="h-7 w-7" />
                  <span className="text-[10px] font-bold mt-0.5 opacity-50">{step.num}</span>
                </div>
                <h3 className="text-[14px] font-semibold text-foreground mb-1.5">{step.title}</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed max-w-[180px]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
