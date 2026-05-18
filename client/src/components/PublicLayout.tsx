import { useCart } from "@/contexts/CartContext";
import { ShoppingBag, Menu, X, Hammer } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import CartDrawer from "./CartDrawer";
import { trpc } from "@/lib/trpc";
import { SITE_CONFIG } from "@shared/storefront";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { itemCount, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const isHome = location === "/";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--cream)" }}>
      {/* ─── Top Navigation ─────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || !isHome
            ? "bg-[#3E2723] shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="container flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Hammer
              className="w-6 h-6 text-[#C9A227] group-hover:rotate-12 transition-transform duration-300"
              strokeWidth={1.5}
            />
            <div className="leading-tight">
              <div
                className="text-[#C9A227] font-cinzel text-sm md:text-base font-semibold tracking-widest uppercase"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                Mr. Todd's
              </div>
              <div
                className="text-[#D7CCC8] font-cinzel text-xs tracking-[0.2em] uppercase"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                Woodcrafts
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-inter text-sm tracking-widest uppercase transition-colors duration-200 ${
                  location === link.href
                    ? "text-[#C9A227]"
                    : "text-[#D7CCC8] hover:text-[#C9A227]"
                }`}
                style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.12em" }}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="font-inter text-sm tracking-widest uppercase text-[#8D6E63] hover:text-[#C9A227] transition-colors"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={openCart}
              className="relative p-2 text-[#D7CCC8] hover:text-[#C9A227] transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#C9A227] text-[#3E2723] text-[10px] font-bold flex items-center justify-center font-inter">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-[#D7CCC8] hover:text-[#C9A227] transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#3E2723] border-t border-[#5D4037] py-4">
            <nav className="container flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-3 font-inter text-sm tracking-widest uppercase border-b border-[#5D4037]/50 ${
                    location === link.href ? "text-[#C9A227]" : "text-[#D7CCC8]"
                  }`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {link.label}
                </Link>
              ))}
              {user?.role === "admin" && (
                <Link href="/admin" className="py-3 font-inter text-sm tracking-widest uppercase text-[#8D6E63]">
                  Admin
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* ─── Main content ───────────────────────────────────────────────────── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-[#3E2723] text-[#D7CCC8] pt-16 pb-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Hammer className="w-5 h-5 text-[#C9A227]" strokeWidth={1.5} />
                <span
                  className="text-[#C9A227] font-cinzel text-lg font-semibold tracking-widest"
                  style={{ fontFamily: "Cinzel, serif" }}
                >
                  Mr. Todd's Woodcrafts
                </span>
              </div>
              <p className="text-sm text-[#8D6E63] leading-relaxed" style={{ fontFamily: "Lora, serif" }}>
                Hand-carved kitchen and home objects. Material-led, one of one. Made in {SITE_CONFIG.location}.
              </p>
              <p className="text-xs text-[#C9A227] mt-3" style={{ fontFamily: "Inter, sans-serif" }}>
                {SITE_CONFIG.acceptedPaymentLabel} for online orders
              </p>
            </div>

            {/* Links */}
            <div>
              <h4
                className="text-[#C9A227] font-cinzel text-xs tracking-[0.2em] uppercase mb-4"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                Navigate
              </h4>
              <ul className="space-y-2">
                {[...NAV_LINKS, { href: "/kiosk", label: "Kiosk Mode" }].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#8D6E63] hover:text-[#D7CCC8] transition-colors"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4
                className="text-[#C9A227] font-cinzel text-xs tracking-[0.2em] uppercase mb-4"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                Stay in Touch
              </h4>
              <p className="text-sm text-[#8D6E63] mb-4" style={{ fontFamily: "Lora, serif" }}>
                New pieces, show schedules, and restocks delivered to your inbox.
              </p>
              <NewsletterForm />
            </div>
          </div>

          <div className="border-t border-[#5D4037] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#5D4037]" style={{ fontFamily: "Inter, sans-serif" }}>
              © {new Date().getFullYear()} Mr. Todd's Woodcrafts. All rights reserved.
            </p>
            <p className="text-xs text-[#5D4037]" style={{ fontFamily: "Inter, sans-serif" }}>
              {SITE_CONFIG.domain} - handcrafted in {SITE_CONFIG.location}
            </p>
          </div>
        </div>
      </footer>

      <CartDrawer />
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const subscribe = trpc.subscribers.subscribe.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <p className="text-sm text-[#C9A227]" style={{ fontFamily: "Lora, serif" }}>
        Thank you for subscribing!
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email) subscribe.mutate({ email });
      }}
      className="flex gap-2"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="flex-1 px-3 py-2 text-sm bg-[#5D4037] border border-[#8D6E63] rounded text-[#D7CCC8] placeholder-[#8D6E63] focus:outline-none focus:border-[#C9A227]"
        style={{ fontFamily: "Inter, sans-serif" }}
      />
      <button
        type="submit"
        disabled={subscribe.isPending}
        className="px-4 py-2 text-xs font-semibold tracking-widest uppercase bg-[#C9A227] text-[#3E2723] rounded hover:bg-[#E8C84A] transition-colors disabled:opacity-50"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {subscribe.isPending ? "..." : "Join"}
      </button>
    </form>
  );
}
