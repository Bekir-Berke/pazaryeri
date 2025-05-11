FROM node:20-slim

RUN apt-get update -y \
&& apt-get install -y openssl
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/src/main"]

EXPOSE 3000