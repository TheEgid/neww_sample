FROM node:18-alpine

WORKDIR /app

# Установка pnpm
RUN npm install -g pnpm

# Копирование файлов с информацией о приложении
COPY package.json pnpm-lock.yaml ./

# Установка зависимостей с использованием lock-файла
RUN pnpm install --frozen-lockfile

# Копирование всего остального кода
COPY . .

RUN pnpm build

# Создание директории для SQLite и установка владельца
RUN mkdir -p /sqlite-db && chown -R node:node /sqlite-db

# Использование пользователя node
USER node

# Команда по умолчанию
CMD ["npm", "start"]
