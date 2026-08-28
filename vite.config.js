import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';


// https://vitejs.dev/config/
export default defineConfig({ // This should match your GitHub Pages repository name
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/client', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
  },
});

