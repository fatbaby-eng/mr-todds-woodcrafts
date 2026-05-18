import { venmoDisplay, venmoProfileUrl } from "@/siteConfig";

type Props = {
  /** Tighter spacing for sidebars */
  compact?: boolean;
  /** Checkout step uses fuller copy; contact page uses a short blurb */
  mode?: "checkout" | "explainer";
};

export default function VenmoPaymentInfo({ compact, mode = "checkout" }: Props) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-sm text-[#5D4037] leading-relaxed" style={{ fontFamily: "Lora, serif" }}>
        {mode === "checkout" ? (
          <>
            Orders are confirmed here; payment is completed separately through{" "}
            <strong className="text-[#3E2723]">Venmo</strong>. After you submit an order, Todd will email you within 24
            hours with the total (including shipping) and payment instructions.
          </>
        ) : (
          <>
            Shop orders are paid through Venmo after you receive your confirmation email with the total and your order
            number. Other arrangements may be possible for custom work—just ask.
          </>
        )}
      </p>
      {venmoProfileUrl ? (
        <p className="text-sm text-[#5D4037]" style={{ fontFamily: "Inter, sans-serif" }}>
          You can also find Todd on Venmo as{" "}
          <a
            href={venmoProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#C9A227] hover:underline"
          >
            {venmoDisplay}
          </a>
          . Please wait for the confirmation email before paying so the amount and order notes match.
        </p>
      ) : (
        <p className="text-sm text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
          Venmo payment details will be included in your confirmation email.
        </p>
      )}
    </div>
  );
}
