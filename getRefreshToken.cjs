const { google } = require("googleapis");
const readline = require("readline");

const CLIENT_ID = "415965526502-0fsnl9tbo49dmojp5v8h5mgoa0g32n2u.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/youtube.upload"],
});

console.log("\nOPEN THIS URL IN YOUR BROWSER:\n");
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("\nPaste the authorization code here: ", async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());
    console.log("\n✅ REFRESH TOKEN (SAVE THIS):\n", tokens.refresh_token);
  } catch (err) {
    console.error("\n❌ ERROR:", err.message);
  }
  rl.close();
});
