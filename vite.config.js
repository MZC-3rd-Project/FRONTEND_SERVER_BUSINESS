import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    port: 3001,
    proxy: {
      "/login": {
        target: "http://localhost:18081",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:18081",
        changeOrigin: true,
      },
    }

  },
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      "@": path.resolve(__dirname, "./src"),
    },
  },

})