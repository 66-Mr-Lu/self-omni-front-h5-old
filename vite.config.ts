import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true,
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://guai01bin.dynv6.net:8081',
        changeOrigin: true,
        ws: true,
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})