"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Search, Bell, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "لوحة التحكم", href: "/admin", icon: LayoutDashboard },
    { name: "المنتجات", href: "/admin/products", icon: Package },
    { name: "الطلبات", href: "/admin/orders", icon: ShoppingCart },
    { name: "الإعدادات", href: "/admin/settings", icon: Settings },
  ];

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row font-cairo overflow-hidden">
      {/* Sidebar - Cinematic Dark */}
      <aside className="w-full md:w-72 bg-zinc-950 border-l border-white/5 flex flex-col hidden md:flex shrink-0 relative z-20 shadow-2xl">
        <div className="h-24 flex items-center px-8 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-alexandria font-black text-xl text-white tracking-tighter">ADMIN <span className="text-blue-500">PRO</span></span>
          </Link>
        </div>

        <nav className="flex-1 py-8 px-6 space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" 
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-blue-400")} />
                <span className="font-bold text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-white/5 bg-black/20">
          <button 
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' });
              window.location.href = '/admin/login';
            }}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl text-zinc-500 hover:text-white hover:bg-red-500/10 transition-all w-full group"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-500 transition-colors" />
            <span className="font-bold text-sm">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
        {/* Top Header - Glassmorphic */}
        <header className="h-24 glass border-b border-white/5 flex items-center justify-between px-10 shrink-0 sticky top-0 z-10">
          <div className="flex-1 max-w-xl relative group">
            <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              type="text" 
              placeholder="ابحث عن أي شيء..." 
              className="w-full bg-white/5 border-white/10 h-12 pr-12 rounded-2xl text-white font-cairo focus:border-blue-500 transition-all placeholder:text-zinc-600"
            />
          </div>

          <div className="flex items-center gap-8">
            <button className="relative w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full ring-4 ring-black" />
            </button>
            <div className="flex items-center gap-4 pl-4 border-r border-white/5">
              <div className="text-left hidden md:block">
                <p className="text-white font-bold text-sm">يوسف أحمد</p>
                <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">Super Admin</p>
              </div>
              <Avatar className="w-12 h-12 rounded-2xl border-2 border-white/10 shadow-2xl">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback className="bg-blue-600 text-white">Y</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 md:p-12 overflow-auto relative">
          <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

