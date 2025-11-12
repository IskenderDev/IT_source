FROM node:20-alpine AS build
WORKDIR /app

COPY ./src/package.json ./src/package-lock.json* ./src/pnpm-lock.yaml* ./src/yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    else npm install; fi

COPY ./src ./
RUN npm run build

FROM php:8.3-apache AS runtime
RUN a2enmod rewrite headers
ENV TZ=Asia/Bishkek

RUN printf "ServerName localhost\n" > /etc/apache2/conf-available/servername.conf && a2enconf servername

COPY ./src/apache/000-default.conf /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html

COPY --from=build /app/dist/ ./
RUN rm -f /var/www/html/.htaccess

COPY ./src/api ./api

RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
CMD ["apache2-foreground"]
