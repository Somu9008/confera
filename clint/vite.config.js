import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // 👈 allows access from mobile
    port: 5173, // 👈 default Vite port (change if needed)
  },
});
