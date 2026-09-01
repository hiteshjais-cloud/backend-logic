FROM node:22 AS builder

WORKDIR /app

COPY package.json .

RUN npm install

FROM node:22-alpine 

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY . .

CMD ["node","server.js"]
