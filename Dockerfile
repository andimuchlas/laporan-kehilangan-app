FROM php:8.2-apache

# Install dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    unzip \
    git \
    zip \
    curl \
    && docker-php-ext-install pdo pdo_pgsql

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy project files
COPY . /var/www/html

# Set permissions
RUN chown -R www-data:www-data /var/www/html

# Set document root for Apache
ENV APACHE_DOCUMENT_ROOT /var/www/html/frontend

# Update Apache config
RUN sed -ri -e 's!/var/www/html!/var/www/html/frontend!g' /etc/apache2/sites-available/000-default.conf

# Enable PHP error display (for debugging, disable on production)
RUN echo "display_errors=On\nerror_reporting=E_ALL\n" > /usr/local/etc/php/conf.d/errors.ini

# Install PHP dotenv and dependencies
RUN composer install --no-dev --optimize-autoloader

# Expose port 80
EXPOSE 80

CMD ["apache2-foreground"]
