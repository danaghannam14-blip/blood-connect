import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['react-leaflet', 'leaflet'],
      output: {
        globals: {
          'react-leaflet': 'ReactLeaflet',
          'leaflet': 'L'
        }
      }
    }
  }
})