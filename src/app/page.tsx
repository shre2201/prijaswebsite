import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { ProductsSection } from "@/components/sections/products";
import { ServicesSection } from "@/components/sections/services";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { ConsultationBookingSection } from "@/components/sections/consultation-booking";
import { BlogPreviewSection } from "@/components/sections/blog-preview";

export default async function HomePage() {
  const [rawProducts, posts, dbTestimonials, rawServices] = await Promise.all([
    db.product.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        price: true,
        comparePrice: true,
        category: true,
        isFeatured: true,
        stock: true,
        images: true,
      },
    }),
    db.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true, title: true, slug: true, excerpt: true, tags: true, publishedAt: true },
    }),
    db.testimonial.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, name: true, concern: true, quote: true, rating: true },
    }),
    db.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, description: true, price: true, duration: true },
    }),
  ]);

  const services = rawServices.map((s) => ({ ...s, price: Number(s.price) }));

  // Decimal → number for client component serialization
  const products = rawProducts.map((p) => ({
    ...p,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
  }));

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <HowItWorksSection />
        <ProductsSection products={products} />
        <ServicesSection services={services} />
        <TestimonialsSection dbTestimonials={dbTestimonials} />
        <ConsultationBookingSection />
        <BlogPreviewSection posts={posts} />
      </main>
      <Footer />
    </>
  );
}
