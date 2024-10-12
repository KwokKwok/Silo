#!/bin/sh

# 构建前端应用
pnpm build

# 使用 serve 运行构建后的静态文件
npx serve -s dist -l 3000
