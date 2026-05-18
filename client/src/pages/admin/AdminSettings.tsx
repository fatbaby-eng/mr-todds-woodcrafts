import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { Save, AtSign, Mail, Phone, Globe, ExternalLink } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";
import {
  SETTING_VENMO_USERNAME,
  SETTING_CONTACT_EMAIL,
  SETTING_CONTACT_PHONE,
  SETTING_SHOP_LIVE,
} from "@shared/const";

type FormState = {
  venmoUsername: string;
  contactEmail: string;
  contactPhone: string;
  shopLive: boolean;
};

const emptyForm: FormState = {
  venmoUsername: "",
  contactEmail: "",
  contactPhone: "",
  shopLive: true,
};

export default function AdminSettings() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.settings.adminAll.useQuery();
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (data) {
      setForm({
        venmoUsername: data.venmoUsername ?? "",
        contactEmail: data.contactEmail ?? "",
        contactPhone: data.contactPhone ?? "",
        shopLive: data.shopLive === null || data.shopLive === "true",
      });
    }
  }, [data]);

  const update = trpc.settings.update.useMutation({
    onError: (err) => toast.error(err.message),
  });

  const handleSave = async () => {
    try {
      await Promise.all([
        update.mutateAsync({
          key: SETTING_VENMO_USERNAME,
          value: form.venmoUsername.trim() || null,
        }),
        update.mutateAsync({
          key: SETTING_CONTACT_EMAIL,
          value: form.contactEmail.trim() || null,
        }),
        update.mutateAsync({
          key: SETTING_CONTACT_PHONE,
          value: form.contactPhone.trim() || null,
        }),
        update.mutateAsync({
          key: SETTING_SHOP_LIVE,
          value: form.shopLive ? "true" : "false",
        }),
      ]);
      await Promise.all([
        utils.settings.adminAll.invalidate(),
        utils.settings.publicAll.invalidate(),
      ]);
      toast.success("Settings saved.");
    } catch {
      /* per-mutation toast already fired */
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1
            className="font-cinzel text-[#F5F0EB] text-2xl mb-1"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Site Settings
          </h1>
          <p className="text-sm text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
            Shop-wide configuration. Changes take effect immediately.
          </p>
        </div>

        {isLoading ? (
          <div className="bg-[#1A1008] border border-[#2D1A0E] rounded-lg p-8 text-center text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
            Loading settings…
          </div>
        ) : (
          <>
            {/* Payment */}
            <div className="bg-[#1A1008] border border-[#2D1A0E] rounded-lg p-6">
              <h2
                className="font-cinzel text-[#C9A227] text-sm tracking-widest uppercase mb-4"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                Payment
              </h2>
              <Field
                label="Venmo Username"
                hint='The "@" handle customers pay. Letters, numbers, dashes, and underscores only. Do not include the "@".'
                icon={AtSign}
              >
                <input
                  type="text"
                  value={form.venmoUsername}
                  onChange={(e) => setForm({ ...form, venmoUsername: e.target.value })}
                  placeholder="e.g. mr-todds-woodcrafts"
                  className="w-full px-3 py-2.5 bg-[#0F0A05] border border-[#2D1A0E] rounded text-sm text-[#F5F0EB] focus:outline-none focus:border-[#C9A227]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
                {form.venmoUsername && (
                  <p className="text-xs text-[#8D6E63] mt-2" style={{ fontFamily: "Inter, sans-serif" }}>
                    Customers will pay <span className="text-[#C9A227]">@{form.venmoUsername.replace(/^@+/, "")}</span>.{" "}
                    <a
                      href={`https://account.venmo.com/u/${form.venmoUsername.replace(/^@+/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 underline hover:text-[#C9A227]"
                    >
                      Open profile <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                )}
              </Field>
            </div>

            {/* Contact */}
            <div className="bg-[#1A1008] border border-[#2D1A0E] rounded-lg p-6 space-y-5">
              <h2
                className="font-cinzel text-[#C9A227] text-sm tracking-widest uppercase"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                Contact
              </h2>
              <Field
                label="Contact Email"
                hint="Used on the storefront and order confirmation emails."
                icon={Mail}
              >
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  placeholder="todd@mrtoddsworkshop.com"
                  className="w-full px-3 py-2.5 bg-[#0F0A05] border border-[#2D1A0E] rounded text-sm text-[#F5F0EB] focus:outline-none focus:border-[#C9A227]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
              </Field>
              <Field
                label="Contact Phone (optional)"
                hint="Optional. Shown on the contact page if filled."
                icon={Phone}
              >
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  placeholder="(402) 555-0100"
                  className="w-full px-3 py-2.5 bg-[#0F0A05] border border-[#2D1A0E] rounded text-sm text-[#F5F0EB] focus:outline-none focus:border-[#C9A227]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
              </Field>
            </div>

            {/* Storefront */}
            <div className="bg-[#1A1008] border border-[#2D1A0E] rounded-lg p-6">
              <h2
                className="font-cinzel text-[#C9A227] text-sm tracking-widest uppercase mb-4"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                Storefront
              </h2>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.shopLive}
                  onChange={(e) => setForm({ ...form, shopLive: e.target.checked })}
                  className="mt-1 h-4 w-4 accent-[#C9A227]"
                />
                <div>
                  <div className="flex items-center gap-2 text-[#F5F0EB] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                    <Globe className="w-4 h-4 text-[#C9A227]" />
                    Shop is live and accepting orders
                  </div>
                  <p className="text-xs text-[#8D6E63] mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
                    Uncheck to temporarily hide the "Add to Cart" button across the storefront
                    (use during travel or large fulfillment backlogs).
                  </p>
                </div>
              </label>
            </div>

            {/* Save */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleSave}
                disabled={update.isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C9A227] text-[#1A1008] font-semibold text-sm tracking-widest uppercase rounded hover:bg-[#D4B03A] transition-colors disabled:opacity-60"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <Save className="w-4 h-4" />
                {update.isPending ? "Saving…" : "Save Settings"}
              </button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function Field({
  label,
  hint,
  icon: Icon,
  children,
}: {
  label: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-xs text-[#8D6E63] mt-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
