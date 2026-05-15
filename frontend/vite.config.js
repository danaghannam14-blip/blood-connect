import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  ssr: {
    noExternal: ['leaflet', 'react-leaflet']
  }
})