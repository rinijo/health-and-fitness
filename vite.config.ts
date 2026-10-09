import { copyFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/health-and-fitness/' : '/',
  server: {
    host: 'localhost',
    port: 5173,
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'copy-404',
      closeBundle() {
        copyFileSync('dist/index.html', 'dist/404.html')
      },
    },
  ],
}))
