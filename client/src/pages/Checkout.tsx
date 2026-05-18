import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Lock, ShoppingBag, Check, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import QRCodeLib from "qrcode";

type Step = "info" | "shipping" | "payment" | "done";

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

/**
 * Builds a Venmo "pay" deep link.
 * On iOS/Android, the `venmo://` URI opens the app directly with the
 * recipient, amount, and memo pre-filled. On desktop, the same params via
 * `https://venmo.com/?...` open the Venmo web profile.
 *
 * Docs: https://venmo.com/code (deep link spec)
 */
function buildVenmoLinks(opts: { username: string; amount: number; note: string }) {
  const params = new URLSearchParams({
    txn: "pay",
    recipients: opts.username,
    amount: opts.amount.toFixed(2),
    note: opts.note,
  });
  return {
    app: `venmo://paycharge?${params.toString()}`,
    web: `https://account.venmo.com/pay?${params.toString()}`,
  };
}

function VenmoQR({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current && url) {
      QRCodeLib.toCanvas(canvasRef.current, url, {
        width: 192,
        margin: 2,
        color: { dark: "#3E2723", light: "#FFFFFF" },
      }).catch(console.error);
    }
  }, [url]);
  return <canvas ref={canvasRef} className="rounded bg-white p-2 mx-auto" />;
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState<Step>("info");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paidTotal, setPaidTotal] = useState<number>(0);

  const [customer, setCustomer] = useState<CustomerInfo>({
    firstName: "", lastName: "", email: "", phone: "",
  });
  const [shipping, setShipping] = useState<ShippingInfo>({
    address1: "", address2: "", city: "", state: "NE", zip: "", country: "US",
  });

  const { data: siteSettings } = trpc.settings.publicAll.useQuery();
  const venmoUsername = siteSettings?.venmoUsername ?? null;

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  const shippingCost = subtotal >= 7500 ? 0 : 895; // free over $75
  const total = subtotal + shippingCost;

  const placeOrder = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      setOrderNumber(data.orderNumber);
      setPaidTotal(total);
      clearCart();
      setStep("payment");
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
      paymentMethod: "VENMO",
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
      shippingCost,
    });
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

  // ─── Final Done state ──────────────────────────────────────────────────────
  if (step === "done" && orderNumber) {
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
            Thank you!
          </h1>
          <p className="text-[#5D4037] mb-2" style={{ fontFamily: "Lora, serif" }}>
            Order <strong className="font-mono">#{orderNumber}</strong> is in.
            Once your Venmo payment lands, Todd will confirm and begin work on your pieces.
          </p>
          <div className="bg-white border border-[#D7CCC8] rounded-lg p-6 my-6 text-left text-sm text-[#5D4037] space-y-2" style={{ fontFamily: "Inter, sans-serif" }}>
            <p>
              <strong className="text-[#3E2723]">What happens next:</strong>
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Todd matches your Venmo payment to this order using the memo (<span className="font-mono">{orderNumber}</span>).</li>
              <li>You'll get an email confirmation at <strong>{customer.email}</strong> when payment is verified.</li>
              <li>In-stock pieces ship in 3–7 business days. Made-to-order pieces take 2–4 weeks.</li>
            </ol>
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

  // ─── Venmo Payment Step ───────────────────────────────────────────────────
  if (step === "payment" && orderNumber) {
    const memo = `Order ${orderNumber}`;
    const amountDollars = paidTotal / 100;
    const links = venmoUsername
      ? buildVenmoLinks({ username: venmoUsername, amount: amountDollars, note: memo })
      : null;

    return (
      <div className="min-h-screen bg-[#F5F0EB]">
        <div className="bg-[#3E2723] py-4 px-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-[#C9A227] font-cinzel text-lg font-semibold" style={{ fontFamily: "Cinzel, serif" }}>
                Mr. Todd's Woodcrafts
              </span>
            </Link>
            <div className="flex items-center gap-1 text-[#8D6E63] text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
              <Lock className="w-3.5 h-3.5" />
              Secure Checkout
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="bg-white border border-[#D7CCC8] rounded-lg p-6 md:p-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
              Step 3 of 3 — Payment
            </p>
            <h1 className="font-cinzel text-[#3E2723] text-2xl md:text-3xl mb-2" style={{ fontFamily: "Cinzel, serif" }}>
              Pay with Venmo
            </h1>
            <p className="text-sm text-[#5D4037] mb-6" style={{ fontFamily: "Lora, serif" }}>
              Order <span className="font-mono font-semibold">#{orderNumber}</span> is reserved. Send your payment via
              Venmo below to confirm it.
            </p>

            {venmoUsername && links ? (
              <>
                <div className="bg-[#F5F0EB] rounded-lg border border-[#D7CCC8] p-5 mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                    <div>
                      <p className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1">Send to</p>
                      <CopyableField value={`@${venmoUsername}`} copyValue={venmoUsername} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1">Amount</p>
                      <CopyableField value={formatPrice(paidTotal)} copyValue={amountDollars.toFixed(2)} />
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1">Memo (required)</p>
                      <CopyableField value={memo} copyValue={memo} />
                      <p className="text-xs text-[#8D6E63] mt-1">
                        The order number in the memo lets Todd match your payment to your order.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <a
                      href={links.app}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#008CFF] text-white font-semibold text-sm tracking-widest uppercase rounded hover:bg-[#0078e7] transition-colors"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      Open Venmo
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a
                      href={links.web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center mt-2 text-xs text-[#5D4037] hover:text-[#3E2723] underline"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      Or open in browser
                    </a>
                    <p className="text-xs text-[#8D6E63] mt-3" style={{ fontFamily: "Inter, sans-serif" }}>
                      The button above opens the Venmo app with the amount, recipient, and memo pre-filled. Review and tap Pay.
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
                      Or scan from your phone
                    </p>
                    <VenmoQR url={links.app} />
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 mb-6 text-sm text-amber-900" style={{ fontFamily: "Inter, sans-serif" }}>
                <p className="font-semibold mb-1">Venmo handle not yet configured.</p>
                <p>
                  Todd will email you at <strong>{customer.email}</strong> within 24 hours with a Venmo link for
                  Order <span className="font-mono">#{orderNumber}</span>.
                </p>
              </div>
            )}

            <button
              onClick={() => setStep("done")}
              className="w-full py-3.5 bg-[#3E2723] text-[#D7CCC8] font-semibold text-sm tracking-widest uppercase rounded hover:bg-[#5D4037] transition-colors"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              I've Sent the Payment
            </button>
            <p className="text-xs text-center text-[#8D6E63] mt-3" style={{ fontFamily: "Inter, sans-serif" }}>
              Don't worry — even if you close this tab, your order is saved as
              <span className="font-mono"> #{orderNumber}</span>.
            </p>
          </div>
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
            Secure Checkout
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-[#D7CCC8] py-3">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-4">
          {(["info", "shipping", "payment"] as Step[]).map((s, i) => {
            const label = s === "info" ? "Your Info" : s === "shipping" ? "Shipping" : "Payment";
            const active = step === s;
            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className="w-8 h-px bg-[#D7CCC8]" />}
                <div className={`flex items-center gap-1.5 text-xs font-medium ${
                  active ? "text-[#3E2723]" : "text-[#8D6E63]"
                }`} style={{ fontFamily: "Inter, sans-serif" }}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    active ? "bg-[#3E2723] text-[#D7CCC8]" : "bg-[#D7CCC8] text-[#8D6E63]"
                  }`}>
                    {i + 1}
                  </div>
                  <span className="hidden sm:inline">{label}</span>
                </div>
              </div>
            );
          })}
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
                    Payment via Venmo
                  </p>
                  <p>
                    Place your order and you'll get a one-tap Venmo payment screen on the next step with the
                    exact amount and a memo pre-filled. Your order is reserved once we see your Venmo payment.
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
                  {placeOrder.isPending ? "Placing Order..." : "Continue to Payment"}
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

function CopyableField({ value, copyValue }: { value: string; copyValue: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-2 bg-white rounded border border-[#D7CCC8] px-3 py-2">
      <span className="font-mono text-sm text-[#3E2723] truncate" style={{ fontFamily: "Inter, sans-serif" }}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(copyValue).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
        className="flex items-center gap-1 text-xs text-[#8D6E63] hover:text-[#3E2723] transition-colors"
        style={{ fontFamily: "Inter, sans-serif" }}
        aria-label="Copy"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
