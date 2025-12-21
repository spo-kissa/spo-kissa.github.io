# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build

WORKDIR /docs

COPY package.json package-lock.json* ./

RUN npm ci

COPY ./docs .

RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /docs/build /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
