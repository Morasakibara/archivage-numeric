#!/bin/bash

# Configuration
BACKUP_DIR="/var/lib/postgresql/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME=${POSTGRES_DB:-archivage_elec}
USER=${POSTGRES_USER:-archivage_user}

# Création du dossier de backup s'il n'existe pas
mkdir -p $BACKUP_DIR

echo "Démarrage de la sauvegarde de la base de données $DB_NAME..."

# Sauvegarde PostgreSQL
docker exec archivage_postgres pg_dump -U $USER $DB_NAME > $BACKUP_DIR/db_backup_$TIMESTAMP.sql

# Compression
gzip $BACKUP_DIR/db_backup_$TIMESTAMP.sql

# Nettoyage (conserver les 7 derniers jours)
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +7 -delete

echo "Sauvegarde terminée : db_backup_$TIMESTAMP.sql.gz"
