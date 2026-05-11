import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, Upload, Star, StarOff, Loader2 } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";

const WOOD_TYPES = ["CHERRY", "WALNUT", "MAPLE", "MIXED", "OTHER"] as const;
const CATEGORIES = ["SPOON", "KNIFE", "SCOOP", "SERVING", "CUSTOM"] as const;
const STATUSES = ["IN_STOCK", "MADE_TO_ORDER", "SOLD_OUT", "RETIRED"] as const;
const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

type ProductForm = {
  name: string; slug: string; description: string; price: string;
  woodType: typeof WOOD_TYPES[number]; category: typeof CATEGORIES[number];
  status: typeof STATUSES[number]; quantity: string; leadTimeDays: string;
  featured: boolean; images: string; dimensions: string; careInstructions: string;
};

const defaultForm: ProductForm = {
  name: "", slug: "", description: "", price: "", woodType: "CHERRY",
  category: "SPOON", status: "IN_STOCK", quantity: "1", leadTimeDays: "",
  featured: false, images: "", dimensions: "", careInstructions: "",
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminProducts() {
  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.products.list.useQuery({});
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => { utils.products.list.invalidate(); setModal(null); toast.success("Product created!"); },
    onError: () => toast.error("Failed to create product."),
  });
  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => { utils.products.list.invalidate(); setModal(null); toast.success("Product updated!"); },
    onError: () => toast.error("Failed to update product."),
  });
  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => { utils.products.list.invalidate(); setDeleteConfirm(null); toast.success("Product deleted."); },
    onError: () => toast.error("Failed to delete product."),
  });
  const uploadImage = trpc.products.uploadImage.useMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const { url } = await uploadImage.mutateAsync({ filename: file.name, contentType: file.type, dataUrl });
          setForm((f) => ({ ...f, images: f.images ? f.images + "\n" + url : url }));
          toast.success("Image uploaded!");
        } catch { toast.error("Image upload failed."); }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch { toast.error("Image upload failed."); setUploading(false); }
  }

  const openCreate = () => { setForm(defaultForm); setEditId(null); setModal("create"); };
  const openEdit = (p: NonNullable<typeof products>[number]) => {
    const imgs = Array.isArray(p.images) ? p.images : [];
    setForm({
      name: p.name, slug: p.slug, description: p.description ?? "",
      price: (p.price / 100).toFixed(2), woodType: p.woodType, category: p.category,
      status: p.status, quantity: String(p.quantity), leadTimeDays: p.leadTimeDays ? String(p.leadTimeDays) : "",
      featured: p.featured, images: imgs.join("\n"), dimensions: p.dimensions ?? "",
      careInstructions: p.careInstructions ?? "",
    });
    setEditId(p.id);
    setModal("edit");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name, slug: form.slug || slugify(form.name),
      description: form.description || undefined,
      price: Math.round(parseFloat(form.price) * 100),
      woodType: form.woodType, category: form.category, status: form.status,
      quantity: parseInt(form.quantity) || 0,
      leadTimeDays: form.leadTimeDays ? parseInt(form.leadTimeDays) : undefined,
      featured: form.featured,
      images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
      dimensions: form.dimensions || undefined,
      careInstructions: form.careInstructions || undefined,
    };
    if (modal === "create") createProduct.mutate(payload);
    else if (modal === "edit" && editId) updateProduct.mutate({ id: editId, ...payload });
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
        {label}
      </label>
      {children}
    </div>
  );

  const inputCls = "w-full px-3 py-2 bg-[#0F0A05] border border-[#2D1A0E] rounded text-sm text-[#F5F0EB] placeholder-[#5D4037] focus:outline-none focus:border-[#C9A227]";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-cinzel text-[#F5F0EB] text-2xl" style={{ fontFamily: "Cinzel, serif" }}>
            Products
          </h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#C9A227] text-[#1A1008] font-semibold text-sm rounded hover:bg-[#D4B03A] transition-colors"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <Plus className="w-4 h-4" />
            New Product
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#1A1008] border border-[#2D1A0E] rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>Loading…</div>
          ) : !products || products.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[#8D6E63] mb-4" style={{ fontFamily: "Inter, sans-serif" }}>No products yet.</p>
              <button onClick={openCreate} className="text-[#C9A227] hover:underline text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                Add your first product →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                <thead>
                  <tr className="border-b border-[#2D1A0E]">
                    {["Product", "Category", "Wood", "Price", "Stock", "Status", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-widest uppercase text-[#8D6E63]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const imgs = Array.isArray(p.images) ? p.images : [];
                    return (
                      <tr key={p.id} className="border-b border-[#2D1A0E] hover:bg-[#2D1A0E]/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded overflow-hidden bg-[#2D1A0E] flex-shrink-0">
                              {imgs[0] && <img src={imgs[0]} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <div>
                              <p className="text-[#F5F0EB] font-medium">{p.name}</p>
                              {p.featured && <span className="text-[10px] text-[#C9A227]">★ Featured</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#8D6E63]">{p.category}</td>
                        <td className="px-4 py-3 text-[#8D6E63]">{p.woodType}</td>
                        <td className="px-4 py-3 text-[#F5F0EB] font-semibold">{formatPrice(p.price)}</td>
                        <td className={`px-4 py-3 font-semibold ${p.quantity <= 2 ? "text-red-400" : "text-emerald-400"}`}>
                          {p.quantity}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.status === "IN_STOCK" ? "bg-emerald-900/40 text-emerald-400" :
                            p.status === "MADE_TO_ORDER" ? "bg-blue-900/40 text-blue-400" :
                            "bg-[#2D1A0E] text-[#8D6E63]"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(p)} className="text-[#8D6E63] hover:text-[#C9A227] transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(p.id)} className="text-[#8D6E63] hover:text-red-400 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#1A1008] border border-[#2D1A0E] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D1A0E]">
              <h2 className="font-cinzel text-[#F5F0EB] text-lg" style={{ fontFamily: "Cinzel, serif" }}>
                {modal === "create" ? "New Product" : "Edit Product"}
              </h2>
              <button onClick={() => setModal(null)} className="text-[#8D6E63] hover:text-[#F5F0EB]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Product Name *">
                  <input
                    required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
                    className={inputCls} style={{ fontFamily: "Inter, sans-serif" }}
                  />
                </Field>
                <Field label="Slug">
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className={inputCls} style={{ fontFamily: "Inter, sans-serif" }}
                  />
                </Field>
              </div>
              <Field label="Description">
                <textarea
                  rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputCls} resize-none`} style={{ fontFamily: "Inter, sans-serif" }}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price (USD) *">
                  <input
                    required type="number" step="0.01" min="0" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={inputCls} style={{ fontFamily: "Inter, sans-serif" }}
                  />
                </Field>
                <Field label="Quantity">
                  <input
                    type="number" min="0" value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className={inputCls} style={{ fontFamily: "Inter, sans-serif" }}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Wood Type">
                  <select value={form.woodType} onChange={(e) => setForm({ ...form, woodType: e.target.value as typeof WOOD_TYPES[number] })}
                    className={`${inputCls} bg-[#0F0A05]`} style={{ fontFamily: "Inter, sans-serif" }}>
                    {WOOD_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </Field>
                <Field label="Category">
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as typeof CATEGORIES[number] })}
                    className={`${inputCls} bg-[#0F0A05]`} style={{ fontFamily: "Inter, sans-serif" }}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof STATUSES[number] })}
                    className={`${inputCls} bg-[#0F0A05]`} style={{ fontFamily: "Inter, sans-serif" }}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Lead Time (days)">
                  <input
                    type="number" min="0" value={form.leadTimeDays}
                    onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })}
                    placeholder="e.g. 14"
                    className={inputCls} style={{ fontFamily: "Inter, sans-serif" }}
                  />
                </Field>
                <Field label="Dimensions">
                  <input
                    value={form.dimensions}
                    onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                    placeholder='e.g. 12" × 2" × 0.5"'
                    className={inputCls} style={{ fontFamily: "Inter, sans-serif" }}
                  />
                </Field>
              </div>
              <Field label="Images">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                      className="flex items-center gap-2 px-3 py-2 rounded text-xs bg-[#3E2723] text-[#D7CCC8] hover:bg-[#5D4037] disabled:opacity-50">
                      {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      {uploading ? "Uploading…" : "Upload Image"}
                    </button>
                    <span className="text-xs text-[#5D4037]">or paste URLs below (one per line)</span>
                  </div>
                  <textarea rows={3} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })}
                    placeholder="/manus-storage/... (one URL per line)"
                    className={`${inputCls} resize-none font-mono text-xs`} />
                </div>
              </Field>
              <Field label="Care Instructions">
                <textarea
                  rows={2} value={form.careInstructions}
                  onChange={(e) => setForm({ ...form, careInstructions: e.target.value })}
                  className={`${inputCls} resize-none`} style={{ fontFamily: "Inter, sans-serif" }}
                />
              </Field>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 accent-[#C9A227]"
                />
                <span className="text-sm text-[#D7CCC8]" style={{ fontFamily: "Inter, sans-serif" }}>
                  Featured on homepage
                </span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={() => setModal(null)}
                  className="flex-1 py-2.5 border border-[#2D1A0E] text-[#8D6E63] text-sm rounded hover:border-[#5D4037] hover:text-[#F5F0EB] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                  className="flex-1 py-2.5 bg-[#C9A227] text-[#1A1008] font-semibold text-sm rounded hover:bg-[#D4B03A] transition-colors disabled:opacity-60"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {modal === "create" ? "Create Product" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#1A1008] border border-red-900/50 rounded-lg p-6 max-w-sm w-full text-center">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" strokeWidth={1} />
            <h3 className="font-cinzel text-[#F5F0EB] text-lg mb-2" style={{ fontFamily: "Cinzel, serif" }}>
              Delete Product?
            </h3>
            <p className="text-sm text-[#8D6E63] mb-5" style={{ fontFamily: "Inter, sans-serif" }}>
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-[#2D1A0E] text-[#8D6E63] text-sm rounded hover:border-[#5D4037] transition-colors"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteProduct.mutate({ id: deleteConfirm })}
                disabled={deleteProduct.isPending}
                className="flex-1 py-2.5 bg-red-700 text-white text-sm font-semibold rounded hover:bg-red-600 transition-colors disabled:opacity-60"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
