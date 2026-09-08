import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';
// https://vite.dev/config/
console.log("Vite config loaded!!!!")
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 👈 This line adds the alias
    },
    extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
  },
  server: {
    port: 5174,  
    strictPort: true,
  },
})
 