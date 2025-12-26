/**
 * One-time script to generate YouTube OAuth refresh token
 * Run with: node getYoutubeToken.js
 */

const {google} = require("googleapis");
const readline = require("readline");

// OAuth 2.0 credentials from environment variables
const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN;
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob"; // For installed applications

// Validate required environment variables
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ Error: YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET must be set as environment variables");
  process.exit(1);
}

// YouTube upload scope
const SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Generate authorization URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline", // Required to get refresh token
  scope: SCOPES,
  prompt: "consent", // Force consent screen to ensure refresh token
});

console.log("\n=== YouTube OAuth Token Generator ===\n");
console.log("Step 1: Visit this URL to authorize:");
console.log(authUrl);
console.log("\nStep 2: After authorization, you will receive an authorization code.");
console.log("Step 3: Paste the authorization code below:\n");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Wait for authorization code
rl.question("Enter authorization code: ", async (code) => {
  try {
    // Exchange authorization code for tokens
    const {tokens} = await oauth2Client.getToken(code);
    
    // Log ONLY the refresh token
    if (tokens.refresh_token) {
      console.log("\n=== Refresh Token ===");
      console.log(tokens.refresh_token);
      console.log("\nSave this refresh token securely!\n");
    } else {
      console.log("\n⚠️  Warning: No refresh token received.");
      console.log("Make sure you used 'prompt=consent' and 'access_type=offline'.\n");
    }
    
    rl.close();
  } catch (error) {
    console.error("\n❌ Error exchanging code for tokens:", error.message);
    rl.close();
    process.exit(1);
  }
});

