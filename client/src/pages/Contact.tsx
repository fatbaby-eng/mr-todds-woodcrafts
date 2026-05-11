import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Mail, MapPin, Clock, Send, Check } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({
    name: "", email: "", subject: "general", message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const sendMessage = trpc.contact.send.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Message sent! Todd will reply within 1-2 business days.");
    },
    onError: (_err: unknown) => {
      toast.error("Failed to send message. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage.mutate(form);
  };

  return (
    <PublicLayout>
      {/* Header */}
      <div className="pt-24 pb-16 bg-[#3E2723]">
        <div className="container text-center">
          <p className="text-[#C9A227] text-xs tracking-[0.3em] uppercase mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
            Get in Touch
          </p>
          <h1
            className="text-[#F5F0EB] text-4xl md:text-5xl font-cinzel"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Contact
          </h1>
          <p className="text-[#8D6E63] mt-4 max-w-md mx-auto" style={{ fontFamily: "Lora, serif" }}>
            Questions about a piece, custom orders, wholesale inquiries — Todd reads every message.
          </p>
        </div>
      </div>

      <div className="bg-[#F5F0EB] py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* ─── Contact Info ──────────────────────────────────────────── */}
            <div className="space-y-8">
              <div>
                <h2
                  className="font-cinzel text-[#3E2723] text-xl mb-6"
                  style={{ fontFamily: "Cinzel, serif" }}
                >
                  Reach Out
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#C9A227] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                        Email
                      </p>
                      <a href="mailto:todd@mrtodds.com" className="text-sm text-[#3E2723] hover:text-[#C9A227] transition-colors" style={{ fontFamily: "Inter, sans-serif" }}>
                        todd@mrtodds.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#C9A227] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                        Location
                      </p>
                      <p className="text-sm text-[#3E2723]" style={{ fontFamily: "Inter, sans-serif" }}>
                        Omaha, Nebraska
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#C9A227] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                        Response Time
                      </p>
                      <p className="text-sm text-[#3E2723]" style={{ fontFamily: "Inter, sans-serif" }}>
                        1–2 business days
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom orders note */}
              <div className="bg-[#3E2723] rounded-lg p-5">
                <h3
                  className="font-cinzel text-[#C9A227] text-sm mb-2"
                  style={{ fontFamily: "Cinzel, serif" }}
                >
                  Custom Orders
                </h3>
                <p className="text-xs text-[#D7CCC8] leading-relaxed" style={{ fontFamily: "Lora, serif" }}>
                  Todd accepts a limited number of custom commissions each month. Custom pieces typically take 2–4 weeks and start at $75. Describe what you have in mind and he'll get back to you with a quote.
                </p>
              </div>


            </div>

            {/* ─── Contact Form ───────────────────────────────────────────── */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="bg-white border border-[#D7CCC8] rounded-lg p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3
                    className="font-cinzel text-[#3E2723] text-xl mb-2"
                    style={{ fontFamily: "Cinzel, serif" }}
                  >
                    Message Sent!
                  </h3>
                  <p className="text-[#8D6E63]" style={{ fontFamily: "Lora, serif" }}>
                    Thanks for reaching out. Todd will reply within 1–2 business days.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "general", message: "" }); }}
                    className="mt-6 text-sm text-[#C9A227] hover:underline"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white border border-[#D7CCC8] rounded-lg p-8 space-y-5"
                >
                  <h2
                    className="font-cinzel text-[#3E2723] text-xl mb-6"
                    style={{ fontFamily: "Cinzel, serif" }}
                  >
                    Send a Message
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 border border-[#D7CCC8] rounded text-sm text-[#3E2723] placeholder-[#D7CCC8] focus:outline-none focus:border-[#C9A227] transition-colors"
                        placeholder="Jane Smith"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 border border-[#D7CCC8] rounded text-sm text-[#3E2723] placeholder-[#D7CCC8] focus:outline-none focus:border-[#C9A227] transition-colors"
                        placeholder="jane@example.com"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
                      Subject
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-[#D7CCC8] rounded text-sm text-[#3E2723] focus:outline-none focus:border-[#C9A227] transition-colors bg-white"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <option value="general">General Question</option>
                      <option value="custom">Custom Order Inquiry</option>
                      <option value="order">Order Question</option>
                      <option value="wholesale">Wholesale / Retail</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
                      Message *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 border border-[#D7CCC8] rounded text-sm text-[#3E2723] placeholder-[#D7CCC8] focus:outline-none focus:border-[#C9A227] transition-colors resize-none"
                      placeholder="Tell Todd what you're looking for..."
                      style={{ fontFamily: "Inter, sans-serif" }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sendMessage.isPending}
                    className="w-full py-4 flex items-center justify-center gap-2 bg-[#3E2723] text-[#D7CCC8] font-semibold text-sm tracking-widest uppercase rounded hover:bg-[#5D4037] transition-colors disabled:opacity-60"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {sendMessage.isPending ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4" strokeWidth={1.5} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
