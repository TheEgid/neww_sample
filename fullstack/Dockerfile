FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# В установить pnpm
RUN npm install -g pnpm

# Копирование файлов с информацией о приложении
COPY package.json pnpm-lock.yaml ./
# Чистая установка с lock файлом
RUN pnpm install --frozen-lockfile

# Копирование всего кода
COPY . .

# Запускаем сборку Next.js
RUN pnpm run build

# Запускаем приложение в production
USER node
CMD ["pnpm", "start"]
