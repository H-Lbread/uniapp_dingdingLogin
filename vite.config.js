import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@components': resolve(__dirname, './components'),
      '@utils': resolve(__dirname, './utils'),
      '@mixins': resolve(__dirname, './mixins'),
      '@static': resolve(__dirname, './static'),
    }
  },
  // server: {
  //   host: '192.168.6.91',
  //   port: 3000,
  //   open: true // 自动打开浏览器
  // }
}) 