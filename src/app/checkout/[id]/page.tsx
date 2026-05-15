"use client";

import { useState, use, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ShieldCheck, CreditCard, ChevronRight, Loader2, ArrowLeft, ShieldAlert, Sparkles, CheckCircle2, Rocket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

const checkoutSchema = z.object({
  fullName: z.string().min(3, { message: "الاسم يجب أن يكون 3 أحرف على الأقل" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  phone: z.string().min(10, { message: "رقم الهاتف غير صالح" }),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

import { supabase } from "@/lib/supabase";

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProduct();
  }, [resolvedParams.id]);

  async function fetchProduct() {
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
    }
  }

  const defaultProduct = {
    title: "مكتبة الأتمتة الشاملة: +2000 تدفق عمل (n8n Workflows) جاهز للاستخدام",
    price: "49.00",
    original_price: "199.00",
  };

  const currentProduct = product || defaultProduct;
  
  const displayProduct = {
    name: currentProduct.title || currentProduct.name,
    price: currentProduct.price,
    originalPrice: currentProduct.original_price || currentProduct.originalPrice,
  };

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
  });

  async function onSubmit(data: CheckoutValues) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/paymob/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: currentProduct.price,
          email: data.email,
          firstName: data.fullName.split(" ")[0],
          lastName: data.fullName.split(" ").slice(1).join(" ") || "Customer",
          phone: data.phone,
          productId: resolvedParams.id,
        }),
      });

      const result = await response.json();

      if (result.iframeUrl) {
        toast.success("جاري تحويلك لبوابة الدفع الآمنة...");
        window.location.href = result.iframeUrl;
      } else {
        throw new Error(result.error || "فشل بدء عملية الدفع");
      }
    } catch (error: any) {
      console.error("Payment Error:", error);
      toast.error(error.message || "حدث خطأ أثناء معالجة الطلب");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <Link href={`/product/${resolvedParams.id}`} className="inline-flex items-center text-zinc-400 hover:text-blue-600 font-cairo transition-all mb-4 group">
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                العودة للمنتج
              </Link>
              <h1 className="text-3xl md:text-5xl font-alexandria font-black text-zinc-900 tracking-tight">إتمام الطلب الآمن</h1>
            </div>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-zinc-100 shadow-sm">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span className="font-cairo text-sm font-bold text-zinc-500">تشفير SSL 256-bit</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Checkout Form */}
            <div className="lg:col-span-7">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-[2.5rem] p-8 md:p-12 border-blue-50"
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid gap-8">
                    <div className="space-y-3">
                      <Label className="font-alexandria font-bold text-zinc-900 text-lg">الاسم الكامل</Label>
                      <Input 
                        placeholder="أدخل اسمك كما في الهوية" 
                        className="h-16 rounded-2xl bg-zinc-50 border-zinc-100 text-zinc-900 font-cairo text-lg focus:bg-white focus:ring-blue-500 transition-all" 
                        disabled={isLoading}
                        {...register("fullName")}
                      />
                      {errors.fullName && <p className="text-sm text-red-500 font-cairo flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.fullName.message}</p>}
                    </div>

                    <div className="space-y-3">
                      <Label className="font-alexandria font-bold text-zinc-900 text-lg">البريد الإلكتروني (لاستلام الملفات)</Label>
                      <Input 
                        type="email" 
                        placeholder="you@example.com" 
                        className="h-16 rounded-2xl bg-zinc-50 border-zinc-100 text-zinc-900 font-cairo text-lg text-left focus:bg-white focus:ring-blue-500 transition-all" 
                        dir="ltr" 
                        disabled={isLoading}
                        {...register("email")}
                      />
                      {errors.email && <p className="text-sm text-red-500 font-cairo flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.email.message}</p>}
                      <p className="text-xs text-zinc-400 font-cairo">تأكد من صحة البريد، الملفات ستصلك فوراً بعد الدفع.</p>
                    </div>

                    <div className="space-y-3">
                      <Label className="font-alexandria font-bold text-zinc-900 text-lg">رقم الهاتف</Label>
                      <Input 
                        type="tel" 
                        placeholder="01xxxxxxxxx" 
                        className="h-16 rounded-2xl bg-zinc-50 border-zinc-100 text-zinc-900 font-cairo text-lg text-left focus:bg-white focus:ring-blue-500 transition-all" 
                        dir="ltr" 
                        disabled={isLoading}
                        {...register("phone")}
                      />
                      {errors.phone && <p className="text-sm text-red-500 font-cairo flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.phone.message}</p>}
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button 
                      type="submit" 
                      className="w-full h-20 bg-zinc-900 hover:bg-blue-600 text-white font-alexandria font-black text-2xl rounded-[1.5rem] shadow-2xl transition-all active:scale-[0.98]" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          جاري تجهيز طلبك...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          متابعة الدفع ({currentProduct.price} ج.م)
                          <ArrowLeft className="w-6 h-6 rtl:rotate-180" />
                        </div>
                      )}
                    </Button>
                  </div>
                </form>

                <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-zinc-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-alexandria font-bold text-zinc-900 text-sm">بواسطة Paymob</p>
                      <p className="font-cairo text-zinc-400 text-xs text-right">دفع آمن بالبطاقة أو المحافظ الإلكترونية</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-alexandria font-bold text-zinc-900 text-sm">تسليم فوري</p>
                      <p className="font-cairo text-zinc-400 text-xs text-right">رابط التحميل يصلك خلال ثوانٍ</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-32 space-y-6"
              >
                <Card className="rounded-[2.5rem] p-8 border-zinc-100 bg-white shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl pointer-events-none" />
                  
                  <h3 className="text-2xl font-alexandria font-black text-zinc-900 mb-8 flex items-center gap-3">
                    ملخص الطلب
                    <Sparkles className="w-5 h-5 text-blue-500" />
                  </h3>
                  
                  <div className="space-y-6 mb-8">
                    <div className="flex gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-zinc-100">
                        <Rocket className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="font-alexandria font-bold text-zinc-900 text-sm leading-snug">{currentProduct.name}</h4>
                        <p className="font-cairo text-zinc-500 text-xs mt-1">Full Access • Lifetime Update</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8 font-cairo text-right">
                    <div className="flex justify-between text-zinc-500 text-lg">
                      <span className="order-1">{currentProduct.originalPrice} ج.م</span>
                      <span className="line-through order-2">السعر الأصلي</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-bold text-lg bg-emerald-50 px-3 py-1 rounded-lg">
                      <span className="order-1">-{parseFloat(currentProduct.originalPrice || "0") - parseFloat(currentProduct.price || "0")} ج.م</span>
                      <span className="order-2">خصم خاص (75%)</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-zinc-900 font-alexandria text-3xl pt-8 border-t border-zinc-100">
                    <span className="text-blue-600 font-black">{currentProduct.price} ج.م</span>
                    <span className="font-black">الإجمالي</span>
                  </div>
                </Card>

                {/* Trust Section */}
                <div className="bg-zinc-900 rounded-[2rem] p-8 text-white">
                  <div className="flex items-center gap-4 mb-4">
                    <ShieldCheck className="w-8 h-8 text-blue-500" />
                    <h4 className="font-alexandria font-bold text-lg">ضمان يوسف أوتميتس</h4>
                  </div>
                  <p className="font-cairo text-zinc-400 text-sm leading-relaxed">
                    نحن نضمن لك أن جميع الملفات تعمل بنسبة 100%. إذا واجهت أي مشكلة تقنية، دعمنا الفني معك حتى يتم الحل.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

