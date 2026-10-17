import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/assets": "http://localhost:3000",
      "/add-asset": "http://localhost:3000",
      "/add-nominee": "http://localhost:3000",
      "/verify-nominee": "http://localhost:3000",
      "/request-emergency-otp": "http://localhost:3000",
      "/verify-emergency-otp": "http://localhost:3000",
      "/verify-emergency": "http://localhost:3000",
      "/generate-checklist": "http://localhost:3000",
      "/recovery-assistant": "http://localhost:3000",
      "/health": "http://localhost:3000"
    }
  }
});
