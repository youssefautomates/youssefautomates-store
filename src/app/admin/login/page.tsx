"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock, Loader2, ShieldAlert, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (res.ok) {
        toast.success("تم تسجيل الدخول بنجاح");
        router.push("/admin");
        router.refresh();
      } else {
        toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }
    } catch (error) {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <Link href="/" className="absolute top-8 left-8 text-zinc-400 hover:text-white font-cairo transition-colors">
        العودة للمتجر
      </Link>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
            <ShieldAlert className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-alexandria font-bold text-white mb-2">تسجيل الدخول للإدارة</h1>
          <p className="text-zinc-400 font-cairo">الرجاء إدخال بيانات الدخول للوصول إلى لوحة التحكم</p>
        </div>

        <Card className="bg-zinc-900 border-zinc-800 p-6 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input 
                  type="email" 
                  placeholder="البريد الإلكتروني..." 
                  className="bg-zinc-950 border-zinc-800 text-white font-cairo h-12 pr-10 focus-visible:ring-indigo-500 text-left"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="كلمة المرور..." 
                  className="bg-zinc-950 border-zinc-800 text-white font-cairo h-12 pr-10 pl-10 focus-visible:ring-indigo-500 text-left"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-900"
              />
              <label htmlFor="remember" className="text-sm font-cairo text-zinc-400 cursor-pointer select-none">
                حفظ بيانات الدخول
              </label>
            </div>

            <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-cairo text-lg" disabled={isLoading || !email || !password}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                "دخول"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
