import Link from "next/link";
import Image from "next/image";

const EXPLORE = [
  { label: "Harsheen", href: "/#about" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Shop", href: "/#products" },
  { label: "Treatments", href: "/#services" },
  { label: "Journal", href: "/blog" },
];

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="shell pt-20 pb-10 sm:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-14">
          <div className="lg:col-span-7">
            <p className="font-display font-light text-[2rem] sm:text-[2.6rem] leading-[1.15] tracking-[-0.01em] text-balance max-w-[34rem]">
              Questions before you book? Write to us, and you’ll hear back from Harsheen.
            </p>
            <a
              href="mailto:prijasskincare@gmail.com"
              className="inline-block mt-8 font-display italic text-[1.25rem] sm:text-[1.5rem] text-[#E8B796] underline decoration-1 underline-offset-[6px] decoration-[#E8B796]/40 hover:decoration-[#E8B796] break-all"
            >
              prijasskincare@gmail.com
            </a>
          </div>

          <nav className="lg:col-span-2 lg:col-start-9" aria-label="Footer">
            <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-paper/60 mb-4">Explore</h2>
            <ul className="space-y-1">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-block py-1.5 text-[0.95rem] text-paper/85 hover:text-paper transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-2">
            <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-paper/60 mb-4">Contact</h2>
            <ul className="space-y-1 text-[0.95rem]">
              <li>
                <a href="tel:+917021827174" className="inline-block py-1.5 text-paper/85 hover:text-paper transition-colors">
                  +91 70218 27174
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/prijas.skincare/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block py-1.5 text-paper/85 hover:text-paper transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <Link href="/#consultation" className="inline-block py-1.5 text-paper/85 hover:text-paper transition-colors">
                  Book a consultation
                </Link>
              </li>
            </ul>
            <p className="mt-4 text-[0.85rem] leading-relaxed text-paper/60">We usually reply within a day.</p>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-paper/15 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-paper">
              <Image src="/logo.png" alt="" width={30} height={29} className="object-contain" />
            </span>
            <span className="font-display text-[1.6rem] leading-none">Prijas</span>
          </Link>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-paper/50">
            © {new Date().getFullYear()} Prijas Skincare · Mixed by hand
          </p>
        </div>
      </div>
    </footer>
  );
}
