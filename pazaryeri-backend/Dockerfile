FROM node:22-slim

RUN apt-get update -y \
&& apt-get install -y openssl
WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g ts-node typescript

COPY . .

RUN npx prisma generate

RUN npm run build

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm run start:prod"]

EXPOSE 4000