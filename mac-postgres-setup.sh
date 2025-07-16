#!/bin/bash

# Automatic PostgreSQL Setup for Mac
echo "🚀 Setting up PostgreSQL on your Mac..."
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Installing Homebrew first..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
brew install postgresql@16

# Start PostgreSQL service
echo "▶️  Starting PostgreSQL..."
brew services start postgresql@16

# Wait for PostgreSQL to start
sleep 3

# Create database
echo "🗄️  Creating hrms_db database..."
createdb hrms_db

# Check if neon-backup.sql exists
if [ -f "neon-backup.sql" ]; then
    echo "📥 Importing your data from neon-backup.sql..."
    psql hrms_db < neon-backup.sql
    echo "✅ Data imported successfully!"
else
    echo "⚠️  neon-backup.sql not found. Database created empty."
fi

# Create .env file with new DATABASE_URL
echo "📝 Creating .env file..."
echo "DATABASE_URL=postgresql://localhost:5432/hrms_db" > .env.local

echo ""
echo "✅ PostgreSQL setup complete!"
echo ""
echo "Your new DATABASE_URL is:"
echo "postgresql://localhost:5432/hrms_db"
echo ""
echo "To use in Replit:"
echo "1. Copy the DATABASE_URL above"
echo "2. Go to Replit Secrets (lock icon)"
echo "3. Update DATABASE_URL with this value"
echo "4. Restart your app"
echo ""
echo "To run locally on your Mac:"
echo "cd your-project-directory"
echo "npm install"
echo "npm run dev"