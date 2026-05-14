"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, Clock, CheckCircle2, ChevronDown, ChevronLeft, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { SalesPopup } from "@/components/ui/SalesPopup";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { InfiniteTestimonials } from "@/components/ui/InfiniteTestimonials";
import { cn } from "@/lib/utils";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("store_products");
    if (saved) {
      setProducts(JSON.parse(saved).filter((p: any) => p.status === "نشط"));
    } else {
      setProducts([
        { id: 1, name: "حزمة أتمتة خدمة العملاء الذكية", price: "49.00", originalPrice: "99.00", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop", isFeatured: true },
        { id: 2, name: "دليل بناء بوت تليجرام متقدم", price: "39.00", originalPrice: "79.00", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop", isFeatured: false },
      ]);
    }
  }, []);

  return (
    <>
      <Navbar />
      <SalesPopup />
      
      <main className="flex-1 flex flex-col pt-16 bg-white">
        {/* Premium Cinematic Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-20 md:pt-32 md:pb-32 bg-grid-pattern">
          {/* Animated Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-[120px]" 
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -5, 0],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-sky-300/10 rounded-full blur-[100px]" 
            />
          </div>
          
          <div className="container relative mx-auto px-4 z-10">
            <div className="max-w-5xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-blue-100 px-4 py-2 rounded-full mb-8 shadow-sm"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <span className="font-cairo text-sm font-bold text-blue-700">تحديث مايو 2024: 12 حزمة جديدة متاحة الآن</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-6xl md:text-8xl lg:text-9xl font-alexandria font-black text-zinc-900 mb-8 leading-[1.1] tracking-tighter"
              >
                حوّل عملك إلى <br />
                <span className="text-gradient">ماكينة أرباح</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl md:text-2xl lg:text-3xl text-zinc-600 font-cairo max-w-3xl mx-auto mb-12 leading-relaxed"
              >
                وفر 40+ ساعة أسبوعياً. احصل على أقوى تدفقات عمل <span className="font-bold text-zinc-900 underline decoration-blue-500/30">n8n</span> الجاهزة للاستخدام الفوري. لا برمجة، لا تعقيد، فقط نتائج.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col md:flex-row items-center justify-center gap-6"
              >
                <Link
                  href="#products"
                  className="group relative h-20 px-12 inline-flex items-center justify-center gap-3 bg-zinc-900 text-white rounded-2xl font-cairo text-xl font-bold shadow-2xl hover:shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 w-full md:w-auto"
                >
                  <span className="relative z-10">تصفح الحزم المميزة</span>
                  <ChevronLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-sky-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                </Link>
                
                <div className="flex flex-col items-center md:items-start">
                  <div className="flex -space-x-3 rtl:space-x-reverse mb-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-zinc-200 overflow-hidden shadow-sm">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="customer" />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
                      +1.2k
                    </div>
                  </div>
                  <p className="font-cairo text-sm text-zinc-500">انضم لـ 1,200+ رائد أعمال ذكي</p>
                </div>
              </motion.div>

              {/* Integrations Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="mt-24 pt-12 border-t border-zinc-100"
              >
                <p className="font-cairo text-xs font-bold uppercase tracking-widest text-zinc-400 mb-8">يدعم التكامل مع أدواتك المفضلة</p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                  {['n8n', 'OpenAI', 'Telegram', 'Google Sheets', 'WhatsApp', 'Stripe'].map((tool) => (
                    <span key={tool} className="font-alexandria font-bold text-lg md:text-xl text-zinc-600">{tool}</span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Abstract Floating Elements */}
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-1/4 right-[10%] hidden lg:block w-32 h-32 glass rounded-3xl -rotate-6 flex items-center justify-center shadow-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600">
              <Zap className="w-8 h-8 fill-blue-600" />
            </div>
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute bottom-1/4 left-[10%] hidden lg:block w-40 h-40 glass rounded-[2.5rem] rotate-12 flex items-center justify-center shadow-2xl"
          >
            <div className="w-20 h-20 rounded-3xl bg-sky-500/10 flex items-center justify-center text-sky-500">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </motion.div>
        </section>


        {/* Trust Logos / Numbers (Social Proof) */}
        <section className="border-y border-zinc-100 bg-zinc-50/50 py-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8 md:gap-24 items-center text-center">
              <div>
                <p className="text-4xl font-alexandria font-bold text-zinc-900 mb-1">+1,200</p>
                <p className="text-zinc-500 font-cairo text-sm">عميل سعيد</p>
              </div>
              <div>
                <p className="text-4xl font-alexandria font-bold text-zinc-900 mb-1">+50K</p>
                <p className="text-zinc-500 font-cairo text-sm">ساعة تم توفيرها</p>
              </div>
              <div>
                <p className="text-4xl font-alexandria font-bold text-zinc-900 mb-1">100%</p>
                <p className="text-zinc-500 font-cairo text-sm">أتمتة ناجحة</p>
              </div>
            </div>
          </div>
        </section>

        {/* Products Showcase (Premium Grid) */}
        <section id="products" className="py-24 md:py-40 relative bg-zinc-50/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full font-cairo text-sm font-bold mb-6 border border-blue-100"
              >
                <Sparkles className="w-4 h-4" />
                المتجر الحصري للحزم الجاهزة
              </motion.div>
              <h2 className="text-4xl md:text-6xl font-alexandria font-black text-zinc-900 mb-6 tracking-tight">اختر سلاحك السري الجديد</h2>
              <p className="text-zinc-500 font-cairo text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                حزم أتمتة تم بناؤها واختبارها بعناية فائقة لتمنحك أداءً يفوق التوقعات من اللحظة الأولى.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {products.map((product, idx) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="group h-full"
                >
                  <div className="relative h-full flex flex-col glass-card rounded-[2rem] overflow-hidden group-hover:-translate-y-2 transition-all duration-500">
                    {/* Image Area */}
                    <div className="relative h-64 overflow-hidden">
                      <Image 
                        src={product.image || product.img} 
                        alt={product.title || product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      
                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.isFeatured && (
                          <Badge className="bg-blue-600 text-white border-none font-cairo text-xs py-1 px-3 shadow-lg">الأكثر مبيعاً</Badge>
                        )}
                        <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 font-cairo text-xs py-1 px-3">
                          {idx === 0 ? '12 Workflow' : idx === 1 ? '8 Workflows' : '15 Workflows'}
                        </Badge>
                      </div>

                      <div className="absolute bottom-4 right-4 text-white font-alexandria font-bold text-2xl drop-shadow-lg">
                        {product.price} <span className="text-sm font-cairo font-normal">ج.م</span>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex -space-x-1.5 rtl:space-x-reverse">
                          {['n8n', 'AI', 'Sheet'].map((tag, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-zinc-100 border border-white flex items-center justify-center text-[8px] font-bold text-zinc-500 uppercase">
                              {tag[0]}
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">تكاملات ذكية</span>
                      </div>

                      <h3 className="text-2xl font-alexandria font-extrabold text-zinc-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                        {product.title || product.name}
                      </h3>
                      
                      <p className="text-zinc-500 font-cairo text-sm mb-8 leading-relaxed line-clamp-2">
                        {idx === 0 ? 'نظام متكامل لإدارة المحادثات الآلية وزيادة معدل التحويل بشكل فوري.' : 'دليل شامل لبناء أسرع بوت تليجرام في السوق حالياً.'}
                      </p>

                      <div className="mt-auto space-y-4">
                        <div className="flex items-center justify-between text-xs font-cairo font-bold text-zinc-400 pb-4 border-b border-zinc-100">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            تسليم فوري
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" />
                            ضمان 100%
                          </span>
                        </div>

                        <Link
                          href={`/product/${product.id}`}
                          className="w-full h-14 inline-flex items-center justify-center gap-2 bg-zinc-900 group-hover:bg-blue-600 text-white font-cairo font-bold rounded-xl transition-all shadow-xl shadow-zinc-200 group-hover:shadow-blue-500/20 active:scale-95"
                        >
                          ابدأ الآن
                          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* Features Section - SaaS Style */}
        <section id="features" className="py-24 md:py-40 relative overflow-hidden bg-white">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-alexandria font-black text-zinc-900 mb-8 tracking-tight">لماذا يختار المحترفون <span className="text-blue-600">يوسف أوتميتس؟</span></h2>
              <p className="text-zinc-500 font-cairo text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                لا نبيع مجرد ملفات، نبيعك حلاً متكاملاً يغير طريقة عملك للأبد.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
              {[
                { 
                  icon: Zap, 
                  title: "تسليم فوري (Instant)", 
                  desc: "بمجرد إتمام الدفع، سيصلك رابط التحميل وملف الـ PDF مباشرة إلى بريدك الإلكتروني ولن تنتظر دقيقة واحدة.",
                  color: "bg-blue-50 text-blue-600"
                },
                { 
                  icon: Shield, 
                  title: "جودة استثنائية (Premium)", 
                  desc: "كل تدفق عمل تم اختباره وبناؤه بعناية فائقة لضمان عمله 100% بدون أي أخطاء برمجية.",
                  color: "bg-sky-50 text-sky-600"
                },
                { 
                  icon: Clock, 
                  title: "توفير مئات الساعات", 
                  desc: "لا تضيع وقتك في التجربة والخطأ، احصل على الخلاصة وابدأ في جني الأرباح فوراً.",
                  color: "bg-zinc-100 text-zinc-900"
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative"
                >
                  <div className="h-full p-10 rounded-[2.5rem] bg-zinc-50 border border-zinc-100 group-hover:bg-white group-hover:shadow-2xl group-hover:shadow-zinc-200/50 transition-all duration-500">
                    <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg", feature.color)}>
                      <feature.icon className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-alexandria font-black text-zinc-900 mb-6">{feature.title}</h3>
                    <p className="text-zinc-500 font-cairo text-lg leading-relaxed">{feature.desc}</p>
                    
                    <div className="absolute bottom-8 right-10 opacity-0 group-hover:opacity-10 group-hover:translate-x-2 transition-all duration-500">
                      <feature.icon className="w-24 h-24" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Statistics Banner */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mt-32 p-12 md:p-20 rounded-[3rem] bg-zinc-900 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-full h-full bg-grid-pattern opacity-10" />
              <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                {[
                  { label: "عميل نشط", value: "1,200+" },
                  { label: "ساعة عمل تم توفيرها", value: "50K+" },
                  { label: "تدفق عمل متاح", value: "250+" },
                  { label: "تقييم إيجابي", value: "99%" }
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="text-4xl md:text-6xl font-alexandria font-black mb-4 text-gradient">{stat.value}</p>
                    <p className="font-cairo text-zinc-400 text-sm md:text-base uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section - Luxury Slider */}
        <section id="reviews" className="py-24 md:py-40 relative bg-zinc-50/50">
          <div className="container mx-auto px-4 mb-20 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-blue-600 text-white mb-6 font-cairo px-4 py-1.5">أصوات النجاح ⚡</Badge>
              <h2 className="text-4xl md:text-6xl font-alexandria font-black text-zinc-900 mb-8 tracking-tight">ماذا يقول رواد الأعمال؟</h2>
              <p className="text-zinc-500 font-cairo text-lg md:text-xl max-w-2xl mx-auto">
                نحن نفخر بكوننا جزءاً من قصص نجاح مئات الشركات والناشئين في عالم الأتمتة.
              </p>
            </motion.div>
          </div>
          
          <div className="relative">
            <InfiniteTestimonials />
            <div className="absolute inset-y-0 left-0 w-32 md:w-64 bg-gradient-to-r from-zinc-50 to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-32 md:w-64 bg-gradient-to-l from-zinc-50 to-transparent z-10" />
          </div>

          <div className="container mx-auto px-4 mt-20 text-center">
            <p className="font-cairo text-zinc-400 text-sm mb-6 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              جميع التقييمات موثقة ومؤكدة من عملاء حقيقيين
            </p>
          </div>
        </section>


        {/* FAQ Section - Clean & Trustworthy */}
        <section id="faq" className="py-24 md:py-40 max-w-5xl mx-auto px-4 w-full bg-white">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-alexandria font-black text-zinc-900 mb-8 tracking-tight">لديك استفسار؟ <br /><span className="text-blue-600">لدينا الإجابة.</span></h2>
            <p className="text-zinc-500 font-cairo text-lg md:text-xl">كل ما تحتاج معرفته قبل أن تبدأ رحلة الأتمتة معنا.</p>
          </div>

          <div className="grid gap-6">
            {[
              { q: "كيف سأستلم ملفات الأتمتة؟", a: "فور إتمام الدفع، ستصلك رسالة بريد إلكتروني تحتوي على رابط تحميل مباشر لملف الـ PDF وكود استيراد الـ Workflow لبرنامج n8n." },
              { q: "هل الحزم تدعم اللغة العربية؟", a: "نعم، جميع الشروحات باللغة العربية الواضحة، والتدفقات مصممة للتعامل مع البيانات العربية والإنجليزية بكفاءة." },
              { q: "هل أحتاج لمهارات برمجية؟", a: "إطلاقاً! الحزم مصممة بنظام 'Copy & Paste'. كل ما عليك هو اتباع الخطوات الموضحة بالصور في ملف الـ PDF." },
              { q: "ماذا لو واجهت مشكلة في التشغيل؟", a: "فريق الدعم الفني متواجد لمساعدتك عبر تليجرام أو البريد الإلكتروني لضمان عمل الحزمة لديك 100%." }
            ].map((faq, i) => (
              <motion.details 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group glass-card rounded-3xl p-8 cursor-pointer open:bg-zinc-900 open:text-white transition-all duration-300"
              >
                <summary className="font-alexandria font-bold text-xl flex justify-between items-center outline-none list-none">
                  {faq.q}
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center group-open:bg-blue-600 group-open:rotate-180 transition-all">
                    <ChevronDown className="w-6 h-6 text-zinc-600 group-open:text-white" />
                  </div>
                </summary>
                <p className="mt-8 text-zinc-500 group-open:text-zinc-300 font-cairo text-lg leading-relaxed">
                  {faq.a}
                </p>
              </motion.details>
            ))}
          </div>
        </section>


      </main>

      <Footer />
    </>
  );
}
