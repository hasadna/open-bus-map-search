FROM mcr.microsoft.com/playwright:v1.38.0-jammy

COPY complaint.js /complaint.js
COPY package.json /package.json
COPY package-lock.json /package-lock.json

RUN npm ci

CMD ["node", "/complaint.js"]

