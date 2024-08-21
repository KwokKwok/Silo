import { defineConfig } from 'wxt';
import path from 'path';
console.log(path.resolve(__dirname, './src'));

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Silo - SiliconCloud API Playground',
    action: {},
  },
  vite: () => ({
    esbuild: {
      pure: ['console.log'], // 删除 console.log
      drop: ['debugger'], // 删除 debugger
    },
  }),
});