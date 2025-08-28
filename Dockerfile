FROM node:24.7.0-alpine3.22@sha256:eb37f58646a901dc7727cf448cae36daaefaba79de33b5058dab79aa4c04aefb AS builder

WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
RUN npm run build-storybook -- -o dist/storybook

FROM nginx:stable-alpine3.21@sha256:8f2bcf97c473dfe311e79a510ee540ee02e28ce1e6a64e1ef89bfad32574ef10
COPY nginx-default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
