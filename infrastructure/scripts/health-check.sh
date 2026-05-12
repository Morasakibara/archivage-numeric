#!/bin/bash

echo "--- VÉRIFICATION SANTÉ SERVICES ---"

# PostgreSQL
if docker exec archivage_postgres pg_isready -U archivage_user > /dev/null 2>&1; then
    echo "[OK] PostgreSQL est opérationnel"
else
    echo "[FAIL] PostgreSQL est injoignable"
fi

# Redis
if docker exec archivage_redis redis-cli ping | grep PONG > /dev/null 2>&1; then
    echo "[OK] Redis est opérationnel"
else
    echo "[FAIL] Redis est injoignable"
fi

# Backend
if curl -s http://localhost:3000/api > /dev/null; then
    echo "[OK] Backend NestJS répond"
else
    echo "[FAIL] Backend NestJS ne répond pas"
fi

echo "------------------------------------"
