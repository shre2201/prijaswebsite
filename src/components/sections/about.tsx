import Image from "next/image";

const GOES_IN = [
  "Natural ingredients, sourced with care",
  "Blends chosen after your consultation",
  "Small batches, mixed by hand",
];

const STAYS_OUT = ["Sulphates", "Parabens", "Synthetic fragrance", "Testing on animals"];

export function AboutSection() {
  return (
    <section id="about" className="bg-travertine">
      <div className="shell grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-12 py-20 sm:py-24 lg:py-32">
        {/* Portrait — the source is a small selfie, so it's shown modestly in an arch
            with a light grade that pulls its indoor colour toward the site palette. */}
        <figure className="lg:col-span-5 flex flex-col items-center lg:items-start">
          <div className="relative w-full max-w-[19rem] sm:max-w-[21rem]">
            <div
              className="absolute inset-0 translate-x-3 translate-y-3 rounded-t-full border border-clay/50"
              aria-hidden="true"
            />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-full bg-paper">
              <Image
                src="/founder.png"
                alt="Harsheen Kaur, founder of Prijas"
                fill
                sizes="(min-width: 640px) 21rem, 19rem"
                className="object-cover object-[50%_30%] scale-[1.04] [filter:saturate(0.82)_sepia(0.1)_contrast(0.96)_brightness(1.03)]"
              />
            </div>
          </div>
          <figcaption className="mt-7 flex flex-col items-center lg:items-start gap-1 text-center lg:text-left">
            <span className="font-display italic text-[1.35rem] text-ink">Harsheen Kaur</span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-stone">
              Founder · Certified esthetician &amp; nutritionist
            </span>
          </figcaption>
        </figure>

        {/* Story */}
        <div className="lg:col-span-7 lg:pl-6 flex flex-col justify-center">
          <p className="eyebrow mb-5">The person mixing your jar</p>
          <h2 className="display-lg text-ink text-balance max-w-[36rem]">
            Prijas began with years of using the wrong products.
          </h2>

          <div className="mt-8 space-y-5 max-w-[34rem] text-[1.02rem] leading-[1.75] text-stone">
            <p>
              Prijas takes a whole-person view of skin. Harsheen looks at what your skin is doing,
              but also at what you eat, how you sleep and the routine you already have.
            </p>
            <p>
              It’s built on one belief: you deserve personal care, not a generic solution.
              So nothing is mixed until you’ve talked.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-[40rem]">
            <div>
              <h3 className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink mb-3">What goes in</h3>
              <ul className="border-t border-ink/15">
                {GOES_IN.map((item) => (
                  <li key={item} className="py-3 border-b border-ink/15 text-[0.95rem] text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink mb-3">What stays out</h3>
              <ul className="border-t border-ink/15">
                {STAYS_OUT.map((item) => (
                  <li key={item} className="py-3 border-b border-ink/15 text-[0.95rem] text-stone line-through decoration-clay/60 decoration-1">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
