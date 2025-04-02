FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate

EXPOSE 3001

CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm start"]
