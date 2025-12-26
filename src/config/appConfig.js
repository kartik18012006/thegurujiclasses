/**
 * App Configuration
 * Centralized configuration for the application
 */

// ============================================
// IMPORTANT: CONFIGURE YOUR PRODUCTION URL
// ============================================
// Replace 'YOUR_PRODUCTION_DOMAIN' below with your actual website domain
// Examples:
//   - 'https://thegurujiclasses.com'
//   - 'https://yourdomain.com'
//   - 'https://your-app.web.app' (if using Firebase Hosting)
// 
// This URL is used for share links so they work for everyone, not just localhost
// ============================================

// ⚠️ IMPORTANT: Replace this with your actual production domain
// Examples: 'https://thegurujiclasses.com' or 'https://your-app.web.app'
// If you don't have a domain yet, use a placeholder but share links won't work
const PRODUCTION_URL = ''; // ⚠️ ADD YOUR DOMAIN HERE (e.g., 'https://thegurujiclasses.com')

// Get the base URL for sharing links
// IMPORTANT: Always uses production URL for share links (even in dev)
const getBaseUrl = () => {
  // Priority 1: Environment variable (set in .env file)
  // Create .env file in root directory with: VITE_APP_URL=https://yourdomain.com
  if (import.meta.env.VITE_APP_URL && import.meta.env.VITE_APP_URL !== '') {
    return import.meta.env.VITE_APP_URL;
  }
  
  // Priority 2: Hardcoded production URL (if configured)
  if (PRODUCTION_URL && PRODUCTION_URL.trim() !== '') {
    return PRODUCTION_URL;
  }
  
  // Priority 3: Check if we're running on localhost
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
  
  if (isLocalhost) {
    // If production URL is not set, show error
    console.error('❌ ERROR: Production URL not configured!');
    console.error('❌ Share links will NOT work. They will point to localhost which only works on your machine.');
    console.error('❌ SOLUTION: Update PRODUCTION_URL in src/config/appConfig.js with your actual domain');
    console.error('❌ Example: const PRODUCTION_URL = "https://thegurujiclasses.com";');
    console.error('❌ See SHARE_LINK_SETUP.md for detailed instructions');
    
    // Still return localhost for now, but user must configure production URL
    return window.location.origin;
  }
  
  // If not localhost, assume we're in production and use current origin
  return window.location.origin;
};

export const APP_CONFIG = {
  BASE_URL: getBaseUrl(),
  PRODUCTION_URL: PRODUCTION_URL,
};

