#!/bin/bash

# Deployment script for Operator Skills Hub
# Only run this when you specifically want to deploy to Vercel

echo "🚀 Deploying Operator Skills Hub to Vercel..."
echo "⚠️  This will incur Vercel costs - only run when necessary!"
echo ""

# Check if user wants to continue
read -p "Are you sure you want to deploy? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo "📦 Committing changes..."
git add .
git commit -m "Deploy to production - $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"

echo "🚀 Pushing to GitHub..."
git push origin main

echo "🌐 Deploying to Vercel..."
vercel --prod --yes

echo "✅ Deployment complete!"
echo "🔗 Check your Vercel dashboard for the live URL"
