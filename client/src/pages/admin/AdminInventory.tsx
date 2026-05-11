import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { AlertTriangle, Package, Plus, X, Pencil } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";

const BLANK_STATUSES = ["RAW", "ROUGH_CUT", "CARVING", "FINISHED", "SOLD"] as const;
const WOOD_TYPES = ["CHERRY", "WALNUT", "MAPLE", "MIXED", "OTHER"] as const;
const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

type BlankForm = {
  woodType: typeof WOOD_TYPES[number];
  dimensions: string;
  source: string;
  cost: string;
  status: typeof BLANK_STATUSES[number];
  notes: string;
};
const defaultBlankForm: BlankForm = {
  woodType: "CHERRY", dimensions: "", source: "", cost: "", status: "RAW", notes: "",
};

export default function AdminInventory() {
  const utils = trpc.useUtils();
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery({});
  const { data: blanks, isLoading: blanksLoading } = trpc.inventory.list.useQuery({});
  const [blankModal, setBlankModal] = useState(false);
  const [blankForm, setBlankForm] = useState<BlankForm>(defaultBlankForm);
  const [editBlankId, setEditBlankId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "blanks">("products");

  const updateQty = trpc.products.update.useMutation({
    onSuccess: () => { utils.products.list.invalidate(); toast.success("Quantity updated."); },
    onError: () => toast.error("Failed to update."),
  });

  const createBlank = trpc.inventory.create.useMutation({
    onSuccess: () => { utils.inventory.list.invalidate(); setBlankModal(false); toast.success("Wood blank added!"); },
    onError: () => toast.error("Failed to add blank."),
  });

  const updateBlank = trpc.inventory.update.useMutation({
    onSuccess: () => { utils.inventory.list.invalidate(); setBlankModal(false); toast.success("Blank updated."); },
    onError: () => toast.error("Failed to update blank."),
  });

  const deleteBlank = trpc.inventory.delete.useMutation({
    onSuccess: () => { utils.inventory.list.invalidate(); toast.success("Blank removed."); },
    onError: () => toast.error("Failed to remove blank."),
  });

  const lowStock = products?.filter((p) => p.quantity <= 2 && p.status !== "RETIRED") ?? [];

  const openBlankCreate = () => { setBlankForm(defaultBlankForm); setEditBlankId(null); setBlankModal(true); };
  const openBlankEdit = (b: { id: number; woodType: typeof WOOD_TYPES[number]; dimensions: string | null; source: string | null; cost: number | null; status: typeof BLANK_STATUSES[number]; notes: string | null }) => {
    setBlankForm({
      woodType: b.woodType,
      dimensions: b.dimensions ?? "",
      source: b.source ?? "",
      cost: b.cost ? String(b.cost / 100) : "",
      status: b.status,
      notes: b.notes ?? "",
    });
    setEditBlankId(b.id);
    setBlankModal(true);
  };

  const handleBlankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      woodType: blankForm.woodType,
      dimensions: blankForm.dimensions || undefined,
      source: blankForm.source || undefined,
      cost: blankForm.cost ? Math.round(parseFloat(blankForm.cost) * 100) : undefined,
      status: blankForm.status,
      notes: blankForm.notes || undefined,
    };
    if (editBlankId) updateBlank.mutate({ id: editBlankId, ...payload });
    else createBlank.mutate(payload);
  };

  const inputCls = "w-full px-3 py-2 bg-[#0F0A05] border border-[#2D1A0E] rounded text-sm text-[#F5F0EB] placeholder-[#5D4037] focus:outline-none focus:border-[#C9A227]";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="font-cinzel text-[#F5F0EB] text-2xl" style={{ fontFamily: "Cinzel, serif" }}>
            Inventory
          </h1>
          {activeTab === "blanks" && (
            <button
              onClick={openBlankCreate}
              className="flex items-center gap-2 px-4 py-2 bg-[#C9A227] text-[#1A1008] font-semibold text-sm rounded hover:bg-[#D4B03A] transition-colors"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Plus className="w-4 h-4" />
              Add Wood Blank
            </button>
          )}
        </div>

        {/* Low stock alert */}
        {lowStock.length > 0 && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400 mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
                {lowStock.length} product{lowStock.length > 1 ? "s" : ""} with low stock (≤ 2 units)
              </p>
              <p className="text-xs text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
                {lowStock.map((p) => p.name).join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-[#1A1008] border border-[#2D1A0E] rounded-lg p-1 w-fit">
          {(["products", "blanks"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors capitalize ${
                activeTab === tab ? "bg-[#C9A227] text-[#1A1008]" : "text-[#8D6E63] hover:text-[#F5F0EB]"
              }`}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {tab === "products" ? "Product Stock" : "Wood Blanks"}
            </button>
          ))}
        </div>

        {/* Product Stock Table */}
        {activeTab === "products" && (
          <div className="bg-[#1A1008] border border-[#2D1A0E] rounded-lg overflow-hidden">
            {productsLoading ? (
              <div className="py-12 text-center text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>Loading…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                  <thead>
                    <tr className="border-b border-[#2D1A0E]">
                      {["Product", "Category", "Status", "Stock", "Adjust"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-widest uppercase text-[#8D6E63]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products?.map((p) => (
                      <tr key={p.id} className={`border-b border-[#2D1A0E] ${p.quantity <= 2 ? "bg-red-950/10" : ""}`}>
                        <td className="px-4 py-3">
                          <p className="text-[#F5F0EB]">{p.name}</p>
                          {p.quantity <= 2 && p.status !== "RETIRED" && (
                            <span className="text-[10px] text-red-400 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Low stock
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#8D6E63]">{p.category}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.status === "IN_STOCK" ? "bg-emerald-900/40 text-emerald-400" :
                            p.status === "MADE_TO_ORDER" ? "bg-blue-900/40 text-blue-400" :
                            "bg-[#2D1A0E] text-[#8D6E63]"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className={`px-4 py-3 font-bold ${p.quantity <= 2 ? "text-red-400" : p.quantity <= 5 ? "text-yellow-400" : "text-emerald-400"}`}>
                          {p.quantity}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQty.mutate({ id: p.id, quantity: Math.max(0, p.quantity - 1) })}
                              className="w-7 h-7 rounded bg-[#2D1A0E] text-[#8D6E63] hover:text-[#F5F0EB] hover:bg-[#5D4037] transition-colors flex items-center justify-center text-sm"
                            >
                              −
                            </button>
                            <button
                              onClick={() => updateQty.mutate({ id: p.id, quantity: p.quantity + 1 })}
                              className="w-7 h-7 rounded bg-[#2D1A0E] text-[#8D6E63] hover:text-[#F5F0EB] hover:bg-[#5D4037] transition-colors flex items-center justify-center text-sm"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Wood Blanks Table */}
        {activeTab === "blanks" && (
          <div className="bg-[#1A1008] border border-[#2D1A0E] rounded-lg overflow-hidden">
            {blanksLoading ? (
              <div className="py-12 text-center text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>Loading…</div>
            ) : !blanks || blanks.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="w-10 h-10 text-[#5D4037] mx-auto mb-3" strokeWidth={1} />
                <p className="text-[#8D6E63] mb-3" style={{ fontFamily: "Inter, sans-serif" }}>No wood blanks tracked yet.</p>
                <button onClick={openBlankCreate} className="text-[#C9A227] hover:underline text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                  Add your first blank →
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                  <thead>
                    <tr className="border-b border-[#2D1A0E]">
                      {["Wood Type", "Dimensions", "Source", "Cost", "Status", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-widest uppercase text-[#8D6E63]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {blanks.map((b) => (
                      <tr key={b.id} className="border-b border-[#2D1A0E] hover:bg-[#2D1A0E]/40 transition-colors">
                        <td className="px-4 py-3 text-[#F5F0EB] font-medium">{b.woodType}</td>
                        <td className="px-4 py-3 text-[#8D6E63]">{b.dimensions ?? "—"}</td>
                        <td className="px-4 py-3 text-[#8D6E63]">{b.source ?? "—"}</td>
                        <td className="px-4 py-3 text-[#8D6E63]">{b.cost ? formatPrice(b.cost) : "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            b.status === "FINISHED" ? "bg-emerald-900/40 text-emerald-400" :
                            b.status === "CARVING" ? "bg-orange-900/40 text-orange-400" :
                            b.status === "SOLD" ? "bg-[#2D1A0E] text-[#8D6E63]" :
                            "bg-blue-900/40 text-blue-400"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openBlankEdit(b)} className="text-[#8D6E63] hover:text-[#C9A227] transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteBlank.mutate({ id: b.id })} className="text-[#8D6E63] hover:text-red-400 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Blank Modal */}
      {blankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#1A1008] border border-[#2D1A0E] rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D1A0E]">
              <h2 className="font-cinzel text-[#F5F0EB] text-lg" style={{ fontFamily: "Cinzel, serif" }}>
                {editBlankId ? "Edit Wood Blank" : "Add Wood Blank"}
              </h2>
              <button onClick={() => setBlankModal(false)} className="text-[#8D6E63] hover:text-[#F5F0EB]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBlankSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Wood Type *</label>
                  <select value={blankForm.woodType} onChange={(e) => setBlankForm({ ...blankForm, woodType: e.target.value as typeof WOOD_TYPES[number] })}
                    className={`${inputCls} bg-[#0F0A05]`} style={{ fontFamily: "Inter, sans-serif" }}>
                    {WOOD_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Status</label>
                  <select value={blankForm.status} onChange={(e) => setBlankForm({ ...blankForm, status: e.target.value as typeof BLANK_STATUSES[number] })}
                    className={`${inputCls} bg-[#0F0A05]`} style={{ fontFamily: "Inter, sans-serif" }}>
                    {BLANK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Dimensions</label>
                <input value={blankForm.dimensions} onChange={(e) => setBlankForm({ ...blankForm, dimensions: e.target.value })}
                  placeholder='e.g. 14" × 3" × 1.5"' className={inputCls} style={{ fontFamily: "Inter, sans-serif" }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Source</label>
                  <input value={blankForm.source} onChange={(e) => setBlankForm({ ...blankForm, source: e.target.value })}
                    placeholder="Local mill, etc." className={inputCls} style={{ fontFamily: "Inter, sans-serif" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Cost (USD)</label>
                  <input type="number" step="0.01" min="0" value={blankForm.cost}
                    onChange={(e) => setBlankForm({ ...blankForm, cost: e.target.value })}
                    className={inputCls} style={{ fontFamily: "Inter, sans-serif" }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Notes</label>
                <textarea rows={2} value={blankForm.notes} onChange={(e) => setBlankForm({ ...blankForm, notes: e.target.value })}
                  className={`${inputCls} resize-none`} style={{ fontFamily: "Inter, sans-serif" }} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setBlankModal(false)}
                  className="flex-1 py-2.5 border border-[#2D1A0E] text-[#8D6E63] text-sm rounded hover:border-[#5D4037] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif" }}>
                  Cancel
                </button>
                <button type="submit" disabled={createBlank.isPending || updateBlank.isPending}
                  className="flex-1 py-2.5 bg-[#C9A227] text-[#1A1008] font-semibold text-sm rounded hover:bg-[#D4B03A] transition-colors disabled:opacity-60"
                  style={{ fontFamily: "Inter, sans-serif" }}>
                  {editBlankId ? "Save Changes" : "Add Blank"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
