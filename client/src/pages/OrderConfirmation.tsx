import { Check } from "lucide-react";
import { Link, useParams, useSearch } from "wouter";

export default function OrderConfirmation() {
  const params = useParams<{ orderNumber: string }>();
  const search = useSearch();
  const orderNumber = params.orderNumber ?? "";
  const fromStripe = new URLSearchParams(search).get("stripe") === "success";

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
          {fromStripe ? "Payment Received" : "Order Confirmed!"}
        </h1>
        <p
          className="text-[#5D4037] mb-2"
          style={{ fontFamily: "Lora, serif" }}
        >
          {fromStripe
            ? "Thanks for your order. Todd will begin work on your pieces shortly."
            : "Thank you for your order."}
        </p>
        <div className="bg-white border border-[#D7CCC8] rounded-lg p-6 my-6 text-left">
          <p
            className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Order Number
          </p>
          <p
            className="font-cinzel text-[#3E2723] text-xl"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            #{orderNumber}
          </p>
          <p
            className="text-sm text-[#8D6E63] mt-3"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            A confirmation will be sent to the email you provided at checkout.
          </p>
          <p
            className="text-sm text-[#8D6E63] mt-2"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Estimated shipping: 3–7 business days (made-to-order pieces: 2–4 weeks).
          </p>
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
