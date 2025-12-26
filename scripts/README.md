# Backfill Scripts

## backfillEnrollments.cjs

Backfills missing `studentName` and `studentEmail` fields in enrollment documents.

### What it does:
- Queries all enrollment documents
- Identifies enrollments missing `studentName` or `studentEmail`
- Fetches user data from `users/{studentId}` collection
- Updates enrollment documents with student name and email
- Handles missing users gracefully (skips them)

### Prerequisites:

1. **Firebase Admin SDK Setup** (choose one):

   **Option A: Firebase CLI (Recommended for development)**
   ```bash
   firebase login
   firebase use the-guruji-classes
   ```

   **Option B: Service Account Key**
   - Download service account key from Firebase Console
   - Uncomment and update the service account initialization in the script
   - Place key file in a secure location (not in git)

   **Option C: Environment Variable**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
   ```

### Usage:

```bash
node scripts/backfillEnrollments.cjs
```

### Safety Features:

- ✅ Asks for confirmation before updating
- ✅ Shows progress for each enrollment
- ✅ Handles missing users gracefully
- ✅ Only updates missing fields (doesn't overwrite existing data)
- ✅ Provides detailed summary at the end

### Output:

The script will:
1. Show total enrollments found
2. Show how many need updating
3. Ask for confirmation
4. Process each enrollment with progress updates
5. Show final summary with success/error counts

### Example Output:

```
🔄 Starting enrollment backfill process...

📥 Fetching all enrollments...
📊 Found 25 total enrollments

✅ 10 enrollments already have complete data
⚠️  15 enrollments need updating

⚠️  This will update 15 enrollment documents. Continue? (yes/no): yes

🔄 Processing enrollments...

[1/15] ✅ Updated enrollment abc123: John Doe (john@example.com)
[2/15] ✅ Updated enrollment def456: Jane Smith (jane@example.com)
...

==================================================
📊 BACKFILL SUMMARY
==================================================
✅ Successfully updated: 15
⚠️  Skipped (user not found): 0
❌ Errors: 0
📝 Total processed: 15
==================================================

🎉 Backfill completed successfully!
```


