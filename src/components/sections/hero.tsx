"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ease = [0.22, 1, 0.36, 1] as const;

// An illustrative slip showing what a personal formula looks like.
// Clearly labelled as an example on the page.
const SLIP = [
  { k: "Skin", v: "Combination, tans easily, tight by evening" },
  { k: "From the chat", v: "Long commute, little water, late dinners" },
  { k: "Mixed", v: "Orange peel & aloe day gel · a richer night cream" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-paper grain">
      <div className="shell grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-12 pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24 items-end">
        {/* Copy */}
        <div className="lg:col-span-6 xl:col-span-6 lg:pb-10">
          <motion.p
            className="eyebrow mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease }}
          >
            Organic skin &amp; scalp care · by Harsheen Kaur
          </motion.p>

          <h1 className="display-xl text-ink text-balance">
            {["Made for your skin,", "and nobody else’s."].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className={i === 1 ? "block italic" : "block"}
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease }}
          >
            <p className="mt-7 max-w-[34rem] text-[1.05rem] leading-[1.7] text-stone">
              Every jar starts with a conversation. Harsheen, a certified esthetician and
              nutritionist, asks about your skin, what you eat and how you live — then blends
              your creams, gels and scrubs by hand, in small batches, for you alone.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-7">
              <Button className="h-12 px-7 text-[0.92rem]" asChild>
                <Link href="/#consultation">
                  Book a consultation
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              </Button>
              <Link href="/#products" className="text-link text-[0.92rem] text-ink self-start sm:self-auto py-2">
                Or see what she makes
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Image + formulation slip */}
        <div className="lg:col-span-6 xl:col-span-5 xl:col-start-8 relative">
          <motion.div
            className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px] bg-travertine"
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            transition={{ duration: 1.1, delay: 0.2, ease }}
          >
            <Image
              src="/products/752b1108-92b0-4a5e-ac22-1718831b6216.png"
              alt="A jar of Prijas orange gel on travertine stone, surrounded by fresh oranges and mint"
              fill
              priority
              sizes="(min-width: 1280px) 40vw, (min-width: 1024px) 48vw, 100vw"
              className="object-cover object-[0%_50%]"
            />
          </motion.div>

          <motion.figure
            className="relative -mt-16 ml-4 mr-4 sm:ml-auto sm:mr-8 sm:max-w-[20rem] xl:absolute xl:-left-28 xl:-bottom-8 xl:m-0 xl:max-w-[18rem] bg-[#FBF8F3] border border-border px-5 py-5 shadow-[0_18px_40px_-22px_rgba(37,32,27,0.35)] -rotate-[1.2deg]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85, ease }}
          >
            <figcaption className="flex items-baseline justify-between border-b border-dashed border-border pb-2.5 mb-3">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-clay">Formulation slip</span>
              <span className="font-mono text-[0.68rem] text-stone">example</span>
            </figcaption>
            <dl className="space-y-2.5">
              {SLIP.map((row) => (
                <div key={row.k} className="grid grid-cols-[6.5rem_1fr] gap-2">
                  <dt className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-stone pt-[3px]">{row.k}</dt>
                  <dd className="text-[0.86rem] leading-snug text-ink">{row.v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 pt-3 border-t border-dashed border-border font-display italic text-[1.05rem] text-ink/80">
              — batch of one, H.K.
            </p>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
