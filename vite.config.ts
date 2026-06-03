import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  base: process.env.VITE_APP_BASE_PATH || '/omni/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: Number(process.env.VITE_DEV_PORT) || 3000,
    open: true,
  }
})