# 使用官方 Node.js 镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装指定版本的 pnpm
RUN npm install -g pnpm

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install

# 复制所有源代码
COPY . .

# 安装 serve 用于服务静态文件
RUN pnpm add serve

# 复制启动脚本
COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# 暴露端口（根据您的前端应用实际使用的端口）
EXPOSE 3000

# 定义容器启动时执行的命令
CMD ["sh", "start.sh"]
