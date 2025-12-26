const { defineSecret } = require("firebase-functions/params");
const { onObjectFinalized } = require("firebase-functions/v2/storage");
const { logger } = require("firebase-functions");
const { google } = require("googleapis");
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { getStorage } = require("firebase-admin/storage");

const YOUTUBE_CLIENT_ID = defineSecret("YOUTUBE_CLIENT_ID");
const YOUTUBE_CLIENT_SECRET = defineSecret("YOUTUBE_CLIENT_SECRET");
const YOUTUBE_REFRESH_TOKEN = defineSecret("YOUTUBE_REFRESH_TOKEN");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * STABILIZED: Video Upload Handler with YouTube Quota Detection
 * 
 * STORAGE PATH: course-videos/{courseId}/{fileName}
 * 
 * This function:
 * 1. Extracts courseId and fileName from path
 * 2. Finds lesson document by matching storagePath
 * 3. Uploads video to YouTube with proper error handling
 * 4. Detects quota errors and sets status to "UPLOAD_BLOCKED"
 * 5. Returns structured error codes: QUOTA_EXCEEDED, AUTH_ERROR, UNKNOWN_ERROR
 */
exports.uploadVideoToYouTube = onObjectFinalized(
  {
    region: "asia-south2",
    bucket: "the-guruji-classes.firebasestorage.app",
    secrets: [
      YOUTUBE_CLIENT_ID,
      YOUTUBE_CLIENT_SECRET,
      YOUTUBE_REFRESH_TOKEN
    ]
  },
  async (event) => {
    logger.info("🔥 Function triggered - uploadVideoToYouTube started");

    let lessonId = null;
    let lessonRef = null;

    try {
      const filePath = event.data.name;
      if (!filePath) {
        logger.warn("No file path found in event data");
        return;
      }

      logger.info("📁 File path:", filePath);
      logger.info("📄 Content type:", event.data.contentType || "unknown");

      const contentType = event.data.contentType || "";
      if (!contentType.startsWith("video/")) {
        logger.info(`⏭️  Skipping non-video file: ${filePath} (contentType: ${contentType})`);
        return;
      }

      if (!filePath.startsWith("course-videos/")) {
        logger.info(`⏭️  Skipping file outside course-videos/: ${filePath}`);
        return;
      }

      logger.info(`✅ File validated: ${filePath}`);

      // Extract courseId and fileName from path: course-videos/{courseId}/{fileName}
      const pathParts = filePath.split("/");
      if (pathParts.length !== 3) {
        logger.error(`❌ Invalid file path structure. Expected: course-videos/{courseId}/{fileName}, got: ${filePath}`);
        return;
      }

      const courseId = pathParts[1];
      const fileName = pathParts[2];

      logger.info(`📚 Extracted courseId: ${courseId}`);
      logger.info(`📁 File name: ${fileName}`);

      // Find lesson document by matching storagePath
      // Lessons store storagePath field when video is uploaded
      try {
        const lessonsQuery = await db.collection("lessons")
          .where("courseId", "==", courseId)
          .where("storagePath", "==", filePath)
          .limit(1)
          .get();

        if (lessonsQuery.empty) {
          logger.warn(`⚠️  No lesson found for storagePath: ${filePath}`);
          // Continue anyway - video uploaded but lesson not linked yet
        } else {
          lessonId = lessonsQuery.docs[0].id;
          lessonRef = db.collection("lessons").doc(lessonId);
          
          // Update lesson status to "processing" immediately
          await lessonRef.update({
            status: "processing",
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          logger.info(`✅ Lesson ${lessonId} status updated to 'processing'`);
        }
      } catch (updateError) {
        logger.error("❌ Failed to find/update lesson:", updateError);
        // Continue anyway - video processing should not depend on lesson update
      }

      if (
        !process.env.YOUTUBE_CLIENT_ID ||
        !process.env.YOUTUBE_CLIENT_SECRET ||
        !process.env.YOUTUBE_REFRESH_TOKEN
      ) {
        throw new Error("Missing YouTube OAuth environment variables");
      }

      const oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET,
        "http://localhost"
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
      });

      const youtube = google.youtube({
        version: "v3",
        auth: oauth2Client,
      });

      const bucket = getStorage().bucket(event.data.bucket);
      const localFileName = path.basename(filePath);
      const localPath = path.join(os.tmpdir(), localFileName);

      logger.info(`⬇️  Downloading file to: ${localPath}`);
      await bucket.file(filePath).download({ destination: localPath });

      if (!fs.existsSync(localPath)) {
        logger.error("❌ File download failed - file does not exist");
        throw new Error("UNKNOWN_ERROR: File was not downloaded successfully");
      }

      const stats = fs.statSync(localPath);
      const fileSize = stats.size;
      logger.info(`✅ File downloaded successfully`);
      logger.info(`📊 File size: ${fileSize} bytes`);

      if (fileSize === 0) {
        logger.error("❌ Downloaded file is empty");
        throw new Error("UNKNOWN_ERROR: Downloaded file is empty");
      }

      logger.info("🎬 Starting YouTube upload...");

      // Get lesson title for YouTube video title
      let lessonTitle = "Lesson Video";
      if (lessonRef) {
        try {
          const lessonDoc = await lessonRef.get();
          if (lessonDoc.exists()) {
            lessonTitle = lessonDoc.data().title || lessonTitle;
          }
        } catch (err) {
          logger.warn("Could not fetch lesson title, using default");
        }
      }

      let response;
      try {
        response = await youtube.videos.insert({
          part: ["snippet", "status"],
          requestBody: {
            snippet: {
              title: lessonTitle,
              description: `Educational lesson video from The GuruJI Classes`,
              tags: ["education", "lesson", "tutorial"],
              categoryId: "27" // Education category
            },
            status: {
              privacyStatus: "unlisted",
              madeForKids: false,
              selfDeclaredMadeForKids: false
            }
          },
          media: {
            body: fs.createReadStream(localPath)
          }
        });
      } catch (youtubeError) {
        // Detect YouTube quota/rate limit errors
        const errorMessage = youtubeError.message || "";
        const errorCode = youtubeError.code || "";
        
        logger.error("❌ YouTube API error:", errorMessage);
        logger.error("❌ YouTube error code:", errorCode);

        // Check for quota exceeded errors
        if (
          errorCode === 403 ||
          errorMessage.includes("quota") ||
          errorMessage.includes("quotaExceeded") ||
          errorMessage.includes("dailyUploadLimitExceeded") ||
          errorMessage.includes("uploadLimitExceeded")
        ) {
          logger.error("🚫 YouTube quota exceeded - marking as UPLOAD_BLOCKED");
          
          if (lessonRef) {
            await lessonRef.update({
              status: "UPLOAD_BLOCKED",
              errorCode: "QUOTA_EXCEEDED",
              errorMessage: "Daily YouTube upload limit reached. Please try again tomorrow.",
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
          
          // Clean up and return - do NOT retry
          if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
          }
          return; // Exit gracefully, don't throw
        }

        // Check for auth errors
        if (
          errorCode === 401 ||
          errorMessage.includes("unauthorized") ||
          errorMessage.includes("invalid_grant") ||
          errorMessage.includes("invalid_token")
        ) {
          logger.error("🔐 YouTube auth error");
          
          if (lessonRef) {
            await lessonRef.update({
              status: "failed",
              errorCode: "AUTH_ERROR",
              errorMessage: "YouTube authentication failed. Please contact support.",
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
          
          throw new Error("AUTH_ERROR: YouTube authentication failed");
        }

        // Unknown error
        logger.error("❌ Unknown YouTube error");
        if (lessonRef) {
          await lessonRef.update({
            status: "failed",
            errorCode: "UNKNOWN_ERROR",
            errorMessage: errorMessage || "Unknown error occurred during YouTube upload",
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        
        throw new Error(`UNKNOWN_ERROR: ${errorMessage}`);
      }

      const videoId = response.data.id;
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      logger.info("✅ YouTube upload complete");
      logger.info(`🎥 Video ID: ${videoId}`);
      logger.info(`🔗 YouTube URL: ${youtubeUrl}`);

      // Update lesson document with YouTube details and set status to "ready"
      if (lessonRef) {
        try {
          await lessonRef.update({
            status: "ready",
            youtubeVideoId: videoId,
            youtubeUrl: youtubeUrl,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          logger.info("✅ Lesson document updated with YouTube URL and status 'ready'");
        } catch (firestoreError) {
          logger.error("❌ Failed to update lesson document:", firestoreError);
          // Don't throw - YouTube upload succeeded
        }
      }

      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        logger.info("🗑️  Temporary file deleted");
      }

    } catch (err) {
      logger.error("❌ Function failed:", err.message);
      logger.error("❌ Error details:", err);
      
      // Determine error code from error message
      let errorCode = "UNKNOWN_ERROR";
      if (err.message.includes("AUTH_ERROR")) {
        errorCode = "AUTH_ERROR";
      } else if (err.message.includes("QUOTA_EXCEEDED")) {
        errorCode = "QUOTA_EXCEEDED";
      }

      // Update lesson status to "failed" or "UPLOAD_BLOCKED"
      if (lessonRef) {
        try {
          const updateData = {
            errorCode: errorCode,
            errorMessage: err.message || "Unknown error occurred",
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };

          if (errorCode === "QUOTA_EXCEEDED") {
            updateData.status = "UPLOAD_BLOCKED";
          } else {
            updateData.status = "failed";
          }

          await lessonRef.update(updateData);
          logger.info(`✅ Lesson status updated to '${updateData.status}' with error code '${errorCode}'`);
        } catch (firestoreError) {
          logger.error("❌ Failed to update lesson status:", firestoreError);
        }
      }
      
      // Only throw if it's not a quota error (quota errors are handled gracefully)
      if (errorCode !== "QUOTA_EXCEEDED") {
        throw err;
      }
    }
  }
);
