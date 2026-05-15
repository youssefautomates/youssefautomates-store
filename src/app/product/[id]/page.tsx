"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, FileText, Zap, ChevronRight, Lock, PlayCircle, Star, 
  ShieldCheck, Download, Users, Check, Infinity, Target, Sparkles, 
  MonitorPlay, ArrowLeft, Rocket, Gift, ShieldAlert, HeartHandshake,
  MessageCircle, Clock, Smartphone
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { supabase } from "@/lib/supabase";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "previews" | "reviews">("details");

  useEffect(() => {
    fetchProduct();
  }, [resolvedParams.id]);

  async function fetchProduct() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", resolvedParams.id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const defaultProduct = {
    title: "مكتبة الأتمتة الشاملة: +2000 تدفق عمل (n8n Workflows) جاهز للاستخدام",
    price: "49.00",
    original_price: "199.00",
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop"
  };

  const currentProduct = product || defaultProduct;
  
  // Normalize fields in case they come from DB or default
  const displayProduct = {
    name: currentProduct.title || currentProduct.name,
    price: currentProduct.price,
    originalPrice: currentProduct.original_price || currentProduct.originalPrice,
    image: currentProduct.image_url || currentProduct.image
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      
      <main className="pt-24 md:pt-32 pb-24">
        {/* Cinematic Header Section */}
        <section className="container mx-auto px-4 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row gap-12 items-start"
          >
            {/* Left: Product Visuals */}
            <div className="w-full lg:w-[55%] space-y-6">
              <div className="relative aspect-[16/10] bg-zinc-100 rounded-[2.5rem] overflow-hidden shadow-2xl group border border-zinc-200">
                <Image 
                  src={currentProduct.image} 
                  alt={currentProduct.name} 
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent opacity-40" />
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute top-6 left-6 glass px-4 py-2 rounded-2xl flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="font-cairo text-xs font-bold text-white uppercase tracking-widest">Premium Asset</span>
                </motion.div>
              </div>

              {/* Quick Benefits Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Download, label: "تحميل فوري", color: "text-blue-600" },
                  { icon: Clock, label: "توفير وقت", color: "text-emerald-600" },
                  { icon: ShieldCheck, label: "آمن 100%", color: "text-sky-600" },
                  { icon: MessageCircle, label: "دعم متميز", color: "text-amber-600" }
                ].map((item, i) => (
                  <div key={i} className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                    <item.icon className={cn("w-6 h-6", item.color)} />
                    <span className="font-cairo text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Persuasive Copy */}
            <div className="w-full lg:w-[45%] space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-600 text-white border-none font-cairo px-4 py-1.5 rounded-full text-xs font-bold">
                  🔥 الحزمة الأكثر طلباً لعام 2024
                </Badge>
                <h1 className="text-4xl md:text-6xl font-alexandria font-black text-zinc-900 leading-[1.1] tracking-tighter">
                  {currentProduct.name}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="flex text-yellow-400">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
                  </div>
                  <span className="font-cairo text-sm font-bold text-zinc-500 underline underline-offset-4 decoration-zinc-200">284 تقييم موثق</span>
                </div>
              </div>

              <p className="text-xl text-zinc-600 font-cairo leading-relaxed">
                توقف عن إضاعة وقتك في بناء العمليات من الصفر. احصل على الخلاصة التي طورناها على مدار سنوات لتشغيل البيزنس الخاص بك بذكاء خارق. <span className="text-zinc-900 font-bold">نسخ ولصق فقط.</span>
              </p>

              {/* Desktop Checkout Box */}
              <div className="hidden lg:block glass-card p-8 rounded-[2rem] border-blue-100 bg-white/80">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col">
                    <span className="text-zinc-400 font-cairo text-lg line-through">{currentProduct.originalPrice} ج.م</span>
                    <span className="text-5xl font-alexandria font-black text-zinc-900">{currentProduct.price} ج.م</span>
                  </div>
                  <Badge className="bg-red-500 text-white font-bold px-4 py-2 rounded-xl border-none">خصم 75% اليوم</Badge>
                </div>
                
                <Link
                  href={`/checkout/${resolvedParams.id}`}
                  className="w-full h-20 inline-flex items-center justify-center gap-3 bg-zinc-900 hover:bg-blue-600 text-white font-cairo text-2xl font-black rounded-2xl transition-all shadow-2xl hover:shadow-blue-500/20 active:scale-95"
                >
                  امتلك الحزمة الآن
                  <ArrowLeft className="w-6 h-6 rtl:rotate-180" />
                </Link>
                
                <p className="text-center mt-4 font-cairo text-xs text-zinc-400 flex items-center justify-center gap-2">
                  <Lock className="w-3 h-3" />
                  دفع آمن 100% عبر بروتوكولات مشفرة
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Value Stacking Section */}
        <section className="bg-zinc-900 py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-alexandria font-black text-white mb-8 tracking-tight">ماذا ستحصل عليه <span className="text-blue-500">بالضبط؟</span></h2>
              <p className="text-zinc-400 font-cairo text-lg md:text-xl">نحن لا نبيعك ملفات فقط، بل نبيعك "الوقت" والحرية المالية.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { 
                  title: "مكتبة الـ +2000 Workflow", 
                  value: "قيمة 500$", 
                  desc: "أضخم مكتبة عربية منظمة ومقسمة لسهولة الاستخدام والبحث.",
                  icon: Rocket,
                  color: "bg-blue-600"
                },
                { 
                  title: "دليل الإطلاق السريع (PDF)", 
                  value: "قيمة 99$", 
                  desc: "دليل خطوة بخطوة بالصور لضمان تفعيل الحزم في أقل من 5 دقائق.",
                  icon: FileText,
                  color: "bg-sky-500"
                },
                { 
                  title: "تحديثات مدى الحياة", 
                  value: "قيمة 199$", 
                  desc: "كل حزمة جديدة نضيفها مستقبلاً ستصلك مجاناً وبدون أي تكلفة إضافية.",
                  icon: Infinity,
                  color: "bg-emerald-500"
                },
                { 
                  title: "دعم فني مخصص (VIP)", 
                  value: "قيمة 150$", 
                  desc: "فريقنا متواجد للرد على استفساراتك وحل المشاكل التقنية التي قد تواجهك.",
                  icon: HeartHandshake,
                  color: "bg-amber-500"
                }
              ].map((item, i) => (
                <div key={i} className="relative group overflow-hidden bg-white/5 border border-white/10 rounded-[2.5rem] p-10 hover:bg-white/10 transition-all duration-500">
                  <div className="flex items-start justify-between mb-8">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg", item.color)}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold px-3 py-1">{item.value}</Badge>
                  </div>
                  <h3 className="text-2xl font-alexandria font-black text-white mb-4">{item.title}</h3>
                  <p className="text-zinc-400 font-cairo text-lg leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-20 p-12 rounded-[3rem] bg-blue-600 text-white text-center shadow-2xl shadow-blue-500/20">
              <p className="text-xl md:text-3xl font-alexandria font-bold mb-4">إجمالي قيمة ما تحصل عليه: <span className="line-through opacity-60">948 ج.م</span></p>
              <h3 className="text-4xl md:text-7xl font-alexandria font-black">احصل عليها اليوم بـ {currentProduct.price} ج.م فقط!</h3>
            </div>
          </div>
        </section>

        {/* Feature Tabs Section */}
        <section className="container mx-auto px-4 py-24 md:py-32">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="w-full lg:w-1/3">
              <div className="sticky top-32 space-y-6">
                <h2 className="text-3xl md:text-5xl font-alexandria font-black text-zinc-900 mb-10 leading-tight">نظرة أعمق على القوة التي ستمتلكها</h2>
                <div className="flex flex-col gap-3">
                  {[
                    { id: "details", label: "التفاصيل التقنية", icon: Target },
                    { id: "previews", label: "معاينة النظام", icon: MonitorPlay },
                    { id: "reviews", label: "آراء المشترين", icon: Star },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex items-center justify-between px-8 py-6 rounded-2xl font-cairo font-bold text-lg transition-all duration-300",
                        activeTab === tab.id 
                          ? "bg-zinc-900 text-white shadow-xl" 
                          : "bg-white border border-zinc-100 text-zinc-500 hover:bg-zinc-50"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <tab.icon className="w-6 h-6" />
                        {tab.label}
                      </span>
                      <ChevronRight className={cn("w-5 h-5 transition-transform", activeTab === tab.id ? "rotate-90" : "")} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-2/3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-[3rem] p-8 md:p-12 border border-zinc-100 shadow-sm min-h-[600px]"
                >
                  {activeTab === "details" && (
                    <div className="space-y-12">
                      <div className="prose prose-zinc max-w-none">
                        <h3 className="text-3xl font-alexandria font-black text-zinc-900 mb-8">لماذا هذه الحزمة فريدة؟</h3>
                        <p className="text-xl text-zinc-600 font-cairo leading-relaxed mb-8">
                          لقد استغرقنا أكثر من 3 سنوات في تطوير واختبار هذه المكتبة. كل عقدة تم وضعها بعناية، وكل تدفق تم تجريبه في بيئة عمل حقيقية قبل إضافته للمكتبة.
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none p-0">
                          {[
                            "تحسين الأداء بنسبة تصل إلى 400%",
                            "تقليل أخطاء الإدخال اليدوي بنسبة 99%",
                            "تكامل كامل مع ChatGPT و OpenAI",
                            "دعم الربط مع واتساب وتليجرام",
                            "نظام إدارة فواتير آلي بالكامل",
                            "أتمتة خدمة العملاء على مدار الساعة"
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-4 bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100">
                              <CheckCircle2 className="w-6 h-6 text-blue-600 mt-1" />
                              <span className="font-cairo text-lg font-bold text-zinc-900">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === "previews" && (
                    <div className="space-y-8 text-center">
                      <h3 className="text-3xl font-alexandria font-black text-zinc-900">شاهد النظام وهو يعمل</h3>
                      <div className="aspect-video relative rounded-3xl overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-800">
                        <Image 
                          src="https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=1200&auto=format&fit=crop"
                          alt="Workflow Preview"
                          fill
                          className="object-cover opacity-40"
                        />
                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-6 p-8">
                          <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer">
                            <PlayCircle className="w-12 h-12 text-white" />
                          </div>
                          <p className="font-cairo text-white text-xl font-bold">معاينة فيديو سريعة: كيف تقوم بالاستيراد؟</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {[1,2,3].map(i => (
                          <div key={i} className="aspect-square bg-zinc-100 rounded-2xl border border-zinc-200" />
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "reviews" && (
                    <div className="space-y-8">
                      <div className="flex flex-col md:flex-row items-center gap-10 p-10 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
                        <div className="text-center">
                          <p className="text-7xl font-alexandria font-black text-zinc-900">5.0</p>
                          <div className="flex text-yellow-400 my-4">
                            {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 fill-current" />)}
                          </div>
                          <p className="text-zinc-500 font-cairo">متوسط تقييم العملاء</p>
                        </div>
                        <div className="flex-1 space-y-4">
                          {[5,4,3,2,1].map(s => (
                            <div key={s} className="flex items-center gap-4">
                              <span className="w-4 font-bold text-zinc-900">{s}</span>
                              <div className="flex-1 h-3 bg-zinc-200 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400" style={{ width: s === 5 ? '98%' : '2%' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-6">
                        {[
                          { name: "محمد سليم", comment: "أفضل استثمار قمت به في عام 2024. الحزم مرتبة جداً وسهلة الاستخدام." },
                          { name: "علي القحطاني", comment: "وفرت عليّ أياماً من البرمجة والبحث. جودة التدفقات عالمية." }
                        ].map((r, i) => (
                          <div key={i} className="p-8 bg-white border border-zinc-100 rounded-3xl shadow-sm">
                            <p className="text-xl text-zinc-600 font-cairo italic mb-6">"{r.comment}"</p>
                            <p className="font-alexandria font-bold text-zinc-900">-{r.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* FAQ Section - Objection Handling */}
        <section className="bg-white border-y border-zinc-100 py-24 md:py-40">
          <div className="container mx-auto px-4">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-alexandria font-black text-zinc-900 mb-8 tracking-tight">أسئلة قد تدور <span className="text-blue-600">في ذهنك</span></h2>
              <p className="text-zinc-500 font-cairo text-lg md:text-xl">نحن شفافون تماماً معك، ابدأ بثقة.</p>
            </div>

            <div className="max-w-4xl mx-auto grid gap-6">
              {[
                { q: "هل أحتاج اشتراك في n8n؟", a: "يمكنك استخدام النسخة المجانية التي تقوم بتنصيبها على سيرفرك الخاص (Self-hosted) أو النسخة السحابية. الحزم تعمل مع الجميع." },
                { q: "ماذا لو لم تعمل الحزمة معي؟", a: "هذا نادر جداً، ولكن إذا حدث، فريقنا سيتدخل فوراً لمساعدتك أو تعديل الحزمة بما يتوافق مع بيئة عملك." },
                { q: "هل الدفع آمن؟", a: "نعم، نستخدم بوابات دفع مشفرة عالمياً (Paymob) ولا نطلع على أي من بياناتك البنكية." },
                { q: "هل يمكنني بيع هذه التدفقات؟", a: "لا، الرخصة تمنحك حق الاستخدام الشخصي أو لاستخدامها في مشاريع عملائك كجزء من خدمتك، ولا يحق لك إعادة بيع المكتبة كمنتج رقمي." }
              ].map((faq, i) => (
                <details key={i} className="group glass-card rounded-3xl p-8 cursor-pointer open:bg-zinc-900 open:text-white transition-all duration-300">
                  <summary className="font-alexandria font-bold text-xl flex justify-between items-center outline-none list-none">
                    {faq.q}
                    <ChevronDown className="w-6 h-6 text-zinc-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-8 text-zinc-500 group-open:text-zinc-300 font-cairo text-lg leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile Sticky CTA */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-zinc-200 p-6 z-50 flex items-center justify-between gap-6 shadow-[0_-10px_50px_rgba(0,0,0,0.1)] pb-safe">
          <div className="flex flex-col">
            <span className="text-zinc-400 font-cairo text-sm line-through">{currentProduct.originalPrice} ج.م</span>
            <span className="text-3xl font-alexandria font-black text-zinc-900">{currentProduct.price} ج.م</span>
          </div>
          <Link
            href={`/checkout/${resolvedParams.id}`}
            className="flex-1 h-14 bg-zinc-900 text-white font-cairo font-black text-lg rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            اشتري الآن
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}

