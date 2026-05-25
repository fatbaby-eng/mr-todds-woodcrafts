import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Pencil, Trash2, X, MapPin, Calendar, Package } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";

type ShowForm = {
  name: string; location: string; address: string; boothNumber: string;
  startDate: string; endDate: string; isActive: boolean; notes: string;
};
const defaultForm: ShowForm = {
  name: "", location: "", address: "", boothNumber: "",
  startDate: "", endDate: "", isActive: true, notes: "",
};

export default function AdminShows() {
  const utils = trpc.useUtils();
  const { data: shows, isLoading } = trpc.tradeShows.list.useQuery({});
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ShowForm>(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const createShow = trpc.tradeShows.create.useMutation({
    onSuccess: () => { utils.tradeShows.list.invalidate(); setModal(null); toast.success("Show added!"); },
    onError: () => toast.error("Failed to add show."),
  });
  const updateShow = trpc.tradeShows.update.useMutation({
    onSuccess: () => { utils.tradeShows.list.invalidate(); setModal(null); toast.success("Show updated!"); },
    onError: () => toast.error("Failed to update show."),
  });
  const deleteShow = trpc.tradeShows.delete.useMutation({
    onSuccess: () => { utils.tradeShows.list.invalidate(); setDeleteConfirm(null); toast.success("Show deleted."); },
    onError: () => toast.error("Failed to delete show."),
  });

  const openCreate = () => { setForm(defaultForm); setEditId(null); setModal("create"); };
  const openEdit = (s: NonNullable<typeof shows>[number]) => {
    setForm({
      name: s.name, location: s.location, address: s.address ?? "",
      boothNumber: s.boothNumber ?? "", isActive: s.isActive,
      startDate: new Date(s.startDate).toISOString().slice(0, 10),
      endDate: new Date(s.endDate).toISOString().slice(0, 10),
      notes: s.notes ?? "",
    });
    setEditId(s.id);
    setModal("edit");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name, location: form.location,
      address: form.address || undefined,
      boothNumber: form.boothNumber || undefined,
      startDate: new Date(form.startDate),
      endDate: new Date(form.endDate || form.startDate),
      isActive: form.isActive,
      notes: form.notes || undefined,
    };
    if (modal === "create") createShow.mutate(payload);
    else if (modal === "edit" && editId) updateShow.mutate({ id: editId, ...payload });
  };

  const inputCls = "w-full px-3 py-2 bg-[#0F0A05] border border-[#2D1A0E] rounded text-sm text-[#F5F0EB] placeholder-[#5D4037] focus:outline-none focus:border-[#C9A227]";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-cinzel text-[#F5F0EB] text-2xl" style={{ fontFamily: "Cinzel, serif" }}>
            Trade Shows
          </h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#C9A227] text-[#1A1008] font-semibold text-sm rounded hover:bg-[#D4B03A] transition-colors"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <Plus className="w-4 h-4" />
            Add Show
          </button>
        </div>

        {/* Shows list */}
        {isLoading ? (
          <div className="py-12 text-center text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>Loading…</div>
        ) : !shows || shows.length === 0 ? (
          <div className="bg-[#1A1008] border border-[#2D1A0E] rounded-lg py-16 text-center">
            <Calendar className="w-10 h-10 text-[#5D4037] mx-auto mb-3" strokeWidth={1} />
            <p className="text-[#8D6E63] mb-3" style={{ fontFamily: "Inter, sans-serif" }}>No shows scheduled yet.</p>
            <button onClick={openCreate} className="text-[#C9A227] hover:underline text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              Add your first show →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {shows.map((show) => (
              <div
                key={show.id}
                className={`bg-[#1A1008] border rounded-lg p-5 ${show.isActive ? "border-[#2D1A0E]" : "border-[#2D1A0E] opacity-60"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-cinzel text-[#F5F0EB] text-base" style={{ fontFamily: "Cinzel, serif" }}>
                        {show.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        show.isActive ? "bg-emerald-900/40 text-emerald-400" : "bg-[#2D1A0E] text-[#8D6E63]"
                      }`} style={{ fontFamily: "Inter, sans-serif" }}>
                        {show.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>
                          {new Date(show.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          {show.endDate && (
                            <> – {new Date(show.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>{show.location}</span>
                      </div>
                      {show.boothNumber && (
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-[#C9A227]" />
                          <span>Booth {show.boothNumber}</span>
                        </div>
                      )}
                    </div>
                    {show.address && (
                      <p className="text-xs text-[#5D4037] mt-1" style={{ fontFamily: "Inter, sans-serif" }}>{show.address}</p>
                    )}
                    {show.notes && (
                      <p className="text-xs text-[#8D6E63] mt-2 italic" style={{ fontFamily: "Lora, serif" }}>{show.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => openEdit(show)} className="text-[#8D6E63] hover:text-[#C9A227] transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm(show.id)} className="text-[#8D6E63] hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Show Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#1A1008] border border-[#2D1A0E] rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D1A0E]">
              <h2 className="font-cinzel text-[#F5F0EB] text-lg" style={{ fontFamily: "Cinzel, serif" }}>
                {modal === "create" ? "Add Trade Show" : "Edit Trade Show"}
              </h2>
              <button onClick={() => setModal(null)} className="text-[#8D6E63] hover:text-[#F5F0EB]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Show Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nebraska Craft Fair" className={inputCls} style={{ fontFamily: "Inter, sans-serif" }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Start Date *</label>
                  <input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className={`${inputCls} [color-scheme:dark]`} style={{ fontFamily: "Inter, sans-serif" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className={`${inputCls} [color-scheme:dark]`} style={{ fontFamily: "Inter, sans-serif" }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>City / Location *</label>
                <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Omaha, NE" className={inputCls} style={{ fontFamily: "Inter, sans-serif" }} />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Full Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="123 Convention Blvd, Omaha, NE 68102" className={inputCls} style={{ fontFamily: "Inter, sans-serif" }} />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Booth Number / Info</label>
                <input value={form.boothNumber} onChange={(e) => setForm({ ...form, boothNumber: e.target.value })}
                  placeholder="Booth 42 / Aisle C" className={inputCls} style={{ fontFamily: "Inter, sans-serif" }} />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Notes</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={`${inputCls} resize-none`} style={{ fontFamily: "Inter, sans-serif" }} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#C9A227]" />
                <span className="text-sm text-[#D7CCC8]" style={{ fontFamily: "Inter, sans-serif" }}>Show as upcoming on public site</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 py-2.5 border border-[#2D1A0E] text-[#8D6E63] text-sm rounded hover:border-[#5D4037] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif" }}>
                  Cancel
                </button>
                <button type="submit" disabled={createShow.isPending || updateShow.isPending}
                  className="flex-1 py-2.5 bg-[#C9A227] text-[#1A1008] font-semibold text-sm rounded hover:bg-[#D4B03A] transition-colors disabled:opacity-60"
                  style={{ fontFamily: "Inter, sans-serif" }}>
                  {modal === "create" ? "Add Show" : "Save Changes"}
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
            <h3 className="font-cinzel text-[#F5F0EB] text-lg mb-2" style={{ fontFamily: "Cinzel, serif" }}>Delete Show?</h3>
            <p className="text-sm text-[#8D6E63] mb-5" style={{ fontFamily: "Inter, sans-serif" }}>This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-[#2D1A0E] text-[#8D6E63] text-sm rounded hover:border-[#5D4037] transition-colors"
                style={{ fontFamily: "Inter, sans-serif" }}>
                Cancel
              </button>
              <button onClick={() => deleteShow.mutate({ id: deleteConfirm })} disabled={deleteShow.isPending}
                className="flex-1 py-2.5 bg-red-700 text-white text-sm font-semibold rounded hover:bg-red-600 transition-colors disabled:opacity-60"
                style={{ fontFamily: "Inter, sans-serif" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
