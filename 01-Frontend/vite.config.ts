import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import fs from 'fs'
import { visualizer } from 'rollup-plugin-visualizer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Bundle analyzer - genera stats.html después del build
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    // Optimizaciones de performance
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      // Asegurar que React se mantenga como dependencia externa correcta
      external: (id) => {
        // No externalizar nada - mantener todo en el bundle para evitar problemas
        return false;
      },
      output: {
        // Code splitting simplificado para evitar problemas con React
        manualChunks: {
          // React DEBE cargarse PRIMERO - evita forwardRef issues
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          
          // UI que depende de React - se carga DESPUÉS
          'ui-vendor': ['@radix-ui/react-slot', '@radix-ui/react-dialog', 'lucide-react'],
          
          // Resto separado lógicamente
          'utils-vendor': ['axios', 'zod', 'clsx', 'tailwind-merge'],
          'charts': ['recharts'],
          'vendor': ['@tanstack/react-query', 'zustand', 'i18next']
        },
        // Nombres de archivos optimizados para caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            // Para páginas/features, usar nombres descriptivos
            if (facadeModuleId.includes('/pages/')) {
              const pageName = facadeModuleId.split('/pages/')[1].split('.')[0]
              return `pages/[name]-[hash].js`.replace('[name]', pageName)
            }
            if (facadeModuleId.includes('/features/')) {
              const featureName = facadeModuleId.split('/features/')[1].split('/')[0]
              return `features/[name]-[hash].js`.replace('[name]', featureName)
            }
          }
          return 'chunks/[name]-[hash].js'
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
    // ✅ CRÍTICO: Asegurar que solo haya UNA instancia de React
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5181',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
