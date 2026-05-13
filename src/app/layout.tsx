import type { Metadata } from "next";
import { Cairo, Alexandria } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: 'swap',
});

const alexandria = Alexandria({
  subsets: ["arabic"],
  variable: "--font-alexandria",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Youssef Automates",
  description: "متجر رائد لبيع المنتجات الرقمية وأتمتة n8n",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${alexandria.variable}`}
      style={{ colorScheme: 'light' }}
    >
      <body className="min-h-screen bg-white text-zinc-900 font-cairo flex flex-col antialiased">
        {children}
        <Toaster theme="light" position="top-center" />
      </body>
    </html>
  );
}
