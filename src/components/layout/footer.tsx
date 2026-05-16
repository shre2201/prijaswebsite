import Link from "next/link";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center mb-3">
              <Image
                src="/logo.png"
                alt="Prijas Skincare"
                width={56}
                height={56}
                className="object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-background/60 max-w-xs leading-relaxed">
              Natural, personalized skincare rooted in tradition and backed by science. Every product, crafted for you.
            </p>
            <div className="flex flex-col gap-2 mt-4">
              <a href="mailto:prijasskincare@gmail.com" className="text-background/60 hover:text-primary transition-colors flex items-center gap-2 text-xs">
                <Mail className="h-3.5 w-3.5" /> prijasskincare@gmail.com
              </a>
              <a href="tel:+917021827174" className="text-background/60 hover:text-primary transition-colors flex items-center gap-2 text-xs">
                <Phone className="h-3.5 w-3.5" /> +91 70218 27174
              </a>
              <a href="https://www.instagram.com/prijas.skincare/" target="_blank" rel="noreferrer" className="text-background/60 hover:text-primary transition-colors flex items-center gap-2 text-xs">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg>
                @prijas.skincare
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><Link href="/#about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link href="/#products" className="hover:text-primary transition-colors">Products</Link></li>
              <li><Link href="/#services" className="hover:text-primary transition-colors">Services</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/#consultation" className="hover:text-primary transition-colors">Book Consultation</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><a href="mailto:prijasskincare@gmail.com" className="hover:text-primary transition-colors">prijasskincare@gmail.com</a></li>
              <li><a href="tel:+917021827174" className="hover:text-primary transition-colors">+91 70218 27174</a></li>
              <li className="text-background/40 text-xs leading-relaxed pt-1">
                For orders, consultations, and support — we typically reply within 24 hours.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-background/40">
          <span>© {new Date().getFullYear()} Prijas Skincare. All rights reserved.</span>
          <span>Natural · Handcrafted · Made for you</span>
        </div>
      </div>
    </footer>
  );
}
