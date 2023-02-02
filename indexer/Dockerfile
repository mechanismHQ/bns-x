FROM node:18

WORKDIR /usr/src/app

RUN npm install -g pnpm

# RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

COPY package.json ./

RUN pnpm install --prod

COPY . .

RUN ./node_modules/.bin/prisma generate --schema prisma/stacks-api-schema.prisma

COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh

EXPOSE 8080
# CMD ["node", "-r", "@swc-node/register", "scripts/server.ts"]
CMD /docker-entrypoint.sh