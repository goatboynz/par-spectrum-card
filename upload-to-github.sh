#!/bin/bash

# PAR Spectrum Card - GitHub Upload Script
# Repository: https://github.com/goatboynz/par-spectrum-card

echo "🚀 PAR Spectrum Card - GitHub Upload"
echo "===================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Add all files
echo ""
echo "📝 Adding files..."
git add .
echo "✅ Files added"

# Commit
echo ""
echo "💾 Creating commit..."
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update PAR Spectrum Card"
fi
git commit -m "$commit_msg"
echo "✅ Commit created"

# Add remote if not exists
echo ""
if ! git remote | grep -q origin; then
    echo "🔗 Adding GitHub remote..."
    git remote add origin https://github.com/goatboynz/par-spectrum-card.git
    echo "✅ Remote added"
else
    echo "✅ Remote already exists"
fi

# Rename branch to main
echo ""
echo "🌿 Setting branch to main..."
git branch -M main
echo "✅ Branch set to main"

# Push to GitHub
echo ""
echo "⬆️  Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your code is now on GitHub!"
    echo ""
    echo "📍 Repository: https://github.com/goatboynz/par-spectrum-card"
    echo ""
    echo "Next steps:"
    echo "1. Go to: https://github.com/goatboynz/par-spectrum-card/releases"
    echo "2. Click 'Create a new release'"
    echo "3. Tag: v1.0.0"
    echo "4. Publish release"
    echo ""
    echo "Then install via HACS! 🏠"
else
    echo ""
    echo "❌ Push failed. You may need to:"
    echo "1. Authenticate with GitHub (gh auth login)"
    echo "2. Or pull first: git pull origin main --allow-unrelated-histories"
    echo "3. Then run this script again"
fi
