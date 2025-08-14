FROM node:18-alpine AS base
ARG BACKEND_URL="http://localhost:3001"
ENV VITE_BACKEND_URL=$BACKEND_URL

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . ./
RUN npm run build

FROM node:21-alpine

RUN npm install -g serve

COPY --from=base /app/dist/ ./

EXPOSE 80/tcp

CMD serve -l 80 -s
