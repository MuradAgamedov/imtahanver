FROM dunglas/frankenphp:1.3-php8.4-alpine


# Install PHP extensions required for Laravel and Redis
RUN install-php-extensions \
    pdo_pgsql \
    pdo_mysql \
    redis \
    zip \
    opcache \
    gd \
    intl \
    bcmath \
    pcntl

# Set document root for FrankenPHP
ENV FRANKENPHP_DOCUMENT_ROOT=/app/public

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy dependency files first to leverage Docker cache
COPY composer.json composer.lock ./

# Install dependencies (without running scripts/autoloader first)
RUN composer install --no-scripts --no-autoloader --no-interaction --prefer-dist

# Copy the rest of the application
COPY . .

# Run composer dump-autoload
RUN composer dump-autoload --optimize

# Ensure storage and bootstrap directories are writable by www-data
RUN mkdir -p storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/app/public \
    bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Copy entrypoint script and make it executable
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
