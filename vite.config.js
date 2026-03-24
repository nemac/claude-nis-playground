import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/claude-nis-playground/' : '/',
  server: {
    proxy: {
      '/nsiapi': {
        target: 'https://nsi.sec.usace.army.mil',
        changeOrigin: true,
        secure: true,
      },
      '/agol': {
        target: 'https://services.arcgis.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/agol/, ''),
      },
    },
  },
}))
