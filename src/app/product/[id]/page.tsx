"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, FileText, Zap, ChevronRight, Lock, Star, 
  ShieldCheck, Download, Users, Infinity, Target, Sparkles, 
  MonitorPlay, ArrowLeft, Rocket, HeartHandshake,
  Clock, ShoppingCart, Play, FileJson, Link as LinkIcon, Archive,
  Volume2, VolumeX, Pause, Maximize, RotateCcw
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { supabase } from "@/lib/supabase";
import { type Product, calcDiscount } from "@/lib/products";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

// ── Helper: Unpack Tags ───────────────────────────────────────────────
function unpackProduct(p: Product) {
  const video_url = p.tags?.find(t => t.startsWith("video:"))?.replace("video:", "") || "";
  const gallery = p.tags?.filter(t => t.startsWith("gallery:"))?.map(t => t.replace("gallery:", "")) || [];
  const file_type = p.tags?.find(t => t.startsWith("type:"))?.replace("type:", "") || "zip";
  
  return {
    ...p,
    video_url,
    gallery: gallery.length > 0 ? gallery : [],
    file_type
  };
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "previews" | "reviews">("details");
  const [activeMedia, setActiveMedia] = useState<string | null>(null); // URL of image or 'video'
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [resolvedParams.id]); // eslint-disable-line

  async function fetchProduct() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", resolvedParams.id)
        .single();

      if (error) throw error;
      const unpacked = unpackProduct(data as Product);
      setProduct(unpacked);
      
      // LOGIC: If video exists, it's the primary media. Otherwise the image.
      if (unpacked.video_url) {
        setActiveMedia('video');
      } else {
        setActiveMedia(unpacked.image_url);
      }
      
      // Update views non-blocking
      if (data) {
        supabase.rpc('increment_product_views', { product_id: data.id }).then(() => {});
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("حدث خطأ أثناء تحميل المنتج");
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
  
  // FILTER: Only real images. No placeholders.
  const isPlaceholder = (url: string) => !url || url.includes("unsplash.com") || url.includes("placeholder");
  const mainImage = isPlaceholder(product.image_url) ? null : product.image_url;
  const galleryImages = product.gallery.filter((url: string) => !isPlaceholder(url));
  const allRealImages = [mainImage, ...galleryImages].filter(Boolean) as string[];

  // File type icon helper
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText;
      case 'json': return FileJson;
      case 'video': return Play;
      case 'link': return LinkIcon;
      default: return Archive;
    }
  };
  const FileIcon = getFileIcon(product.file_type);

  const isYouTube = product.video_url?.includes('youtube.com') || product.video_url?.includes('youtu.be');

  return (
    <div className="min-h-screen bg-[#050505] text-white font-cairo selection:bg-rose-500/30">
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
            <div className="w-full lg:w-[58%] space-y-6">
              <div className="relative aspect-video bg-[#08080c] rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] group border border-white/5 flex items-center justify-center">
                
                <AnimatePresence mode="wait">
                  {activeMedia === 'video' && product.video_url ? (
                    <motion.div 
                      key="video"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 flex items-center justify-center bg-black"
                    >
                      {isYouTube ? (
                        <iframe 
                          src={`https://www.youtube.com/embed/${product.video_url.split('v=')[1]?.split('&')[0] || product.video_url.split('/').pop()}?autoplay=1&mute=1&controls=1`}
                          className="w-full h-full border-none"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                        />
                      ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <video 
                            ref={videoRef}
                            src={product.video_url} 
                            muted={isMuted}
                            autoPlay 
                            playsInline
                            loop={!hasInteracted}
                            controls={hasInteracted}
                            preload="metadata"
                            className="max-w-full max-h-full object-contain"
                          />
                          
                          {/* Muted Autoplay Overlay */}
                          {!hasInteracted && (
                            <div 
                              onClick={handleUnmuteAndStart}
                              className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[1px] cursor-pointer group/unmute transition-all hover:bg-black/10 z-30"
                            >
                               <motion.div 
                                initial={{ scale: 0.8 }}
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-24 h-24 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full flex items-center justify-center mb-6 transition-transform group-hover/unmute:scale-110 shadow-2xl"
                               >
                                  <VolumeX className="w-10 h-10 text-white" />
                               </motion.div>
                               <span className="font-alexandria font-black text-xl text-white tracking-[0.2em] bg-rose-600 px-10 py-4 rounded-2xl shadow-[0_20px_50px_rgba(214,0,75,0.4)] transition-all group-hover/unmute:bg-rose-500 group-hover/unmute:-translate-y-1">
                                  اضغط لفتح الصوت
                               </span>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ) : activeMedia ? (
                    <motion.div
                      key={activeMedia}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Image 
                        src={activeMedia} 
                        alt={product.title} 
                        fill
                        className="object-contain p-4 md:p-8"
                        priority
                      />
                    </motion.div>
                  ) : (
                    /* Fallback to first frame of video or icon if no image */
                    <div className="flex flex-col items-center justify-center gap-4 text-zinc-700">
                      <MonitorPlay className="w-20 h-20 opacity-20" />
                    </div>
                  )}
                </AnimatePresence>

                {/* Badges */}
                <div className="absolute top-8 left-8 flex flex-col gap-3 z-30 pointer-events-none">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-2xl"
                  >
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    <span className="font-alexandria text-[10px] font-black text-white uppercase tracking-widest">Premium Digital Asset</span>
                  </motion.div>
                </div>
                
                {product.is_featured && (
                  <div className="absolute top-8 right-8 bg-[#D6004B] px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-[0_15px_40px_rgba(214,0,75,0.4)] z-30 font-alexandria font-black text-[10px] text-white uppercase tracking-widest pointer-events-none">
                    Best Seller
                  </div>
                )}
              </div>

              {/* Gallery / Slider: ONLY Real Media */}
              {(allRealImages.length > 0 || (product.video_url && allRealImages.length > 0)) && (
                <div className="flex gap-4 overflow-x-auto py-2 px-1 custom-scrollbar">
                  {/* Video Entry in Gallery */}
                  {product.video_url && (
                    <button 
                      onClick={() => setActiveMedia('video')}
                      className={cn(
                        "relative w-32 aspect-video rounded-2xl overflow-hidden shrink-0 border-2 transition-all duration-300",
                        activeMedia === 'video' 
                          ? "border-rose-600 ring-4 ring-rose-600/20 scale-105 shadow-2xl" 
                          : "border-white/5 opacity-50 hover:opacity-100 hover:border-white/20"
                      )}
                    >
                       <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                          {mainImage ? <Image src={mainImage} alt="video" fill className="object-cover blur-[2px] opacity-40" /> : <PlayCircle className="w-8 h-8 text-white/20" />}
                          <div className="relative z-10 w-10 h-10 bg-rose-600 rounded-full flex items-center justify-center shadow-lg">
                             <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                          </div>
                       </div>
                    </button>
                  )}
                  {/* Real Images */}
                  {allRealImages.map((img, i) => (
                    <button 
                      key={i}
                      onClick={() => setActiveMedia(img)}
                      className={cn(
                        "relative w-32 aspect-video rounded-2xl overflow-hidden shrink-0 border-2 transition-all duration-300",
                        activeMedia === img 
                          ? "border-rose-600 ring-4 ring-rose-600/20 scale-105 shadow-2xl" 
                          : "border-white/5 opacity-50 hover:opacity-100 hover:border-white/20"
                      )}
                    >
                      <Image src={img} alt={`Gallery ${i}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Benefits Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {[
                  { icon: Download, label: "Instant Access", color: "text-rose-500", bg: "bg-rose-500/5", border: "border-rose-500/10" },
                  { icon: Clock, label: "Saves Time", color: "text-emerald-500", bg: "bg-emerald-500/5", border: "border-emerald-500/10" },
                  { icon: ShieldCheck, label: "Secure Payment", color: "text-blue-500", bg: "bg-blue-500/5", border: "border-blue-500/10" },
                  { icon: HeartHandshake, label: "VIP Support", color: "text-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/10" }
                ].map((item, i) => (
                  <div key={i} className={cn("p-5 rounded-[2rem] flex flex-col items-center justify-center text-center gap-3 border transition-all hover:bg-white/5", item.bg, item.border)}>
                    <item.icon className={cn("w-6 h-6", item.color)} />
                    <span className="font-alexandria text-[9px] font-black text-zinc-300 tracking-widest uppercase">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Persuasive Copy */}
            <div className="w-full lg:w-[42%] space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  {discountPct && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-alexandria px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      🔥 Special Offer
                    </Badge>
                  )}
                  <Badge className="bg-white/5 text-zinc-400 border border-white/10 font-alexandria px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    Digital Product
                  </Badge>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-alexandria font-black text-white leading-[1.1] tracking-tighter">
                  {product.title}
                </h1>
                
                <div className="flex items-center gap-6 border-b border-white/5 pb-8">
                  <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-5 py-2.5 border border-white/10">
                    <div className="flex text-yellow-400 gap-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <span className="font-alexandria text-xs font-black text-white">5.0</span>
                  </div>
                  <span className="font-cairo text-sm text-zinc-500 flex items-center gap-2">
                    <Users className="w-4 h-4 text-rose-500" /> <span className="text-white font-bold">{product.sales + 100}</span> مشتري سعيد
                  </span>
                </div>
              </div>

              <p className="text-xl text-zinc-400 font-cairo leading-relaxed">
                {product.short_description || product.description?.substring(0, 150) || "أداة متقدمة تضمن لك توفير مئات الساعات وتعظيم نتائجك بأقل مجهود."}
              </p>

              {/* Purchase Card */}
              <div className="bg-[#0c0c12] p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group/card">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-rose-600/5 to-transparent opacity-50" />
                
                <div className="flex items-center justify-between mb-10 relative z-10">
                  <div className="flex flex-col">
                    {product.original_price && (
                      <span className="text-zinc-600 font-alexandria text-xl line-through decoration-rose-500/40 mb-2">
                        {product.original_price} <span className="text-xs">EGP</span>
                      </span>
                    )}
                    <div className="flex items-baseline gap-3">
                      <span className="text-6xl font-alexandria font-black text-white tracking-tighter">{product.price}</span>
                      <span className="text-xl font-alexandria font-black text-zinc-500 uppercase">EGP</span>
                    </div>
                  </div>
                  {discountPct && (
                    <div className="flex flex-col items-end gap-2">
                      <div className="bg-rose-600 text-white font-alexandria font-black px-4 py-2 rounded-xl text-sm shadow-xl shadow-rose-600/20">
                        -{discountPct}%
                      </div>
                      <span className="text-[10px] text-zinc-500 font-alexandria font-black uppercase tracking-widest">Limited Time</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4 relative z-10">
                  <Link
                    href={`/checkout/${product.id}`}
                    className="w-full h-20 inline-flex items-center justify-center gap-4 bg-[#D6004B] hover:bg-[#ff0059] text-white font-alexandria font-black text-2xl rounded-[2rem] transition-all shadow-[0_20px_50px_rgba(214,0,75,0.3)] hover:shadow-[0_25px_60px_rgba(214,0,75,0.5)] active:scale-95 group/btn"
                  >
                    Get Instant Access
                    <ArrowLeft className="w-7 h-7 rtl:rotate-180 group-hover:-translate-x-2 transition-transform" />
                  </Link>

                  <button
                    onClick={() => addToCart(product)}
                    className="w-full h-16 inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white font-alexandria font-black text-lg rounded-[1.5rem] border border-white/10 transition-all active:scale-95"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>
                
                <div className="mt-8 flex items-center justify-center gap-6 relative z-10 border-t border-white/5 pt-8">
                   <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-alexandria font-black text-zinc-500 uppercase tracking-widest">Safe Checkout</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-zinc-500" />
                      <span className="text-[10px] font-alexandria font-black text-zinc-500 uppercase tracking-widest">SSL Encrypted</span>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Value Stacking / Deliverables */}
        <section className="bg-[#08080c] border-y border-white/5 py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-24">
              <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 font-alexandria px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest mb-6">
                What's Inside
              </Badge>
              <h2 className="text-4xl md:text-6xl font-alexandria font-black text-white mb-8 tracking-tighter">Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">succeed.</span></h2>
              <p className="text-zinc-500 font-cairo text-xl md:text-2xl max-w-2xl mx-auto">لقد قمنا بتجميع حزمة متكاملة تضمن لك البدء الفوري وتحقيق النتائج.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { 
                  title: `The ${product.file_type?.toUpperCase() || "DIGITAL"} Asset`, 
                  desc: `ستحصل على الملف بصيغة ${product.file_type || "رقمية"} عالية الجودة وجاهزة للتشغيل الفوري.`,
                  icon: FileIcon,
                  color: "text-rose-500", bg: "bg-rose-500/5"
                },
                { 
                  title: "Setup Blueprint", 
                  desc: "دليل خطوة بخطوة يضمن لك ضبط الإعدادات بشكل مثالي في أقل من 5 دقائق.",
                  icon: Rocket,
                  color: "text-orange-500", bg: "bg-orange-500/5"
                },
                { 
                  title: "Lifetime Updates", 
                  desc: "أي تطوير أو تحسين مستقبلي ستحصل عليه مجاناً وبشكل تلقائي في حسابك.",
                  icon: Infinity,
                  color: "text-emerald-500", bg: "bg-emerald-500/5"
                },
                { 
                  title: "Priority Concierge", 
                  desc: "فريق الدعم الفني لدينا متاح دائماً للرد على أي استفسار تقني أو تجاري.",
                  icon: HeartHandshake,
                  color: "text-blue-500", bg: "bg-blue-500/5"
                }
              ].map((item, i) => (
                <div key={i} className="relative group bg-[#0c0c12] border border-white/5 rounded-[3rem] p-12 hover:border-rose-500/30 transition-all duration-500">
                  <div className="flex items-center justify-between mb-10">
                    <div className={cn("w-20 h-20 rounded-[1.5rem] flex items-center justify-center shadow-2xl", item.bg)}>
                      <item.icon className={cn("w-10 h-10", item.color)} />
                    </div>
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-zinc-700 group-hover:text-emerald-500 group-hover:border-emerald-500/50 transition-all">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-alexandria font-black text-white mb-6">{item.title}</h3>
                  <p className="text-zinc-500 font-cairo text-lg leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile Sticky Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#050505]/95 backdrop-blur-3xl border-t border-white/10 p-6 z-50 flex items-center justify-between gap-6 pb-safe shadow-[0_-30px_60px_rgba(0,0,0,0.9)]">
          <div className="flex flex-col">
            <span className="text-3xl font-alexandria font-black text-white leading-none tracking-tighter">{product.price} <span className="text-xs text-zinc-500">EGP</span></span>
          </div>
          <div className="flex gap-3 flex-1">
            <button
              onClick={() => addToCart(product)}
              className="h-14 w-14 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all shrink-0"
            >
              <ShoppingCart className="w-6 h-6" />
            </button>
            <Link
              href={`/checkout/${product.id}`}
              className="flex-1 h-14 bg-[#D6004B] text-white font-alexandria font-black text-lg rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-rose-600/20"
            >
              Buy Now
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
