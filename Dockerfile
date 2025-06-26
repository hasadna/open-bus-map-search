FROM node:lts AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
RUN npm run build-storybook -- -o dist/storybook

FROM nginx
COPY nginx-default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
