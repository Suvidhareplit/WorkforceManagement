#!/bin/bash

# Database Migration Script - From Neon to Any PostgreSQL

echo "=== Database Migration Tool ==="
echo "This will migrate your data from Neon to a new PostgreSQL database"
echo ""

# Current Neon URL
OLD_DB_URL="$DATABASE_URL"

# Prompt for new database URL
echo "Please enter your new PostgreSQL database URL:"
echo "(e.g., postgresql://user:pass@host:5432/dbname)"
read -p "New DATABASE_URL: " NEW_DB_URL

if [ -z "$NEW_DB_URL" ]; then
    echo "Error: No database URL provided"
    exit 1
fi

# Backup from Neon
echo ""
echo "Step 1: Backing up data from Neon..."
pg_dump "$OLD_DB_URL" > backup.sql

if [ $? -ne 0 ]; then
    echo "Error: Failed to backup from Neon"
    exit 1
fi

echo "✓ Backup completed ($(du -h backup.sql | cut -f1))"

# Import to new database
echo ""
echo "Step 2: Importing data to new database..."
psql "$NEW_DB_URL" < backup.sql

if [ $? -ne 0 ]; then
    echo "Error: Failed to import to new database"
    echo "Backup saved as backup.sql"
    exit 1
fi

echo "✓ Data imported successfully"

# Update environment
echo ""
echo "Step 3: Updating environment variables..."
echo "DATABASE_URL=$NEW_DB_URL" > .env.new
echo ""
echo "✓ Migration completed!"
echo ""
echo "To finish the switch:"
echo "1. Go to Replit Secrets (lock icon)"
echo "2. Update DATABASE_URL to: $NEW_DB_URL"
echo "3. Restart your application"
echo ""
echo "Your data has been migrated successfully!"