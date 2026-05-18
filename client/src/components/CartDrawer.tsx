import { useCart } from "@/contexts/CartContext";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "var(--cream)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: "var(--amber-wood)", background: "#3E2723" }}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#C9A227]" strokeWidth={1.5} />
            <h2
              className="text-[#D7CCC8] font-cinzel text-base tracking-widest uppercase"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Your Cart
            </h2>
            {itemCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#C9A227] text-[#3E2723] text-xs font-bold flex items-center justify-center font-inter">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-[#8D6E63] hover:text-[#D7CCC8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag className="w-12 h-12 text-[#D7CCC8]" strokeWidth={1} />
              <p
                className="text-[#8D6E63] font-lora text-lg"
                style={{ fontFamily: "Lora, serif" }}
              >
                Your cart is empty
              </p>
              <p className="text-[#8D6E63] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                Discover handcrafted pieces in our shop
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="mt-2 px-6 py-2.5 text-xs font-semibold tracking-widest uppercase bg-[#3E2723] text-[#D7CCC8] rounded hover:bg-[#5D4037] transition-colors"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-4 py-4 border-b"
                  style={{ borderColor: "#D7CCC8" }}
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0 bg-[#D7CCC8]">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-[#8D6E63]" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/shop/${item.slug}`}
                      onClick={closeCart}
                      className="font-cinzel text-sm text-[#3E2723] hover:text-[#C9A227] transition-colors line-clamp-2"
                      style={{ fontFamily: "Cinzel, serif" }}
                    >
                      {item.name}
                    </Link>
                    {item.woodType && (
                      <p className="text-xs text-[#8D6E63] mt-0.5 capitalize" style={{ fontFamily: "Inter, sans-serif" }}>
                        {item.woodType.charAt(0) + item.woodType.slice(1).toLowerCase()} Wood
                      </p>
                    )}
                    <p className="text-sm font-semibold text-[#C9A227] mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded border border-[#D7CCC8] flex items-center justify-center text-[#5D4037] hover:border-[#C9A227] hover:text-[#C9A227] transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-[#3E2723]" style={{ fontFamily: "Inter, sans-serif" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-6 h-6 rounded border border-[#D7CCC8] flex items-center justify-center text-[#5D4037] hover:border-[#C9A227] hover:text-[#C9A227] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-auto text-[#8D6E63] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t" style={{ borderColor: "#D7CCC8", background: "#fff" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-cinzel text-sm text-[#5D4037]" style={{ fontFamily: "Cinzel, serif" }}>
                Subtotal
              </span>
              <span className="font-semibold text-[#3E2723] text-lg" style={{ fontFamily: "Inter, sans-serif" }}>
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="text-xs text-[#8D6E63] mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
              Shipping is calculated at checkout. Venmo details appear after you place the order.
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full py-3.5 text-center text-sm font-semibold tracking-widest uppercase bg-[#3E2723] text-[#D7CCC8] rounded hover:bg-[#5D4037] transition-colors"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={closeCart}
              className="block w-full mt-2 py-2.5 text-center text-xs tracking-widest uppercase text-[#8D6E63] hover:text-[#3E2723] transition-colors"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
