# Pulled March 21, 2023
FROM node:18@sha256:8d9a875ee427897ef245302e31e2319385b092f1c3368b497e89790f240368f5
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY ./.yarn ./.yarn
RUN yarn install --pure-lockfile
COPY . .
RUN yarn run build

# Pulled March 21, 2023
FROM nginx@sha256:aa0afebbb3cfa473099a62c4b32e9b3fb73ed23f2a75a65ce1d4b4f55a5c2ef2
COPY nginx-default.conf /etc/nginx/conf.d/default.conf
COPY --from=0 /app/dist /usr/share/nginx/html
