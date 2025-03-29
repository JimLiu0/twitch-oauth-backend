#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Check if a commit message was provided
if [ -z "$1" ]; then
  echo "Error: Please provide a commit message"
  echo "Usage: ./gitpush.sh \"Your commit message\""
  exit 1
fi

# Store the commit message
COMMIT_MESSAGE="$1"

# Run git commands
echo "📁 Adding all files..."
git add .

echo "✅ Committing with message: '$COMMIT_MESSAGE'"
git commit -m "$COMMIT_MESSAGE"

echo "📤 Pushing to remote repository..."
git push

echo "🚀 Done! All changes have been pushed." 