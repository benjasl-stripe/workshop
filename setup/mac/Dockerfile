FROM postgres:16-alpine

# Bootstrap defaults (used only on first init)
ENV POSTGRES_USER=postgres \
    POSTGRES_PASSWORD=postgres \
    POSTGRES_DB=postgres

# App defaults (override at runtime with -e)
ENV APP_DB_NAME=stripe-ws-db \
    APP_DB_USER=myadmin \
    APP_DB_PASS=mypassword

# Copy your dump(s)
COPY import/ /docker-entrypoint-initdb.d/import/

# Copy the init script so it runs once on first startup
COPY docker/01_init_app.sh /docker-entrypoint-initdb.d/01_init_app.sh
RUN chmod +x /docker-entrypoint-initdb.d/01_init_app.sh
