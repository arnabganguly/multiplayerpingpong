FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/realtime/package.json apps/realtime/package.json
COPY apps/simulator/package.json apps/simulator/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/game-core/package.json packages/game-core/package.json
RUN npm ci
COPY . .
RUN npm run build --workspace @pingpong/realtime

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S pingpong && adduser -S pingpong -G pingpong
COPY package*.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/realtime/package.json apps/realtime/package.json
COPY apps/simulator/package.json apps/simulator/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/game-core/package.json packages/game-core/package.json
RUN npm ci --omit=dev --ignore-scripts
COPY --from=build /app/apps/realtime/dist apps/realtime/dist
COPY --from=build /app/packages/contracts/dist packages/contracts/dist
COPY --from=build /app/packages/game-core/dist packages/game-core/dist
USER pingpong
EXPOSE 8080
CMD ["node", "apps/realtime/dist/server.js"]
