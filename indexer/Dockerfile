FROM node:16

WORKDIR /usr/src/app

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

COPY package.json ./

RUN pnpm install --prod

COPY . .

EXPOSE 8080
CMD ["node", "-r", "@swc-node/register", "scripts/server.ts"]