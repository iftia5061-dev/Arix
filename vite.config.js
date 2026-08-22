import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/firebase/firestore') || id.includes('node_modules/@firebase/firestore')) return 'firebase-firestore'
          if (id.includes('node_modules/firebase/auth') || id.includes('node_modules/@firebase/auth')) return 'firebase-auth'
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) return 'firebase-core'
          return undefined
        },
      },
    },
  },
})
