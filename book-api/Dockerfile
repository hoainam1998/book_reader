FROM node:22-alpine

RUN npm install -g nodemon

WORKDIR /api

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5000

CMD ["sh", "-c", "npm run db:deploy && npm run dev"]