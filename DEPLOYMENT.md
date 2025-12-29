# 🚀 Deployment Guide

This guide covers deploying the PMI Emergency Call System frontend to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Process](#build-process)
- [Environment Configuration](#environment-configuration)
- [Deployment Platforms](#deployment-platforms)
  - [Vercel](#vercel-recommended)
  - [Netlify](#netlify)
  - [Docker](#docker)
  - [Traditional Server](#traditional-server)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure:

1. ✅ Backend API is deployed and accessible
2. ✅ Environment variables are configured
3. ✅ Build passes locally (`npm run build`)
4. ✅ All tests pass
5. ✅ TypeScript compilation succeeds

---

## Build Process

### 1. Install Dependencies

```bash
npm install --production
```

### 2. Build the Application

```bash
npm run build
```

This creates an optimized production build in `.next/` directory.

### 3. Test the Build Locally

```bash
npm start
```

Verify the application works correctly at `http://localhost:3000`

---

## Environment Configuration

### Production Environment Variables

Create `.env.production` file:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Optional: Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### Environment Variable Checklist

- [ ] `NEXT_PUBLIC_API_BASE_URL` - Points to production API
- [ ] API URL uses HTTPS
- [ ] CORS is configured on backend
- [ ] Backend accepts requests from frontend domain

---

## Deployment Platforms

### Vercel (Recommended)

Vercel provides the best Next.js deployment experience.

#### Via Vercel CLI

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   vercel
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next
5. Add environment variables
6. Click "Deploy"

#### Vercel Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"]
}
```

---

### Netlify

#### Via Netlify CLI

1. **Install Netlify CLI**

   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**

   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

#### Via Netlify Dashboard

1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your repository
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Add environment variables
6. Click "Deploy site"

#### Netlify Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Docker

#### Dockerfile

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV production

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
    restart: unless-stopped
```

#### Build and Run

```bash
# Build image
docker build -t pmi-call-fe .

# Run container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com pmi-call-fe

# Or use docker-compose
docker-compose up -d
```

---

### Traditional Server (Ubuntu/Debian)

#### 1. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

#### 3. Deploy Application

```bash
# Clone repository
git clone <repository-url>
cd xpmi-call-fe

# Install dependencies
npm install --production

# Build application
npm run build

# Start with PM2
pm2 start npm --name "pmi-call-fe" -- start

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### 4. Configure Nginx

Create `/etc/nginx/sites-available/pmi-call-fe`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/pmi-call-fe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. Setup SSL with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Post-Deployment

### 1. Health Check

Verify these endpoints work:

- [ ] Homepage loads
- [ ] Login page works
- [ ] API connection successful
- [ ] Static assets load correctly

### 2. Performance Check

- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Images optimized
- [ ] Fonts loaded correctly

### 3. Monitoring Setup

#### Sentry (Error Tracking)

```bash
npm install @sentry/nextjs
```

Create `sentry.client.config.js`:

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

#### Google Analytics

Add to `app/layout.tsx`:

```tsx
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  strategy="afterInteractive"
/>
```

### 4. Backup Strategy

- [ ] Database backups (if applicable)
- [ ] Environment variable backups
- [ ] Git repository backup

---

## Troubleshooting

### Build Fails

**Error: Module not found**

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Error: TypeScript compilation errors**

```bash
# Check for errors
npm run type-check

# Fix errors or use --no-typescript-check (not recommended)
```

### Runtime Errors

**API Connection Failed**

- ✅ Check `NEXT_PUBLIC_API_BASE_URL` is correct
- ✅ Verify backend is running
- ✅ Check CORS configuration
- ✅ Verify network/firewall rules

**Environment Variables Not Loading**

- ✅ Ensure variables start with `NEXT_PUBLIC_`
- ✅ Restart build process after changing variables
- ✅ Check variable names match exactly

**Static Assets Not Loading**

- ✅ Check `public/` directory structure
- ✅ Verify file paths are correct
- ✅ Clear CDN cache if using one

### Performance Issues

**Slow Page Load**

- ✅ Enable Next.js Image Optimization
- ✅ Use `next/font` for font optimization
- ✅ Enable static generation where possible
- ✅ Implement code splitting

**High Memory Usage**

- ✅ Increase Node.js memory limit: `NODE_OPTIONS=--max-old-space-size=4096`
- ✅ Check for memory leaks in components
- ✅ Optimize React Query cache settings

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests pass
- [ ] Build succeeds locally
- [ ] TypeScript compilation succeeds
- [ ] Environment variables configured
- [ ] API endpoint updated to production
- [ ] Code reviewed
- [ ] Documentation updated

### During Deployment

- [ ] Application deployed
- [ ] Environment variables set
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Monitoring setup

### Post-Deployment

- [ ] Homepage accessible
- [ ] Authentication works
- [ ] All features tested
- [ ] Performance metrics checked
- [ ] Error tracking working
- [ ] Team notified

---

## Rollback Plan

If deployment fails:

### Vercel

```bash
# Rollback to previous deployment
vercel rollback <deployment-url>
```

### PM2

```bash
# View process list with IDs
pm2 list

# Restart with previous version
git checkout <previous-commit>
npm run build
pm2 restart pmi-call-fe
```

### Docker

```bash
# Stop current container
docker stop pmi-call-fe

# Run previous image
docker run -d --name pmi-call-fe pmi-call-fe:previous
```

---

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_BASE_URL: ${{ secrets.API_BASE_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
```

---

## Security Considerations

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] API keys not exposed
- [ ] CORS configured correctly
- [ ] Content Security Policy set
- [ ] Rate limiting on API
- [ ] Authentication tokens secure

---

**Last Updated**: November 4, 2025  
**Maintained by**: Development Team
