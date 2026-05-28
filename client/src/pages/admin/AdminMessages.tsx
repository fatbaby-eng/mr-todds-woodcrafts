import { trpc } from "@/lib/trpc";
import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { format } from "date-fns";
import { Mail, MailOpen, Archive, Check, Trash2, Reply } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type Message = {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "unread" | "read" | "archived";
  createdAt: string | Date;
};

export default function AdminMessages() {
  const { data: messages, refetch } = trpc.contactMessages.list.useQuery();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isReplyMode, setIsReplyMode] = useState(false);
  const [replyBody, setReplyBody] = useState("");

  const updateStatus = trpc.contactMessages.updateStatus.useMutation({
    onSuccess: () => refetch(),
  });
  
  const deleteMessage = trpc.contactMessages.delete.useMutation({
    onSuccess: () => {
      toast.success("Message deleted");
      setSelectedMessage(null);
      refetch();
    }
  });

  const sendReply = trpc.contactMessages.reply.useMutation({
    onSuccess: () => {
      toast.success("Reply sent successfully");
      setIsReplyMode(false);
      setReplyBody("");
      refetch();
    }
  });

  const handleUpdateStatus = (id: number, status: "unread" | "read" | "archived") => {
    updateStatus.mutate({ id, status });
    if (status !== "archived") {
      toast.success(`Message marked as ${status}`);
    } else {
      toast.success("Message archived");
    }
  };

  const handleReplySubmit = () => {
    if (!selectedMessage) return;
    if (!replyBody.trim()) {
      toast.error("Reply message cannot be empty");
      return;
    }
    
    sendReply.mutate({
      id: selectedMessage.id,
      to: selectedMessage.email,
      subject: `Re: ${selectedMessage.subject || "Your Message to Mr. Todd's Workshop"}`,
      body: replyBody,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to permanently delete this message?")) {
      deleteMessage.mutate({ id });
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-cinzel text-[#F5F0EB] mb-2" style={{ fontFamily: "Cinzel, serif" }}>Inbox</h1>
          <p className="text-[#A1887F] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>View, reply, and manage customer contact messages.</p>
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
              <tr 
                key={msg.id} 
                className={`${msg.status === "unread" ? "bg-[#2D1A0E]" : ""} hover:bg-[#2D1A0E]/50 transition-colors cursor-pointer`}
                onClick={() => {
                  setSelectedMessage(msg as Message);
                  setIsReplyMode(false);
                  if (msg.status === "unread") handleUpdateStatus(msg.id, "read");
                }}
              >
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
                  <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
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
                    <button onClick={() => handleDelete(msg.id)} className="p-2 text-[#8D6E63] hover:text-red-400 hover:bg-[#3E2723] rounded transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedMessage} onOpenChange={(open) => {
        if (!open) {
          setSelectedMessage(null);
          setIsReplyMode(false);
        }
      }}>
        <DialogContent className="bg-[#1A110B] border-[#3E2723] text-[#F5F0EB] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-cinzel text-[#C9A227]">{selectedMessage?.subject || "Message"}</DialogTitle>
            <DialogDescription className="text-[#A1887F]">
              From {selectedMessage?.name} ({selectedMessage?.email}) on {selectedMessage ? format(new Date(selectedMessage.createdAt), "PPP p") : ""}
            </DialogDescription>
          </DialogHeader>
          
          {!isReplyMode ? (
            <div className="mt-4 p-4 bg-[#2D1A0E] rounded-md border border-[#3E2723] max-h-96 overflow-y-auto">
              <p className="whitespace-pre-wrap text-[#D7CCC8]" style={{ fontFamily: "Inter, sans-serif" }}>
                {selectedMessage?.message}
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="p-3 bg-[#2D1A0E] border border-[#3E2723] rounded-md text-sm text-[#A1887F] italic">
                <p className="mb-2"><strong>Replying to:</strong></p>
                <p className="line-clamp-3">{selectedMessage?.message}</p>
              </div>
              <textarea 
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write your reply here..."
                className="w-full h-48 bg-[#2D1A0E] border border-[#3E2723] rounded-md p-3 text-[#F5F0EB] focus:outline-none focus:border-[#C9A227]"
              />
            </div>
          )}

          <DialogFooter className="mt-6 flex justify-between sm:justify-between items-center w-full">
            <button 
              onClick={() => {
                if (selectedMessage) {
                  handleDelete(selectedMessage.id);
                  setSelectedMessage(null);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-400/10 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setSelectedMessage(null);
                  setIsReplyMode(false);
                }}
                className="px-4 py-2 border border-[#3E2723] text-[#D7CCC8] hover:bg-[#2D1A0E] rounded transition-colors"
              >
                Close
              </button>
              {!isReplyMode ? (
                <button 
                  onClick={() => setIsReplyMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#C9A227] text-[#1A110B] font-semibold hover:bg-[#E8C84A] rounded transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
              ) : (
                <button 
                  onClick={handleReplySubmit}
                  disabled={sendReply.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-[#C9A227] text-[#1A110B] font-semibold hover:bg-[#E8C84A] rounded transition-colors disabled:opacity-50"
                >
                  {sendReply.isPending ? "Sending..." : "Send Reply"}
                </button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
