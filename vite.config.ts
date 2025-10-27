// @ts-nocheck
const { defineConfig } = require('vite')
const vue = require('@vitejs/plugin-vue')
const electron = require('vite-plugin-electron')
const renderer = require('vite-plugin-electron-renderer')
const AutoImport = require('unplugin-auto-import/vite')
const Components = require('unplugin-vue-components/vite')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')
const path = require('path')

module.exports = defineConfig({
  plugins: [
    vue(),
    electron([
      {
        entry: 'electron/main.ts',
        onstart(options) {
          if (options && options.startup) {
            options.startup()
          }
        },
        vite: {
          build: {
            sourcemap: false,
            minify: false,
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          if (options && options.reload) {
            options.reload()
          }
        },
        vite: {
          build: {
            sourcemap: false,
            minify: false,
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      }
    ]),
    renderer(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia']
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist'
  }
})