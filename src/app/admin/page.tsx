"use client";

import { Card } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, Activity, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const stats = [
    { title: "إجمالي الإيرادات", value: "45,231.89 ج.م", icon: DollarSign, trend: "+20.1% من الشهر الماضي" },
    { title: "الطلبات", value: "+2350", icon: ShoppingCart, trend: "+180.1% من الشهر الماضي" },
    { title: "العملاء", value: "+12,234", icon: Users, trend: "+19% من الشهر الماضي" },
    { title: "المنتجات النشطة", value: "12", icon: Activity, trend: "+2 منذ الشهر الماضي" },
  ];

  const recentOrders = [
    { id: "ORD-7352", customer: "محمد أحمد", email: "mohamed@example.com", amount: "49.00 ج.م", status: "مكتمل", date: "اليوم" },
    { id: "ORD-7351", customer: "خالد عبدالله", email: "khalid@example.com", amount: "99.00 ج.م", status: "مكتمل", date: "اليوم" },
    { id: "ORD-7350", customer: "سارة محمد", email: "sara@example.com", amount: "49.00 ج.م", status: "قيد الانتظار", date: "أمس" },
    { id: "ORD-7349", customer: "فهد عبدالرحمن", email: "fahad@example.com", amount: "149.00 ج.م", status: "مكتمل", date: "أمس" },
    { id: "ORD-7348", customer: "نورة سعد", email: "noura@example.com", amount: "49.00 ج.م", status: "مكتمل", date: "2 مايو 2026" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-alexandria font-bold text-white mb-2">نظرة عامة</h1>
        <p className="text-zinc-400 font-cairo">إليك ملخص أداء متجرك اليوم.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-zinc-400 font-cairo text-sm font-medium mb-1">{stat.title}</p>
                <h3 className="text-2xl font-alexandria font-bold text-white">{stat.value}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <p className="text-xs text-emerald-400 font-cairo flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {stat.trend}
            </p>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-alexandria font-semibold text-white">أحدث الطلبات</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-950/50">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-right text-zinc-400 font-cairo">رقم الطلب</TableHead>
                <TableHead className="text-right text-zinc-400 font-cairo">العميل</TableHead>
                <TableHead className="text-right text-zinc-400 font-cairo">المبلغ</TableHead>
                <TableHead className="text-right text-zinc-400 font-cairo">الحالة</TableHead>
                <TableHead className="text-right text-zinc-400 font-cairo">التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                  <TableCell className="font-medium text-white font-alexandria">{order.id}</TableCell>
                  <TableCell>
                    <div className="font-cairo text-white">{order.customer}</div>
                    <div className="text-xs text-zinc-500 font-sans" dir="ltr">{order.email}</div>
                  </TableCell>
                  <TableCell className="text-indigo-400 font-medium">{order.amount}</TableCell>
                  <TableCell>
                    <Badge className={
                      order.status === 'مكتمل' 
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                    }>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-400 font-cairo">{order.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
