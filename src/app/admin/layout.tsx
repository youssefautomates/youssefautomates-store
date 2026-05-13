"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "لوحة التحكم", href: "/admin", icon: LayoutDashboard },
    { name: "المنتجات", href: "/admin/products", icon: Package },
    { name: "الطلبات", href: "/admin/orders", icon: ShoppingCart },
    { name: "الإعدادات", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row font-cairo">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900 border-l border-zinc-800 flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Link href="/" className="font-alexandria font-bold text-xl text-white">
            أتمتة <span className="text-indigo-400">برو</span>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-indigo-500/10 text-indigo-400 font-medium" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' });
              window.location.href = '/admin/login';
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <Input 
              type="text" 
              placeholder="ابحث عن منتج أو طلب..." 
              className="w-full bg-zinc-950 border-zinc-800 pl-4 pr-10 text-white font-cairo focus-visible:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="w-9 h-9 border border-zinc-800">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="bg-zinc-800 text-zinc-400">A</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 md:p-8 overflow-auto bg-zinc-950">
          {children}
        </div>
      </main>
    </div>
  );
}
