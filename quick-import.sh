#!/bin/bash
# Quick import script - run this after updating DATABASE_URL
echo "Importing your data to new database..."
psql $DATABASE_URL < neon-backup.sql
echo "Import complete!"
