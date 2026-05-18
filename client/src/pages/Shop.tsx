import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import PublicLayout from "@/components/PublicLayout";
import { SITE_CONFIG } from "@shared/storefront";

const CATEGORIES = ["All", "SPOON", "KNIFE", "SCOOP", "SERVING", "CUSTOM"];
const WOOD_TYPES = ["All", "CHERRY", "WALNUT", "MAPLE", "MIXED", "OTHER"];
const STATUSES = ["All", "IN_STOCK", "MADE_TO_ORDER"];

const CATEGORY_LABELS: Record<string, string> = {
  SPOON: "Spoons", KNIFE: "Knives & Spreaders", SCOOP: "Scoops",
  SERVING: "Serving Boards", CUSTOM: "Custom",
};
const WOOD_LABELS: Record<string, string> = {
  CHERRY: "Cherry", WALNUT: "Walnut", MAPLE: "Maple", MIXED: "Mixed", OTHER: "Other",
};
const STATUS_LABELS: Record<string, string> = {
  IN_STOCK: "In Stock", MADE_TO_ORDER: "Made to Order",
};

export default function Shop() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [woodType, setWoodType] = useState("All");
  const [status, setStatus] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const { data: products, isLoading } = trpc.products.list.useQuery({
    category: category !== "All" ? category : undefined,
    woodType: woodType !== "All" ? woodType : undefined,
    status: status !== "All" ? status : undefined,
    search: search.length > 1 ? search : undefined,
  });

  const sortedProducts = useMemo(() => {
    if (!products) return [];
    const arr = [...products];
    if (sortBy === "price-asc") arr.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") arr.sort((a, b) => b.price - a.price);
    else arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return arr;
  }, [products, sortBy]);

  const activeFilters = [
    category !== "All" && { key: "category", label: CATEGORY_LABELS[category] ?? category },
    woodType !== "All" && { key: "woodType", label: WOOD_LABELS[woodType] ?? woodType },
    status !== "All" && { key: "status", label: STATUS_LABELS[status] ?? status },
  ].filter(Boolean) as { key: string; label: string }[];

  const clearFilter = (key: string) => {
    if (key === "category") setCategory("All");
    if (key === "woodType") setWoodType("All");
    if (key === "status") setStatus("All");
  };

  return (
    <PublicLayout>
      {/* Page Header */}
      <div className="pt-24 pb-10 bg-[#3E2723]">
        <div className="container text-center">
          <p className="text-[#C9A227] text-xs tracking-[0.3em] uppercase mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
            Handcrafted Goods
          </p>
          <h1
            className="text-[#F5F0EB] text-4xl md:text-5xl font-cinzel"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            The Collection
          </h1>
          <p className="text-[#8D6E63] mt-4 max-w-lg mx-auto" style={{ fontFamily: "Lora, serif" }}>
            Every piece is carved by hand from sustainably sourced hardwoods. Place your order online and Todd will follow up with Venmo payment details.
          </p>
        </div>
      </div>

      <div className="bg-[#F5F0EB] min-h-screen py-10">
        <div className="container">
          <div className="mb-6 rounded-lg border border-[#D7CCC8] bg-white p-4">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C9A227] mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
              {SITE_CONFIG.acceptedPaymentLabel}
            </p>
            <p className="text-sm text-[#5D4037]" style={{ fontFamily: "Lora, serif" }}>
              Checkout reserves the piece and captures your shipping details. Todd confirms each order personally before payment is collected.
            </p>
          </div>

          {/* Search + Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D6E63]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 border border-[#D7CCC8] rounded bg-white text-[#3E2723] placeholder-[#8D6E63] focus:outline-none focus:border-[#C9A227] text-sm"
                style={{ fontFamily: "Inter, sans-serif" }}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D6E63] hover:text-[#3E2723]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded text-sm font-medium transition-colors ${
                showFilters ? "bg-[#3E2723] text-[#D7CCC8] border-[#3E2723]" : "bg-white border-[#D7CCC8] text-[#5D4037] hover:border-[#C9A227]"
              }`}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-[#D7CCC8] rounded bg-white text-[#5D4037] text-sm focus:outline-none focus:border-[#C9A227]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-white border border-[#D7CCC8] rounded-lg p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        category === c
                          ? "bg-[#3E2723] text-[#D7CCC8]"
                          : "bg-[#F5F0EB] text-[#5D4037] hover:bg-[#D7CCC8]"
                      }`}
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {c === "All" ? "All" : (CATEGORY_LABELS[c] ?? c)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
                  Wood Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {WOOD_TYPES.map((w) => (
                    <button
                      key={w}
                      onClick={() => setWoodType(w)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        woodType === w
                          ? "bg-[#3E2723] text-[#D7CCC8]"
                          : "bg-[#F5F0EB] text-[#5D4037] hover:bg-[#D7CCC8]"
                      }`}
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {w === "All" ? "All" : (WOOD_LABELS[w] ?? w)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
                  Availability
                </label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        status === s
                          ? "bg-[#3E2723] text-[#D7CCC8]"
                          : "bg-[#F5F0EB] text-[#5D4037] hover:bg-[#D7CCC8]"
                      }`}
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {s === "All" ? "All" : (STATUS_LABELS[s] ?? s)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {activeFilters.map((f) => (
                <span
                  key={f.key}
                  className="flex items-center gap-1 px-3 py-1 bg-[#3E2723] text-[#D7CCC8] rounded-full text-xs"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {f.label}
                  <button onClick={() => clearFilter(f.key)} className="hover:text-[#C9A227]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={() => { setCategory("All"); setWoodType("All"); setStatus("All"); }}
                className="px-3 py-1 text-xs text-[#8D6E63] hover:text-[#3E2723] underline"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results count */}
          {!isLoading && (
            <p className="text-sm text-[#8D6E63] mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
              {sortedProducts.length} {sortedProducts.length === 1 ? "piece" : "pieces"} found
            </p>
          )}

          {/* Product grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-[#D7CCC8]" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-[#D7CCC8] rounded w-3/4" />
                    <div className="h-3 bg-[#D7CCC8] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#8D6E63] text-lg" style={{ fontFamily: "Lora, serif" }}>
                No pieces match your filters.
              </p>
              <button
                onClick={() => { setSearch(""); setCategory("All"); setWoodType("All"); setStatus("All"); }}
                className="mt-4 text-sm text-[#C9A227] hover:underline"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
