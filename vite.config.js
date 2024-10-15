import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
// 根据需要修改环境变量
import "./scripts/paid-sk.js";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
    }
  },
  envPrefix: ['VITE_', 'SILO_'],
})
