import { trpc } from "@/lib/trpc";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, ShoppingBag } from "lucide-react";
import { Link } from "wouter";

const SLIDE_DURATION = 6000; // ms per product

const WOOD_LABELS: Record<string, string> = {
  CHERRY: "Cherry", WALNUT: "Walnut", MAPLE: "Maple", MIXED: "Mixed Wood", OTHER: "Other",
};
const CATEGORY_LABELS: Record<string, string> = {
  SPOON: "Spoon", KNIFE: "Knife & Spreader", SCOOP: "Scoop",
  SERVING: "Serving Board", CUSTOM: "Custom Piece",
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default function Kiosk() {
  const { data: products } = trpc.products.list.useQuery({ featured: true, limit: 20 });
  const { data: shows } = trpc.tradeShows.list.useQuery({ activeOnly: true });

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const displayProducts = products ?? [];
  const currentShow = shows?.[0];

  const next = useCallback(() => {
    if (displayProducts.length === 0) return;
    setCurrent((c) => (c + 1) % displayProducts.length);
    setProgress(0);
  }, [displayProducts.length]);

  const prev = useCallback(() => {
    if (displayProducts.length === 0) return;
    setCurrent((c) => (c - 1 + displayProducts.length) % displayProducts.length);
    setProgress(0);
  }, [displayProducts.length]);

  // Auto-advance
  useEffect(() => {
    if (paused || displayProducts.length === 0) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          next();
          return 0;
        }
        return p + (100 / (SLIDE_DURATION / 100));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [paused, next, displayProducts.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === " ") setPaused((p) => !p);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  const product = displayProducts[current];
  const images: string[] = Array.isArray(product?.images) ? product.images : [];

  return (
    <div
      className="relative w-screen h-screen bg-[#1A1008] overflow-hidden select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background image */}
      {images[0] && (
        <div className="absolute inset-0">
          <img
            src={images[0]}
            alt=""
            className="w-full h-full object-cover opacity-30"
            style={{ filter: "blur(2px)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1008] via-[#1A1008]/80 to-transparent" />
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 h-full flex">
        {/* Left: Product info */}
        <div className="flex-1 flex flex-col justify-center px-16 py-12 max-w-2xl">
          {/* Brand */}
          <div className="mb-12">
            <p
              className="text-[#C9A227] text-xs tracking-[0.4em] uppercase mb-1"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Handcrafted in Nebraska
            </p>
            <h1
              className="text-[#F5F0EB] text-3xl font-cinzel"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Mr. Todd's Workshop
            </h1>
          </div>

          {/* Product */}
          {product ? (
            <div key={product.id} className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-[#C9A227] text-xs tracking-[0.3em] uppercase"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {CATEGORY_LABELS[product.category] ?? product.category}
                </span>
                <span className="text-[#5D4037]">·</span>
                <span className="text-xs text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
                  {WOOD_LABELS[product.woodType] ?? product.woodType} Wood
                </span>
              </div>
              <h2
                className="text-[#F5F0EB] text-5xl md:text-6xl font-cinzel leading-tight mb-6"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                {product.name}
              </h2>
              {product.description && (
                <p
                  className="text-[#8D6E63] text-lg leading-relaxed mb-8 max-w-md line-clamp-3"
                  style={{ fontFamily: "Lora, serif" }}
                >
                  {product.description.replace(/<[^>]*>?/gm, '')}
                </p>
              )}
              <div className="flex items-center gap-6">
                <span
                  className="text-[#C9A227] text-4xl font-bold"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {formatPrice(product.price)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.status === "IN_STOCK"
                      ? "bg-emerald-900/40 text-emerald-400"
                      : product.status === "MADE_TO_ORDER"
                      ? "bg-blue-900/40 text-blue-400"
                      : "bg-[#2D1A0E] text-[#8D6E63]"
                  }`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {product.status === "IN_STOCK" ? "In Stock" : product.status === "MADE_TO_ORDER" ? "Made to Order" : product.status}
                </span>
              </div>
            </div>
          ) : (
            <div>
              <h2
                className="text-[#F5F0EB] text-5xl font-cinzel mb-6"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                Hand-Carved Hardwood
              </h2>
              <p className="text-[#8D6E63] text-xl" style={{ fontFamily: "Lora, serif" }}>
                Every piece carved by hand. Every grain unique.
              </p>
            </div>
          )}

          {/* Show info */}
          {currentShow && (
            <div className="mt-10 pt-8 border-t border-[#2D1A0E]">
              <p className="text-xs text-[#5D4037] tracking-widest uppercase mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
                Find us here today
              </p>
              <p className="text-[#D7CCC8] font-cinzel" style={{ fontFamily: "Cinzel, serif" }}>
                {currentShow.name}
                {currentShow.boothNumber && (
                  <span className="text-[#C9A227]"> · Booth {currentShow.boothNumber}</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Right: Product image */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-12">
          {images[0] ? (
            <div className="relative w-full max-w-lg aspect-square">
              <img
                src={images[0]}
                alt={product?.name ?? ""}
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
              {/* Product counter */}
              <div
                className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-[#D7CCC8]"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {current + 1} / {displayProducts.length}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-lg aspect-square rounded-2xl bg-[#2D1A0E] flex items-center justify-center">
              <ShoppingBag className="w-24 h-24 text-[#5D4037]" strokeWidth={1} />
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2D1A0E]">
        <div
          className="h-full bg-[#C9A227] transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slide dots */}
      {displayProducts.length > 1 && (
        <div className="absolute z-50 bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {displayProducts.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setProgress(0); }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? "bg-[#C9A227] w-6" : "bg-[#5D4037] hover:bg-[#8D6E63]"
              }`}
            />
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="absolute z-50 top-6 right-6 flex items-center gap-3">
        <Link 
          href="/"
          className="w-10 h-10 rounded-full bg-[#2D1A0E]/80 backdrop-blur-sm flex items-center justify-center text-[#8D6E63] hover:text-[#F5F0EB] transition-colors"
          title="Exit Kiosk"
        >
          <X className="w-5 h-5" />
        </Link>
      </div>

      {/* Nav arrows */}
      <button
        onClick={prev}
        className="absolute z-50 left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#2D1A0E]/80 backdrop-blur-sm flex items-center justify-center text-[#8D6E63] hover:text-[#F5F0EB] hover:bg-[#5D4037]/80 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute z-50 right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#2D1A0E]/80 backdrop-blur-sm flex items-center justify-center text-[#8D6E63] hover:text-[#F5F0EB] hover:bg-[#5D4037]/80 transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Keyboard hint */}
      <div className="absolute bottom-8 right-6 text-xs text-[#5D4037]" style={{ fontFamily: "Inter, sans-serif" }}>
        ← → navigate · Space pause
      </div>
    </div>
  );
}
