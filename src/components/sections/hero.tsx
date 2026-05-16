"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const TRUST_PILLS = ["100% Natural", "No Parabens", "Cruelty Free", "Certified Expert"];

export function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-cream via-white to-green-50/60">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/6 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-sage/8 blur-[80px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-20">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-5"
        >
          <div className="inline-flex items-center gap-1.5 bg-primary/8 text-primary border border-primary/15 rounded-full px-3.5 py-1 text-xs font-medium">
            <Sparkles className="h-3 w-3" />
            Personalized Natural Skincare
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-foreground leading-[1.15] text-balance">
            Where skincare meets nutrition and knowledge, <br className="hidden sm:block" />
            <span className="text-primary italic">Glow</span> begins within.
          </h1>

          <p className="text-[15px] text-muted-foreground leading-relaxed max-w-md">
            Discover the power of nature with Prijas Organic Skincare, specialising in 100% Organic Skin and Scalp Treatments by Harsheen Kaur.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {TRUST_PILLS.map((pill) => (
              <span key={pill} className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground/60 bg-white border border-border/50 rounded-full px-3 py-1">
                <Leaf className="h-2.5 w-2.5 text-primary" />
                {pill}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Button className="rounded-full h-11 px-7 text-[13px]" asChild>
              <Link href="/#consultation">
                Book free consultation
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button variant="outline" className="rounded-full h-11 px-7 text-[13px]" asChild>
              <Link href="/#products">Explore products</Link>
            </Button>
          </div>
        </motion.div>

        {/* Right — brand visual */}
        <motion.div
          className="relative flex justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-72 h-72 sm:w-80 sm:h-80"
          >
            <div className="w-full h-full rounded-[2.5rem] bg-gradient-to-br from-primary/15 via-sage/10 to-cream shadow-xl shadow-primary/10 overflow-hidden flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Prijas Skincare"
                width={160}
                height={160}
                className="object-contain opacity-90"
              />
            </div>

            {/* Floating cards */}
            <motion.div
              className="absolute -left-10 top-1/4 bg-white rounded-2xl shadow-lg shadow-black/8 px-4 py-3 min-w-[108px] border border-border/30"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xl font-bold text-primary leading-none">500+</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Happy clients</p>
            </motion.div>

            <motion.div
              className="absolute -right-8 bottom-1/4 bg-white rounded-2xl shadow-lg shadow-black/8 px-4 py-3 min-w-[108px] border border-border/30"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 }}
            >
              <p className="text-xl font-bold text-primary leading-none">4.9 ★</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Avg. rating</p>
            </motion.div>

            <motion.div
              className="absolute -top-4 right-6 bg-primary text-primary-foreground rounded-xl shadow-lg px-3 py-2 border border-primary/20"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center gap-1.5">
                <Shield className="h-3 w-3" />
                <p className="text-[11px] font-medium">100% Natural</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-muted-foreground/30" />
      </motion.div>
    </section>
  );
}
