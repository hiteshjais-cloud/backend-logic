FROM node:20 as builder

WORKDIR /app

COPY package.json .

RUN npm install

FROM node:20-alpine 

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY . .

CMD ["node","server.js"]
