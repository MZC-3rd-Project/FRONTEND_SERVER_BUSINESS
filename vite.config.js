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
      "/ws/chat": {
        target: "ws://localhost:18081",
        changeOrigin: true,
        ws: true,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            // WS 연결 종료 후 proxy가 upstream에 쓰려 할 때 발생하는 정상적인 소켓 에러 — 무시
            if (
              err.code === "ECONNRESET" ||
              err.message?.includes("socket has been ended") ||
              err.message?.includes("write after end")
            ) return
            console.error("[ws-proxy]", err.message)
          })
        },
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