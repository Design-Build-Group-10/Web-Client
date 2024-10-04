import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: mode === 'production'
            ? 'http://backend-server'
            : mode === 'development'
              ? 'http://82.156.184.46'
              : mode === 'mock'
                ? 'http://127.0.0.1:4523/m1/5147033-4811066-default'
                : 'http://127.0.0.1:8000',
          changeOrigin: true,
          // rewrite: path => path.replace(/^\/api/, ''), // mock 时打开， dev 时注释
        },
        '/media': {
          target: 'http://82.156.184.46',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/media/, '/media'),
        },
      },
    },
  }
})
