FROM node:18-alpine

WORKDIR /app

# В установить pnpm
RUN npm install -g pnpm

# Копирование файлов с информацией о приложении
COPY package.json pnpm-lock.yaml ./
# Чистая установка с lock файлом
RUN pnpm install --frozen-lockfile

# Копирование всего кода
COPY . .

RUN chown -R node:node /sqlite-db

# Запуск в контейнере
USER node

CMD ["npm", "start"]
