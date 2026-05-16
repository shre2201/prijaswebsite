"use client";
import { motion } from "framer-motion";
import { Leaf, Heart, Shield, Sparkles } from "lucide-react";
import Image from "next/image";

const VALUES = [
  { icon: Leaf, title: "100% Natural", desc: "No sulphates, parabens, or synthetic fragrances. Every ingredient is carefully sourced." },
  { icon: Heart, title: "Small-batch crafted", desc: "Handmade in small batches to ensure freshness and quality in every bottle." },
  { icon: Shield, title: "Expert Certified", desc: "Certified Skincare Esthetician & Nutritionist." },
  { icon: Sparkles, title: "Truly personalized", desc: "No two skins are the same. Neither are our products." },
];

export function AboutSection() {
  return (
    <section id="about" className="bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center max-w-4xl mx-auto">
          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-primary/10 via-sage/10 to-cream flex items-center justify-center p-24">
              <div className="w-full h-full rounded-2xl overflow-hidden">
                <Image
                  src="/founder.png"
                  alt="Harsheen Kaur — Founder, Prijas Skincare"
                  width={500}
                  height={625}
                  className="w-full h-full object-cover object-top"
                  priority
                />
              </div>
            </div>
            <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-lg border border-border/30 p-4 max-w-[170px]">
              <p className="text-[13px] font-bold text-foreground">Harsheen Kaur</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">Founder · Certified Esthetician & Nutritionist</p>
            </div>
          </motion.div>

          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="space-y-5"
          >
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">Our Story</p>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground leading-snug">
                Born from years of struggling with the wrong products
              </h2>
            </div>

            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Prijas provides a holistic approach to aesthetics. Experience rejuvenating services designed to nourish and restore your natural radiance. 
            </p>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Prijas is built on one belief: you deserve personalized care, not generic solutions. Every product starts with a conversation.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {VALUES.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="flex gap-2.5 items-start p-3 rounded-xl bg-cream/40 border border-border/30"
                >
                  <div className="mt-0.5 h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <v.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{v.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{v.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
