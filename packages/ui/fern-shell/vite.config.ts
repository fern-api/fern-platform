import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import vercel from "vite-plugin-vercel";

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: process.env.PORT as unknown as number,
    },
    plugins: [react(), vercel()],
});
