import Link from "next/link";
import { ShoppingBag, Mail, MapPin, Phone, ShieldCheck, CreditCard, ChevronLeft } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/50 pt-20 pb-8 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent blur-[2px]"></div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand & About */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="font-alexandria font-bold text-2xl tracking-tight text-white" dir="ltr">
                Youssef <span className="text-indigo-400">Automates</span>
              </span>
            </Link>
            <p className="text-zinc-400 font-cairo leading-relaxed text-sm">
              الوجهة الأولى عربياً لحلول وأتمتة الأعمال باستخدام الذكاء الاصطناعي ومنصة n8n. نوفر لك الجهد والوقت لبناء أنظمة تعمل بذكاء 24/7.
            </p>
            <div className="flex items-center gap-4 text-zinc-400">
              <Link href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </Link>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-alexandria font-semibold text-white mb-6 text-lg relative inline-block">
              روابط سريعة
              <span className="absolute -bottom-2 right-0 w-1/2 h-0.5 bg-indigo-500 rounded-full"></span>
            </h3>
            <ul className="space-y-4 font-cairo text-sm text-zinc-400">
              <li><Link href="#products" className="hover:text-indigo-400 hover:translate-x-1 transition-all inline-flex items-center gap-2"><ChevronLeft className="w-3 h-3" /> المنتجات</Link></li>
              <li><Link href="#features" className="hover:text-indigo-400 hover:translate-x-1 transition-all inline-flex items-center gap-2"><ChevronLeft className="w-3 h-3" /> لماذا نحن؟</Link></li>
              <li><Link href="#faq" className="hover:text-indigo-400 hover:translate-x-1 transition-all inline-flex items-center gap-2"><ChevronLeft className="w-3 h-3" /> الأسئلة الشائعة</Link></li>
              <li><Link href="#reviews" className="hover:text-indigo-400 hover:translate-x-1 transition-all inline-flex items-center gap-2"><ChevronLeft className="w-3 h-3" /> آراء العملاء</Link></li>
            </ul>
          </div>

          {/* Legal Pages */}
          <div>
            <h3 className="font-alexandria font-semibold text-white mb-6 text-lg relative inline-block">
              قانوني
              <span className="absolute -bottom-2 right-0 w-1/2 h-0.5 bg-indigo-500 rounded-full"></span>
            </h3>
            <ul className="space-y-4 font-cairo text-sm text-zinc-400">
              <li><Link href="#" className="hover:text-indigo-400 hover:translate-x-1 transition-all inline-flex items-center gap-2"><ChevronLeft className="w-3 h-3" /> شروط الاستخدام</Link></li>
              <li><Link href="#" className="hover:text-indigo-400 hover:translate-x-1 transition-all inline-flex items-center gap-2"><ChevronLeft className="w-3 h-3" /> سياسة الخصوصية</Link></li>
              <li><Link href="#" className="hover:text-indigo-400 hover:translate-x-1 transition-all inline-flex items-center gap-2"><ChevronLeft className="w-3 h-3" /> سياسة الاسترجاع</Link></li>
              <li><Link href="#" className="hover:text-indigo-400 hover:translate-x-1 transition-all inline-flex items-center gap-2"><ChevronLeft className="w-3 h-3" /> سياسة الدفع المسبق</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-alexandria font-semibold text-white mb-6 text-lg relative inline-block">
              تواصل معنا
              <span className="absolute -bottom-2 right-0 w-1/2 h-0.5 bg-indigo-500 rounded-full"></span>
            </h3>
            <ul className="space-y-4 font-cairo text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span dir="ltr">support@youssefautomates.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span dir="ltr">+20 100 000 0000</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span>القاهرة، جمهورية مصر العربية</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-zinc-500">
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="font-cairo text-xs">دفع آمن 100%</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span className="font-cairo text-xs">بواسطة Paymob</span>
            </div>
          </div>
          <div className="text-center md:text-right font-cairo text-sm text-zinc-500">
            <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()} Youssef Automates.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
