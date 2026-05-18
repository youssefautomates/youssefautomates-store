"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, FileText, Zap, ChevronRight, Lock, Star, 
  ShieldCheck, Download, Users, Infinity as InfinityIcon, Target, Sparkles, 
  MonitorPlay, ArrowLeft, Rocket, HeartHandshake,
  Clock, ShoppingCart, Play, FileJson, Link as LinkIcon, Archive,
  Volume2, VolumeX, Pause, Maximize, RotateCcw, LayoutTemplate, Layers, Check, X,
  RefreshCw, LifeBuoy
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, use, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ProductReviews } from "@/components/ProductReviews";
import { WhatsAppPopup } from "@/components/WhatsAppPopup";

import { supabase } from "@/lib/supabase";
import { type Product, calcDiscount } from "@/lib/products";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

// ── Helper: Unpack Tags ───────────────────────────────────────────────
function unpackProduct(p: Product) {
  const mediaTags = p.tags?.filter(t => t.startsWith("media:")) || [];
  const slides = Array(5).fill(null).map((_, i) => {
    const tag = mediaTags.find(t => t.startsWith(`media:${i}:`));
    if (tag) {
      const parts = tag.split(":");
      return { type: parts[2] as 'image' | 'video', url: parts.slice(3).join(":") };
    }
    return null;
  }).filter(Boolean) as { type: 'image' | 'video', url: string }[];

  // Fallback for legacy data
  if (slides.length === 0) {
    const video_url = p.tags?.find(t => t.startsWith("video:"))?.replace("video:", "");
    if (video_url) slides.push({ type: 'video', url: video_url });
    if (p.image_url) slides.push({ type: 'image', url: p.image_url });
    const legacyGallery = p.tags?.filter(t => t.startsWith("gallery:"))?.map(t => t.replace("gallery:", "")) || [];
    legacyGallery.forEach(url => slides.push({ type: 'image', url }));
  }

  const file_type = p.tags?.find(t => t.startsWith("type:"))?.replace("type:", "") || "zip";
  
  return {
    ...p,
    slides,
    file_type
  };
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [resolvedParams.slug]); // eslint-disable-line

  async function fetchProduct() {
    setIsLoading(true);
    const rawSlug = resolvedParams.slug;
    const decodedSlug = decodeURIComponent(rawSlug);
    
    try {
      console.log("[PRODUCT_PAGE] Fetching product for slug:", decodedSlug);
      
      let { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", decodedSlug)
        .single();

      if (error || !data) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decodedSlug);
        
        if (isUUID) {
          const { data: idData, error: idError } = await supabase
            .from("products")
            .select("*")
            .eq("id", decodedSlug)
            .single();
          
          if (!idError && idData) {
            router.replace(`/product/${idData.slug}`);
            return;
          }
        }
        
        if (error && (error.code === 'PGRST116' || error.message?.includes('no rows'))) {
          setProduct(null);
          return;
        }

        if (error) throw error;
      }

      const unpacked = unpackProduct(data as Product);
      setProduct(unpacked);
      
      if (unpacked.slides.length > 0) {
        setActiveMedia(unpacked.slides[0]);
      } else {
        setActiveMedia(unpacked.image_url ? { type: 'image', url: unpacked.image_url } : null);
      }
      
      if (data) {
        supabase.rpc('increment_product_views', { product_id: data.id }).then(() => {});
        if (typeof window !== "undefined") {
          if ((window as any).fbq) {
            (window as any).fbq('track', 'ViewContent', {
              content_name: unpacked.title,
              content_ids: [unpacked.id],
              content_type: 'product',
              value: unpacked.price,
              currency: 'EGP'
            });
          }
          if ((window as any).ttq) {
            (window as any).ttq.track('ViewContent', {
              contents: [{ content_id: unpacked.id, content_name: unpacked.title, price: unpacked.price, quantity: 1 }],
              content_type: 'product',
              value: unpacked.price,
              currency: 'EGP'
            });
          }
        }
      }
    } catch (err: any) {
      console.error("[PRODUCT_PAGE] Fetch Error Details:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleUnmuteAndStart = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsMuted(false);
      setHasInteracted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-cairo">
        <h1 className="text-4xl font-alexandria font-bold mb-4">المنتج غير موجود</h1>
        <Link href="/" className="text-rose-400 hover:text-rose-300 underline font-bold">العودة للرئيسية</Link>
      </div>
    );
  }

  const savings = product.original_price ? product.original_price - product.price : 0;
  const discountPct = calcDiscount(product.price, product.original_price);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-cairo selection:bg-rose-500/30" style={{ isolation: 'isolate' }}>
      <Navbar />
      
      <main className="pt-24 md:pt-32 pb-24 relative z-0">
        
        {/* PREMIUM PRODUCT PAGE SECTION: ANNOUNCEMENT MARQUEE */}
        <div className="w-full bg-gradient-to-r from-rose-700 via-rose-500 to-rose-700 overflow-hidden py-3 relative z-10 flex items-center shadow-[0_10px_30px_rgba(214,0,75,0.2)] mb-12 border-y border-white/10">
          <style jsx>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(100%); }
            }
            .animate-marquee {
              animation: marquee 40s linear infinite;
            }
          `}</style>
          <div className="flex whitespace-nowrap animate-marquee">
            {Array(15).fill("").map((_, i) => (
              <div key={i} className="flex items-center gap-6 mx-6 text-white font-alexandria font-bold text-[13px] tracking-wide">
                <span className="drop-shadow-md">🔥 أكثر من 1000 عميل سعيد</span>
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                <span className="drop-shadow-md">تقييم 4.9 من 5</span>
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                <span className="drop-shadow-md">الآف القوالب الجاهزة</span>
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                <span className="drop-shadow-md">تحديثات مجانية مدى الحياة</span>
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <section className="container mx-auto px-4 md:px-6">
          {/* PREMIUM PRODUCT PAGE SECTION: HERO */}
          <div className="flex flex-col lg:flex-row-reverse gap-8 lg:gap-16 items-start">
            
            {/* Left Column (Visual Left via flex-row-reverse): Media */}
            <div className="w-full lg:w-[55%] space-y-6">
              {/* Main Viewer */}
              <div className="relative aspect-video bg-[#08080c] rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(214,0,75,0.1)] border border-white/10 flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-20 pointer-events-none z-10" />
                
                <AnimatePresence mode="wait">
                  {activeMedia?.type === 'video' ? (
                    <motion.div 
                      key="video"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 flex items-center justify-center bg-black"
                    >
                      {activeMedia.url.includes('youtube.com') || activeMedia.url.includes('youtu.be') ? (
                        <iframe 
                          src={`https://www.youtube.com/embed/${activeMedia.url.split('v=')[1]?.split('&')[0] || activeMedia.url.split('/').pop()}?autoplay=1&mute=1&controls=1`}
                          className="w-full h-full border-none"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                        />
                      ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <video 
                            ref={videoRef}
                            src={activeMedia.url} 
                            muted={isMuted}
                            autoPlay 
                            playsInline
                            loop={!hasInteracted}
                            controls={hasInteracted}
                            preload="metadata"
                            controlsList="nodownload"
                            onContextMenu={(e) => e.preventDefault()}
                            className="w-full h-full object-cover"
                          />
                          
                          {!hasInteracted && (
                            <div 
                              onClick={handleUnmuteAndStart}
                              className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer group/unmute transition-all hover:bg-black/20"
                              style={{ zIndex: 10 }}
                            >
                               <motion.div 
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-20 h-20 bg-rose-600/20 backdrop-blur-2xl border border-rose-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(214,0,75,0.3)]"
                               >
                                  <VolumeX className="w-8 h-8 text-white" />
                               </motion.div>
                               <span className="font-alexandria font-black text-xl text-white tracking-widest bg-[#D6004B] px-8 py-3 rounded-full shadow-[0_15px_40px_rgba(214,0,75,0.4)]">
                                  اضغط لفتح الصوت
                               </span>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ) : activeMedia?.url ? (
                    <motion.div
                      key={activeMedia.url}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0"
                    >
                      <Image 
                        src={activeMedia.url} 
                        alt={product.title} 
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority
                      />
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-4 text-zinc-800">
                      <MonitorPlay className="w-20 h-20 opacity-20" />
                    </div>
                  )}
                </AnimatePresence>

                {/* Badges */}
                <div className="absolute top-4 left-4 md:top-6 md:left-6 flex flex-col gap-3 z-20 pointer-events-none">
                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    <span className="font-alexandria text-[10px] font-black text-white uppercase tracking-widest">Premium Product</span>
                  </div>
                </div>
              </div>

              {/* Premium Cinematic Media Slider */}
              {product.slides.length > 0 && (
                <div className="w-full relative group/gallery select-none">
                  <div 
                    className={cn(
                      "gap-4 pt-1 pb-3 px-1 snap-x custom-scrollbar-premium",
                      product.slides.length <= 4 
                        ? "grid grid-cols-4" 
                        : "flex overflow-x-auto justify-start"
                    )}
                    style={{ scrollbarWidth: 'thin', msOverflowStyle: 'none' }}
                  >
                    <style jsx>{`
                      .custom-scrollbar-premium::-webkit-scrollbar { height: 5px; display: ${product.slides.length > 4 ? 'block' : 'none'}; }
                      .custom-scrollbar-premium::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.01); border-radius: 20px; }
                      .custom-scrollbar-premium::-webkit-scrollbar-thumb { background: rgba(214, 0, 75, 0.3); border-radius: 20px; transition: all 0.3s ease; }
                      .group\\/gallery:hover .custom-scrollbar-premium::-webkit-scrollbar-thumb { background: #D6004B; box-shadow: 0 0 15px rgba(214, 0, 75, 0.5); }
                    `}</style>

                    {product.slides.map((slide: any, i: number) => {
                      const isYT = slide.type === 'video' && (slide.url.includes('youtube.com') || slide.url.includes('youtu.be'));
                      const ytId = isYT ? (slide.url.split('v=')[1]?.split('&')[0] || slide.url.split('/').pop()) : null;
                      const isActive = activeMedia?.url === slide.url;

                      return (
                        <motion.button 
                          key={i}
                          onClick={() => { setActiveMedia(slide); setHasInteracted(false); setIsMuted(true); }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            "relative aspect-video rounded-2xl overflow-hidden shrink-0 transition-all duration-300 snap-center border",
                            product.slides.length > 4 ? "w-[22.5%] md:w-[23.5%]" : "w-full",
                            "h-24 md:h-32 bg-white/[0.03] backdrop-blur-xl",
                            isActive 
                              ? "border-rose-500 shadow-[0_0_20px_rgba(214,0,75,0.3)] z-10" 
                              : "border-white/5 opacity-60 hover:opacity-100 hover:border-white/20"
                          )}
                        >
                           <div className="absolute inset-0 bg-[#050505] flex items-center justify-center">
                              {slide.type === 'video' ? (
                                <>
                                  {isYT ? (
                                    <Image src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="video thumb" fill className="object-cover" />
                                  ) : (
                                    <video src={`${slide.url}#t=0.1`} className="w-full h-full object-cover" muted playsInline />
                                  )}
                                  <div className="absolute inset-0 bg-black/40 group-hover/thumb:bg-black/10 transition-colors flex items-center justify-center">
                                     <div className="w-10 h-10 bg-rose-600/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                                       <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                                     </div>
                                  </div>
                                </>
                              ) : (
                                <Image src={slide.url} alt={`Gallery ${i}`} fill className="object-cover" />
                              )}
                           </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stat Cards Under Media */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                 {[
                   { val: "2000+", label: "قالب جاهز" },
                   { val: "4.9/5", label: "تقييم العملاء" },
                   { val: "100%", label: "توفير للوقت" }
                 ].map((stat, i) => (
                   <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center shadow-lg hover:border-rose-500/20 transition-colors">
                     <span className="block text-xl md:text-2xl font-alexandria font-black text-rose-500 mb-1">{stat.val}</span>
                     <span className="text-xs md:text-sm font-cairo text-zinc-400 font-medium">{stat.label}</span>
                   </div>
                 ))}
              </div>
            </div>

            {/* Right Column (Visual Right via flex-row-reverse): Content & Pricing */}
            <div className="w-full lg:w-[45%] space-y-8">
              <div className="space-y-4">
                {discountPct && (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-alexandria px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest inline-flex shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    🔥 خصم خاص متاح الآن
                  </Badge>
                )}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-alexandria font-black text-white leading-[1.1] tracking-tighter">
                  {product.title}
                </h1>
                
                <div className="prose prose-invert prose-rose max-w-none pt-4">
                  {product.description ? (
                    <div className="text-zinc-400 font-cairo text-[16px] md:text-lg leading-[1.8]" dangerouslySetInnerHTML={{ __html: product.description.replace(/\\n/g, '<br/>') }} />
                  ) : (
                    <p className="text-zinc-400 font-cairo text-[16px] md:text-lg leading-[1.8]">هذا المنتج الرقمي مصمم لمساعدتك في أتمتة أعمالك وتوفير مئات الساعات من الجهد اليدوي بأقصى سرعة وكفاءة.</p>
                  )}
                </div>
              </div>

              {/* Pricing Card */}
              <div className="bg-[#0b0b10]/80 backdrop-blur-3xl p-8 rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                      {product.original_price && (
                        <span className="text-zinc-500 font-alexandria text-lg line-through decoration-rose-500/40 mb-1">
                          {product.original_price} ج.م
                        </span>
                      )}
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl md:text-6xl font-alexandria font-black text-white tracking-tighter">{product.price}</span>
                        <span className="text-xl md:text-2xl font-alexandria font-black text-rose-500 uppercase">ج.م</span>
                      </div>
                    </div>
                    {discountPct && (
                      <div className="bg-rose-600 text-white font-alexandria font-black px-4 py-2 rounded-xl text-sm shadow-[0_0_15px_rgba(214,0,75,0.4)]">
                        وفر {discountPct}%
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Link
                      href={`/checkout/${product.id}`}
                      className="w-full h-16 md:h-20 inline-flex items-center justify-center gap-4 bg-gradient-to-r from-[#D6004B] to-rose-600 hover:from-[#ff0059] hover:to-rose-500 text-white font-alexandria font-black text-lg md:text-2xl rounded-[1.5rem] transition-all duration-300 shadow-[0_15px_40px_rgba(214,0,75,0.4)] hover:shadow-[0_20px_50px_rgba(214,0,75,0.6)] hover:-translate-y-1 group"
                    >
                      شراء الآن واستلام فوري
                      <ArrowLeft className="w-6 h-6 md:w-8 md:h-8 rtl:rotate-180 group-hover:-translate-x-2 transition-transform" />
                    </Link>

                    <button
                      onClick={() => addToCart(product)}
                      className="w-full h-14 md:h-16 inline-flex items-center justify-center gap-3 bg-white/[0.02] hover:bg-white/[0.05] text-zinc-300 hover:text-white font-alexandria font-bold text-base rounded-[1.2rem] border border-white/10 transition-colors"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      إضافة إلى السلة
                    </button>
                  </div>
                </div>
              </div>

              {/* Trust Strip */}
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 pt-4">
                 {[
                   { icon: Download, text: "تحميل فوري" },
                   { icon: ShieldCheck, text: "دفع آمن 100%" },
                   { icon: RefreshCw, text: "تحديثات مجانية" },
                   { icon: LifeBuoy, text: "دعم فني" }
                 ].map((trust, i) => (
                   <div key={i} className="flex items-center gap-2 text-zinc-400">
                     <trust.icon className="w-4 h-4 text-emerald-500" />
                     <span className="font-cairo font-bold text-[13px]">{trust.text}</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </section>

        {/* PREMIUM PRODUCT PAGE SECTION: BEFORE / AFTER */}
        <section className="mt-32 relative px-4 md:px-6">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-5xl font-alexandria font-black text-white tracking-tighter">لماذا تحتاج هذه <span className="text-rose-500">الحزمة؟</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
             {/* Before Card */}
             <div className="bg-[#0c0c12] border border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden transition-colors hover:border-red-500/20 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-8 border border-red-500/20">
                   <X className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-alexandria font-bold text-white mb-8">بدون الأتمتة</h3>
                <ul className="space-y-6">
                   {["عمل يدوي مكرر وممل يومياً", "إضاعة مئات الساعات كل شهر", "أخطاء بشرية لا يمكن تجنبها", "تأخير مستمر في الرد على العملاء", "تكلفة مالية عالية للموظفين"].map((text, i) => (
                     <li key={i} className="flex items-center gap-4 text-zinc-400 font-cairo text-lg">
                        <X className="w-5 h-5 text-red-500/70 shrink-0" />
                        <span>{text}</span>
                     </li>
                   ))}
                </ul>
             </div>

             {/* After Card */}
             <div className="bg-[#0c0c12] border border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden transition-colors hover:border-emerald-500/20 group">
                <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/20 relative z-10">
                   <Check className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-alexandria font-bold text-white mb-8 relative z-10">مع الحزمة</h3>
                <ul className="space-y-6 relative z-10">
                   {["عمل آلي 24/7 بدون أي تدخل", "توفير وقتك للأشياء الأكثر أهمية", "دقة 100% بدون أي أخطاء", "رد فوري واحترافي لجميع عملائك", "توفير آلاف الدولارات سنوياً"].map((text, i) => (
                     <li key={i} className="flex items-center gap-4 text-white font-cairo font-bold text-lg">
                        <Check className="w-5 h-5 text-emerald-500 shrink-0 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span>{text}</span>
                     </li>
                   ))}
                </ul>
             </div>
          </div>
        </section>

        {/* PREMIUM PRODUCT PAGE SECTION: FEATURES */}
        <section className="mt-32 container mx-auto px-4 md:px-6" id="products">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-5xl font-alexandria font-black text-white tracking-tighter">ماذا تتضمن <span className="text-rose-500">الحزمة؟</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
             {[
               { icon: Layers, title: "مجموعة ضخمة", desc: "أكثر من 2000 قالب احترافي مصمم خصيصاً لتوفير وقتك ومجهودك في أي مجال." },
               { icon: LinkIcon, title: "ربط كل شيء", desc: "أتمتة وسائل التواصل، البريد، قواعد البيانات، أدوات الذكاء الاصطناعي والمزيد بسهولة." },
               { icon: Rocket, title: "جاهزة للعمل فوراً", desc: "بنقرة واحدة، يمكنك استيراد القوالب (JSON) والبدء في استخدامها مباشرة." },
               { icon: Download, title: "تحميل فوري", desc: "احصل على جميع الملفات بصيغة JSON مباشرة بعد إتمام الدفع بشكل آمن." },
               { icon: Target, title: "تحديثات مجانية", desc: "تحصل على أي قوالب جديدة نضيفها مستقبلاً إلى الحزمة بدون أي تكلفة إضافية." },
               { icon: ShieldCheck, title: "ملكية كاملة لك", desc: "استخدم القوالب لعملك الخاص أو طبقها لعملائك بحرية تامة وبدون قيود." },
               { icon: HeartHandshake, title: "دعم فني متميز", desc: "نحن بجانبك خطوة بخطوة للإجابة عن أي استفسار أو مساعدة في تركيب القوالب." },
               { icon: Zap, title: "أداء فائق وسرعة", desc: "انطلق بسرعة الصاروخ مع قوالب محسنة ومختبرة لتعمل بأعلى كفاءة ممكنة." },
               { icon: FileText, title: "توثيق وشروحات", desc: "فيديوهات وملفات شرح تفصيلية تجعل من استخدام الحزمة أمراً في غاية السهولة للمبتدئين." }
             ].map((feature, i) => (
               <div key={i} className="bg-white/[0.02] border border-white/5 hover:border-rose-500/30 p-8 rounded-[2.5rem] transition-all duration-500 group hover:bg-white/[0.04] shadow-xl hover:shadow-[0_20px_50px_rgba(214,0,75,0.05)]">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-rose-500/10 transition-colors duration-500 border border-white/5 group-hover:border-rose-500/20 shadow-lg">
                    <feature.icon className="w-6 h-6 text-zinc-400 group-hover:text-rose-500 transition-colors duration-500" />
                  </div>
                  <h3 className="text-xl font-alexandria font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-zinc-400 font-cairo leading-relaxed text-base">{feature.desc}</p>
               </div>
             ))}
          </div>
        </section>

        {/* Reviews Section */}
        <ProductReviews productId={product.id} />

        {/* PREMIUM PRODUCT PAGE SECTION: FAQ */}
        <section className="mt-32 max-w-3xl mx-auto px-4 md:px-6" id="faq">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-5xl font-alexandria font-black text-white tracking-tighter">الأسئلة <span className="text-rose-500">الشائعة</span></h2>
          </div>
          <div className="space-y-4">
             {[
               { q: "هل أحتاج لخبرة برمجية لاستخدام هذه القوالب؟", a: "لا، جميع القوالب مصممة لتكون جاهزة للاستخدام (Plug & Play). كل ما عليك فعله هو استيراد الملف وتغيير بعض الإعدادات البسيطة مثل إضافة حساباتك." },
               { q: "كيف سأستلم الحزمة بعد الدفع؟", a: "بمجرد إتمام الدفع بنجاح، سيتم توجيهك فوراً لصفحة التحميل داخل متجرنا. كما سنرسل لك بريداً إلكترونياً يحتوي على روابط التحميل لضمان عدم ضياعها." },
               { q: "هل تعمل القوالب على الاستضافة الذاتية (Self-hosted) لـ n8n؟", a: "نعم! جميع القوالب بصيغة JSON متوافقة وتعمل بكفاءة 100% سواء كنت تستخدم النسخة السحابية أو الاستضافة الذاتية." },
               { q: "هل الدفع آمن؟", a: "بالتأكيد. نحن نستخدم بوابات دفع عالمية وموثوقة (باي موب) لتشفير وحماية جميع بياناتك المالية ولا نحتفظ بأي بيانات للبطاقات." },
             ].map((faq, i) => (
               <details key={i} className="group bg-white/[0.02] border border-white/5 rounded-2xl [&_summary::-webkit-details-marker]:hidden hover:bg-white/[0.04] transition-colors">
                  <summary className="flex items-center justify-between p-6 md:p-8 cursor-pointer font-alexandria font-bold text-lg text-white select-none">
                     {faq.q}
                     <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center shrink-0 group-open:bg-rose-500/10 transition-colors">
                        <ChevronRight className="w-5 h-5 text-rose-500 transition-transform duration-300 group-open:-rotate-90" />
                     </div>
                  </summary>
                  <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0 text-zinc-400 font-cairo leading-relaxed text-lg border-t border-white/5 mt-2 pt-6 opacity-0 group-open:animate-[fadeIn_0.3s_ease_forwards]">
                     {faq.a}
                  </div>
               </details>
             ))}
          </div>
          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </section>

        {/* PREMIUM PRODUCT PAGE SECTION: FINAL CTA */}
        <section className="mt-32 mb-16 container mx-auto px-4 md:px-6">
          <div className="bg-gradient-to-b from-[#1a050e] to-[#0a0205] border border-rose-500/20 rounded-[3rem] md:rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden shadow-[0_0_100px_rgba(214,0,75,0.15)]">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-rose-600/20 rounded-full blur-[120px] pointer-events-none" />
             
             <div className="relative z-10 max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-alexandria font-black text-white tracking-tighter mb-8 leading-tight">
                  لا تضيع المزيد من <span className="text-rose-500">الوقت</span>
                </h2>
                <p className="text-xl md:text-2xl text-zinc-300 font-cairo mb-12 leading-relaxed">
                  احصل على الحزمة الآن وابدأ في أتمتة أعمالك وتوفير مئات الساعات شهرياً بضغطة زر.
                </p>
                
                <Link
                  href={`/checkout/${product.id}`}
                  className="inline-flex items-center justify-center gap-4 bg-[#D6004B] hover:bg-[#ff0059] text-white font-alexandria font-black text-xl md:text-3xl px-12 py-6 md:px-16 md:py-8 rounded-full transition-all duration-300 shadow-[0_15px_40px_rgba(214,0,75,0.4)] hover:shadow-[0_25px_60px_rgba(214,0,75,0.6)] hover:-translate-y-2 active:scale-95 group"
                >
                  شراء الحزمة الآن
                  <ArrowLeft className="w-8 h-8 md:w-10 md:h-10 rtl:rotate-180 group-hover:-translate-x-3 transition-transform" />
                </Link>
                
                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 mt-12 text-zinc-400">
                   <div className="flex items-center gap-3 bg-black/20 px-6 py-3 rounded-full border border-white/5 backdrop-blur-md">
                      <ShieldCheck className="w-6 h-6 text-emerald-500" />
                      <span className="font-alexandria font-bold text-sm md:text-base">دفع آمن وموثوق</span>
                   </div>
                   <div className="flex items-center gap-3 bg-black/20 px-6 py-3 rounded-full border border-white/5 backdrop-blur-md">
                      <Download className="w-6 h-6 text-rose-500" />
                      <span className="font-alexandria font-bold text-sm md:text-base">استلام فوري للملفات</span>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Mobile Sticky Bar - Professional & Compact */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#050505]/95 backdrop-blur-3xl border-t border-white/10 p-5 z-50 flex items-center justify-between gap-4 pb-safe shadow-[0_-20px_50px_rgba(0,0,0,0.9)]">
          <div className="flex flex-col pl-2">
            <span className="text-2xl font-alexandria font-black text-white leading-none tracking-tighter">
              {product.price} <span className="text-[10px] text-zinc-500 font-black">ج.م</span>
            </span>
            {product.original_price && <span className="text-[10px] text-zinc-600 line-through">توفير {savings}ج.م</span>}
          </div>
          <div className="flex gap-2 flex-1">
            <button
              onClick={() => addToCart(product)}
              className="h-12 w-12 bg-white/5 border border-white/10 text-white rounded-xl flex items-center justify-center active:scale-90 shrink-0"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
            <Link
              href={`/checkout/${product.id}`}
              className="flex-1 h-12 bg-[#D6004B] text-white font-alexandria font-black text-sm rounded-xl flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-rose-600/20"
            >
              شراء الآن
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </main>

      <WhatsAppPopup />
      <Footer />
    </div>
  );
}
