FROM node:14
WORKDIR /usr/src/app
# WORKDIR /usr/app
COPY package*.json ./
RUN npm i -g @adonisjs/cli
RUN npm install
ENV HOST=0.0.0.0
ENV PORT=3333
COPY . .
RUN npm run build
EXPOSE 3333
CMD [ "node", "./build/server.js" ]