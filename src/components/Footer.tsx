import Link from "next/link";
import { ShoppingBag, Mail, MapPin, Phone, ShieldCheck, CreditCard, ChevronLeft, Globe, X, Camera } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-[#050505] border-t border-white/5 py-8 overflow-hidden">
      {/* Cinematic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container relative mx-auto px-4 z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8">
          
          {/* Right: Logo */}
          <Link href="/" className="flex items-center gap-3 group lg:w-1/3 justify-center lg:justify-start">
            <div className="relative w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
               <img src="/logo.png" alt="Youssef Automates" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(214,0,75,0.5)]" />
            </div>
            <div className="flex flex-col">
              <span className="font-alexandria font-black text-xl tracking-tighter text-white leading-tight" dir="ltr">
                Youssef <span className="text-[#D6004B]">Automates</span>
              </span>
            </div>
          </Link>

          {/* Center: Site Links */}
          <div className="lg:w-1/3 flex justify-center">
            <ul className="flex flex-wrap justify-center gap-6 font-cairo text-sm text-zinc-400">
              <li><Link href="#products" className="hover:text-[#D6004B] transition-colors">المنتجات المميزة</Link></li>
              <li><Link href="#features" className="hover:text-[#D6004B] transition-colors">لماذا تختارنا؟</Link></li>
              <li><Link href="#faq" className="hover:text-[#D6004B] transition-colors">الأسئلة الشائعة</Link></li>
            </ul>
          </div>

          {/* Left: Contact & Social */}
          <div className="lg:w-1/3 flex items-center justify-center lg:justify-end gap-4">
            <a href="mailto:support@youssefautomates.com" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-[#D6004B] hover:text-white hover:border-[#D6004B] transition-all shadow-xl">
              <Mail className="w-4 h-4" />
            </a>
            <a href="tel:+201000000000" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-[#D6004B] hover:text-white hover:border-[#D6004B] transition-all shadow-xl">
              <Phone className="w-4 h-4" />
            </a>
            {[X, Globe, Camera].map((Icon, i) => (
              <Link key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-[#D6004B] hover:text-white hover:border-[#D6004B] transition-all shadow-xl">
                <Icon className="w-4 h-4" />
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom: Copyright centered */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-center">
          <p className="font-cairo text-zinc-500 text-xs md:text-sm text-center">
            &copy; {new Date().getFullYear()} <span className="text-white font-bold">Youssef Automates</span>. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}

