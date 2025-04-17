FROM mcr.microsoft.com/playwright:v1.52.0-noble

COPY complaint.js /complaint.js
COPY package.json /package.json
COPY package-lock.json /package-lock.json

RUN npm ci

CMD ["node", "/complaint.js"]

