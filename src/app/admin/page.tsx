"use client";

import { Card } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, Activity, TrendingUp, ArrowUpRight, ArrowDownRight, MoreHorizontal, PackageCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const stats = [
    { 
      title: "إجمالي الإيرادات", 
      value: "$45,231.89", 
      icon: DollarSign, 
      trend: "+20.1%", 
      isUp: true,
      color: "from-blue-600 to-indigo-600"
    },
    { 
      title: "الطلبات النشطة", 
      value: "2,350", 
      icon: ShoppingCart, 
      trend: "+12.5%", 
      isUp: true,
      color: "from-emerald-600 to-teal-600"
    },
    { 
      title: "العملاء الجدد", 
      value: "1,234", 
      icon: Users, 
      trend: "-3.2%", 
      isUp: false,
      color: "from-amber-600 to-orange-600"
    },
    { 
      title: "معدل التحويل", 
      value: "4.8%", 
      icon: Activity, 
      trend: "+1.2%", 
      isUp: true,
      color: "from-purple-600 to-pink-600"
    },
  ];

  const recentOrders = [
    { id: "ORD-7352", customer: "محمد أحمد", email: "mohamed@example.com", amount: "$49.00", status: "مكتمل", date: "منذ 5 دقائق" },
    { id: "ORD-7351", customer: "خالد عبدالله", email: "khalid@example.com", amount: "$99.00", status: "مكتمل", date: "منذ 15 دقيقة" },
    { id: "ORD-7350", customer: "سارة محمد", email: "sara@example.com", amount: "$49.00", status: "قيد المراجعة", date: "منذ ساعة" },
    { id: "ORD-7349", customer: "فهد عبدالرحمن", email: "fahad@example.com", amount: "$149.00", status: "مكتمل", date: "منذ ساعتين" },
    { id: "ORD-7348", customer: "نورة سعد", email: "noura@example.com", amount: "$49.00", status: "مكتمل", date: "منذ 3 ساعات" },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-alexandria font-black text-white mb-3 tracking-tighter">لوحة التحكم</h1>
          <p className="text-zinc-500 font-cairo text-lg">أهلاً بك مجدداً، يوسف. إليك ملخص العمليات اليوم.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-zinc-900 border-white/10 text-zinc-400 font-cairo px-4 py-2 rounded-xl">20 مايو 2026</Badge>
          <button className="bg-blue-600 hover:bg-blue-500 text-white font-cairo font-bold px-6 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/20">تصدير التقارير</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="glass-card border-white/5 bg-white/5 p-8 relative overflow-hidden group hover:bg-white/[0.08] transition-all duration-500">
              <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl rounded-full bg-gradient-to-br", stat.color)} />
              
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl bg-gradient-to-br", stat.color)}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={cn("flex items-center gap-1 font-bold text-sm", stat.isUp ? "text-emerald-500" : "text-red-500")}>
                  {stat.trend}
                  {stat.isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
              </div>

              <div className="relative z-10">
                <p className="text-zinc-500 font-cairo text-sm font-medium mb-2">{stat.title}</p>
                <h3 className="text-3xl font-alexandria font-black text-white tracking-tighter">{stat.value}</h3>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <Card className="lg:col-span-2 glass-card border-white/5 bg-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-2xl font-alexandria font-black text-white flex items-center gap-3">
              أحدث العمليات
              <Badge className="bg-blue-500/10 text-blue-500 border-none">جديد</Badge>
            </h2>
            <button className="text-zinc-500 hover:text-white transition-colors">عرض الكل</button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-right text-zinc-500 font-alexandria font-bold py-6 px-8">المعرف</TableHead>
                  <TableHead className="text-right text-zinc-500 font-alexandria font-bold">العميل</TableHead>
                  <TableHead className="text-right text-zinc-500 font-alexandria font-bold">المبلغ</TableHead>
                  <TableHead className="text-right text-zinc-500 font-alexandria font-bold">الحالة</TableHead>
                  <TableHead className="text-right text-zinc-500 font-alexandria font-bold">التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id} className="border-white/5 hover:bg-white/[0.03] transition-colors group">
                    <TableCell className="font-bold text-white font-alexandria py-6 px-8">{order.id}</TableCell>
                    <TableCell>
                      <div className="font-bold text-white font-cairo text-base">{order.customer}</div>
                      <div className="text-xs text-zinc-600 font-sans" dir="ltr">{order.email}</div>
                    </TableCell>
                    <TableCell className="text-white font-alexandria font-black">{order.amount}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "rounded-full px-4 py-1 border-none font-cairo font-bold",
                        order.status === 'مكتمل' 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : 'bg-amber-500/10 text-amber-500'
                      )}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-500 font-cairo text-sm">{order.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Quick Actions / Performance */}
        <div className="space-y-8">
          <Card className="glass-card border-white/5 bg-white/5 p-8 rounded-[2.5rem]">
            <h3 className="text-xl font-alexandria font-black text-white mb-8">إجراءات سريعة</h3>
            <div className="grid gap-4">
              <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-blue-600 group transition-all duration-300">
                <span className="flex items-center gap-4">
                  <PackageCheck className="w-6 h-6 text-blue-500 group-hover:text-white" />
                  <span className="text-white font-cairo font-bold">إضافة منتج جديد</span>
                </span>
                <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-white" />
              </button>
              <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-zinc-800 group transition-all duration-300">
                <span className="flex items-center gap-4">
                  <Users className="w-6 h-6 text-zinc-600 group-hover:text-white" />
                  <span className="text-white font-cairo font-bold">إدارة العملاء</span>
                </span>
                <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-white" />
              </button>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-500/20 overflow-hidden relative group">
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <h3 className="text-xl font-alexandria font-black text-white mb-2">أداء المبيعات</h3>
              <p className="text-white/60 font-cairo text-sm mb-6">لقد حققت مبيعات أعلى بنسبة 12% من الأسبوع الماضي.</p>
              <button className="w-full py-4 bg-white text-blue-600 font-alexandria font-black rounded-2xl hover:bg-blue-50 transition-colors">تحليل البيانات</button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

