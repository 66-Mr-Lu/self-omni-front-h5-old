import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills({
      // 只包含需要的模块，避免体积过大
      include: ['buffer'],
    }),
    VitePWA({
      // PWA 注册时机：提示用户更新
      registerType: 'prompt',
      // 开发模式下也要生成 SW，方便测试
      devOptions: {
        enabled: true,   // 允许开发环境启用 Service Worker
        type: 'module',  // 推荐
      },
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'Omni工具箱',
        short_name: 'Omni',
        description: '一款实用的在线工具箱',
        theme_color: '#4A90E2',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/omni/',
        start_url: '/omni/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          },
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // 缓存策略：优先缓存，失败时回退到网络
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // 缓存字体文件
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // 缓存图片资源
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  base: process.env.VITE_APP_BASE_PATH || '/omni/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: Number(process.env.VITE_DEV_PORT) || 3000,
    open: true,
  },
  build: {
    target: ['es2022'],
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})