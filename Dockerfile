FROM php:8.2-apache

# Install required extensions
RUN apt-get update && apt-get install -y libpq-dev unzip && docker-php-ext-install pdo pdo_pgsql

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy project files
COPY . /var/www/html/

# Set working directory
WORKDIR /var/www/html

# Set permissions
RUN chown -R www-data:www-data /var/www/html

# Optional: Expose environment variables to PHP
ENV APACHE_DOCUMENT_ROOT /var/www/html/frontend

# Update Apache config
RUN sed -ri -e 's!/var/www/html!/var/www/html/frontend!g' /etc/apache2/sites-available/000-default.conf
