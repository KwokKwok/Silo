import { defineConfig } from 'wxt';
import path from 'path';
console.log(path.resolve(__dirname, './src'));

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Silo - 多模型对话、文生图',
    permissions: ['contextMenus'],
    action: {},
    "web_accessible_resources": [
      {
        "resources": ["ext.html"],
        "matches": ['*://*/*']
      }
    ]
  },
  vite: () => ({
    esbuild: {
      pure: ['console.log'], // 删除 console.log
      drop: ['debugger'], // 删除 debugger
    },
  }),
  alias: {
    '@src': path.resolve(__dirname, './src'),
  },
  runner: {
    startUrls: ["https://developer.mozilla.org/en-US/docs/Web/CSS/perspective"],
  },
});