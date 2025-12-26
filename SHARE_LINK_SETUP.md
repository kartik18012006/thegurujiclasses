# Share Link Setup Guide

## Problem
When you share a course link, it uses `localhost:5173` which only works on your computer. Others clicking the link get an error.

## Solution
You need to configure your production domain URL.

### Option 1: Update Config File (Quick Fix)

1. Open `src/config/appConfig.js`
2. Find this line:
   ```javascript
   const PRODUCTION_URL = 'YOUR_PRODUCTION_DOMAIN';
   ```
3. Replace `YOUR_PRODUCTION_DOMAIN` with your actual website URL, for example:
   ```javascript
   const PRODUCTION_URL = 'https://thegurujiclasses.com';
   ```
   Or if using Firebase Hosting:
   ```javascript
   const PRODUCTION_URL = 'https://your-project-id.web.app';
   ```

### Option 2: Use Environment Variable (Recommended for Production)

1. Create a `.env` file in the root directory (same level as `package.json`)
2. Add this line:
   ```
   VITE_APP_URL=https://yourdomain.com
   ```
3. Replace `https://yourdomain.com` with your actual domain
4. Restart your dev server

### Finding Your Production URL

- **Firebase Hosting**: Check Firebase Console → Hosting → Your site URL
- **Custom Domain**: Use your registered domain (e.g., `https://thegurujiclasses.com`)
- **Other Hosting**: Check your hosting provider's dashboard

### Testing

After configuring:
1. Click "Share Course" button
2. Copy the link
3. The link should now show your production domain, not localhost
4. Test the link in an incognito window or on another device

## Current Status

If you see `https://CONFIGURE_PRODUCTION_URL` in share links, you need to configure the production URL using one of the options above.


