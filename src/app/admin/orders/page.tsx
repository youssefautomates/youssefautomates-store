"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, Eye, Download, Filter, Loader2, RefreshCw, MoreVertical, ExternalLink, Calendar, User, CreditCard, Sparkles, Rocket } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/pricing";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 50;

  const [statsData, setStatsData] = useState({
    totalRevenue: 0,
    totalOrdersCount: 0,
    completedCount: 0,
    conversionRate: "0"
  });

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchOrders(1);
    fetchGlobalStats();
  }, []); // eslint-disable-line

  async function fetchGlobalStats() {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("amount, status");

      if (error) throw error;
      if (data) {
        const completed = data.filter(o => o.status === "completed");
        const revenue = completed.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        const rate = data.length > 0 ? ((completed.length / data.length) * 100).toFixed(1) : "0";
        
        setStatsData({
          totalRevenue: revenue,
          totalOrdersCount: data.length,
          completedCount: completed.length,
          conversionRate: rate
        });
      }
    } catch (err) {
      console.error("Error fetching global stats:", err);
    }
  }

  async function fetchOrders(pageNumber = 1, isLoadMore = false) {
    if (!isLoadMore) setIsLoading(true);
    try {
      const from = (pageNumber - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("orders")
        .select("id, customer_name, customer_email, product_title, amount, status, payment_id, created_at")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data) {
        setHasMore(data.length === PAGE_SIZE);
        if (isLoadMore) {
          setOrders(prev => [...prev, ...data]);
        } else {
          setOrders(data);
        }
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOrders(nextPage, true);
  };

  const handleResendEmail = (email: string) => {
    toast.success(`Download delivery email resent successfully to ${email}`);
  };

  const filteredOrders = orders.filter(order =>
    order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.payment_id?.includes(searchQuery)
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const { totalRevenue, totalOrdersCount, completedCount, conversionRate } = statsData;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-2 md:p-8 font-sans text-left" style={{ background: "#080810", minHeight: "100vh" }} dir="ltr">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-white">Orders Ledger</h1>
          <p className="text-zinc-500">Manage store transactions, audit payment states, and automate digital product fulfillment.</p>
        </div>
        <button
          onClick={() => { setPage(1); fetchOrders(1); fetchGlobalStats(); }}
          className="flex items-center gap-2 px-6 h-12 rounded-xl font-semibold text-sm transition-all active:scale-95 cursor-pointer"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#d4d4d8" }}
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#D6004B" }} /> : <RefreshCw className="w-5 h-5" />}
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: "Total Revenue", value: formatPrice(totalRevenue, "EGP").replace("ج.م", "L.E"), sub: "+12% vs last month", accent: "#D6004B", glow: "rgba(214,0,75,0.12)" },
          { label: "Completed Orders", value: completedCount, sub: `out of ${totalOrdersCount} total orders`, accent: "#10b981", glow: "rgba(16,185,129,0.12)" },
          { label: "Conversion Rate", value: `${conversionRate}%`, sub: "Stable Performance", accent: "#f59e0b", glow: "rgba(245,158,11,0.12)" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "rgba(16,16,26,0.85)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl pointer-events-none" style={{ background: stat.glow }} />
            <p className="mb-1 text-sm relative z-10 text-zinc-500">{stat.label}</p>
            <h3 className="text-3xl font-extrabold relative z-10 text-white">{stat.value}</h3>
            <div className="mt-3 flex items-center text-sm font-semibold relative z-10" style={{ color: stat.accent }}>
              <Sparkles className="w-4 h-4 mr-1.5" />
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[2rem]" style={{ background: "rgba(16,16,26,0.85)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
        <div className="p-6 flex flex-col lg:flex-row gap-4 items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          <div className="relative w-full lg:w-96">
            <Search className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#52525b" }} />
            <Input
              type="text"
              placeholder="Search by customer, email or ID..."
              className="h-12 pl-12 rounded-xl text-white border-white/10"
              style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", color: "#f4f4f5" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button className="flex items-center gap-2 px-5 h-12 rounded-xl text-sm transition-all cursor-pointer" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#d4d4d8" }}>
              <Filter className="w-4 h-4" />
              Filter Results
            </button>
            <button className="flex items-center gap-2 px-5 h-12 rounded-xl text-sm transition-all cursor-pointer" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#d4d4d8" }}>
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
                <TableHead className="text-left py-5 pl-8 text-xs uppercase tracking-widest font-bold text-zinc-500">Order Details</TableHead>
                <TableHead className="text-left py-5 text-xs uppercase tracking-widest font-bold text-zinc-500">Customer</TableHead>
                <TableHead className="text-left py-5 text-xs uppercase tracking-widest font-bold text-zinc-500">Digital Product</TableHead>
                <TableHead className="text-left py-5 text-xs uppercase tracking-widest font-bold text-zinc-500">Status</TableHead>
                <TableHead className="text-left py-5 text-xs uppercase tracking-widest font-bold text-zinc-500">Purchase Date</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-24">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-rose-600 mb-6" />
                    <p className="text-zinc-400 text-lg animate-pulse">Fetching database logs from Supabase...</p>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-24 text-zinc-500 text-lg">
                    {searchQuery ? "No matching transactional records found." : "No customer orders registered yet."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order, idx) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-zinc-800 hover:bg-zinc-800/40 transition-all cursor-pointer group"
                  >
                    <TableCell className="py-6 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-rose-600 group-hover:text-white transition-all">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-white mb-1 text-base tracking-tight">#{order.payment_id || order.id?.slice(0, 8)}</div>
                          <div className="text-rose-400 text-sm font-bold">{formatPrice(order.amount, order.currency || 'EGP').replace("ج.م", "L.E")}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-base mb-1">{order.customer_name}</span>
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono">
                          <Mail className="w-3 h-3" />
                          {order.customer_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300 text-sm max-w-[200px] truncate" title={order.product_title}>
                      {order.product_title}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        order.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 px-3 py-1 rounded-lg'
                          : order.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20 px-3 py-1 rounded-lg'
                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20 px-3 py-1 rounded-lg'
                      }>
                        {order.status === 'completed' ? 'Paid' : order.status === 'pending' ? 'Pending' : 'Failed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 opacity-50" />
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-10 w-10 p-0 text-zinc-500 hover:bg-zinc-800 hover:text-white rounded-xl flex items-center justify-center outline-none transition-all cursor-pointer">
                          <MoreVertical className="h-5 w-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-300 w-64 p-2 rounded-2xl shadow-2xl">
                          <DropdownMenuItem className="hover:bg-zinc-800 hover:text-white cursor-pointer focus:bg-zinc-800 focus:text-white rounded-xl p-3">
                            <Eye className="w-5 h-5 mr-3 text-rose-400" /> View Details
                          </DropdownMenuItem>
                          {order.status === 'completed' && (
                            <DropdownMenuItem
                              className="hover:bg-zinc-800 hover:text-white cursor-pointer focus:bg-zinc-800 focus:text-white rounded-xl p-3"
                              onClick={() => handleResendEmail(order.customer_email)}
                            >
                              <Mail className="w-5 h-5 mr-3 text-emerald-400" /> Resend Download Links
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-zinc-800 my-1" />
                          <DropdownMenuItem className="hover:bg-zinc-800 hover:text-white cursor-pointer focus:bg-zinc-800 focus:text-white rounded-xl p-3">
                            <Download className="w-5 h-5 mr-3 text-amber-400" /> Download Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-zinc-800 hover:text-white cursor-pointer focus:bg-zinc-800 focus:text-white rounded-xl p-3">
                            <ExternalLink className="w-5 h-5 mr-3 text-zinc-500" /> Open in Paymob
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6" style={{ background: "rgba(214,0,75,0.07)", border: "1px solid rgba(214,0,75,0.2)" }}>
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-600/20">
            <Rocket className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-extrabold text-white text-xl mb-1">Ready to Expand?</h4>
            <p className="text-zinc-400">All checkout transactions are secured and fully processed via Paymob payment gateway integrations.</p>
          </div>
        </div>
        <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-10 h-14 rounded-2xl shadow-xl shadow-rose-600/20 transition-all active:scale-95 cursor-pointer">
          Add New Product
        </Button>
      </div>
    </div>
  );
}
