FROM node:22-alpine

RUN npm install -g nodemon

WORKDIR /api

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]