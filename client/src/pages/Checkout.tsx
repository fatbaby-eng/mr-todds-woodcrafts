import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Lock, ShoppingBag, Check, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { STOREFRONT, buildVenmoPaymentLink } from "@/config/storefront";

type Step = "info" | "shipping" | "review";

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ShippingInfo {
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState<Step>("info");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [copiedVenmo, setCopiedVenmo] = useState(false);

  const [customer, setCustomer] = useState<CustomerInfo>({
    firstName: "", lastName: "", email: "", phone: "",
  });
  const [shipping, setShipping] = useState<ShippingInfo>({
    address1: "", address2: "", city: "", state: "NE", zip: "", country: "US",
  });

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  const shippingCost = subtotal >= STOREFRONT.freeShippingThresholdCents ? 0 : STOREFRONT.shippingFlatRateCents;
  const total = subtotal + shippingCost;

  const placeOrder = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      setOrderNumber(data.orderNumber);
      clearCart();
      setStep("review");
    },
    onError: () => {
      toast.error("Failed to place order. Please try again.");
    },
  });

  const handlePlaceOrder = () => {
    placeOrder.mutate({
      customerEmail: customer.email,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerPhone: customer.phone || undefined,
      shippingAddress: {
        line1: shipping.address1,
        line2: shipping.address2 || undefined,
        city: shipping.city,
        state: shipping.state,
        zip: shipping.zip,
        country: shipping.country,
      },
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price,
        productName: i.name,
        productSlug: i.slug,
        imageUrl: i.imageUrl,
      })),
      paymentMethod: "CASH",
      shippingCost,
      notes: `Customer chose Venmo checkout (${STOREFRONT.venmoDisplayHandle}).`,
    });
  };

  const copyVenmoHandle = async () => {
    try {
      await navigator.clipboard.writeText(STOREFRONT.venmoDisplayHandle);
      setCopiedVenmo(true);
      toast.success("Venmo handle copied");
      setTimeout(() => setCopiedVenmo(false), 1800);
    } catch {
      toast.error("Could not copy handle. Please copy it manually.");
    }
  };

  if (items.length === 0 && !orderNumber) {
    return (
      <div className="min-h-screen bg-[#F5F0EB] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-[#D7CCC8] mx-auto mb-4" strokeWidth={1} />
          <h2 className="font-cinzel text-2xl text-[#3E2723] mb-4" style={{ fontFamily: "Cinzel, serif" }}>
            Your cart is empty
          </h2>
          <Link href="/shop" className="text-[#C9A227] hover:underline" style={{ fontFamily: "Inter, sans-serif" }}>
            ← Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ─── Order Confirmation ────────────────────────────────────────────────────
  if (step === "review" && orderNumber) {
    const venmoNote = `Order ${orderNumber} - ${customer.firstName} ${customer.lastName}`.trim();
    const venmoPaymentLink = buildVenmoPaymentLink(total, venmoNote);

    return (
      <div className="min-h-screen bg-[#F5F0EB] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h1
            className="font-cinzel text-[#3E2723] text-3xl mb-3"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Order Confirmed!
          </h1>
          <p className="text-[#5D4037] mb-2" style={{ fontFamily: "Lora, serif" }}>
            Thank you for your order. Todd will begin work on your pieces shortly.
          </p>
          <div className="bg-white border border-[#D7CCC8] rounded-lg p-6 my-6 text-left">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
              Order Number
            </p>
            <p className="font-cinzel text-[#3E2723] text-xl" style={{ fontFamily: "Cinzel, serif" }}>
              #{orderNumber}
            </p>
            <p className="text-sm text-[#8D6E63] mt-3" style={{ fontFamily: "Inter, sans-serif" }}>
              A confirmation email will be sent to <strong>{customer.email}</strong>.
            </p>
            <p className="text-sm text-[#8D6E63] mt-2" style={{ fontFamily: "Inter, sans-serif" }}>
              Estimated shipping: 3–7 business days (made-to-order pieces: 2–4 weeks).
            </p>
          </div>
          <div className="bg-[#3E2723] rounded-lg p-5 text-left mb-6">
            <p className="text-[#C9A227] text-xs font-semibold tracking-widest uppercase mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
              Final Step: Venmo Payment
            </p>
            <p className="text-[#D7CCC8] text-sm mb-3" style={{ fontFamily: "Lora, serif" }}>
              Send <strong>{formatPrice(total)}</strong> to <strong>{STOREFRONT.venmoDisplayHandle}</strong> with note <strong>{venmoNote}</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={venmoPaymentLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C9A227] text-[#3E2723] text-xs font-semibold tracking-widest uppercase rounded hover:bg-[#E8C84A] transition-colors"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Pay on Venmo
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={copyVenmoHandle}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[#8D6E63] text-[#D7CCC8] text-xs font-semibold tracking-widest uppercase rounded hover:bg-white/10 transition-colors"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {copiedVenmo ? "Copied" : "Copy Handle"}
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#3E2723] text-[#D7CCC8] font-semibold text-sm tracking-widest uppercase rounded hover:bg-[#5D4037] transition-colors"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      {/* Header */}
      <div className="bg-[#3E2723] py-4 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[#C9A227] font-cinzel text-lg font-semibold" style={{ fontFamily: "Cinzel, serif" }}>
              Mr. Todd's Woodcrafts
            </span>
          </Link>
          <div className="flex items-center gap-1 text-[#8D6E63] text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
            <Lock className="w-3.5 h-3.5" />
            Secure Checkout - Venmo
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-[#D7CCC8] py-3">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-4">
          {(["info", "shipping"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className="w-8 h-px bg-[#D7CCC8]" />}
              <div className={`flex items-center gap-1.5 text-xs font-medium ${
                step === s ? "text-[#3E2723]" : "text-[#8D6E63]"
              }`} style={{ fontFamily: "Inter, sans-serif" }}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === s ? "bg-[#3E2723] text-[#D7CCC8]" : "bg-[#D7CCC8] text-[#8D6E63]"
                }`}>
                  {i + 1}
                </div>
                <span className="hidden sm:inline capitalize">{s === "info" ? "Your Info" : "Shipping"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* ─── Form ──────────────────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            {step === "info" && (
              <div className="bg-white border border-[#D7CCC8] rounded-lg p-6">
                <h2
                  className="font-cinzel text-[#3E2723] text-xl mb-6"
                  style={{ fontFamily: "Cinzel, serif" }}
                >
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customer.firstName}
                        onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                        className="w-full px-3 py-2.5 border border-[#D7CCC8] rounded text-sm text-[#3E2723] focus:outline-none focus:border-[#C9A227]"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customer.lastName}
                        onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                        className="w-full px-3 py-2.5 border border-[#D7CCC8] rounded text-sm text-[#3E2723] focus:outline-none focus:border-[#C9A227]"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className="w-full px-3 py-2.5 border border-[#D7CCC8] rounded text-sm text-[#3E2723] focus:outline-none focus:border-[#C9A227]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full px-3 py-2.5 border border-[#D7CCC8] rounded text-sm text-[#3E2723] focus:outline-none focus:border-[#C9A227]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!customer.firstName || !customer.lastName || !customer.email) {
                      toast.error("Please fill in all required fields.");
                      return;
                    }
                    setStep("shipping");
                  }}
                  className="mt-6 w-full py-3.5 bg-[#3E2723] text-[#D7CCC8] font-semibold text-sm tracking-widest uppercase rounded hover:bg-[#5D4037] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Continue to Shipping
                </button>
              </div>
            )}

            {step === "shipping" && (
              <div className="bg-white border border-[#D7CCC8] rounded-lg p-6">
                <button
                  onClick={() => setStep("info")}
                  className="flex items-center gap-1 text-sm text-[#8D6E63] hover:text-[#3E2723] mb-4 transition-colors"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <h2
                  className="font-cinzel text-[#3E2723] text-xl mb-6"
                  style={{ fontFamily: "Cinzel, serif" }}
                >
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                      Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={shipping.address1}
                      onChange={(e) => setShipping({ ...shipping, address1: e.target.value })}
                      placeholder="123 Main St"
                      className="w-full px-3 py-2.5 border border-[#D7CCC8] rounded text-sm text-[#3E2723] focus:outline-none focus:border-[#C9A227]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                      Apt / Suite (optional)
                    </label>
                    <input
                      type="text"
                      value={shipping.address2}
                      onChange={(e) => setShipping({ ...shipping, address2: e.target.value })}
                      placeholder="Apt 4B"
                      className="w-full px-3 py-2.5 border border-[#D7CCC8] rounded text-sm text-[#3E2723] focus:outline-none focus:border-[#C9A227]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={shipping.city}
                        onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                        className="w-full px-3 py-2.5 border border-[#D7CCC8] rounded text-sm text-[#3E2723] focus:outline-none focus:border-[#C9A227]"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                        State *
                      </label>
                      <select
                        value={shipping.state}
                        onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                        className="w-full px-3 py-2.5 border border-[#D7CCC8] rounded text-sm text-[#3E2723] focus:outline-none focus:border-[#C9A227] bg-white"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={shipping.zip}
                        onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                        className="w-full px-3 py-2.5 border border-[#D7CCC8] rounded text-sm text-[#3E2723] focus:outline-none focus:border-[#C9A227]"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                        Country
                      </label>
                      <select
                        value={shipping.country}
                        onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                        className="w-full px-3 py-2.5 border border-[#D7CCC8] rounded text-sm text-[#3E2723] focus:outline-none focus:border-[#C9A227] bg-white"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-[#F5F0EB] rounded border border-[#D7CCC8] text-sm text-[#5D4037]" style={{ fontFamily: "Lora, serif" }}>
                  <p className="font-semibold text-[#3E2723] mb-1" style={{ fontFamily: "Cinzel, serif" }}>
                    Note on Payment
                  </p>
                  <p>
                    This checkout reserves your order. On the confirmation page, you will get a direct Venmo link to pay {formatPrice(total)} to {STOREFRONT.venmoDisplayHandle}. Todd confirms paid orders quickly.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (!shipping.address1 || !shipping.city || !shipping.zip) {
                      toast.error("Please fill in all required shipping fields.");
                      return;
                    }
                    handlePlaceOrder();
                  }}
                  disabled={placeOrder.isPending}
                  className="mt-6 w-full py-3.5 bg-[#3E2723] text-[#D7CCC8] font-semibold text-sm tracking-widest uppercase rounded hover:bg-[#5D4037] transition-colors disabled:opacity-60"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {placeOrder.isPending ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            )}
          </div>

          {/* ─── Order Summary ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#D7CCC8] rounded-lg p-6 sticky top-6">
              <h3
                className="font-cinzel text-[#3E2723] text-base mb-5 pb-4 border-b border-[#D7CCC8]"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                Order Summary
              </h3>
              <ul className="space-y-3 mb-5">
                {items.map((item) => (
                  <li key={item.productId} className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded overflow-hidden bg-[#F5F0EB] flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-[#8D6E63]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#3E2723] line-clamp-2" style={{ fontFamily: "Inter, sans-serif" }}>
                        {item.name}
                      </p>
                      <p className="text-xs text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-[#3E2723]" style={{ fontFamily: "Inter, sans-serif" }}>
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="border-t border-[#D7CCC8] pt-4 space-y-2">
                <div className="flex justify-between text-sm text-[#5D4037]" style={{ fontFamily: "Inter, sans-serif" }}>
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#5D4037]" style={{ fontFamily: "Inter, sans-serif" }}>
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
                </div>
                {shippingCost === 0 && (
                  <p className="text-xs text-emerald-600" style={{ fontFamily: "Inter, sans-serif" }}>
                    ✓ Free shipping applied
                  </p>
                )}
                <div className="flex justify-between font-semibold text-[#3E2723] pt-2 border-t border-[#D7CCC8]" style={{ fontFamily: "Inter, sans-serif" }}>
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
