#!/bin/bash

echo "=== PostgreSQL Local Setup for Mac ==="
echo ""

# Step 1: Install PostgreSQL
echo "Step 1: Installing PostgreSQL with Homebrew..."
echo "Run: brew install postgresql@16"
echo ""

# Step 2: Start PostgreSQL
echo "Step 2: Start PostgreSQL service..."
echo "Run: brew services start postgresql@16"
echo ""

# Step 3: Create database
echo "Step 3: Create your database..."
echo "Run: createdb hrms_db"
echo ""

# Step 4: Import your data
echo "Step 4: Import your existing data..."
echo "Run: psql hrms_db < neon-backup.sql"
echo ""

# Step 5: Update DATABASE_URL
echo "Step 5: Your new DATABASE_URL is:"
echo "DATABASE_URL=postgresql://localhost:5432/hrms_db"
echo ""
echo "Or with your Mac username:"
echo "DATABASE_URL=postgresql://$(whoami):@localhost:5432/hrms_db"
echo ""
echo "Add this to your .env file or Replit secrets!"
echo ""
echo "That's it! No cloud dependency!"