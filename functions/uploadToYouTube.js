const { google } = require("googleapis");
const admin = require("firebase-admin");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { getStorage } = require("firebase-admin/storage");

if (!admin.apps.length) {
  admin.initializeApp();
}

module.exports = async (object) => {
  // STEP A — Validate file
  if (!object.name) {
    console.log("No file name provided, skipping.");
    return;
  }

  // Ignore non-video files
  const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv"];
  const fileExtension = path.extname(object.name).toLowerCase();
  
  if (!videoExtensions.includes(fileExtension)) {
    console.log(`File ${object.name} is not a video file, skipping.`);
    return;
  }

  console.log(`Processing video file: ${object.name}`);

  // STEP B — Download video
  const bucket = getStorage().bucket(object.bucket);
  const tempFilePath = path.join(os.tmpdir(), path.basename(object.name));

  try {
    console.log(`Downloading file to: ${tempFilePath}`);
    await bucket.file(object.name).download({ destination: tempFilePath });

    // Verify file exists and get size
    if (!fs.existsSync(tempFilePath)) {
      throw new Error("File was not downloaded successfully.");
    }

    const stats = fs.statSync(tempFilePath);
    const fileSizeBytes = stats.size;
    
    console.log("File downloaded");
    console.log(`File exists: ${fs.existsSync(tempFilePath)}`);
    console.log(`File size: ${fileSizeBytes} bytes`);

    if (fileSizeBytes === 0) {
      throw new Error("Downloaded file is empty.");
    }

    // STEP C — Upload to YouTube
    const oauth2Client = new google.auth.OAuth2(
      process.env.YT_CLIENT_ID,
      process.env.YT_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.YT_REFRESH_TOKEN,
    });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    console.log("Uploading video to YouTube...");

    const response = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: "GuruJI Lesson",
          description: "Uploaded via GuruJI platform",
        },
        status: {
          privacyStatus: "unlisted",
        },
      },
      media: {
        body: fs.createReadStream(tempFilePath),
        mimeType: "video/mp4",
      },
    });

    // STEP D — Logs
    console.log("Upload successful");
    console.log(`YouTube video ID: ${response.data.id}`);
    console.log(`YouTube video URL: https://www.youtube.com/watch?v=${response.data.id}`);

    // Clean up temporary file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log("Temporary file deleted");
    }
  } catch (error) {
    console.error("Error processing video:", error);
    
    // Clean up temporary file on error
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log("Temporary file deleted after error");
    }
    
    throw error;
  }
};
