import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, ShoppingBag, Clock, Check, ChevronLeft, ChevronRight, Star } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";

const WOOD_LABELS: Record<string, string> = {
  CHERRY: "Cherry", WALNUT: "Walnut", MAPLE: "Maple", MIXED: "Mixed Wood", OTHER: "Other",
};
const CATEGORY_LABELS: Record<string, string> = {
  SPOON: "Spoon", KNIFE: "Knife / Spreader", SCOOP: "Scoop",
  SERVING: "Serving Board", CUSTOM: "Custom Piece",
};
const CUSTOM_WOOD_OPTIONS = ["CHERRY", "WALNUT", "APRICOT", "MAPLE", "MIXED"];

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [selectedWood, setSelectedWood] = useState<string | null>(null);
  const [customSelections, setCustomSelections] = useState<Record<string, string>>({});

  const { data: product, isLoading } = trpc.products.bySlug.useQuery({ slug: slug ?? "" });
  const { data: related } = trpc.products.list.useQuery(
    { category: product?.category, limit: 4 },
    { enabled: !!product }
  );

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  const handleAddToCart = () => {
    if (!product) return;
    let itemPrice = product.price;
    if (product.volumeDiscounts && Array.isArray(product.volumeDiscounts)) {
      const applicableDiscount = [...product.volumeDiscounts]
        .sort((a, b) => b.quantity - a.quantity)
        .find(d => quantity >= d.quantity);
      if (applicableDiscount) itemPrice = applicableDiscount.pricePerUnit;
    }
    if (product.customOptions && Array.isArray(product.customOptions)) {
      for (const opt of product.customOptions) {
        if (opt.type === "select" && opt.choices) {
          const choice = opt.choices.find((c: any) => c.label === customSelections[opt.name]);
          if (choice && choice.priceOverride) itemPrice += choice.priceOverride;
        }
      }
    }

    addItem({
      productId: product.id,
      quantity,
      price: itemPrice,
      name: product.name,
      imageUrl: images[0],
      woodType: selectedWood || product.woodType,
      slug: product.slug,
      customSelections,
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
                  {product.allowsCustomWood ? "Custom Wood Selection" : `${WOOD_LABELS[product.woodType] ?? product.woodType} Wood`}
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
                  {(() => {
                    let currentPrice = product.price;
                    if (product.volumeDiscounts && Array.isArray(product.volumeDiscounts)) {
                      const applicableDiscount = [...product.volumeDiscounts]
                        .sort((a, b) => b.quantity - a.quantity)
                        .find(d => quantity >= d.quantity);
                      if (applicableDiscount) currentPrice = applicableDiscount.pricePerUnit;
                    }
                    if (product.customOptions && Array.isArray(product.customOptions)) {
                      for (const opt of product.customOptions) {
                        if (opt.type === "select" && opt.choices) {
                          const choice = opt.choices.find((c: any) => c.label === customSelections[opt.name]);
                          if (choice && choice.priceOverride) currentPrice += choice.priceOverride;
                        }
                      }
                    }
                    return formatPrice(currentPrice);
                  })()}
                </span>
                {product.volumeDiscounts && Array.isArray(product.volumeDiscounts) && product.volumeDiscounts.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-xs text-[#8D6E63] border-l border-[#D7CCC8] pl-3" style={{ fontFamily: "Inter, sans-serif" }}>
                    Volume pricing available
                  </div>
                )}
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
                <div 
                  className="prose prose-sm max-w-none mb-6 text-[#5D4037] prose-p:leading-relaxed prose-p:mb-4 prose-strong:font-semibold prose-strong:text-[#3E2723]" 
                  style={{ fontFamily: "Lora, serif" }}
                  dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, "<br/>") }}
                />
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
                <div className="space-y-6">
                  {/* Custom Wood Selection */}
                  {product.allowsCustomWood && (
                    <div className="space-y-3 p-4 bg-white border border-[#D7CCC8] rounded shadow-sm">
                      <label className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63] flex justify-between items-center" style={{ fontFamily: "Inter, sans-serif" }}>
                        Select Wood Type
                        <span className="text-[#C9A227] normal-case tracking-normal">Required</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {CUSTOM_WOOD_OPTIONS.map((wood) => (
                          <button
                            key={wood}
                            onClick={() => setSelectedWood(wood)}
                            className={`py-2 px-3 text-sm rounded border transition-colors ${
                              selectedWood === wood 
                                ? "bg-[#3E2723] border-[#3E2723] text-white" 
                                : "bg-[#F5F0EB] border-[#D7CCC8] text-[#5D4037] hover:border-[#3E2723]"
                            }`}
                            style={{ fontFamily: "Inter, sans-serif" }}
                          >
                            {WOOD_LABELS[wood]}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-[#8D6E63] italic" style={{ fontFamily: "Inter, sans-serif" }}>
                        Custom sets typically take 1-2 weeks.
                      </p>
                    </div>
                  )}

                  {product.customOptions && Array.isArray(product.customOptions) && product.customOptions.length > 0 && (
                    <div className="space-y-4">
                      {product.customOptions.map((opt: any, i: number) => (
                        <div key={i} className="space-y-2 p-4 bg-white border border-[#D7CCC8] rounded shadow-sm">
                          <label className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63] flex justify-between items-center" style={{ fontFamily: "Inter, sans-serif" }}>
                            {opt.name}
                            {opt.required && <span className="text-[#C9A227] normal-case tracking-normal">Required</span>}
                          </label>
                          {opt.type === "select" && opt.choices ? (
                            <select 
                              value={customSelections[opt.name] || ""}
                              onChange={e => setCustomSelections(prev => ({ ...prev, [opt.name]: e.target.value }))}
                              className="w-full px-3 py-2 bg-[#F5F0EB] border border-[#D7CCC8] rounded text-sm focus:outline-none focus:border-[#3E2723] text-[#3E2723]"
                            >
                              <option value="">-- Select --</option>
                              {opt.choices.map((c: any) => (
                                <option key={c.label} value={c.label}>{c.label} {c.priceOverride ? `(+$${(c.priceOverride / 100).toFixed(2)})` : ''}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={customSelections[opt.name] || ""}
                              onChange={e => setCustomSelections(prev => ({ ...prev, [opt.name]: e.target.value }))}
                              className="w-full px-3 py-2 bg-[#F5F0EB] border border-[#D7CCC8] rounded text-sm focus:outline-none focus:border-[#3E2723] text-[#3E2723]"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

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
                        onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                        disabled={quantity >= product.quantity}
                        className="px-3 py-2 text-[#5D4037] hover:bg-[#F5F0EB] disabled:opacity-50 transition-colors"
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
                    disabled={Boolean((product.allowsCustomWood && !selectedWood) || (product.customOptions && Array.isArray(product.customOptions) && product.customOptions.some((opt: any) => opt.required && !customSelections[opt.name])))}
                    className={`w-full py-4 flex items-center justify-center gap-2 text-sm font-semibold tracking-widest uppercase rounded transition-all duration-200 ${
                      added
                        ? "bg-emerald-600 text-white"
                        : Boolean((product.allowsCustomWood && !selectedWood) || (product.customOptions && Array.isArray(product.customOptions) && product.customOptions.some((opt: any) => opt.required && !customSelections[opt.name])))
                        ? "bg-[#D7CCC8] text-[#8D6E63] cursor-not-allowed"
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
                        {product.allowsCustomWood && !selectedWood ? "Select Wood Type" : "Add to Cart"}
                      </>
                    )}
                  </button>
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
                  { icon: <Check className="w-5 h-5 mx-auto text-[#C9A227]"/>, label: "Hand Carved" },
                  { icon: <Star className="w-5 h-5 mx-auto text-[#C9A227]"/>, label: "Local Hardwood" },
                  { icon: <Check className="w-5 h-5 mx-auto text-[#C9A227]"/>, label: "Food Safe Finish" },
                ].map((b, i) => (
                  <div key={i}>
                    <div className="mb-1">{b.icon}</div>
                    <p className="text-xs text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
                      {b.label}
                    </p>
                  </div>
                ))}
              </div>
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
