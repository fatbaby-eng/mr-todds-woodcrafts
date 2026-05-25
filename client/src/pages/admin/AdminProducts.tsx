import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, Upload, Star, StarOff, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";

const CATEGORIES = ["SPOON", "KNIFE", "SCOOP", "SERVING", "CUSTOM"] as const;
const WOOD_TYPES = ["CHERRY", "WALNUT", "MAPLE", "APRICOT", "MIXED", "OTHER"] as const;
const STATUSES = ["IN_STOCK", "MADE_TO_ORDER", "SOLD_OUT", "RETIRED"] as const;
const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

type CustomOption = {
  name: string;
  type: string;
  choices: string;
  required: boolean;
};

type VolumeDiscount = {
  quantity: number;
  pricePerUnit: number;
};

type ProductForm = {
  name: string; slug: string; description: string; price: string;
  woodType: typeof WOOD_TYPES[number]; category: typeof CATEGORIES[number];
  status: typeof STATUSES[number]; quantity: string; leadTimeDays: string;
  featured: boolean; allowsCustomWood: boolean; images: string; dimensions: string; careInstructions: string;
  customOptions: CustomOption[]; volumeDiscounts: VolumeDiscount[];
};

const defaultForm: ProductForm = {
  name: "", slug: "", description: "", price: "", woodType: "CHERRY",
  category: "SPOON", status: "IN_STOCK", quantity: "1", leadTimeDays: "",
  featured: false, allowsCustomWood: false, images: "", dimensions: "", careInstructions: "",
  customOptions: [], volumeDiscounts: [],
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
      {label}
    </label>
    {children}
  </div>
);

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
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const { url } = await uploadImage.mutateAsync({ filename: file.name, contentType: file.type, dataUrl });
        urls.push(url);
      }
      setForm((f) => ({ ...f, images: f.images ? f.images + "\n" + urls.join("\n") : urls.join("\n") }));
      toast.success(`${urls.length} image(s) uploaded!`);
    } catch {
      toast.error("Some images failed to upload.");
    } finally {
      setUploading(false);
      // Reset input value so the same files can be selected again
      if (e.target) e.target.value = "";
    }
  }

  const openCreate = () => { setForm(defaultForm); setEditId(null); setModal("create"); };
  const openEdit = (p: NonNullable<typeof products>[number]) => {
    const imgs = Array.isArray(p.images) ? p.images : [];
    setForm({
      name: p.name, slug: p.slug, description: p.description ?? "",
      price: (p.price / 100).toFixed(2), woodType: p.woodType, category: p.category,
      status: p.status, quantity: String(p.quantity), leadTimeDays: p.leadTimeDays ? String(p.leadTimeDays) : "",
      featured: p.featured, allowsCustomWood: p.allowsCustomWood ?? false, images: imgs.join("\n"), dimensions: p.dimensions ?? "",
      careInstructions: p.careInstructions ?? "",
      customOptions: ((p.customOptions as any[]) || []).map(opt => ({
        ...opt,
        choices: Array.isArray(opt.choices) ? opt.choices.map((c: any) => c.label).join(", ") : (opt.choices || "")
      })),
      volumeDiscounts: (p.volumeDiscounts as any[]) || [],
    });
    setEditId(p.id);
    setModal("edit");
  };

  const imagesList = form.images.split("\n").map(s => s.trim()).filter(Boolean);

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...imagesList];
    if (direction === 'left' && index > 0) {
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    } else if (direction === 'right' && index < newImages.length - 1) {
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    }
    setForm({ ...form, images: newImages.join("\n") });
  };

  const removeImage = (index: number) => {
    const newImages = imagesList.filter((_, i) => i !== index);
    setForm({ ...form, images: newImages.join("\n") });
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
      allowsCustomWood: form.allowsCustomWood,
      images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
      dimensions: form.dimensions || undefined,
      careInstructions: form.careInstructions || undefined,
      customOptions: form.customOptions.map(opt => ({
        ...opt,
        choices: opt.type === "select" ? opt.choices.split(",").map(c => ({ label: c.trim() })).filter(c => c.label) : undefined
      })),
      volumeDiscounts: form.volumeDiscounts,
    };
    if (modal === "create") createProduct.mutate(payload);
    else if (modal === "edit" && editId) updateProduct.mutate({ id: editId, ...payload });
  };

  const inputCls = "w-full px-3 py-2 bg-[#0F0A05] border border-[#2D1A0E] rounded text-sm text-[#F5F0EB] placeholder-[#5D4037] focus:outline-none focus:border-[#C9A227]";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-cinzel text-[#F5F0EB] text-2xl" style={{ fontFamily: "Cinzel, serif" }}>
            Products
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!products) return;
                const headers = ["ID", "Name", "Slug", "Price (cents)", "Quantity", "Wood Type", "Category", "Status", "Featured", "Dimensions"];
                const rows = products.map(p => [
                  p.id, `"${p.name}"`, p.slug, p.price, p.quantity, p.woodType, p.category, p.status, p.featured, `"${p.dimensions ?? ""}"`
                ]);
                const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `products-export-${new Date().toISOString().split("T")[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#2D1A0E] text-[#C9A227] font-semibold text-sm rounded hover:bg-[#3E2723] transition-colors border border-[#C9A227]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Export CSV
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-[#C9A227] text-[#1A1008] font-semibold text-sm rounded hover:bg-[#D4B03A] transition-colors"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Plus className="w-4 h-4" />
              New Product
            </button>
          </div>
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
                              {p.featured && <span className="text-[10px] text-[#C9A227] flex items-center gap-1 mt-0.5"><Star className="w-3 h-3 fill-[#C9A227]" /> Featured</span>}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="space-y-4 pt-4 border-t border-[#2D1A0E]">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold tracking-widest uppercase text-[#F5F0EB]" style={{ fontFamily: "Cinzel, serif" }}>Custom Options</label>
                  <button type="button" onClick={() => setForm({ ...form, customOptions: [...form.customOptions, { name: "", type: "text", choices: "", required: false }] })} className="text-xs text-[#C9A227] hover:text-[#D4AF37] flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Option
                  </button>
                </div>
                {form.customOptions.map((opt, i) => (
                  <div key={i} className="p-4 rounded border border-[#2D1A0E] bg-[#140C07] space-y-3 relative">
                    <button type="button" onClick={() => setForm({ ...form, customOptions: form.customOptions.filter((_, idx) => idx !== i) })} className="absolute top-2 right-2 text-[#8D6E63] hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                      <input placeholder="Option Name (e.g. Wood Choice)" value={opt.name} onChange={(e) => { const arr = [...form.customOptions]; arr[i].name = e.target.value; setForm({ ...form, customOptions: arr }); }} className={inputCls} />
                      <select value={opt.type} onChange={(e) => { const arr = [...form.customOptions]; arr[i].type = e.target.value; setForm({ ...form, customOptions: arr }); }} className={inputCls}>
                        <option value="text">Text Input</option>
                        <option value="select">Dropdown Options</option>
                      </select>
                    </div>
                    {opt.type === "select" && (
                      <input placeholder="Choices (comma separated)" value={opt.choices} onChange={(e) => { const arr = [...form.customOptions]; arr[i].choices = e.target.value; setForm({ ...form, customOptions: arr }); }} className={inputCls} />
                    )}
                    <label className="flex items-center gap-2 text-xs text-[#8D6E63]">
                      <input type="checkbox" checked={opt.required} onChange={(e) => { const arr = [...form.customOptions]; arr[i].required = e.target.checked; setForm({ ...form, customOptions: arr }); }} className="rounded border-[#2D1A0E] bg-[#0F0A05] text-[#C9A227] focus:ring-[#C9A227]" />
                      Required field
                    </label>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 pb-2 border-t border-[#2D1A0E]">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold tracking-widest uppercase text-[#F5F0EB]" style={{ fontFamily: "Cinzel, serif" }}>Volume Discounts</label>
                  <button type="button" onClick={() => setForm({ ...form, volumeDiscounts: [...form.volumeDiscounts, { quantity: 2, pricePerUnit: parseFloat(form.price || "0") }] })} className="text-xs text-[#C9A227] hover:text-[#D4AF37] flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Discount
                  </button>
                </div>
                {form.volumeDiscounts.map((vd, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs text-[#8D6E63]">Buy</span>
                      <input type="number" min="2" value={vd.quantity} onChange={(e) => { const arr = [...form.volumeDiscounts]; arr[i].quantity = parseInt(e.target.value) || 2; setForm({ ...form, volumeDiscounts: arr }); }} className={inputCls} />
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs text-[#8D6E63]">for $</span>
                      <input type="number" step="0.01" min="0" value={vd.pricePerUnit} onChange={(e) => { const arr = [...form.volumeDiscounts]; arr[i].pricePerUnit = parseFloat(e.target.value) || 0; setForm({ ...form, volumeDiscounts: arr }); }} className={inputCls} placeholder="Price per unit" />
                    </div>
                    <span className="text-xs text-[#8D6E63]">each</span>
                    <button type="button" onClick={() => setForm({ ...form, volumeDiscounts: form.volumeDiscounts.filter((_, idx) => idx !== i) })} className="text-[#8D6E63] hover:text-red-400 p-2">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Field label="Description">
                <textarea
                  rows={10} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputCls} resize-none font-mono`} style={{ fontFamily: "Inter, sans-serif" }}
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                      className="flex items-center gap-2 px-3 py-2 rounded text-xs bg-[#3E2723] text-[#D7CCC8] hover:bg-[#5D4037] disabled:opacity-50">
                      {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      {uploading ? "Uploading…" : "Upload Image"}
                    </button>
                  </div>
                  {imagesList.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {imagesList.map((img, i) => (
                        <div key={i} className="relative group rounded border border-[#2D1A0E] overflow-hidden bg-[#0F0A05]">
                          <img src={img} alt="" className="w-full h-24 object-cover" />
                          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => removeImage(i)} className="bg-red-900/80 text-red-100 p-1 rounded hover:bg-red-600 flex items-center justify-center">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="absolute bottom-1 left-1 right-1 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => moveImage(i, 'left')} disabled={i === 0} className="bg-black/70 text-white p-1 rounded disabled:opacity-30 hover:bg-black flex items-center justify-center">
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button type="button" onClick={() => moveImage(i, 'right')} disabled={i === imagesList.length - 1} className="bg-black/70 text-white p-1 rounded disabled:opacity-30 hover:bg-black flex items-center justify-center">
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                          {i === 0 && (
                            <div className="absolute top-1 left-1 bg-[#C9A227] text-[#1A1008] text-[10px] font-bold px-1.5 py-0.5 rounded">
                              MAIN
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
