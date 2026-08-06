import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// If deploying to GitHub Pages at https://<user>.github.io/<repo>/,
// set base to "/<repo>/". For Vercel/Netlify (custom domain or root), leave as "/".
export default defineConfig({
  plugins: [react()],
  base: "/project-demo-pos-system/bistro-pos/",
});
