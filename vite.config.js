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
      "/api/store": {
        target: "http://localhost:8072",
        changeOrigin: true,
      },
      "/api/products": {
        target: "http://localhost:8084",
        changeOrigin: true,
      },
      "/api/funding":{
        target: "http://localhost:8086",
        changeOrigin: true,
      },
      "/api/campaigns":{
        target: "http://localhost:8086",
        changeOrigin: true,
      }
    }

  },
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      "@": path.resolve(__dirname, "./src"),
    },
  },

})