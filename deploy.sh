#!/bin/bash
# ============================================
# PMI-FE-Call Deployment Script
# ============================================

set -e

echo "🚀 PMI Frontend Deployment Script"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Check if shared network exists
echo -e "${YELLOW}Step 1: Checking shared network...${NC}"
if ! docker network inspect pmi-shared-network >/dev/null 2>&1; then
    echo -e "${RED}Error: pmi-shared-network does not exist!${NC}"
    echo "Please deploy the backend first, or run:"
    echo "  docker network create pmi-shared-network"
    exit 1
fi
echo -e "${GREEN}Network found!${NC}"

# Step 2: Generate SSL certificates if not exists
if [ ! -f "./nginx/ssl/server.crt" ]; then
    echo -e "${YELLOW}Step 2: Generating SSL certificates...${NC}"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ./nginx/ssl/server.key \
        -out ./nginx/ssl/server.crt \
        -subj "/C=ID/ST=Jakarta/L=Jakarta/O=PMI/OU=IT/CN=148.230.100.61" \
        -addext "subjectAltName = IP:148.230.100.61"
    echo -e "${GREEN}SSL certificates generated!${NC}"
else
    echo -e "${GREEN}SSL certificates already exist${NC}"
fi

# Step 3: Build and start containers
echo -e "${YELLOW}Step 3: Building and starting containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d --build

# Step 4: Show status
echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}✅ Frontend deployment complete!${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""
echo "Services:"
echo "  - Next.js: Running on internal network"
echo "  - Nginx:   https://148.230.100.61:1932"
echo ""
echo "Frontend URL: https://148.230.100.61:1932"
echo "Backend API:  https://148.230.100.61:501/api"
echo ""
echo "To check logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
