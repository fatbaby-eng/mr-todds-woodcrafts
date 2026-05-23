import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

const ABOUT_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663636425749/NnkxhKXWD7fvxT2jVUmqJK/about-workshop-mDbzEm83VeFf26wFs83pMw.webp";
const PROCESS_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663636425749/NnkxhKXWD7fvxT2jVUmqJK/process-banner-NRWk3kcMe7ZBPpmt2FU9ag.webp";

const VALUES = [
  {
    title: "Made by Hand",
    desc: "Every piece is carved by hand using traditional tools. No CNC, no shortcuts. Just wood, tools, and time.",
    icon: "✦",
  },
  {
    title: "Wood with a Story",
    desc: "Most of the wood comes from trees that lived somewhere specific — a yard in Omaha, a family property. That matters.",
    icon: "◈",
  },
  {
    title: "Food Safe",
    desc: "All pieces are finished with food-safe oil. Safe for direct food contact right out of the box.",
    icon: "🛡️",
  },
  {
    title: "One of One",
    desc: "Every blank is different. No two pieces come out the same. You're getting something that exists once.",
    icon: "◇",
  },
];

export default function About() {
  return (
    <PublicLayout>
      {/* Header */}
      <div className="pt-24 pb-16 bg-[#3E2723] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url(${PROCESS_IMAGE})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="container relative z-10 text-center">
          <p className="text-[#C9A227] text-xs tracking-[0.3em] uppercase mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
            The Maker
          </p>
          <h1
            className="text-[#F5F0EB] text-4xl md:text-5xl font-cinzel"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Our Story
          </h1>
        </div>
      </div>

      {/* Story */}
      <section className="py-20 bg-[#F5F0EB]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#C9A227] text-xs tracking-[0.3em] uppercase mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
                The Beginning
              </p>
              <h2
                className="text-[#3E2723] text-3xl font-cinzel mb-6 leading-tight"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                Started with
                <br />
                Four Trees
              </h2>
              <div className="space-y-4 text-[#5D4037]" style={{ fontFamily: "Lora, serif" }}>
                <p className="leading-relaxed">
                  Mr. Todd's Workshop started with trees that died in a yard in southeast Omaha. Two cherry and two apricot, planted by my mother-in-law about 35 years ago, taken down slowly by a nearby walnut. When the trees finally came down I could not bring myself to haul the wood off as firewood.
                </p>
                <p className="leading-relaxed">
                  I have cut down three of the four. The last apricot is still standing, dead, waiting.
                </p>
                <p className="leading-relaxed">
                  The first piece was a cane for her. The second was a baby toy. After that the work just kept going.
                </p>
                <p className="leading-relaxed text-[#8D6E63]">
                  Hand tools mostly. Food-safe oil finishes. The grain decides as much as the maker does. No two pieces come out the same, and they aren't meant to be.
                </p>
                <p className="leading-relaxed text-[#8D6E63]">
                  Run out of a workshop in Omaha, Nebraska, by Todd Boswell. Designer by trade, carver by accident.
                </p>
              </div>
            </div>
            <div className="relative">
              <video
                src="/woodCart.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full rounded-lg shadow-xl object-cover aspect-[4/3]"
              />
              <div className="absolute -bottom-4 -left-4 bg-[#C9A227] text-[#3E2723] p-4 rounded shadow-lg hidden lg:block">
                <p className="font-cinzel text-lg font-bold leading-tight" style={{ fontFamily: "Cinzel, serif" }}>Measured in</p>
                <p className="font-cinzel text-lg font-bold leading-tight" style={{ fontFamily: "Cinzel, serif" }}>Grain and Grace</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#3E2723]">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-[#C9A227] text-xs tracking-[0.3em] uppercase mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
              What We Stand For
            </p>
            <h2
              className="text-[#F5F0EB] text-3xl font-cinzel"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              How the Work Gets Done
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((v) => (
              <div key={v.title} className="text-center group">
                <div className="w-16 h-16 rounded-full bg-[#5D4037] flex items-center justify-center mx-auto mb-4 group-hover:bg-[#C9A227] transition-colors duration-300">
                  <span className="text-2xl">{v.icon}</span>
                </div>
                <h3
                  className="font-cinzel text-[#F5F0EB] text-sm mb-3"
                  style={{ fontFamily: "Cinzel, serif" }}
                >
                  {v.title}
                </h3>
                <p className="text-xs text-[#8D6E63] leading-relaxed" style={{ fontFamily: "Lora, serif" }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white text-center">
        <div className="container max-w-2xl">
          <h2
            className="text-[#3E2723] text-2xl font-cinzel mb-4"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Ready to Own a Piece?
          </h2>
          <p className="text-[#8D6E63] mb-8" style={{ fontFamily: "Lora, serif" }}>
            Browse the full collection or reach out to discuss a custom piece.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#3E2723] text-[#D7CCC8] font-semibold text-sm tracking-widest uppercase rounded hover:bg-[#5D4037] transition-colors"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Shop the Collection
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-[#3E2723] text-[#3E2723] font-semibold text-sm tracking-widest uppercase rounded hover:bg-[#3E2723] hover:text-[#D7CCC8] transition-colors"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Custom Order
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
