"use client";

import { useEffect, useState } from "react";
import { Star, ShieldCheck, MessageSquareQuote, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface Review {
  id: string;
  productId: string;
  firstName: string;
  lastName: string;
  rating: number;
  text: string;
  avatarUrl: string;
  gender?: string;
  isVerified: boolean;
  createdAt: string;
}

const MALE_SEEDS = ["Felix", "Oliver", "Charlie", "Jack", "Liam", "Noah", "James", "Ethan"];
const FEMALE_SEEDS = ["Mia", "Lily", "Emma", "Sara", "Luna", "Aria", "Zoe", "Chloe"];

const getAvatarUrl = (firstName: string, gender?: string) => {
  const seeds = gender === "female" ? FEMALE_SEEDS : MALE_SEEDS;
  let hash = 0;
  for (let i = 0; i < firstName.length; i++) {
    hash = firstName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const chosen = seeds[Math.abs(hash) % seeds.length];
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${chosen}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc`;
};

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/reviews?productId=${productId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReviews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  if (loading || reviews.length === 0) return null;

  return (
    <section className="container mx-auto px-4 mt-24 mb-12" id="reviews">
      {/* Header & Rating Summary */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-600/10 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(214,0,75,0.15)] border border-rose-500/20">
            <MessageSquareQuote className="w-7 h-7 text-rose-500" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-alexandria font-black text-white tracking-tighter">آراء العملاء</h2>
            <p className="text-zinc-400 font-cairo mt-1">ماذا يقول عملاؤنا عن هذه الحزمة؟</p>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex items-center gap-6 shadow-2xl backdrop-blur-sm">
          <div className="text-center">
            <span className="text-5xl font-alexandria font-black text-white tracking-tighter block mb-1">4.9</span>
            <div className="flex text-rose-500 gap-0.5 justify-center mb-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <span className="text-xs text-zinc-500 font-cairo">من أصل 100+ تقييم</span>
          </div>
          
          {/* Rating Bars */}
          <div className="flex flex-col gap-2 w-48 border-r border-white/10 pr-6 rtl:border-r-0 rtl:pr-0 rtl:border-l rtl:pl-6">
            {[
              { stars: 5, pct: 90 },
              { stars: 4, pct: 8 },
              { stars: 3, pct: 2 },
              { stars: 2, pct: 0 },
              { stars: 1, pct: 0 }
            ].map(row => (
              <div key={row.stars} className="flex items-center gap-2 text-[10px] font-alexandria font-bold text-zinc-400">
                <span className="w-2">{row.stars}</span>
                <Star className="w-3 h-3 text-zinc-600 fill-current" />
                <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full shadow-[0_0_10px_rgba(214,0,75,0.5)]" style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {reviews.map((review, idx) => (
          <motion.div 
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: (idx % 3) * 0.1, duration: 0.5 }}
            className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 hover:border-rose-500/20 hover:bg-white/[0.04] transition-all duration-300 group flex flex-col relative overflow-hidden shadow-2xl hover:shadow-[0_20px_50px_rgba(214,0,75,0.05)]"
          >
            {/* Subtle Gradient Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/10 group-hover:border-rose-500/30 transition-colors shadow-xl">
                  {review.avatarUrl && !review.avatarUrl.includes("pravatar") ? (
                    <img src={review.avatarUrl} alt={review.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <img src={getAvatarUrl(review.firstName, review.gender)} alt={review.firstName} className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <h4 className="text-white font-alexandria font-bold text-lg mb-0.5">
                    {review.firstName} {review.lastName ? review.lastName.charAt(0) + "." : ""}
                  </h4>
                  {review.isVerified && (
                    <div className="flex items-center gap-1 mt-1 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">مشترٍ موثوق</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-1 mb-4 text-rose-500 relative z-10">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-zinc-800 fill-transparent'}`} />
              ))}
            </div>

            <p className="text-zinc-300 font-cairo text-[15px] leading-relaxed flex-1 italic relative z-10">
              "{review.text}"
            </p>

            {/* Premium Result Badge overlaying bottom right */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-cairo">
                <CheckCircle2 className="w-4 h-4 text-rose-500/50" />
                <span>حقق نتائج فعلية</span>
              </div>
              <span className="text-[10px] text-zinc-600 font-alexandria">{new Date(review.createdAt).toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' })}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
