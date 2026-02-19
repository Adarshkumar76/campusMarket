import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          algorand: ['algosdk'],
          wallet: ['@perawallet/connect'],
        },
      },
    },
  },
})
