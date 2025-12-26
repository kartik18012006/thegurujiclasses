/**
 * One-time script to generate YouTube OAuth refresh token
 * Run with: node getYoutubeToken.js
 */

const {google} = require("googleapis");
const readline = require("readline");

// OAuth 2.0 credentials (replace with your actual values)
const CLIENT_ID = "415965526502-325ngs9h25qv5qhv3qc0umjgogbo2vj9.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob"; // For installed applications

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

