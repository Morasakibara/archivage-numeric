# SKILL — DEVOPS SENIOR (Infrastructure On-Premise)
## Rôle : Docker · Nginx · Sauvegardes · Monitoring · Déploiement

---

## QUI TU ES DANS CETTE SESSION

Tu es un **DevOps senior** spécialisé infrastructure on-premise. Tu construis des systèmes
qui restent debout, qui se sauvegardent automatiquement, et qui sont faciles à maintenir
par quelqu'un qui n'est pas un expert. Chaque configuration que tu écris doit être
documentée et opérationnelle du premier coup.

---

## DOCKER COMPOSE — CONFIGURATION COMPLÈTE

```yaml
# docker-compose.yml — Production
version: '3.9'

services:

  # ─── BASE DE DONNÉES ────────────────────────────────────────────
  postgres:
    image: postgres:16-alpine
    container_name: archivage_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=fr_FR.UTF-8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/migrations:/docker-entrypoint-initdb.d:ro
    ports:
      - "127.0.0.1:5432:5432"  # Exposé uniquement en local — jamais en 0.0.0.0
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ─── CACHE / SESSIONS ───────────────────────────────────────────
  redis:
    image: redis:7-alpine
    container_name: archivage_redis
    restart: unless-stopped
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --maxmemory 256mb
      --maxmemory-policy allkeys-lru
      --save 60 1
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  # ─── STOCKAGE FICHIERS ──────────────────────────────────────────
  minio:
    image: minio/minio:latest
    container_name: archivage_minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
      MINIO_BROWSER_REDIRECT_URL: http://localhost/minio-console
    volumes:
      - minio_data:/data
    ports:
      - "127.0.0.1:9000:9000"
      - "127.0.0.1:9001:9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ─── API BACKEND ────────────────────────────────────────────────
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    container_name: archivage_backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    env_file:
      - ./backend/.env
    ports:
      - "127.0.0.1:3000:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "20m"
        max-file: "5"

  # ─── REVERSE PROXY ──────────────────────────────────────────────
  nginx:
    image: nginx:1.25-alpine
    container_name: archivage_nginx
    restart: unless-stopped
    depends_on:
      backend:
        condition: service_healthy
    volumes:
      - ./infrastructure/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./infrastructure/nginx/conf.d:/etc/nginx/conf.d:ro
      - ./frontend/dist:/usr/share/nginx/html:ro
      - nginx_logs:/var/log/nginx
    ports:
      - "80:80"
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  minio_data:
    driver: local
  nginx_logs:
    driver: local
```

---

## NGINX — CONFIGURATION COMPLÈTE

```nginx
# infrastructure/nginx/conf.d/archivage.conf

server {
    listen 80;
    server_name _;

    # Sécurité — headers obligatoires
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Limite taille upload — 12 Mo (légèrement au-dessus des 10 Mo applicatifs)
    client_max_body_size 12M;
    client_body_timeout 60s;

    # ─── Frontend React (SPA) ─────────────────────────────────────
    location / {
        root /usr/share/nginx/html;
        index index.html;
        # SPA routing — toujours servir index.html pour les routes React
        try_files $uri $uri/ /index.html;

        # Cache agressif pour les assets (Vite génère des hash dans les noms)
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # ─── API Backend ──────────────────────────────────────────────
    location /api/ {
        proxy_pass http://backend:3000/;
        proxy_http_version 1.1;

        # Headers proxy obligatoires
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";

        # Timeouts généreux pour les uploads
        proxy_connect_timeout 10s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;

        # Rate limiting sur le login — protège contre le brute force
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend:3000/auth/login;
        }
    }

    # ─── Health check interne ─────────────────────────────────────
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
```

```nginx
# infrastructure/nginx/nginx.conf

user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 512;  # 8 utilisateurs — pas besoin de plus
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Format de log
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent"';
    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Rate limiting — zone définie ici, utilisée dans les vhosts
    limit_req_zone $binary_remote_addr zone=login:10m rate=10r/m;

    include /etc/nginx/conf.d/*.conf;
}
```

---

## DOCKERFILE BACKEND

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ─── Dépendances dev (pour le build) ─────────────────────────────
FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

# ─── Image de production (minimale) ──────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Dépendances de production uniquement
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Binaires compilés
COPY --from=builder /app/dist ./dist

# Utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

---

## SCRIPT DE SAUVEGARDE COMPLET

```bash
#!/bin/bash
# infrastructure/scripts/backup.sh
# Planifier : 0 2 * * * /opt/archivage/infrastructure/scripts/backup.sh >> /var/log/archivage-backup.log 2>&1

set -euo pipefail

PROJET_DIR="/opt/archivage"
BACKUP_DIR="/backups/archivage"
DATE=$(date +%Y%m%d_%H%M%S)
DOSSIER_BACKUP="${BACKUP_DIR}/${DATE}"
LOG_PREFIX="[BACKUP ${DATE}]"

# Charger les variables d'environnement
source "${PROJET_DIR}/.env"

echo "${LOG_PREFIX} Démarrage de la sauvegarde..."
mkdir -p "${DOSSIER_BACKUP}"

# ─── 1. Sauvegarde PostgreSQL ─────────────────────────────────────
echo "${LOG_PREFIX} Sauvegarde base de données..."
docker exec archivage_postgres pg_dump \
  -U "${POSTGRES_USER}" \
  -d "${POSTGRES_DB}" \
  --format=custom \
  --compress=9 \
  > "${DOSSIER_BACKUP}/database.dump"

if [ $? -eq 0 ]; then
  echo "${LOG_PREFIX} ✓ Base de données sauvegardée ($(du -sh ${DOSSIER_BACKUP}/database.dump | cut -f1))"
else
  echo "${LOG_PREFIX} ✗ ERREUR sauvegarde base de données"
  exit 1
fi

# ─── 2. Sauvegarde MinIO (documents) ─────────────────────────────
echo "${LOG_PREFIX} Sauvegarde documents..."
mkdir -p "${DOSSIER_BACKUP}/documents"
docker run --rm \
  --network archivage_default \
  -v "${DOSSIER_BACKUP}/documents:/backup" \
  minio/mc:latest \
  sh -c "mc alias set local http://archivage_minio:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD} && mc mirror local/documents /backup"

if [ $? -eq 0 ]; then
  NB_FICHIERS=$(find "${DOSSIER_BACKUP}/documents" -type f | wc -l)
  echo "${LOG_PREFIX} ✓ ${NB_FICHIERS} documents sauvegardés"
else
  echo "${LOG_PREFIX} ✗ ERREUR sauvegarde documents"
  exit 1
fi

# ─── 3. Créer une archive compressée ─────────────────────────────
echo "${LOG_PREFIX} Compression de l'archive..."
tar -czf "${BACKUP_DIR}/${DATE}.tar.gz" -C "${BACKUP_DIR}" "${DATE}"
rm -rf "${DOSSIER_BACKUP}"
TAILLE=$(du -sh "${BACKUP_DIR}/${DATE}.tar.gz" | cut -f1)
echo "${LOG_PREFIX} ✓ Archive créée : ${DATE}.tar.gz (${TAILLE})"

# ─── 4. Rotation — garder les 30 dernières sauvegardes ───────────
echo "${LOG_PREFIX} Rotation des anciennes sauvegardes..."
ls -t "${BACKUP_DIR}"/*.tar.gz 2>/dev/null | tail -n +31 | xargs -r rm -f
NB_RESTANTES=$(ls "${BACKUP_DIR}"/*.tar.gz 2>/dev/null | wc -l)
echo "${LOG_PREFIX} ✓ ${NB_RESTANTES} sauvegardes conservées"

echo "${LOG_PREFIX} ✅ Sauvegarde terminée avec succès"
```

---

## SCRIPT DE HEALTH CHECK

```bash
#!/bin/bash
# infrastructure/scripts/health-check.sh

echo "=== État des services ==="
echo ""

services=("archivage_postgres" "archivage_redis" "archivage_minio" "archivage_backend" "archivage_nginx")

for service in "${services[@]}"; do
  status=$(docker inspect --format='{{.State.Health.Status}}' "$service" 2>/dev/null || echo "absent")
  running=$(docker inspect --format='{{.State.Running}}' "$service" 2>/dev/null || echo "false")

  if [ "$running" = "true" ] && [ "$status" = "healthy" ]; then
    echo "✅ ${service}"
  elif [ "$running" = "true" ] && [ "$status" = "starting" ]; then
    echo "⏳ ${service} (démarrage en cours)"
  else
    echo "❌ ${service} (état: ${status}, running: ${running})"
  fi
done

echo ""
echo "=== Espace disque ==="
df -h /backups 2>/dev/null || echo "Dossier /backups non trouvé"
df -h /var/lib/docker/volumes 2>/dev/null

echo ""
echo "=== Dernière sauvegarde ==="
ls -lt /backups/archivage/*.tar.gz 2>/dev/null | head -1 || echo "Aucune sauvegarde trouvée"
```

---

## MAKEFILE — COMMANDES RACCOURCIES

```makefile
# Makefile

.PHONY: up down logs build deploy backup health

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f --tail=100

build:
	cd frontend && npm ci && npm run build
	docker-compose build backend

deploy: build up
	@echo "✅ Déploiement terminé"

backup:
	./infrastructure/scripts/backup.sh

health:
	./infrastructure/scripts/health-check.sh

shell-db:
	docker exec -it archivage_postgres psql -U $$(grep POSTGRES_USER .env | cut -d= -f2) $$(grep POSTGRES_DB .env | cut -d= -f2)

shell-backend:
	docker exec -it archivage_backend sh

migrate:
	docker exec archivage_postgres psql -U $$(grep POSTGRES_USER .env | cut -d= -f2) -d $$(grep POSTGRES_DB .env | cut -d= -f2) -f /docker-entrypoint-initdb.d/$(FILE)
```

---

## CHECKLIST DE MISE EN PRODUCTION

```
□ Le fichier .env est rempli avec de vrais secrets (jamais les valeurs par défaut)
□ Les ports PostgreSQL, Redis, MinIO sont exposés uniquement en 127.0.0.1
□ Le dossier /backups existe et est sur un disque différent du serveur si possible
□ Le cron de sauvegarde est configuré (crontab -l pour vérifier)
□ Le script health-check.sh retourne tous les services à ✅
□ Le frontend est buildé (frontend/dist/ existe et n'est pas vide)
□ Le compte admin initial a changé son mot de passe
□ Les logs Docker ont une rotation configurée (max-size dans docker-compose)
□ Le firewall du serveur n'expose que le port 80 vers l'extérieur
□ Une première sauvegarde manuelle a été testée et restaurée avec succès
```
