FROM node:20-alpine

WORKDIR /app

# Install dependencies for node-gyp and other native modules if needed
# python3, make, g++ are often needed for things like bcrypt or torrent packages
RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
