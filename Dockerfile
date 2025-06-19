FROM php:8.2-apache

# Install dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo pdo_pgsql

# Enable mod_rewrite
RUN a2enmod rewrite

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy project files
COPY . /var/www/html

# Install dependencies
RUN composer install

# Permissions
RUN chown -R www-data:www-data /var/www/html

# Optional: Set env location if needed
ENV APACHE_DOCUMENT_ROOT /var/www/html

# Expose port (default 80)
EXPOSE 80
