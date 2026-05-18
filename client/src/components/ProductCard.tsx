import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/../../drizzle/schema";
import { ShoppingBag, Clock } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  IN_STOCK: { label: "In Stock", color: "bg-emerald-100 text-emerald-800" },
  MADE_TO_ORDER: { label: "Made to Order", color: "bg-amber-100 text-amber-800" },
  SOLD_OUT: { label: "Sold Out", color: "bg-red-100 text-red-700" },
};

const WOOD_COLORS: Record<string, string> = {
  CHERRY: "#B5451B",
  WALNUT: "#5C3D2E",
  MAPLE: "#C8A96E",
  MIXED: "#8D6E63",
  OTHER: "#9E9E9E",
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const imageUrl = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : undefined;

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  const status = STATUS_LABELS[product.status] ?? STATUS_LABELS.IN_STOCK;
  const canAddToCart =
    product.status === "MADE_TO_ORDER" ||
    (product.status === "IN_STOCK" && product.quantity > 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      quantity: 1,
      price: product.price,
      name: product.name,
      imageUrl,
      woodType: product.woodType,
      slug: product.slug,
    });
    toast.success(`${product.name} added to cart`, {
      description: "View your cart to checkout",
      duration: 2500,
    });
  };

  return (
    <Link href={`/shop/${product.slug}`}>
      <article className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-[#D7CCC8] hover:border-[#C9A227] cursor-pointer">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F5F0EB]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-[#D7CCC8]" strokeWidth={1} />
            </div>
          )}

          {/* Wood type badge */}
          <div className="absolute top-3 left-3">
            <span
              className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-widest uppercase text-white"
              style={{
                fontFamily: "Inter, sans-serif",
                backgroundColor: WOOD_COLORS[product.woodType] ?? WOOD_COLORS.OTHER,
              }}
            >
              {product.woodType.charAt(0) + product.woodType.slice(1).toLowerCase()}
            </span>
          </div>

          {/* Featured badge */}
          {product.featured && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-widest uppercase bg-[#C9A227] text-[#3E2723]" style={{ fontFamily: "Inter, sans-serif" }}>
                Featured
              </span>
            </div>
          )}

          {/* Status overlay for sold out */}
          {product.status === "SOLD_OUT" && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="px-4 py-2 bg-white/90 text-[#3E2723] font-cinzel text-sm tracking-widest uppercase rounded" style={{ fontFamily: "Cinzel, serif" }}>
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3
            className="font-cinzel text-sm text-[#3E2723] group-hover:text-[#5D4037] transition-colors line-clamp-2 mb-1"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            {product.name}
          </h3>

          {product.dimensions && (
            <p className="text-xs text-[#8D6E63] mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
              {product.dimensions}
            </p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-lg font-semibold text-[#3E2723]" style={{ fontFamily: "Inter, sans-serif" }}>
                {formatPrice(product.price)}
              </span>
              {product.status === "MADE_TO_ORDER" && product.leadTimeDays && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-[#8D6E63]" />
                  <span className="text-xs text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
                    {product.leadTimeDays}d lead time
                  </span>
                </div>
              )}
            </div>

            {canAddToCart ? (
              <button
                onClick={handleAddToCart}
                className="p-2 rounded-full bg-[#3E2723] text-[#D7CCC8] hover:bg-[#C9A227] hover:text-[#3E2723] transition-all duration-200 group/btn"
                aria-label={`Add ${product.name} to cart`}
              >
                <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
              </button>
            ) : (
              <span
                className={`px-2 py-1 rounded text-[10px] font-semibold ${status.color}`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {status.label}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
