# YouTube OAuth Secrets Setup for Firebase Functions

## ✅ Current Status

Your Firebase Functions code is **correctly configured** to use environment variables:
- ✅ `functions/index.js` uses `defineSecret()` (Firebase Functions v2)
- ✅ Code reads from `process.env.YOUTUBE_CLIENT_ID`, `process.env.YOUTUBE_CLIENT_SECRET`, `process.env.YOUTUBE_REFRESH_TOKEN`
- ✅ No hardcoded secrets in the code
- ✅ Secrets are properly excluded from Git

## 🔐 Setting Up Secrets

### Important Note
Your code uses **Firebase Functions v2** with `defineSecret()`, which requires:
- ✅ `firebase functions:secrets:set` (correct for v2)
- ❌ `firebase functions:config:set` (older method, not compatible with v2)

### Method 1: Using the Setup Script (Easiest)

```bash
./SETUP_YOUTUBE_SECRETS.sh
```

This script will guide you through setting all three secrets interactively.

### Method 2: Manual Setup

Run these commands one by one and paste your values when prompted:

```bash
# Set YouTube Client ID
firebase functions:secrets:set YOUTUBE_CLIENT_ID
# Paste: Your Google OAuth Client ID (e.g., 415965526502-...apps.googleusercontent.com)

# Set YouTube Client Secret
firebase functions:secrets:set YOUTUBE_CLIENT_SECRET
# Paste: Your Google OAuth Client Secret (e.g., GOCSPX-...)

# Set YouTube Refresh Token
firebase functions:secrets:set YOUTUBE_REFRESH_TOKEN
# Paste: Your YouTube OAuth Refresh Token
```

## ✅ Verify Secrets Are Set

Check that secrets are configured:

```bash
firebase functions:secrets:access YOUTUBE_CLIENT_ID
firebase functions:secrets:access YOUTUBE_CLIENT_SECRET
firebase functions:secrets:access YOUTUBE_REFRESH_TOKEN
```

You should see masked values (not the full secrets).

## 🚀 Deploy Functions

After setting secrets, deploy your functions:

```bash
firebase deploy --only functions
```

The secrets will be automatically:
- ✅ Injected as environment variables at runtime
- ✅ Encrypted in Google Secret Manager
- ✅ Never exposed in logs or code

## 📋 How It Works

1. **Define Secrets** (in `functions/index.js`):
   ```javascript
   const YOUTUBE_CLIENT_ID = defineSecret("YOUTUBE_CLIENT_ID");
   const YOUTUBE_CLIENT_SECRET = defineSecret("YOUTUBE_CLIENT_SECRET");
   const YOUTUBE_REFRESH_TOKEN = defineSecret("YOUTUBE_REFRESH_TOKEN");
   ```

2. **Declare Secrets** (in function definition):
   ```javascript
   exports.uploadVideoToYouTube = onObjectFinalized(
     {
       secrets: [
         YOUTUBE_CLIENT_ID,
         YOUTUBE_CLIENT_SECRET,
         YOUTUBE_REFRESH_TOKEN
       ]
     },
     async (event) => { ... }
   );
   ```

3. **Access Secrets** (in function code):
   ```javascript
   const clientId = process.env.YOUTUBE_CLIENT_ID;
   const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
   const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;
   ```

## 🔒 Security Benefits

- ✅ Secrets stored in Google Secret Manager (encrypted)
- ✅ Never committed to Git
- ✅ Automatically rotated if needed
- ✅ Access controlled via Firebase IAM
- ✅ No secrets in function code or logs

## ❌ Troubleshooting

### Error: "Missing YouTube OAuth env vars"
- Make sure you've set all three secrets using `firebase functions:secrets:set`
- Redeploy functions after setting secrets: `firebase deploy --only functions`

### Error: "Secret not found"
- Verify secret name matches exactly: `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN`
- Check spelling and case sensitivity

### Can't use `firebase functions:config:set`
- Your code uses Firebase Functions v2 which requires `secrets:set`, not `config:set`
- The older config method is not compatible with v2 functions

## 📝 Summary

✅ **Code is ready** - No changes needed  
✅ **Use `firebase functions:secrets:set`** - Not `config:set`  
✅ **Deploy after setting secrets** - `firebase deploy --only functions`  
✅ **Secrets are secure** - Stored in Google Secret Manager


