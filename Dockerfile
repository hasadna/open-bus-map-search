FROM node:24.15.0-alpine3.23@sha256:d1b3b4da11eefd5941e7f0b9cf17783fc99d9c6fc34884a665f40a06dbdfc94f AS builder

WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
RUN npm run build-storybook -- -o dist/storybook

FROM nginx:stable-alpine3.23@sha256:0272e4604ed93c1792f03695a033a6e8546840f86e0de20a884bb17d2c924883
COPY nginx-default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
