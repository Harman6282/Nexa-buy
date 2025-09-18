FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# production image

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=production

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma 

RUN chown -R node:node /app && chmod -R 755 /app

RUN npm install -g pm2

COPY ecosystem.config.js .

USER node 

EXPOSE 3001

CMD ["pm2-runtime", "start","ecosystem.config.js"]