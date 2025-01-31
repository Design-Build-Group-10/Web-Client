import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { theme } from 'ant-design-vue'
import { defineConfig } from 'vite'
import { token } from './src/theme/theme.json'

const { defaultAlgorithm, defaultSeed } = theme

const mapToken = defaultAlgorithm({ ...defaultSeed, ...token })

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue(),
    ],
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          modifyVars: {
            ...mapToken,
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: mode === 'production'
            ? 'http://backend:8000'
            : mode === 'development'
              ? 'http://62.234.168.154'
              : mode === 'mock'
                ? 'http://127.0.0.1:4523/m1/5147033-4811066-default'
                : 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
          // rewrite: path => path.replace(/^\/api/, ''),
          ws: true,
          // bypass(req, res, options) {
          //   console.log(req, res, options)
          // },
        },
        '/media': {
          target: 'http://62.234.168.154',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/media/, '/media'),
        },
        '/admin': {
          target: 'https://62.234.168.154',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/admin/, '/admin'),
        },
      },
    },
  }
})
