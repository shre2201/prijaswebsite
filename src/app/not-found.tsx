import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="bg-paper min-h-[70vh] flex items-center">
        <div className="shell py-32">
          <p className="eyebrow mb-5">404</p>
          <h1 className="display-lg text-ink max-w-[30rem]">This page isn’t on the shelf.</h1>
          <p className="mt-5 text-stone max-w-[28rem]">The link may be old, or the page has moved.</p>
          <div className="mt-8 flex flex-wrap gap-5 items-center">
            <Link href="/" className="inline-flex items-center h-12 px-7 rounded-full bg-moss text-paper hover:bg-ink transition-colors">Go to the homepage</Link>
            <Link href="/#consultation" className="text-link text-ink">Book a consultation</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
