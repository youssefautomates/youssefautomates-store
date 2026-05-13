"use client";

import { useState, use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ShieldCheck, CreditCard, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const checkoutSchema = z.object({
  fullName: z.string().min(3, { message: "الاسم يجب أن يكون 3 أحرف على الأقل" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  phone: z.string().min(10, { message: "رقم الهاتف غير صالح" }),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
      console.log("Processing payment for", data);
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("تم إرسال الطلب بنجاح، جاري التحويل للدفع...");
      router.push(`/success?order_id=ORD-${Math.floor(Math.random() * 100000)}`);
    } catch (error) {
      toast.error("حدث خطأ أثناء معالجة الطلب");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 bg-zinc-950">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <Link href={`/product/${resolvedParams.id}`} className="inline-flex items-center text-zinc-400 hover:text-white font-cairo transition-colors">
              <ChevronRight className="w-4 h-4 ml-2" />
              العودة للمنتج
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div>
              <h1 className="text-2xl font-alexandria font-bold text-white mb-2">إتمام الطلب</h1>
              <p className="text-zinc-400 font-cairo mb-8">الرجاء إدخال بياناتك بشكل صحيح لإرسال الملفات إليك.</p>

              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-cairo text-zinc-300">الاسم الكامل</Label>
                    <Input 
                      placeholder="محمد أحمد" 
                      className="bg-zinc-950 border-zinc-800 text-white font-cairo focus-visible:ring-indigo-500" 
                      disabled={isLoading}
                      {...register("fullName")}
                    />
                    {errors.fullName && <p className="text-sm text-red-500 font-cairo">{errors.fullName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-cairo text-zinc-300">البريد الإلكتروني</Label>
                    <Input 
                      type="email" 
                      placeholder="mohamed@example.com" 
                      className="bg-zinc-950 border-zinc-800 text-white font-cairo text-left focus-visible:ring-indigo-500" 
                      dir="ltr" 
                      disabled={isLoading}
                      {...register("email")}
                    />
                    {errors.email && <p className="text-sm text-red-500 font-cairo">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-cairo text-zinc-300">رقم الهاتف</Label>
                    <Input 
                      type="tel" 
                      placeholder="+966500000000" 
                      className="bg-zinc-950 border-zinc-800 text-white font-cairo text-left focus-visible:ring-indigo-500" 
                      dir="ltr" 
                      disabled={isLoading}
                      {...register("phone")}
                    />
                    {errors.phone && <p className="text-sm text-red-500 font-cairo">{errors.phone.message}</p>}
                  </div>

                  <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-cairo text-lg mt-4" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        جاري المعالجة...
                      </>
                    ) : (
                      <>
                        <CreditCard className="ml-2 w-5 h-5" />
                        متابعة الدفع ({resolvedParams.id === "1" ? "49" : "49"} ج.م)
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 flex items-center justify-center gap-2 text-zinc-500 font-cairo text-sm">
                  <Lock className="w-4 h-4" />
                  دفع آمن ومحمي بواسطة Paymob
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="bg-zinc-900 border-zinc-800 p-6 sticky top-24">
                <h3 className="text-xl font-alexandria font-semibold text-white mb-6">ملخص الطلب</h3>
                
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800">
                  <div className="w-20 h-20 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-zinc-600 text-xs font-alexandria">N8N</span>
                  </div>
                  <div>
                    <h4 className="font-cairo text-white font-medium mb-1">حزمة أتمتة الرد التلقائي على الواتساب</h4>
                    <p className="text-zinc-400 font-cairo text-sm">ملف PDF + Workflow</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-zinc-300 font-cairo">
                    <span>السعر</span>
                    <span>49.00 ج.م</span>
                  </div>
                  <div className="flex justify-between text-zinc-300 font-cairo">
                    <span>الضريبة (0%)</span>
                    <span>0.00 ج.م</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-white font-alexandria text-xl pt-6 border-t border-zinc-800 mb-8">
                  <span>الإجمالي</span>
                  <span className="text-indigo-400">49.00 ج.م</span>
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-indigo-400 shrink-0" />
                  <div>
                    <h5 className="text-indigo-300 font-cairo font-medium text-sm mb-1">ضمان الجودة</h5>
                    <p className="text-indigo-400/70 font-cairo text-xs">
                      جميع ملفاتنا مجربة ومضمونة لتعمل بشكل مثالي بمجرد اتباع الخطوات المرفقة.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
