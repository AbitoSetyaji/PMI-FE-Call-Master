# PMI Emergency Call System - Frontend

Frontend application for PMI (Palang Merah Indonesia) Emergency Call System built with Next.js.

## Project Structure

```
PMI-FE-Call-Master/
├── docker/         # Docker configs (nginx, deploy scripts)
├── docs/           # Documentation files
├── public/         # Static assets
├── src/
│   ├── app/        # Next.js App Router pages
│   ├── components/ # Reusable components
│   ├── contexts/   # React contexts
│   ├── hooks/      # Custom hooks
│   └── lib/        # Utilities & API
├── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
└── package.json
```

## Quick Start (Development)

```bash
npm install
npm run dev
```

Access: http://localhost:3000

## Production Deployment

### Prerequisites
- Backend already running on VPS
- Docker & Docker Compose installed

### Deployment Steps

1. **Upload to VPS:**
```bash
scp -r PMI-FE-Call-Master/ root@148.230.100.61:/opt/pmi/
```

2. **SSH to VPS and deploy:**
```bash
ssh root@148.230.100.61
cd /opt/pmi/PMI-FE-Call-Master
docker-compose -f docker-compose.prod.yml up -d --build
```

## Environment Variables

| Variable | Description | Production Value |
|----------|-------------|------------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | https://pmikotasmg.site/api |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API (optional) | - |

## Production URLs
- Website: https://pmikotasmg.site
- API: https://api.pmikotasmg.site
