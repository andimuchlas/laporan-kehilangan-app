# Gunakan image dasar PHP + Apache
FROM php:8.2-apache

# Install dependensi sistem
RUN apt-get update && apt-get install -y \
    unzip \
    libpq-dev \
    git \
    && docker-php-ext-install pdo pdo_pgsql

# Enable Apache rewrite
RUN a2enmod rewrite

# Install Composer (cara aman)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set direktori kerja
WORKDIR /var/www/html

# Salin semua file dari project ke container
COPY . .

# Jalankan composer install
RUN composer install --no-dev --optimize-autoloader

# Permissions
RUN chown -R www-data:www-data /var/www/html
