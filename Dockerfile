FROM nginx
COPY ./src /usr/share/nginx/html

ENV API_URL="https://api.splan.nils-witt.de"

ENTRYPOINT "/usr/share/nginx/html/customStarter.sh"