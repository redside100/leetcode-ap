# pull official base image
FROM node:20.18-alpine3.20

# set working directory
WORKDIR /app

# Copies package.json and package-lock.json to Docker environment
COPY package*.json ./

RUN npm config set legacy-peer-deps true

# Installs all node packages
RUN npm install

# Copies everything over to Docker environment
COPY . .

# Build for production.
RUN npm run build

# Install `serve` to run the application.
RUN npm install -g serve

# Uses port which is used by the actual application
EXPOSE 1357

# Run application
CMD serve -s dist -p 1357