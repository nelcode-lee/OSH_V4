#!/bin/bash

# Development update script for Operator Skills Hub
# This commits and pushes changes WITHOUT deploying to Vercel

echo "🔄 Updating development version..."
echo "📝 Committing changes..."

# Get a descriptive commit message
if [ $# -eq 0 ]; then
    COMMIT_MSG="Update development version - $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MSG="$1"
fi

git add .
git commit -m "$COMMIT_MSG"

echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Development update complete!"
echo "💡 To deploy to production, run: ./deploy.sh"
echo "💰 Remember: Vercel deployments cost money - only deploy when necessary!"
