# =================
# STAGE 1: Builder
# =================
# Di stage ini kita menginstal dependensi Composer
FROM composer:2.7 as builder

WORKDIR /app

# Salin hanya file yang dibutuhkan Composer
COPY composer.json composer.lock ./
COPY backend/ ./backend/

# Install dependensi. --no-dev untuk produksi
RUN composer install --no-interaction --no-dev --optimize-autoloader

# =================
# STAGE 2: Final Image
# =================
# Ini adalah image akhir yang akan dijalankan
FROM php:8.2-apache

# Install ekstensi PHP yang dibutuhkan (hanya runtime dependencies)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Aktifkan mod_rewrite Apache
RUN a2enmod rewrite

# Set direktori kerja
WORKDIR /var/www/html

# Salin file aplikasi dari build context (lokal) ke container
# Perhatikan kita menyalin ISI dari folder frontend, bukan folder itu sendiri
COPY frontend/ .

# Salin folder API dari backend
COPY backend/api/ ./api/

# Salin folder vendor hasil `composer install` dari stage 'builder'
COPY --from=builder /app/vendor/ ./vendor/

# Atur kepemilikan file agar Apache bisa membacanya
RUN chown -R www-data:www-data /var/www/html
