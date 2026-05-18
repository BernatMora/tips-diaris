import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // SW is in public/sw.js and registered manually in main.jsx
  // No vite-plugin-pwa needed — manifest.json is in public/ and served as-is
})
