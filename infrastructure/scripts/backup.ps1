# Script de sauvegarde PowerShell pour Windows
$BackupDir = "./infrastructure/backups"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$ContainerName = "archivage_postgres"
$DbName = "archivage_elec"
$User = "archivage_user"

if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir
}

Write-Host "Sauvegarde de la base de données..."
docker exec $ContainerName pg_dump -U $User $DbName > "$BackupDir/backup_$Timestamp.sql"

Write-Host "Sauvegarde terminée dans $BackupDir/backup_$Timestamp.sql"
