FROM node:22-slim

RUN corepack enable

WORKDIR /frontend

# Install dependencies first for better layer caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# VITE_* props are injected at container start (not build time), see docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
EXPOSE 5173
CMD ["pnpm", "run", "serve"]
