#!/bin/bash

# ===========================================
# PMI Call Frontend - Hostinger VPS Setup
# ===========================================

set -e

# Configuration - CHANGE THESE!
DOMAIN="yourdomain.com"
EMAIL="your-email@example.com"

echo "=========================================="
echo "PMI Call Frontend - VPS Setup Script"
echo "=========================================="

# Update system
echo ">>> Updating system packages..."
apt update && apt upgrade -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo ">>> Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo ">>> Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create directories
echo ">>> Creating directories..."
mkdir -p certbot/conf certbot/www nginx

# Update nginx.conf with actual domain
echo ">>> Configuring Nginx..."
sed -i "s/yourdomain.com/$DOMAIN/g" nginx/nginx.conf

# Initial dummy certificates (for first Nginx start)
echo ">>> Creating temporary SSL certificates..."
mkdir -p certbot/conf/live/$DOMAIN
openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
    -keyout certbot/conf/live/$DOMAIN/privkey.pem \
    -out certbot/conf/live/$DOMAIN/fullchain.pem \
    -subj "/CN=localhost"

# Start Nginx
echo ">>> Starting Nginx..."
docker-compose -f docker-compose.prod.yml up -d nginx

# Get real SSL certificate
echo ">>> Obtaining SSL certificate from Let's Encrypt..."
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

# Restart all services
echo ">>> Starting all services..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo "Your site is now available at:"
echo "  https://$DOMAIN"
echo ""
echo "SSL certificate will auto-renew every 12 hours"
echo "=========================================="
