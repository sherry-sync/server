# Base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY yarn.lock ./

# Bundle app source
COPY src ./src

EXPOSE 3000:3000
EXPOSE 3001:3001

# Install app dependencies
RUN yarn install

COPY tsconfig.json ./

# Creates a "dist" folder with the production build
RUN npm run build

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

ARG APP_SECRET
ENV APP_SECRET=${APP_SECRET}

ARG PEPPER
ENV PEPPER=${PEPPER}

ARG REFRESH_TOKEN_SECRET
ENV REFRESH_TOKEN_SECRET=${REFRESH_TOKEN_SECRET}

ENV PORT=3000
ENV WS_PORT=3001
ENV JWT_EXPIRED=365d

# Start the server using the production build
CMD ["sh", "-c", "npm run migrate:dev && node dist/main.js"]
