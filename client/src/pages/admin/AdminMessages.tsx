import { trpc } from "@/lib/trpc";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { format } from "date-fns";
import { Mail, MailOpen, Archive, Check } from "lucide-react";
import { toast } from "sonner";

export default function AdminMessages() {
  const { data: messages, refetch } = trpc.contactMessages.list.useQuery();
  const updateStatus = trpc.contactMessages.updateStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const handleUpdateStatus = (id: number, status: "unread" | "read" | "archived") => {
    updateStatus.mutate({ id, status });
    toast.success(`Message marked as ${status}`);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-cinzel text-[#F5F0EB] mb-2" style={{ fontFamily: "Cinzel, serif" }}>Inbox</h1>
          <p className="text-[#A1887F] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>View and manage customer contact messages.</p>
        </div>
      </div>

      <div className="bg-[#1A110B] border border-[#3E2723] rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left" style={{ fontFamily: "Inter, sans-serif" }}>
          <thead className="text-xs uppercase bg-[#2D1A0E] text-[#D7CCC8]">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-widest">Status</th>
              <th className="px-6 py-4 font-semibold tracking-widest">Date</th>
              <th className="px-6 py-4 font-semibold tracking-widest">Customer</th>
              <th className="px-6 py-4 font-semibold tracking-widest">Subject</th>
              <th className="px-6 py-4 font-semibold tracking-widest">Message</th>
              <th className="px-6 py-4 font-semibold tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3E2723]">
            {messages?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[#8D6E63]">
                  No messages found.
                </td>
              </tr>
            )}
            {messages?.map((msg) => (
              <tr key={msg.id} className={`${msg.status === "unread" ? "bg-[#2D1A0E]" : ""} hover:bg-[#2D1A0E]/50 transition-colors`}>
                <td className="px-6 py-4">
                  {msg.status === "unread" && <Mail className="w-4 h-4 text-[#C9A227]" />}
                  {msg.status === "read" && <MailOpen className="w-4 h-4 text-[#8D6E63]" />}
                  {msg.status === "archived" && <Archive className="w-4 h-4 text-[#5D4037]" />}
                </td>
                <td className="px-6 py-4 text-[#D7CCC8] whitespace-nowrap">
                  {format(new Date(msg.createdAt), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-[#F5F0EB]">{msg.name}</div>
                  <div className="text-xs text-[#8D6E63]">{msg.email}</div>
                </td>
                <td className="px-6 py-4 text-[#D7CCC8]">
                  {msg.subject || "No Subject"}
                </td>
                <td className="px-6 py-4 text-[#D7CCC8] max-w-xs truncate" title={msg.message}>
                  {msg.message}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {msg.status === "unread" && (
                      <button onClick={() => handleUpdateStatus(msg.id, "read")} className="p-2 text-[#8D6E63] hover:text-[#C9A227] hover:bg-[#3E2723] rounded transition-colors" title="Mark as Read">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {msg.status !== "archived" && (
                      <button onClick={() => handleUpdateStatus(msg.id, "archived")} className="p-2 text-[#8D6E63] hover:text-[#D7CCC8] hover:bg-[#3E2723] rounded transition-colors" title="Archive">
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
