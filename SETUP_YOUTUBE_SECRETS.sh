#!/bin/bash

# YouTube OAuth Secrets Setup Script for Firebase Functions
# This script helps you set up YouTube OAuth secrets securely

echo "=========================================="
echo "YouTube OAuth Secrets Setup"
echo "=========================================="
echo ""
echo "Your Firebase Functions use Firebase Functions v2 with defineSecret()"
echo "This requires using 'firebase functions:secrets:set' (not config:set)"
echo ""
echo "You will be prompted to enter your secrets one by one."
echo ""

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI not found. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

echo "Step 1: Setting YOUTUBE_CLIENT_ID"
echo "-----------------------------------"
echo "Enter your Google OAuth Client ID (e.g., 415965526502-...apps.googleusercontent.com):"
firebase functions:secrets:set YOUTUBE_CLIENT_ID

echo ""
echo "Step 2: Setting YOUTUBE_CLIENT_SECRET"
echo "--------------------------------------"
echo "Enter your Google OAuth Client Secret (e.g., GOCSPX-...):"
firebase functions:secrets:set YOUTUBE_CLIENT_SECRET

echo ""
echo "Step 3: Setting YOUTUBE_REFRESH_TOKEN"
echo "---------------------------------------"
echo "Enter your YouTube OAuth Refresh Token:"
firebase functions:secrets:set YOUTUBE_REFRESH_TOKEN

echo ""
echo "=========================================="
echo "✅ Secrets setup complete!"
echo "=========================================="
echo ""
echo "Verifying secrets are set..."
echo ""

# Verify secrets (this will show masked values)
echo "YOUTUBE_CLIENT_ID:"
firebase functions:secrets:access YOUTUBE_CLIENT_ID 2>/dev/null && echo "✅ Set" || echo "❌ Not set"

echo ""
echo "YOUTUBE_CLIENT_SECRET:"
firebase functions:secrets:access YOUTUBE_CLIENT_SECRET 2>/dev/null && echo "✅ Set" || echo "❌ Not set"

echo ""
echo "YOUTUBE_REFRESH_TOKEN:"
firebase functions:secrets:access YOUTUBE_REFRESH_TOKEN 2>/dev/null && echo "✅ Set" || echo "❌ Not set"

echo ""
echo "=========================================="
echo "Next step: Deploy functions"
echo "=========================================="
echo "Run: firebase deploy --only functions"
echo ""

