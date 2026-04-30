import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // لتحديث التطبيق تلقائياً عند رفع كود جديد
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'تطبيق زوجونا - لتخطيط الزفاف',
        short_name: 'زوجونا',
        description: 'مساعدك الشخصي لتخطيط زفافك الحضرمي بكل تفاصيله',
        theme_color: '#d97706', // اللون العنابي/الذهبي الذي استخدمناه (amber-600)
        background_color: '#fdfbf7',
        display: 'standalone', // هذه الكلمة هي التي تجعله يفتح كأنه تطبيق بدون متصفح
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})