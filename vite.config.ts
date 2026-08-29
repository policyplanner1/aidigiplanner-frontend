import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_API_PROXY_TARGET;

  const proxy = proxyTarget
    ? {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        },
        "/health": {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        },
      }
    : undefined;

  return {
    plugins: [react()],
    server: { proxy },
    preview: { proxy },
  };
});
