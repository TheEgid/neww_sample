FROM node:18-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

# First install dependencies only
RUN pnpm install --frozen-lockfile --ignore-scripts

# Now copy the entire application
COPY . .

# Then run DB switching and Prisma generation
RUN pnpm run switch-db && pnpm prisma generate

RUN pnpm build

RUN mkdir -p /sqlite-db && chown -R node:node /sqlite-db

USER node

CMD ["npm", "start"]
