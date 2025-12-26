/**
 * Backfill Script: Add studentName and studentEmail to existing enrollments
 * 
 * This script updates enrollment documents that are missing studentName or studentEmail
 * by fetching the data from the users collection.
 * 
 * Usage:
 *   node scripts/backfillEnrollments.cjs
 * 
 * Requirements:
 *   - Firebase Admin SDK credentials (service account key)
 *   - Or run with Firebase CLI: firebase use <project-id>
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin
// Option 1: Use service account key file (recommended for production)
// Uncomment and set path to your service account key:
// const serviceAccount = require('./path/to/serviceAccountKey.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// Option 2: Use Application Default Credentials (for Firebase CLI)
// Run: firebase use <project-id> before running this script
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.error('\n💡 Options to fix:');
  console.error('   1. Run: firebase use <project-id>');
  console.error('   2. Or set GOOGLE_APPLICATION_CREDENTIALS environment variable');
  console.error('   3. Or uncomment service account key initialization above');
  process.exit(1);
}

const db = admin.firestore();

// Create readline interface for confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function backfillEnrollments() {
  console.log('\n🔄 Starting enrollment backfill process...\n');

  try {
    // Fetch all enrollments
    console.log('📥 Fetching all enrollments...');
    const enrollmentsSnapshot = await db.collection('enrollments').get();
    
    if (enrollmentsSnapshot.empty) {
      console.log('✅ No enrollments found. Nothing to backfill.');
      rl.close();
      return;
    }

    console.log(`📊 Found ${enrollmentsSnapshot.size} total enrollments\n`);

    // Filter enrollments that need updating
    const enrollmentsToUpdate = [];
    let alreadyComplete = 0;

    enrollmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      const needsUpdate = !data.studentName || !data.studentEmail;
      
      if (needsUpdate) {
        enrollmentsToUpdate.push({
          id: doc.id,
          studentId: data.studentId,
          courseId: data.courseId,
          currentStudentName: data.studentName, // Track what exists
          currentStudentEmail: data.studentEmail // Track what exists
        });
      } else {
        alreadyComplete++;
      }
    });

    console.log(`✅ ${alreadyComplete} enrollments already have complete data`);
    console.log(`⚠️  ${enrollmentsToUpdate.length} enrollments need updating\n`);

    if (enrollmentsToUpdate.length === 0) {
      console.log('🎉 All enrollments are up to date!');
      rl.close();
      return;
    }

    // Ask for confirmation
    const confirm = await askQuestion(
      `⚠️  This will update ${enrollmentsToUpdate.length} enrollment documents. Continue? (yes/no): `
    );

    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('❌ Backfill cancelled.');
      rl.close();
      return;
    }

    console.log('\n🔄 Processing enrollments...\n');

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Process each enrollment
    for (let i = 0; i < enrollmentsToUpdate.length; i++) {
      const enrollment = enrollmentsToUpdate[i];
      const progress = `[${i + 1}/${enrollmentsToUpdate.length}]`;

      try {
        // Fetch user document
        const userDocRef = db.collection('users').doc(enrollment.studentId);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
          console.log(`${progress} ⚠️  Enrollment ${enrollment.id}: User ${enrollment.studentId} not found - skipping`);
          skippedCount++;
          continue;
        }

        const userData = userDoc.data();
        
        // Extract student name (try multiple sources)
        let studentName = userData.name || 
                        userData.email?.split('@')[0] || 
                        'Unknown Student';
        
        // Extract student email
        const studentEmail = userData.email || 'No email';

        // Prepare update data (only update missing fields)
        const updateData = {};
        if (!enrollment.currentStudentName) {
          updateData.studentName = studentName;
        }
        if (!enrollment.currentStudentEmail) {
          updateData.studentEmail = studentEmail;
        }

        // Update enrollment document
        await db.collection('enrollments').doc(enrollment.id).update(updateData);

        console.log(`${progress} ✅ Updated enrollment ${enrollment.id}: ${studentName} (${studentEmail})`);
        successCount++;

      } catch (error) {
        console.error(`${progress} ❌ Error processing enrollment ${enrollment.id}:`, error.message);
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 BACKFILL SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully updated: ${successCount}`);
    console.log(`⚠️  Skipped (user not found): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📝 Total processed: ${enrollmentsToUpdate.length}`);
    console.log('='.repeat(50) + '\n');

    if (successCount > 0) {
      console.log('🎉 Backfill completed successfully!');
    }

  } catch (error) {
    console.error('\n❌ Fatal error during backfill:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the backfill
backfillEnrollments()
  .then(() => {
    console.log('\n✅ Script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

