# متجر Youssef Automates - لبيع المنتجات الرقمية

متجر إلكتروني احترافي مبني باستخدام **Next.js 15**، مصمم لتحقيق أعلى معدلات التحويل لبيع المنتجات الرقمية والأتمتة.

## 🚀 المميزات
- **تصميم بريميوم:** واجهة مستخدم عصرية وسريعة الاستجابة.
- **إدارة الطلبات:** نظام متكامل لمتابعة المبيعات والطلبات.
- **بوابة دفع Paymob:** ربط مباشر لتسهيل عمليات الدفع في مصر والشرق الأوسط.
- **تسليم تلقائي:** إرسال روابط التحميل فوراً عبر البريد الإلكتروني باستخدام **Resend**.
- **لوحة تحكم للمسؤول:** لمتابعة الأداء وإدارة المخزون الرقمي.

## 🛠 التكنولوجيا المستخدمة
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + Framer Motion
- **Database:** Supabase (PostgreSQL)
- **Email:** Resend
- **Payment:** Paymob
- **Components:** Shadcn/ui

## 📦 البدء في العمل

1. قم بتثبيت التبعيات:
   ```bash
   npm install
   ```

2. قم بإعداد المتغيرات البيئية في ملف `.env.local`:
   ```env
   RESEND_API_KEY=your_key
   ADMIN_EMAIL=your_email
   ADMIN_PASSWORD=your_password
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. تشغيل الخادم المحلي:
   ```bash
   npm run dev
   ```

## 🌐 النشر
تم إعداد المشروع ليكون متوافقاً تماماً مع **Vercel**. بمجرد الربط بـ GitHub، سيتم النشر تلقائياً.

---
تم التطوير بواسطة **Youssef Automates**
