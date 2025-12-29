# PMI Call Frontend - Docker Deployment Guide

## Quick Start (Development)

```bash
docker-compose build
docker-compose up
```

Access at: http://localhost:3000

---

## Production Deployment (Hostinger VPS)

### Prerequisites
- Hostinger VPS dengan Ubuntu/Debian
- Domain yang sudah diarahkan ke VPS IP
- SSH access ke VPS

### Step 1: Upload Project ke VPS

```bash
# Di local machine
scp -r . root@YOUR_VPS_IP:/root/pmi-frontend
```

Atau clone dari Git:
```bash
ssh root@YOUR_VPS_IP
git clone YOUR_REPO_URL /root/pmi-frontend
cd /root/pmi-frontend
```

### Step 2: Configure Environment

Edit file `.env`:
```bash
cp .env.example .env
nano .env
```

Set your API URL:
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Step 3: Configure Domain

Edit `setup-vps.sh`:
```bash
nano setup-vps.sh
```

Ganti:
- `DOMAIN="yourdomain.com"` → domain Anda
- `EMAIL="your-email@example.com"` → email untuk SSL

### Step 4: Run Setup Script

```bash
chmod +x setup-vps.sh
./setup-vps.sh
```

Script akan otomatis:
1. Install Docker & Docker Compose
2. Configure Nginx reverse proxy
3. Obtain SSL certificate dari Let's Encrypt
4. Start semua services

### Step 5: Verify

Buka browser:
```
https://yourdomain.com
```

Geolocation akan berfungsi karena sudah HTTPS! ✅

---

## Useful Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop all
docker-compose -f docker-compose.prod.yml down

# Rebuild after code changes
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## File Structure

```
PMI-FE-Call/
├── Dockerfile              # Multi-stage Next.js build
├── docker-compose.yml      # Development
├── docker-compose.prod.yml # Production with Nginx + SSL
├── .dockerignore
├── .env.example
├── nginx/
│   └── nginx.conf          # Nginx reverse proxy config
├── setup-vps.sh            # Automated VPS setup
└── DOCKER_DEPLOYMENT.md    # This file
```
