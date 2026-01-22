FROM node:24-alpine

WORKDIR /usr/src/app

COPY ./package*.json ./

RUN npm install

COPY . .

VOLUME /usr/src/app/data

EXPOSE 8080
CMD [ "npm", "start"]