"use client";

import Link from "next/link";
import { ShoppingBag, ChevronLeft, Menu, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#features", label: "المميزات" },
    { href: "#products", label: "المنتجات" },
    { href: "#faq", label: "الأسئلة الشائعة" },
    { href: "#reviews", label: "آراء العملاء" },
  ];

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-500 ease-in-out px-4 py-4 md:px-8",
          scrolled ? "py-2 md:py-3" : "py-4 md:py-6"
        )}
      >
        <div className={cn(
          "container mx-auto max-w-7xl transition-all duration-500",
          scrolled ? "glass rounded-2xl px-6 h-14 md:h-16" : "bg-transparent h-16"
        )}>
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <motion.div 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Sparkles className="w-2.5 h-2.5 text-blue-900" />
                </motion.div>
              </div>
              <div className="flex flex-col">
                <span className="font-alexandria font-bold text-lg md:text-xl tracking-tight text-zinc-900 leading-tight" dir="ltr">
                  Youssef <span className="text-blue-600">Automates</span>
                </span>
                <span className="font-cairo text-[10px] text-zinc-500 font-medium tracking-wider uppercase">Premium Workflows</span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8 font-cairo text-[15px] font-medium text-zinc-600">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-blue-600 transition-all relative group py-2"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-sky-400 rounded-full transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/admin/login"
                className="font-cairo text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors px-4 py-2"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="#products"
                className="relative group overflow-hidden inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-cairo text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-xl shadow-zinc-200"
              >
                <span className="relative z-10">ابدأ الأتمتة الآن</span>
                <ChevronLeft className="w-4 h-4 relative z-10 group-hover:-translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-sky-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "md:hidden p-2 rounded-xl transition-all duration-300",
                scrolled ? "hover:bg-zinc-100" : "bg-white/50 backdrop-blur-md border border-white/20 shadow-sm"
              )}
              aria-label="فتح القائمة"
            >
              {mobileOpen ? <X className="w-6 h-6 text-zinc-900" /> : <Menu className="w-6 h-6 text-zinc-900" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="md:hidden absolute top-24 left-4 right-4 z-[60] glass rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 flex flex-col gap-2">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between font-cairo text-lg font-bold text-zinc-900 hover:text-blue-600 hover:bg-blue-50/50 transition-all px-5 py-4 rounded-2xl"
                    >
                      {link.label}
                      <ChevronLeft className="w-5 h-5 opacity-30" />
                    </Link>
                  </motion.div>
                ))}
                <div className="h-px bg-zinc-200/50 my-4" />
                <div className="flex flex-col gap-3">
                  <Link
                    href="/admin/login"
                    onClick={() => setMobileOpen(false)}
                    className="font-cairo text-center text-zinc-500 font-medium py-3"
                  >
                    تسجيل الدخول للمسؤول
                  </Link>
                  <Link
                    href="#products"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-cairo font-bold text-lg px-6 py-5 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    ابدأ الآن - وفر وقتك
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

