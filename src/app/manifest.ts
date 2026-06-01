import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Youssef Automates',
    short_name: 'Youssef Automates',
    description: 'أكاديمية يوسف أوتوميتس لتعليم أتمتة الأعمال بالذكاء الاصطناعي وأنظمة سير العمل بدون كود والأدوات الإبداعية.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
