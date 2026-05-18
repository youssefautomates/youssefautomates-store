"use client";

import Link from "next/link";
import { ChevronLeft, Menu, X, ShoppingCart, Home } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { cartCount, setIsCartOpen } = useCart();
  const pathname = usePathname();

  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      if (isHomePage && window.scrollY < 200) {
        setActiveSection("");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  useEffect(() => {
    if (!isHomePage) return;
    const sections = ["products", "faq", "reviews"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isHomePage]);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      setMobileOpen(false);
      if (href.startsWith("#")) {
        if (isHomePage) {
          e.preventDefault();
          const targetId = href.slice(1);
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }
    },
    [isHomePage]
  );

  const handleHomeClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      setMobileOpen(false);
      if (isHomePage) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [isHomePage]
  );

  const navLinks = [
    { href: isHomePage ? "#products" : "/#products", label: "المنتجات", section: "products" },
    { href: isHomePage ? "#reviews" : "/#reviews", label: "آراء العملاء", section: "reviews" },
    { href: isHomePage ? "#faq" : "/#faq", label: "الأسئلة الشائعة", section: "faq" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-[100] h-16 md:h-20 bg-gradient-to-r from-rose-700 via-rose-500 to-rose-700 shadow-[0_10px_30px_rgba(214,0,75,0.2)] border-b border-white/10 flex items-center justify-center">
        {/* Marquee Background */}
        <div className="absolute inset-0 overflow-hidden flex items-center z-0 pointer-events-none">
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

        {/* Floating Dark Pill */}
        <nav className="relative z-10 w-full h-full md:px-8" style={{ pointerEvents: "auto" }}>
          <div className="w-full h-full max-w-7xl mx-auto bg-[#0b0b10]/95 backdrop-blur-3xl border-x border-white/10 md:rounded-b-[2rem] px-4 md:px-6 shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between h-full">

            {/* Right Side: Logo & Brand */}
            <Link href="/" onClick={handleHomeClick} className="flex items-center gap-3 group relative z-10">
              <div className="w-10 h-10 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                <img src="/logo.png" alt="Youssef Automates" className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(214,0,75,0.4)]" />
              </div>
              <div className="hidden md:flex flex-col">
                <span className="font-alexandria font-black text-lg md:text-xl tracking-tight text-white leading-tight" dir="ltr">
                  Youssef <span className="text-rose-500">Automates</span>
                </span>
                <span className="font-cairo text-[9px] text-zinc-500 font-bold tracking-[0.2em] uppercase">Premium Workflows</span>
              </div>
            </Link>

            {/* Middle: Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8 font-cairo text-[14px] font-bold text-zinc-400">
              <Link
                href="/"
                onClick={handleHomeClick}
                className={cn(
                  "relative group py-2 transition-colors duration-300 hover:text-white",
                  isHomePage && activeSection === "" ? "text-white" : ""
                )}
              >
                الرئيسية
                <span className={cn(
                  "absolute -bottom-1 left-0 h-[2px] bg-rose-500 rounded-full transition-all duration-300",
                  isHomePage && activeSection === "" ? "w-full shadow-[0_0_10px_rgba(214,0,75,0.8)]" : "w-0 group-hover:w-full opacity-50"
                )} />
              </Link>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href.startsWith("/#") ? `#${link.section}` : link.href)}
                  className={cn(
                    "relative group py-2 transition-colors duration-300 hover:text-white",
                    activeSection === link.section ? "text-white" : ""
                  )}
                >
                  {link.label}
                  <span className={cn(
                    "absolute -bottom-1 left-0 h-[2px] bg-rose-500 rounded-full transition-all duration-300",
                    activeSection === link.section ? "w-full shadow-[0_0_10px_rgba(214,0,75,0.8)]" : "w-0 group-hover:w-full opacity-50"
                  )} />
                </Link>
              ))}
            </div>

            {/* Left Side: Buttons & Cart */}
            <div className="flex items-center gap-3 md:gap-4 relative z-10">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-zinc-300 hover:text-white transition-colors group"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black font-alexandria flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(214,0,75,0.5)]"
                    >
                      {cartCount}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              <Link
                href={isHomePage ? "#products" : "/#products"}
                onClick={(e) => handleNavClick(e, "#products")}
                className="hidden md:flex relative h-10 items-center justify-center px-6 bg-white/[0.03] hover:bg-rose-600 border border-white/10 hover:border-rose-500 text-white font-alexandria font-bold text-sm rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(214,0,75,0)] hover:shadow-[0_0_20px_rgba(214,0,75,0.4)]"
              >
                تصفح المنتجات
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-zinc-300 hover:text-white transition-colors"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-[#050505]/80 backdrop-blur-md z-[90] md:hidden"
            />
            <motion.div
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 right-0 bg-[#0b0b10] border-b border-white/10 p-6 pt-24 z-[95] md:hidden rounded-b-[2rem] shadow-2xl"
            >
              <div className="flex flex-col gap-2">
                <Link
                  href="/"
                  onClick={handleHomeClick}
                  className="flex items-center gap-4 px-4 py-4 text-zinc-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all font-alexandria font-bold text-lg"
                >
                  <Home className="w-5 h-5 text-rose-500" />
                  الرئيسية
                </Link>

                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href.startsWith("/#") ? `#${link.section}` : link.href)}
                    className="flex items-center gap-4 px-4 py-4 text-zinc-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all font-alexandria font-bold text-lg"
                  >
                    <ChevronLeft className="w-5 h-5 text-rose-500" />
                    {link.label}
                  </Link>
                ))}
                
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Link
                    href={isHomePage ? "#products" : "/#products"}
                    onClick={(e) => handleNavClick(e, "#products")}
                    className="w-full h-14 bg-rose-600 text-white font-alexandria font-black text-lg rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(214,0,75,0.3)] active:scale-95 transition-transform"
                  >
                    تصفح المنتجات الآن
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
