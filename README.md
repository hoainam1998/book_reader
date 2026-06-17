# Book Reader App.

This project is helping management book information, user and reader (end user).

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/)

## Technical stack
### Back-end
[Javascript](https://www.w3schools.com/js/) + 
[phpmyadmin](https://www.phpmyadmin.net/downloads/) +
[xampp](https://www.apachefriends.org/download.html) +
[mysql](https://www.mysql.com/downloads/) +
[Prisma](https://www.prisma.io/docs) +
[Redis](https://redis.io/) +
[Socket](https://socket.io/docs/v4/tutorial/introduction) +
[Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/)

### Front-end
[Typescript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) +
[Webpack](https://webpack.js.org/concepts/) +
[React 18](https://18.react.dev/) +
[ReactRouter v6](https://reactrouter.com/6.30.4) +
[Axios](https://axios.rest/pages/getting-started/first-steps) +
[Socket](https://socket.io/docs/v4/tutorial/introduction)

## Project setup
### Back-end
```bash
cd /book-api

# install dependencies
$ npm install

# setup local database
step 1 - Download and install xampp
step 2 - Start the MySQL Service
  - Open XAMPP Control Panel
  - Click start Apache
  - Click start Mysql
step 3 - Access phpMyAdmin
  - Open browser and navigate to http://localhost/phpmyadmin

# migration database schema by prisma
Recommend doc (https://www.prisma.io/docs/prisma-orm/quickstart/mysql)
step 1: run `npx prisma migrate dev`
step 2: run `npx prisma generate`

#download and install Docker Desktop
run `npm run docker-dev` to start redis container
```
### Front-end
```bash
cd /book_client

# install dependencies
$ npm install
```

## Run the project
### Back-end
```bash
cd /book-api
npm run dev
```
### Front-end
#### Admin
```bash
cd /book_client
npm run admin
```
#### Client
```bash
cd /book_client
npm run client
```
### Lint with [ESLint](https://eslint.org/)

```sh
cd /book-api or cd /book_client
npm run lint
```
### Docker
```sh
To start all services run:
docker compose up
And `docker compose down` to stop all them.
```
### Testing (Only for back-end)
```bash
cd /book-api
npm run docker-dev
npm run test
```
## CI 
[.github/workflows](.github/workflows)
