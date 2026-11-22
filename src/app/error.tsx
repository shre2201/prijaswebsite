"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="bg-paper min-h-screen flex items-center">
      <div className="shell py-32">
        <p className="eyebrow mb-5">Something went wrong</p>
        <h1 className="display-lg text-ink max-w-[30rem]">Sorry — this page didn’t load.</h1>
        <p className="mt-5 text-stone max-w-[30rem]">
          Please try again. If it keeps happening, call us on{" "}
          <a href="tel:+917021827174" className="text-link text-ink">+91 70218 27174</a>.
        </p>
        <div className="mt-8 flex flex-wrap gap-5 items-center">
          <button onClick={reset} className="inline-flex items-center h-12 px-7 rounded-full bg-moss text-paper hover:bg-ink transition-colors">Try again</button>
          <Link href="/" className="text-link text-ink">Go to the homepage</Link>
        </div>
      </div>
    </main>
  );
}
