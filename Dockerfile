FROM node:20 as build-stage

WORKDIR /app

COPY package*.json ./

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN npm install

COPY . .

FROM node:20-alpine as production-stage

WORKDIR /app

RUN apk add --no-cache postgresql-client

COPY --from=build-stage /app/node_modules ./node_modules
COPY . .

EXPOSE ${APP_PORT}

CMD ["npm", "run", "prod"]