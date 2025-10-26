import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  main: {
    entry: 'src/main/index.js', // 👈 tell electron-vite your main entry
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    input: {
      index: resolve(__dirname, 'src/preload/index.js') // 👈 preload entry
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    input: {
      index: resolve(__dirname, 'src/renderer/index.html'), // 👈 renderer entry
      loading: resolve(__dirname, 'src/renderer/loading.html') // 👈 include loading window
    },
    resolve: {
      alias: {
        '@': resolve('src/renderer/src'),
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
