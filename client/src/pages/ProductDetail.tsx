import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, ShoppingBag, Clock, Check, ChevronLeft, ChevronRight, Star } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";
import { SITE_CONFIG } from "@shared/storefront";

const WOOD_LABELS: Record<string, string> = {
  CHERRY: "Cherry", WALNUT: "Walnut", MAPLE: "Maple", MIXED: "Mixed Wood", OTHER: "Other",
};
const CATEGORY_LABELS: Record<string, string> = {
  SPOON: "Spoon", KNIFE: "Knife / Spreader", SCOOP: "Scoop",
  SERVING: "Serving Board", CUSTOM: "Custom Piece",
};

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  const { data: product, isLoading } = trpc.products.bySlug.useQuery({ slug: slug ?? "" });
  const { data: related } = trpc.products.list.useQuery(
    { category: product?.category, limit: 4 },
    { enabled: !!product }
  );

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  const handleAddToCart = () => {
    if (!product) return;
    const images = Array.isArray(product.images) ? product.images : [];
    addItem({
      productId: product.id,
      quantity,
      price: product.price,
      name: product.name,
      imageUrl: images[0],
      woodType: product.woodType,
      slug: product.slug,
    });
    setAdded(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAdded(false), 2000);
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="pt-24 min-h-screen bg-[#F5F0EB]">
          <div className="container py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
              <div className="aspect-square bg-[#D7CCC8] rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-[#D7CCC8] rounded w-3/4" />
                <div className="h-4 bg-[#D7CCC8] rounded w-1/2" />
                <div className="h-6 bg-[#D7CCC8] rounded w-1/4" />
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!product) {
    return (
      <PublicLayout>
        <div className="pt-24 min-h-screen bg-[#F5F0EB] flex items-center justify-center">
          <div className="text-center">
            <h2 className="font-cinzel text-2xl text-[#3E2723] mb-4" style={{ fontFamily: "Cinzel, serif" }}>
              Product Not Found
            </h2>
            <Link href="/shop" className="text-[#C9A227] hover:underline" style={{ fontFamily: "Inter, sans-serif" }}>
              ← Back to Shop
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const images: string[] = Array.isArray(product.images) ? product.images : [];
  const canBuy = product.status !== "SOLD_OUT" && product.status !== "RETIRED";
  const relatedFiltered = related?.filter((p) => p.id !== product.id).slice(0, 4) ?? [];

  return (
    <PublicLayout>
      <div className="pt-20 bg-[#F5F0EB] min-h-screen">
        {/* Breadcrumb */}
        <div className="container py-4">
          <nav className="flex items-center gap-2 text-xs text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
            <Link href="/" className="hover:text-[#3E2723]">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#3E2723]">Shop</Link>
            <span>/</span>
            <span className="text-[#3E2723]">{product.name}</span>
          </nav>
        </div>

        <div className="container pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* ─── Image Gallery ──────────────────────────────────────────── */}
            <div>
              {/* Main image */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-[#F0E8DF] shadow-md mb-3">
                {images.length > 0 ? (
                  <img
                    src={images[activeImage]}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#D7CCC8]">
                    <ShoppingBag className="w-16 h-16 text-[#8D6E63]" strokeWidth={1} />
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((a) => (a - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors shadow"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#3E2723]" />
                    </button>
                    <button
                      onClick={() => setActiveImage((a) => (a + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors shadow"
                    >
                      <ChevronRight className="w-4 h-4 text-[#3E2723]" />
                    </button>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                        i === activeImage ? "border-[#C9A227]" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ─── Product Info ───────────────────────────────────────────── */}
            <div>
              {/* Category + wood */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold tracking-widest uppercase text-[#C9A227]" style={{ fontFamily: "Inter, sans-serif" }}>
                  {CATEGORY_LABELS[product.category] ?? product.category}
                </span>
                <span className="text-[#D7CCC8]">·</span>
                <span className="text-xs text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
                  {WOOD_LABELS[product.woodType] ?? product.woodType} Wood
                </span>
              </div>

              <h1
                className="text-[#3E2723] text-3xl md:text-4xl font-cinzel leading-tight mb-4"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-semibold text-[#3E2723]" style={{ fontFamily: "Inter, sans-serif" }}>
                  {formatPrice(product.price)}
                </span>
                {product.status === "MADE_TO_ORDER" && product.leadTimeDays && (
                  <div className="flex items-center gap-1 text-sm text-[#8D6E63]">
                    <Clock className="w-4 h-4" />
                    <span style={{ fontFamily: "Inter, sans-serif" }}>
                      {product.leadTimeDays}-day lead time
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="prose prose-sm max-w-none mb-6">
                  <p className="text-[#5D4037] leading-relaxed" style={{ fontFamily: "Lora, serif" }}>
                    {product.description}
                  </p>
                </div>
              )}

              {/* Dimensions */}
              {product.dimensions && (
                <div className="mb-6 p-4 bg-white rounded border border-[#D7CCC8]">
                  <p className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
                    Dimensions
                  </p>
                  <p className="text-sm text-[#3E2723]" style={{ fontFamily: "Inter, sans-serif" }}>
                    {product.dimensions}
                  </p>
                </div>
              )}

              {/* Quantity + Add to cart */}
              {canBuy ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
                      Qty
                    </label>
                    <div className="flex items-center border border-[#D7CCC8] rounded overflow-hidden">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-3 py-2 text-[#5D4037] hover:bg-[#F5F0EB] transition-colors"
                      >
                        −
                      </button>
                      <span className="px-4 py-2 text-sm font-medium text-[#3E2723] border-x border-[#D7CCC8]" style={{ fontFamily: "Inter, sans-serif" }}>
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="px-3 py-2 text-[#5D4037] hover:bg-[#F5F0EB] transition-colors"
                      >
                        +
                      </button>
                    </div>
                    {product.quantity !== null && product.quantity !== undefined && (
                      <span className="text-xs text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
                        {product.quantity} available
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className={`w-full py-4 flex items-center justify-center gap-2 text-sm font-semibold tracking-widest uppercase rounded transition-all duration-200 ${
                      added
                        ? "bg-emerald-600 text-white"
                        : "bg-[#3E2723] text-[#D7CCC8] hover:bg-[#5D4037]"
                    }`}
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4" />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                        Add to Cart
                      </>
                    )}
                  </button>
                  <p className="text-sm text-[#8D6E63]" style={{ fontFamily: "Lora, serif" }}>
                    Checkout reserves this piece and Todd follows up with Venmo payment details.
                  </p>
                </div>
              ) : (
                <div className="py-4 px-6 bg-[#D7CCC8] rounded text-center">
                  <p className="font-cinzel text-[#5D4037] text-sm" style={{ fontFamily: "Cinzel, serif" }}>
                    {product.status === "SOLD_OUT" ? "This piece has been sold" : "No longer available"}
                  </p>
                  <Link href="/contact" className="text-xs text-[#C9A227] hover:underline mt-1 block" style={{ fontFamily: "Inter, sans-serif" }}>
                    Inquire about a custom piece →
                  </Link>
                </div>
              )}

              {/* Trust badges */}
              <div className="mt-8 pt-6 border-t border-[#D7CCC8] grid grid-cols-3 gap-4 text-center">
                {[
                  { icon: "✦", label: "Hand Carved" },
                  { icon: "🌲", label: "Sustainably Sourced" },
                  { icon: "🛡️", label: "Food Safe Finish" },
                ].map((b) => (
                  <div key={b.label}>
                    <div className="text-xl mb-1">{b.icon}</div>
                    <p className="text-xs text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
                      {b.label}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
                {SITE_CONFIG.acceptedPaymentLabel}. In-stock pieces usually ship in {SITE_CONFIG.inStockShippingWindow}.
              </p>
            </div>
          </div>

          {/* ─── Related Products ──────────────────────────────────────────── */}
          {relatedFiltered.length > 0 && (
            <div className="mt-20">
              <h2
                className="text-[#3E2723] text-2xl font-cinzel text-center mb-8"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                You Might Also Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedFiltered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
