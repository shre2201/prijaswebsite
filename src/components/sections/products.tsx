import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface PublicProduct {
  id: string;
  name: string;
  description: string;
  images: string[];
}

// Display only: nothing is sold off the shelf. Every product is mixed after a consultation.
export function ProductsSection({ products }: { products: PublicProduct[] }) {
  return (
    <section id="products" className="bg-paper border-t border-ink/10">
      <div className="shell py-20 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-6 mb-14 items-end">
          <div className="lg:col-span-6">
            <p className="eyebrow mb-5">What Harsheen makes</p>
            <h2 className="display-lg text-ink text-balance">Mixed by hand, once we know your skin.</h2>
          </div>
          <p className="lg:col-span-5 lg:col-start-8 text-[1rem] leading-[1.7] text-stone">
            These are the things Harsheen mixes most often. None of them leaves the studio until
            you’ve had your consultation, because each jar is adjusted to the skin it’s going to.
          </p>
        </div>

        {products.length === 0 ? (
          <p className="py-16 text-center text-stone max-w-md mx-auto">
            Book a consultation and we’ll talk through what to make for you.
          </p>
        ) : (
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 sm:gap-x-6">
            {products.map((product) => (
              <li key={product.id} className="group">
                <div className="relative aspect-square overflow-hidden rounded-[2px] bg-[#EFE6DA]">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-contain p-[6%] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-display italic text-[1.1rem] text-stone px-4 text-center">
                      {product.name}
                    </div>
                  )}
                </div>
                <h3 className="mt-4 font-display text-[1.12rem] sm:text-[1.2rem] leading-snug text-ink">{product.name}</h3>
                {product.description && (
                  <p className="mt-1.5 text-[0.9rem] leading-[1.6] text-stone line-clamp-2">{product.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-16 pt-8 border-t border-ink/15 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <p className="font-display italic text-[1.2rem] sm:text-[1.35rem] text-ink max-w-[34rem]">
            Not sure which of these you need? That’s what the consultation is for.
          </p>
          <Link
            href="/#consultation"
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-moss text-paper text-[0.92rem] hover:bg-ink transition-colors self-start sm:self-auto shrink-0"
          >
            Book your consultation <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
