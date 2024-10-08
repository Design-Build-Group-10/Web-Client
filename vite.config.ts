import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { theme } from 'ant-design-vue'
import { defineConfig } from 'vite'

const { defaultAlgorithm, defaultSeed } = theme

const mapToken = defaultAlgorithm({ ...defaultSeed })

// https://vitejs.dev/config/
export default defineConfig(() => {
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
          target: 'http://62.234.168.154',
          changeOrigin: true,
        },
        '/media': {
          target: 'http://62.234.168.154',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/media/, '/media'),
        },
        '/admin': {
          target: 'http://62.234.168.154',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/admin/, '/admin'),
        },
      },
    },
  }
})
