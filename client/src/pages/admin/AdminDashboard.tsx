import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Package, ShoppingCart, DollarSign, AlertTriangle, ArrowRight, TrendingUp } from "lucide-react";
import AdminLayout from "./AdminLayout";

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-900/40 text-yellow-400",
  PROCESSING: "bg-blue-900/40 text-blue-400",
  SHIPPED: "bg-purple-900/40 text-purple-400",
  DELIVERED: "bg-emerald-900/40 text-emerald-400",
  CANCELLED: "bg-red-900/40 text-red-400",
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();
  const { data: orders } = trpc.orders.list.useQuery({ limit: 5 });

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1
            className="font-cinzel text-[#F5F0EB] text-2xl mb-1"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Dashboard
          </h1>
          <p className="text-sm text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
            Welcome back. Here's what's happening with the shop.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Products",
              value: isLoading ? "—" : stats?.totalProducts ?? 0,
              icon: Package,
              color: "text-[#C9A227]",
              href: "/admin/products",
            },
            {
              label: "Total Orders",
              value: isLoading ? "—" : stats?.totalOrders ?? 0,
              icon: ShoppingCart,
              color: "text-blue-400",
              href: "/admin/orders",
            },
            {
              label: "Pending Orders",
              value: isLoading ? "—" : stats?.pendingOrders ?? 0,
              icon: TrendingUp,
              color: "text-yellow-400",
              href: "/admin/orders",
            },
            {
              label: "Total Revenue",
              value: isLoading ? "—" : formatPrice(stats?.totalRevenue ?? 0),
              icon: DollarSign,
              color: "text-emerald-400",
              href: "/admin/orders",
            },
          ].map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-[#1A1008] border border-[#2D1A0E] rounded-lg p-5 hover:border-[#5D4037] transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold tracking-widest uppercase text-[#8D6E63]" style={{ fontFamily: "Inter, sans-serif" }}>
                  {stat.label}
                </p>
                <stat.icon className={`w-4 h-4 ${stat.color}`} strokeWidth={1.5} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`} style={{ fontFamily: "Inter, sans-serif" }}>
                {stat.value}
              </p>
            </Link>
          ))}
        </div>

        {/* Low Stock Alert */}
        {stats && stats.lowStockProducts.length > 0 && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h2
                className="font-cinzel text-red-400 text-sm"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                Low Stock Alert — {stats.lowStockProducts.length} {stats.lowStockProducts.length === 1 ? "product" : "products"} need attention
              </h2>
            </div>
            <div className="space-y-2">
              {stats.lowStockProducts.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="text-sm text-[#D7CCC8]" style={{ fontFamily: "Inter, sans-serif" }}>
                    {p.name}
                  </span>
                  <span className="text-xs text-red-400 font-semibold" style={{ fontFamily: "Inter, sans-serif" }}>
                    {p.quantity} left
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/admin/inventory"
              className="mt-3 inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Manage inventory <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-[#1A1008] border border-[#2D1A0E] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2D1A0E]">
            <h2
              className="font-cinzel text-[#F5F0EB] text-sm"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs text-[#C9A227] hover:underline flex items-center gap-1"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!orders || orders.length === 0 ? (
            <div className="py-12 text-center text-[#8D6E63] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              No orders yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                <thead>
                  <tr className="border-b border-[#2D1A0E]">
                    {["Order #", "Customer", "Date", "Total", "Status"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold tracking-widest uppercase text-[#8D6E63]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-[#2D1A0E] hover:bg-[#2D1A0E]/40 transition-colors">
                      <td className="px-5 py-3 text-[#C9A227] font-mono text-xs">
                        #{order.orderNumber}
                      </td>
                      <td className="px-5 py-3 text-[#D7CCC8]">{order.customerName}</td>
                      <td className="px-5 py-3 text-[#8D6E63]">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-5 py-3 text-[#F5F0EB] font-semibold">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[order.status] ?? "bg-[#2D1A0E] text-[#8D6E63]"}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
