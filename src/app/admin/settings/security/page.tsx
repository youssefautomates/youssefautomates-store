"use client";

import { useState } from "react";
import { ShieldCheck, Loader2, ArrowUpRight, CheckCircle2, Lock, Eye, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function SecuritySettings() {
  const [sessions, setSessions] = useState([
    { id: 1, device: "Windows Chrome (صاحب الحساب)", ip: "197.34.120.45", date: "نشط حالياً", active: true },
    { id: 2, device: "iPhone 15 Safari", ip: "197.34.120.90", date: "منذ ساعتين", active: false }
  ]);

  const activityLog = [
    { action: "تسجيل دخول ناجح", user: "يوسف أحمد", ip: "197.34.120.45", date: "منذ 10 دقائق", status: "success" },
    { action: "تعديل بيانات المنتج رقم #809", user: "يوسف أحمد", ip: "197.34.120.45", date: "منذ ساعة", status: "success" },
    { action: "تنزيل تقرير الإيرادات السنوي", user: "يوسف أحمد", ip: "197.34.120.45", date: "منذ 4 ساعات", status: "success" }
  ];

  const handleRevoke = (id: number) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-8 font-cairo text-zinc-100 min-h-screen pb-16">
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-alexandria font-black tracking-tight text-white flex items-center gap-3">
            حماية وأمن النظام
            <ShieldCheck className="w-8 h-8 text-rose-500" />
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            مراقبة الجلسات النشطة، سجل عمليات المشرفين، وإعدادات الوصول الآمن لمتجر Youssef Automates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sessions Control */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-[#09090b]/60 border border-white/5 p-6 shadow-2xl space-y-6">
            <h3 className="font-alexandria font-bold text-sm text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-500" />
              الجلسات النشطة والمصرح لها
            </h3>
            
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{session.device}</h4>
                    <p className="text-[10px] text-zinc-500 mt-1">عنوان IP: {session.ip} · نشاط: {session.date}</p>
                  </div>
                  {session.active ? (
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      الجلسة الحالية
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRevoke(session.id)}
                      className="text-[10px] font-bold px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                    >
                      إنهاء الجلسة
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="rounded-3xl bg-[#09090b]/60 border border-white/5 p-6 shadow-2xl space-y-6">
            <h3 className="font-alexandria font-bold text-sm text-white">سجل العمليات الآمن (Activity Log)</h3>
            <div className="space-y-4">
              {activityLog.map((log, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-white/[0.01] hover:bg-white/[0.02] transition-all">
                  <div>
                    <p className="text-xs font-bold text-white">{log.action}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">بواسطة: {log.user} · عنوان IP: {log.ip}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-bold">{log.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Side Card */}
        <div className="rounded-3xl bg-[#09090b]/60 border border-white/5 p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-alexandria font-bold text-sm text-white mb-6">صلاحيات الوصول والتحكم</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              حسابك الحالي يمتلك صلاحيات المشرف العام الكاملة (Super Admin) والتي تتيح إرسال عمليات الدفع وإلغائها وإدارة قواعد البيانات الرقمية بالكامل.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-2xl bg-white/[0.02]">
                <span className="text-xs text-zinc-400">حالة التحقق الثنائي</span>
                <span className="text-xs font-bold text-emerald-400">مفعّل ونشط</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-2xl bg-white/[0.02]">
                <span className="text-xs text-zinc-400">أمن النقل (SSL)</span>
                <span className="text-xs font-bold text-zinc-300">أعلى درجات التشفير</span>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 mt-6">
            <p className="text-[10px] text-rose-400 leading-relaxed font-bold">
              ⚠️ تنبيه: يرجى عدم تسجيل الدخول مطلقاً من شبكات اتصال عامة غير مشفرة لضمان أمن مبيعات متجرك الرقمي.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
