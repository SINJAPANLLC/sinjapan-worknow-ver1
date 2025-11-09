#!/bin/bash

# Work Now - Database Schema Initialization Script for Production
# This script applies the database schema to the VPS production environment

set -e

echo "========================================="
echo "Work Now Database Schema Initialization"
echo "========================================="

# Database configuration
DB_NAME="worknow_production"
SCHEMA_FILE="/var/www/worknow/backend/schema.sql"

echo "[1/4] Enabling required PostgreSQL extensions..."
sudo -u postgres psql $DB_NAME << 'SQL'
-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
SQL

echo "[2/4] Applying database schema..."
sudo -u postgres psql $DB_NAME < $SCHEMA_FILE

echo "[3/4] Verifying tables..."
sudo -u postgres psql $DB_NAME -c "\dt"

echo "[4/4] Creating admin user..."
cd /var/www/worknow
source venv/bin/activate

# Hash the admin password
ADMIN_HASH=$(python3 -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto'); print(pwd_context.hash('Kazuya8008'))")

# Insert admin user
sudo -u postgres psql $DB_NAME << SQL
INSERT INTO users (
    id,
    email,
    password_hash,
    role,
    full_name,
    is_verified,
    created_at
) VALUES (
    gen_random_uuid()::text,
    'info@sinjapanllc.jp',
    '$ADMIN_HASH',
    'admin',
    'SINJAPAN LLC Admin',
    true,
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = 'admin',
    is_verified = true;

-- Verify admin user
SELECT id, email, role, full_name, is_verified, created_at
FROM users WHERE email = 'info@sinjapanllc.jp';
SQL

echo ""
echo "========================================="
echo "✅ Database initialization complete!"
echo "========================================="
echo ""
echo "Admin Account:"
echo "  Email: info@sinjapanllc.jp"
echo "  Password: Kazuya8008"
echo "  Role: admin"
echo ""
echo "You can now login at: https://sinjapan-worknow.com"
echo "========================================="
