import { trpc } from "@/lib/trpc";
import { Users, Mail, Trash2 } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminSubscribers() {
  const utils = trpc.useUtils();
  const { data: subscribers, isLoading } = trpc.subscribers.list.useQuery();
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const deleteSub = trpc.subscribers.delete.useMutation({
    onSuccess: () => {
      utils.subscribers.list.invalidate();
      setDeleteConfirm(null);
      toast.success("Subscriber deleted.");
    },
    onError: () => toast.error("Failed to delete subscriber."),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-cinzel text-[#F5F0EB] text-2xl" style={{ fontFamily: "Cinzel, serif" }}>
            Subscribers
          </h1>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1008] border border-[#2D1A0E] rounded text-sm text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
            <Users className="w-4 h-4" />
            {subscribers?.length ?? 0} total
          </div>
        </div>

        <div className="bg-[#1A1008] border border-[#2D1A0E] rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="py-12 text-center text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>Loading…</div>
          ) : !subscribers || subscribers.length === 0 ? (
            <div className="py-16 text-center">
              <Mail className="w-10 h-10 text-[#5D4037] mx-auto mb-3" strokeWidth={1} />
              <p className="text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>No subscribers yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                <thead>
                  <tr className="border-b border-[#2D1A0E]">
                    {["Email", "Source", "Subscribed", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-widest uppercase text-[#8D6E63]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="border-b border-[#2D1A0E] hover:bg-[#2D1A0E]/40 transition-colors">
                      <td className="px-4 py-3 text-[#F5F0EB]">{sub.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2D1A0E] text-[#8D6E63]">
                          {sub.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#8D6E63]">
                        {new Date(sub.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setDeleteConfirm(sub.id)} className="text-[#8D6E63] hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Delete Confirm */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#1A1008] border border-red-900/50 rounded-lg p-6 max-w-sm w-full text-center">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" strokeWidth={1} />
            <h3 className="font-cinzel text-[#F5F0EB] text-lg mb-2" style={{ fontFamily: "Cinzel, serif" }}>
              Delete Subscriber?
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
                onClick={() => deleteSub.mutate({ id: deleteConfirm })}
                disabled={deleteSub.isPending}
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
