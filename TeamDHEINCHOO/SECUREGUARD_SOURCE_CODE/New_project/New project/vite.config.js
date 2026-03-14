import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/agent-info": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/start_scan": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/active_scans": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/scan_status": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/audit_logs": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/vulnerabilities": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/contract": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/analytics": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
