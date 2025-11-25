#!/usr/bin/env bash
# git_quick_push.sh
# Usage:
#   ./git_quick_push.sh Your commit message here
# This will create a commit with message:
#   "Your commit message here YYYY-MM-DD HH:MM:SS"
# and then push it.

# If no message is provided, show usage and exit
if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <commit message>"
  exit 1
fi

# Join all arguments into a single commit message string
USER_MSG="$*"

# Create a timestamp (e.g., 2025-11-24 18:32:10)
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Full commit message: "<user message> <timestamp>"
FULL_MSG="$USER_MSG $TIMESTAMP"

echo "-------------------------------------------------"
echo "Commit message will be:"
echo "  \"$FULL_MSG\""
echo "-------------------------------------------------"
echo

# Show current git status
echo "\$ git status"
git status
echo

# Stage all changes
echo "\$ git add ."
git add .
echo

# Show status again so you can see what's staged
echo "\$ git status"
git status
echo

# Commit with the full message
echo "\$ git commit -m \"$FULL_MSG\""
git commit -m "$FULL_MSG"
echo

# Push to the current branch's remote
echo "\$ git push"
git push
echo "Done."

