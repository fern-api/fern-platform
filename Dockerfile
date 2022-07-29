FROM node:18.1.0-alpine AS builder

COPY package.json .npmrc tsconfig.json prisma/ /app/

WORKDIR /app
RUN npm install
COPY src/ src
RUN npm run compile 
RUN rm -rf node_modules 
RUN npm install --production

FROM node:18.1.0-alpine

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY --from=builder /app /app

ENTRYPOINT ["node", "/app/lib/server.js"]