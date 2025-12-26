import { 
  doc, 
  getDoc, 
  updateDoc,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Enrollment Progress Service
 * Manages course progress using enrollment documents
 * Structure: enrollments/{courseId}/students/{studentId}
 */

/**
 * Mark a lesson as completed when video ends
 * @param {string} userId - Student's user ID
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @param {number} totalLessons - Total number of lessons in the course
 */
export const markLessonCompleted = async (userId, courseId, lessonId, totalLessons) => {
  try {
    if (!userId || !courseId || !lessonId) {
      console.error('Missing required parameters for markLessonCompleted');
      return { success: false };
    }

    // Get enrollment document: enrollments/{courseId}/students/{studentId}
    const enrollmentRef = doc(db, 'enrollments', courseId, 'students', userId);
    const enrollmentSnap = await getDoc(enrollmentRef);

    if (!enrollmentSnap.exists()) {
      console.error('Enrollment document does not exist');
      return { success: false, error: 'Not enrolled in course' };
    }

    const enrollmentData = enrollmentSnap.data();
    const completedLessons = enrollmentData.completedLessons || [];

    // Check if lesson is already completed (prevent duplicates)
    if (completedLessons.includes(lessonId)) {
      console.log('Lesson already completed:', lessonId);
      return { success: true, alreadyCompleted: true };
    }

    // Add lessonId to completedLessons array (no duplicates)
    const updatedCompletedLessons = [...completedLessons, lessonId];

    // Recalculate progress
    const progress = totalLessons > 0 
      ? Math.round((updatedCompletedLessons.length / totalLessons) * 100)
      : 0;

    // Update enrollment document
    await updateDoc(enrollmentRef, {
      completedLessons: updatedCompletedLessons,
      progress: progress,
      lastUpdated: serverTimestamp()
    });

    console.log('Lesson marked as completed:', {
      userId,
      courseId,
      lessonId,
      progress,
      completedCount: updatedCompletedLessons.length,
      totalLessons
    });

    return {
      success: true,
      progress,
      completedCount: updatedCompletedLessons.length,
      totalLessons
    };
  } catch (error) {
    console.error('Error marking lesson as completed:', error);
    throw error;
  }
};

/**
 * Get enrollment progress
 * @param {string} userId - Student's user ID
 * @param {string} courseId - Course ID
 */
export const getEnrollmentProgress = async (userId, courseId) => {
  try {
    const enrollmentRef = doc(db, 'enrollments', courseId, 'students', userId);
    const enrollmentSnap = await getDoc(enrollmentRef);

    if (!enrollmentSnap.exists()) {
      return {
        completedLessons: [],
        progress: 0,
        exists: false
      };
    }

    const data = enrollmentSnap.data();
    return {
      completedLessons: data.completedLessons || [],
      progress: data.progress || 0,
      exists: true
    };
  } catch (error) {
    console.error('Error getting enrollment progress:', error);
    return {
      completedLessons: [],
      progress: 0,
      exists: false
    };
  }
};

/**
 * Initialize enrollment with progress fields if they don't exist
 * @param {string} userId - Student's user ID
 * @param {string} courseId - Course ID
 */
export const initializeEnrollmentProgress = async (userId, courseId) => {
  try {
    const enrollmentRef = doc(db, 'enrollments', courseId, 'students', userId);
    const enrollmentSnap = await getDoc(enrollmentRef);

    if (enrollmentSnap.exists()) {
      const data = enrollmentSnap.data();
      // If completedLessons doesn't exist, initialize it
      if (!data.completedLessons) {
        await updateDoc(enrollmentRef, {
          completedLessons: [],
          progress: 0,
          lastUpdated: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('Error initializing enrollment progress:', error);
  }
};


