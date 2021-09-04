FROM node:16.0-buster-slim
WORKDIR /usr/src/app
COPY package.json ./
COPY tsconfig.json ./
RUN apt update && apt install mariadb-client python make g++ -y
RUN npm install
COPY ./src ./src
RUN npx tsc


FROM nginx
COPY --from=0 /usr/src/app/src /usr/share/nginx/html

ENV API_URL="https://api.splan.nils-witt.de"

ENTRYPOINT "/usr/share/nginx/html/customStarter.sh"