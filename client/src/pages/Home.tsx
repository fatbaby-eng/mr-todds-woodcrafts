import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowRight, ChevronDown, Truck } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import PublicLayout from "@/components/PublicLayout";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663636425749/NnkxhKXWD7fvxT2jVUmqJK/hero-workshop-KY7LMQoA4LrMirx4g7bW3D.webp";
const ABOUT_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663636425749/NnkxhKXWD7fvxT2jVUmqJK/about-workshop-mDbzEm83VeFf26wFs83pMw.webp";

export default function Home() {
  const { data: featuredProducts, isLoading } = trpc.products.list.useQuery({ featured: true, limit: 6 });

  return (
    <PublicLayout>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image — TODO: replace with real workshop photo */}
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Mr. Todd's workshop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#3E2723]/80 via-[#3E2723]/60 to-[#3E2723]/90" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p
            className="text-[#C9A227] text-xs tracking-[0.4em] uppercase mb-6"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Handcrafted in Omaha, Nebraska
          </p>
          <h1
            className="text-[#F5F0EB] text-5xl md:text-7xl lg:text-8xl font-cinzel font-semibold leading-tight mb-6"
            style={{ fontFamily: "Cinzel, serif", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
          >
            Mr. Todd's
            <br />
            <span className="text-[#C9A227]">Woodcrafts</span>
          </h1>
          <p
            className="text-[#D7CCC8] text-lg md:text-xl max-w-2xl mx-auto mb-3 leading-relaxed"
            style={{ fontFamily: "Lora, serif" }}
          >
            Hand-carved kitchen and home objects shaped by the wood as much as the hand. Cherry, walnut, apricot, and other hardwoods. One of one.
          </p>
          <p
            className="text-[#C9A227] text-sm tracking-[0.2em] uppercase mb-10"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Measured in Grain and Grace
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#C9A227] text-[#3E2723] font-semibold text-sm tracking-widest uppercase rounded hover:bg-[#E8C84A] transition-colors"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Shop the Collection
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-8 py-4 border border-[#D7CCC8] text-[#D7CCC8] font-semibold text-sm tracking-widest uppercase rounded hover:bg-white/10 transition-colors"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-[#C9A227]" />
        </div>
      </section>

      {/* ─── Featured Products ────────────────────────────────────────────── */}
      <section className="py-20 bg-[#F5F0EB]">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-[#C9A227] text-xs tracking-[0.3em] uppercase mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
              The Collection
            </p>
            <h2
              className="text-[#3E2723] text-3xl md:text-4xl font-cinzel mb-4 relative inline-block"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Current Pieces
              <span className="block h-0.5 w-16 bg-[#C9A227] mx-auto mt-3" />
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-[#D7CCC8]" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-[#D7CCC8] rounded w-3/4" />
                    <div className="h-3 bg-[#D7CCC8] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-[#3E2723] text-[#3E2723] font-semibold text-sm tracking-widest uppercase rounded hover:bg-[#3E2723] hover:text-[#D7CCC8] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  View Full Collection
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16 max-w-lg mx-auto">
              <p className="text-[#5D4037] text-lg mb-6" style={{ fontFamily: "Lora, serif" }}>
                New pieces coming soon. Sign up below to be notified.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Brand Story ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#3E2723]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              {/* TODO: replace with real workshop photo */}
              <img
                src={ABOUT_IMAGE}
                alt="Todd's workshop"
                className="w-full rounded-lg shadow-2xl object-cover aspect-[4/3]"
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-4 border-[#C9A227] rounded-lg hidden lg:block" />
            </div>
            <div>
              <p className="text-[#C9A227] text-xs tracking-[0.3em] uppercase mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
                The Maker
              </p>
              <h2
                className="text-[#F5F0EB] text-3xl md:text-4xl font-cinzel mb-6 leading-tight"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                Started with
                <br />
                <span className="text-[#C9A227]">Four Trees</span>
              </h2>
              <div className="space-y-4 text-[#D7CCC8]" style={{ fontFamily: "Lora, serif" }}>
                <p className="leading-relaxed">
                  Mr. Todd's Woodcrafts started with trees that died in a yard in southeast Omaha. Two cherry and two apricot, planted by my mother-in-law about 35 years ago, taken down slowly by a nearby walnut. When the trees finally came down I could not bring myself to haul the wood off as firewood.
                </p>
                <p className="leading-relaxed">
                  I have cut down three of the four. The last apricot is still standing, dead, waiting.
                </p>
                <p className="leading-relaxed">
                  The first piece was a cane for her. The second was a baby toy. After that the work just kept going.
                </p>
                <p className="leading-relaxed text-[#8D6E63]">
                  Hand tools mostly. Food-safe oil finishes. The grain decides as much as the maker does. No two pieces come out the same, and they aren't meant to be.
                </p>
              </div>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 mt-8 text-[#C9A227] font-semibold text-sm tracking-widest uppercase hover:gap-3 transition-all"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Read the Full Story
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#C9A227]">
        <div className="container text-center">
          <Truck className="w-10 h-10 text-[#3E2723] mx-auto mb-4" strokeWidth={1.5} />
          <h2
            className="text-[#3E2723] text-2xl md:text-3xl font-cinzel mb-4"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Free Shipping on Orders Over $75
          </h2>
          <p className="text-[#5D4037] mb-8 max-w-md mx-auto" style={{ fontFamily: "Lora, serif" }}>
            Every order ships carefully packaged from Omaha, Nebraska. Checkout is live now with Venmo payments, and made-to-order pieces ship within 2 weeks.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#3E2723] text-[#D7CCC8] font-semibold text-sm tracking-widest uppercase rounded hover:bg-[#5D4037] transition-colors"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Shop Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
