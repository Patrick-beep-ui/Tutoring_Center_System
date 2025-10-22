import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react';


// https://vitejs.dev/config/
export default defineConfig({ // This should match your GitHub Pages repository name
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
  },
});

