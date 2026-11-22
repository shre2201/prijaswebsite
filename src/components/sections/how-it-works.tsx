// A genuine four-step sequence, so the numbering is real.
const STEPS = [
  {
    title: "Book a consultation",
    desc: "Pick a time that suits you. Talk over video, on the phone, or in person.",
    meta: "Online or in person",
  },
  {
    title: "Talk it through",
    desc: "Thirty minutes on your skin type, what’s bothering you, your lifestyle and what you’d like to change.",
    meta: "30 min",
  },
  {
    title: "Your formula is made",
    desc: "Harsheen blends your products by hand and sends them to you.",
    meta: "5–7 days",
  },
  {
    title: "Adjust as you go",
    desc: "We check in on how your skin is responding. When it changes, so does the formula.",
    meta: "Ongoing",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-paper">
      <div className="shell grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-10 py-20 sm:py-24 lg:py-32">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow mb-5">How it works</p>
            <h2 className="display-lg text-ink text-balance">
              From a conversation to a jar on your shelf.
            </h2>
          </div>
        </div>

        <ol className="lg:col-span-7 lg:col-start-6 border-t border-ink/15">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="grid grid-cols-[3rem_1fr] sm:grid-cols-[5rem_1fr_auto] gap-x-4 sm:gap-x-6 py-7 sm:py-9 border-b border-ink/15"
            >
              <span className="font-display font-light text-[2rem] sm:text-[2.6rem] leading-none text-clay" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3 className="font-display text-[1.3rem] sm:text-[1.45rem] leading-tight text-ink">{step.title}</h3>
                <p className="mt-2 text-[0.98rem] leading-[1.7] text-stone max-w-[30rem]">{step.desc}</p>
                <p className="sm:hidden mt-3 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink/70">{step.meta}</p>
              </div>
              <span className="hidden sm:block font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink/70 pt-2 whitespace-nowrap">
                {step.meta}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
