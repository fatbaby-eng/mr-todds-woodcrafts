import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { X, ChevronDown, DollarSign } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "CARVING", "FINISHED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
const PAYMENT_STATUS_OPTIONS = ["PENDING", "PAID", "REFUNDED"] as const;
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-900/40 text-yellow-400 border-yellow-900/50",
  CONFIRMED: "bg-blue-900/40 text-blue-400 border-blue-900/50",
  CARVING: "bg-orange-900/40 text-orange-400 border-orange-900/50",
  FINISHED: "bg-teal-900/40 text-teal-400 border-teal-900/50",
  SHIPPED: "bg-purple-900/40 text-purple-400 border-purple-900/50",
  DELIVERED: "bg-emerald-900/40 text-emerald-400 border-emerald-900/50",
  CANCELLED: "bg-red-900/40 text-red-400 border-red-900/50",
};
const PAYMENT_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-900/40 text-yellow-400 border-yellow-900/50",
  PAID: "bg-emerald-900/40 text-emerald-400 border-emerald-900/50",
  REFUNDED: "bg-red-900/40 text-red-400 border-red-900/50",
};

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export default function AdminOrders() {
  const utils = trpc.useUtils();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: orders, isLoading } = trpc.orders.list.useQuery({
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const { data: orderDetail } = trpc.orders.byId.useQuery(
    { id: selectedId! },
    { enabled: selectedId !== null }
  );

  const updateStatus = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      utils.orders.list.invalidate();
      utils.orders.byId.invalidate({ id: selectedId! });
      toast.success("Order status updated.");
    },
    onError: () => toast.error("Failed to update status."),
  });

  const updatePaymentStatus = trpc.orders.updatePaymentStatus.useMutation({
    onSuccess: () => {
      utils.orders.list.invalidate();
      utils.orders.byId.invalidate({ id: selectedId! });
      toast.success("Payment status updated.");
    },
    onError: () => toast.error("Failed to update payment status."),
  });

  const shippingAddr = orderDetail?.shippingAddress as {
    line1?: string; line2?: string; city?: string; state?: string; zip?: string; country?: string;
  } | null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="font-cinzel text-[#F5F0EB] text-2xl" style={{ fontFamily: "Cinzel, serif" }}>
            Orders
          </h1>
          <div className="flex gap-2 flex-wrap">
            {["ALL", ...STATUS_OPTIONS].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  statusFilter === s
                    ? "bg-[#C9A227] text-[#1A1008]"
                    : "bg-[#1A1008] border border-[#2D1A0E] text-[#8D6E63] hover:text-[#F5F0EB]"
                }`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#1A1008] border border-[#2D1A0E] rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>Loading…</div>
          ) : !orders || orders.length === 0 ? (
            <div className="py-16 text-center text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
              No orders found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                <thead>
                  <tr className="border-b border-[#2D1A0E]">
                    {["Order #", "Customer", "Date", "Total", "Payment", "Status", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-widest uppercase text-[#8D6E63]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[#2D1A0E] hover:bg-[#2D1A0E]/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedId(order.id)}
                    >
                      <td className="px-4 py-3 text-[#C9A227] font-mono text-xs">
                        #{order.orderNumber}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[#F5F0EB]">{order.customerName}</p>
                        <p className="text-xs text-[#8D6E63]">{order.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-[#8D6E63]">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-[#F5F0EB] font-semibold">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${PAYMENT_COLORS[order.paymentStatus] ?? "bg-[#2D1A0E] text-[#8D6E63] border-[#2D1A0E]"}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_COLORS[order.status] ?? "bg-[#2D1A0E] text-[#8D6E63] border-[#2D1A0E]"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#8D6E63] text-xs hover:text-[#C9A227]">
                        View →
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#1A1008] border border-[#2D1A0E] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D1A0E]">
              <h2 className="font-cinzel text-[#F5F0EB] text-lg" style={{ fontFamily: "Cinzel, serif" }}>
                Order #{orderDetail?.orderNumber ?? "…"}
              </h2>
              <button onClick={() => setSelectedId(null)} className="text-[#8D6E63] hover:text-[#F5F0EB]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!orderDetail ? (
              <div className="py-12 text-center text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>Loading…</div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Status + Payment update */}
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
                      Status
                    </span>
                    <div className="relative">
                      <select
                        value={orderDetail.status}
                        onChange={(e) => updateStatus.mutate({ id: orderDetail.id, status: e.target.value as typeof STATUS_OPTIONS[number] })}
                        className={`appearance-none pl-3 pr-8 py-1.5 rounded border text-xs font-semibold bg-transparent cursor-pointer focus:outline-none ${STATUS_COLORS[orderDetail.status] ?? "border-[#2D1A0E] text-[#8D6E63]"}`}
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="bg-[#1A1008] text-[#F5F0EB]">{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
                      Payment
                    </span>
                    <div className="relative">
                      <select
                        value={orderDetail.paymentStatus}
                        onChange={(e) => updatePaymentStatus.mutate({ id: orderDetail.id, paymentStatus: e.target.value as typeof PAYMENT_STATUS_OPTIONS[number] })}
                        className={`appearance-none pl-3 pr-8 py-1.5 rounded border text-xs font-semibold bg-transparent cursor-pointer focus:outline-none ${PAYMENT_COLORS[orderDetail.paymentStatus] ?? "border-[#2D1A0E] text-[#8D6E63]"}`}
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {PAYMENT_STATUS_OPTIONS.map((s) => <option key={s} value={s} className="bg-[#1A1008] text-[#F5F0EB]">{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                    </div>
                  </div>

                  {orderDetail.paymentStatus === "PENDING" && (
                    <button
                      onClick={() => updatePaymentStatus.mutate({ id: orderDetail.id, paymentStatus: "PAID" })}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/40 text-emerald-400 border border-emerald-900/50 rounded text-xs font-semibold hover:bg-emerald-900/60 transition-colors"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <DollarSign className="w-3 h-3" />
                      Mark Paid (Venmo received)
                    </button>
                  )}
                </div>

                {/* Customer info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
                      Customer
                    </p>
                    <p className="text-sm text-[#F5F0EB]" style={{ fontFamily: "Inter, sans-serif" }}>{orderDetail.customerName}</p>
                    <p className="text-sm text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>{orderDetail.customerEmail}</p>
                    {orderDetail.customerPhone && (
                      <p className="text-sm text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>{orderDetail.customerPhone}</p>
                    )}
                    <p className="text-xs text-[#8D6E63] mt-2" style={{ fontFamily: "Inter, sans-serif" }}>
                      Payment method: <span className="text-[#F5F0EB]">{orderDetail.paymentMethod}</span>
                    </p>
                  </div>
                  {shippingAddr && (
                    <div>
                      <p className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
                        Ship To
                      </p>
                      <p className="text-sm text-[#F5F0EB]" style={{ fontFamily: "Inter, sans-serif" }}>{shippingAddr.line1}</p>
                      {shippingAddr.line2 && <p className="text-sm text-[#F5F0EB]" style={{ fontFamily: "Inter, sans-serif" }}>{shippingAddr.line2}</p>}
                      <p className="text-sm text-[#F5F0EB]" style={{ fontFamily: "Inter, sans-serif" }}>
                        {shippingAddr.city}, {shippingAddr.state} {shippingAddr.zip}
                      </p>
                      <p className="text-sm text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>{shippingAddr.country}</p>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63] mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
                    Items
                  </p>
                  <div className="space-y-2">
                    {orderDetail.items?.map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-[#2D1A0E]">
                        <div className="flex items-center gap-3">
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                          )}
                          <div>
                            <p className="text-sm text-[#F5F0EB]" style={{ fontFamily: "Inter, sans-serif" }}>{item.productName}</p>
                            <p className="text-xs text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-[#F5F0EB]" style={{ fontFamily: "Inter, sans-serif" }}>
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-sm text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
                    <span>Shipping</span>
                    <span>{formatPrice(orderDetail.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-[#F5F0EB] pt-1 border-t border-[#2D1A0E]" style={{ fontFamily: "Inter, sans-serif" }}>
                    <span>Total</span>
                    <span>{formatPrice(orderDetail.totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
