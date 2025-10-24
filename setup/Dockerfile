FROM postgres:16-alpine

# Bootstrap defaults (first init only)
ENV POSTGRES_USER=postgres \
    POSTGRES_PASSWORD=postgres \
    POSTGRES_DB=postgres

# App defaults (can be overridden at runtime)
ENV APP_DB_NAME=stripe-ws-db \
    APP_DB_USER=myadmin \
    APP_DB_PASS=mypassword

# Copy dumps
COPY import/ /docker-entrypoint-initdb.d/import/

# Copy init script, normalize line endings, then make executable
COPY docker/01_init_app.sh /docker-entrypoint-initdb.d/01_init_app.sh
RUN sed -i 's/\r$//' /docker-entrypoint-initdb.d/01_init_app.sh \
 && chmod +x /docker-entrypoint-initdb.d/01_init_app.sh
