import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-video',
      writeBundle() {
        const src = resolve(__dirname, 'public/video.mp4')
        const dest = resolve(__dirname, 'dist/video.mp4')
        if (existsSync(src)) {
          copyFileSync(src, dest)
          console.log('✅ video.mp4 copied to dist/')
        }
      }
    }
  ],
  publicDir: 'public',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})