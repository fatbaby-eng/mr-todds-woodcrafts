import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Package, ShoppingCart, Layers, CalendarDays,
  Users, LogOut, Menu, X, ChevronRight, AlertTriangle, MessageSquare
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/inventory", label: "Inventory", icon: Layers },
  { href: "/admin/messages", label: "Inbox", icon: MessageSquare },
  { href: "/admin/shows", label: "Trade Shows", icon: CalendarDays },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: stats } = trpc.admin.stats.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1008] flex items-center justify-center">
        <div className="text-[#C9A227] font-cinzel text-lg animate-pulse" style={{ fontFamily: "Cinzel, serif" }}>
          Loading…
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1A1008] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-cinzel text-[#C9A227] text-2xl mb-4" style={{ fontFamily: "Cinzel, serif" }}>
            Admin Access Required
          </h1>
          <p className="text-[#8D6E63] mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
            Please sign in to access the admin panel.
          </p>
          <a
            href={getLoginUrl()}
            className="inline-block px-8 py-3 bg-[#C9A227] text-[#1A1008] font-semibold text-sm tracking-widest uppercase rounded hover:bg-[#D4B03A] transition-colors"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#1A1008] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-[#C9A227] mx-auto mb-4" strokeWidth={1} />
          <h1 className="font-cinzel text-[#F5F0EB] text-2xl mb-4" style={{ fontFamily: "Cinzel, serif" }}>
            Access Denied
          </h1>
          <p className="text-[#8D6E63] mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
            You don't have permission to access this area.
          </p>
          <Link href="/" className="text-[#C9A227] hover:underline" style={{ fontFamily: "Inter, sans-serif" }}>
            ← Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const Sidebar = () => (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#2D1A0E]">
        <Link href="/admin" onClick={() => setSidebarOpen(false)}>
          <p className="text-[#C9A227] font-cinzel text-xs tracking-[0.2em] uppercase" style={{ fontFamily: "Cinzel, serif" }}>
            Mr. Todd's
          </p>
          <p className="text-[#F5F0EB] font-cinzel text-sm" style={{ fontFamily: "Cinzel, serif" }}>
            Admin Panel
          </p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = location === href || (href !== "/admin" && location.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
                active
                  ? "bg-[#C9A227] text-[#1A1008] font-semibold"
                  : "text-[#8D6E63] hover:text-[#F5F0EB] hover:bg-[#2D1A0E]"
              }`}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {label === "Inventory" && stats && stats.lowStockProducts.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.lowStockProducts.length}
                </span>
              )}
              {label === "Orders" && stats && stats.pendingOrders > 0 && (
                <span className="ml-auto bg-[#C9A227] text-[#1A1008] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.pendingOrders}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-[#2D1A0E]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#C9A227] flex items-center justify-center text-[#1A1008] font-bold text-sm">
            {user?.name?.charAt(0) ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#F5F0EB] truncate" style={{ fontFamily: "Inter, sans-serif" }}>
              {user?.name ?? "Admin"}
            </p>
            <p className="text-[10px] text-[#8D6E63] truncate" style={{ fontFamily: "Inter, sans-serif" }}>
              {user?.email ?? ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-[#8D6E63] hover:text-[#F5F0EB] border border-[#2D1A0E] rounded hover:border-[#5D4037] transition-colors"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <ChevronRight className="w-3 h-3" />
            Store
          </Link>
          <button
            onClick={() => logout()}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-[#8D6E63] hover:text-red-400 border border-[#2D1A0E] rounded hover:border-red-900 transition-colors"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <LogOut className="w-3 h-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F0A05] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-[#1A1008] border-r border-[#2D1A0E] flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-[#1A1008] border-r border-[#2D1A0E]">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-[#8D6E63] hover:text-[#F5F0EB]"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#1A1008] border-b border-[#2D1A0E]">
          <button onClick={() => setSidebarOpen(true)} className="text-[#8D6E63] hover:text-[#F5F0EB]">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-cinzel text-[#C9A227] text-sm" style={{ fontFamily: "Cinzel, serif" }}>
            Admin Panel
          </span>
        </div>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
