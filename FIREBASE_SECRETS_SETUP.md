# Firebase Functions Secrets Setup Guide

## Current Setup
Your Firebase Functions are using **Firebase Functions v2** with the `defineSecret()` approach, which is the recommended and more secure method.

## Setting YouTube OAuth Secrets

### Method 1: Using Firebase Functions Secrets (Recommended for v2)

Run these commands and paste your values when prompted:

```bash
# Set YouTube Client ID
firebase functions:secrets:set YOUTUBE_CLIENT_ID

# Set YouTube Client Secret  
firebase functions:secrets:set YOUTUBE_CLIENT_SECRET

# Set YouTube Refresh Token
firebase functions:secrets:set YOUTUBE_REFRESH_TOKEN
```

When prompted, paste:
- Your Google OAuth Client ID (e.g., `415965526502-...apps.googleusercontent.com`)
- Your Google OAuth Client Secret (e.g., `GOCSPX-...`)
- Your YouTube OAuth Refresh Token

### Verify Secrets Are Set

```bash
firebase functions:secrets:access YOUTUBE_CLIENT_ID
firebase functions:secrets:access YOUTUBE_CLIENT_SECRET
firebase functions:secrets:access YOUTUBE_REFRESH_TOKEN
```

### Deploy Functions

```bash
firebase deploy --only functions
```

## How It Works

Your `functions/index.js` uses:
- `defineSecret("YOUTUBE_CLIENT_ID")` - Defines the secret
- `process.env.YOUTUBE_CLIENT_ID` - Accesses the secret value at runtime

The secrets are:
- ✅ Stored securely in Google Secret Manager
- ✅ Never committed to Git
- ✅ Automatically injected as environment variables at runtime
- ✅ Encrypted at rest and in transit

## Alternative: Using Config (Older Method)

If you prefer the older config method, you would need to:
1. Update code to use `functions.config().youtube.client_id`
2. Use `firebase functions:config:set youtube.client_id="..."`

However, **secrets are recommended** for sensitive data like OAuth credentials.


