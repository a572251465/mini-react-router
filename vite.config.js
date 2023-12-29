import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const resolvePath = (...args) => path.resolve(__dirname, ...args);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolvePath("./src")
    },
  },
});
