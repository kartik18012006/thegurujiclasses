import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Progress Tracking Service
 * Handles all progress-related Firestore operations
 */

/**
 * Mark a lesson as started/accessed (simple - just clicking on lesson)
 * @param {string} studentId - Student's user ID
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 */
export const markLessonStarted = async (studentId, courseId, lessonId) => {
  try {
    if (!studentId || !courseId || !lessonId) {
      console.error('Missing required parameters for markLessonStarted');
      return { success: false };
    }

    const progressRef = doc(db, 'studentProgress', studentId, 'courses', courseId, 'lessons', lessonId);
    
    // Get existing data
    const progressSnap = await getDoc(progressRef);
    const existingData = progressSnap.exists() ? progressSnap.data() : {};
    
    // Mark as completed when student clicks on lesson (simple approach)
    await setDoc(progressRef, {
      completed: true,
      completedAt: existingData.completedAt || serverTimestamp(),
      watchTime: existingData.watchTime || 0,
      lastPosition: existingData.lastPosition || 0,
      startedAt: existingData.startedAt || serverTimestamp(),
      attempts: (existingData.attempts || 0) + 1,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Update course progress summary
    await updateCourseProgress(studentId, courseId);
    
    console.log('Lesson marked as started/completed:', { studentId, courseId, lessonId });
    return { success: true };
  } catch (error) {
    console.error('Error marking lesson as started:', error);
    throw error;
  }
};

/**
 * Mark a lesson as completed
 * @param {string} studentId - Student's user ID
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @param {number} watchTime - Total watch time in seconds
 */
export const markLessonCompleted = async (studentId, courseId, lessonId, watchTime = 0) => {
  try {
    const progressRef = doc(db, 'studentProgress', studentId, 'courses', courseId, 'lessons', lessonId);
    
    // Get existing data to preserve attempts count
    const progressSnap = await getDoc(progressRef);
    const existingData = progressSnap.exists() ? progressSnap.data() : {};
    
    // Only mark as completed if not already completed (to avoid unnecessary updates)
    if (existingData.completed === true) {
      return { success: true, alreadyCompleted: true };
    }
    
    await setDoc(progressRef, {
      completed: true,
      completedAt: serverTimestamp(),
      watchTime: Math.max(watchTime, existingData.watchTime || 0),
      lastPosition: watchTime,
      attempts: (existingData.attempts || 0) + 1,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Update course progress summary
    await updateCourseProgress(studentId, courseId);
    
    console.log('Lesson marked as completed:', { studentId, courseId, lessonId, watchTime });
    return { success: true, newlyCompleted: true };
  } catch (error) {
    console.error('Error marking lesson as completed:', error);
    throw error;
  }
};

/**
 * Update lesson watch time and position
 * @param {string} studentId - Student's user ID
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @param {number} currentTime - Current video position in seconds
 * @param {number} duration - Total video duration in seconds
 */
export const updateLessonProgress = async (studentId, courseId, lessonId, currentTime, duration) => {
  try {
    if (!studentId || !courseId || !lessonId) {
      console.error('Missing required parameters for updateLessonProgress');
      return { success: false };
    }
    
    const progressRef = doc(db, 'studentProgress', studentId, 'courses', courseId, 'lessons', lessonId);
    const progressSnap = await getDoc(progressRef);
    
    const existingData = progressSnap.exists() ? progressSnap.data() : {};
    const existingWatchTime = existingData.watchTime || 0;
    
    // Only update if current time is greater than existing watch time
    const newWatchTime = Math.max(existingWatchTime, currentTime);
    
    // Mark as completed if watched more than 90% of video
    const completionThreshold = duration * 0.9;
    const isCompleted = newWatchTime >= completionThreshold || existingData.completed === true;
    
    const progressData = {
      lastPosition: currentTime,
      watchTime: newWatchTime,
      completed: isCompleted,
      duration: duration,
      updatedAt: serverTimestamp()
    };
    
    // Only set completedAt if newly completed
    if (isCompleted && !existingData.completedAt) {
      progressData.completedAt = serverTimestamp();
    } else if (existingData.completedAt) {
      progressData.completedAt = existingData.completedAt;
    }
    
    await setDoc(progressRef, progressData, { merge: true });

    // Update course progress if completed
    if (isCompleted && !existingData.completed) {
      await updateCourseProgress(studentId, courseId);
      console.log('Lesson auto-completed at 90%:', { studentId, courseId, lessonId, newWatchTime, duration });
    }
    
    return { success: true, completed: isCompleted, watchTime: newWatchTime };
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    console.error('Error details:', { studentId, courseId, lessonId, currentTime, duration });
    throw error;
  }
};

/**
 * Get lesson progress for a student
 * @param {string} studentId - Student's user ID
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 */
export const getLessonProgress = async (studentId, courseId, lessonId) => {
  try {
    const progressRef = doc(db, 'studentProgress', studentId, 'courses', courseId, 'lessons', lessonId);
    const progressSnap = await getDoc(progressRef);
    
    if (progressSnap.exists()) {
      return progressSnap.data();
    }
    
    return null;
  } catch (error) {
    console.error('Error getting lesson progress:', error);
    return null;
  }
};

/**
 * Get all lesson progress for a course
 * @param {string} studentId - Student's user ID
 * @param {string} courseId - Course ID
 */
export const getCourseProgress = async (studentId, courseId) => {
  try {
    const lessonsProgressRef = collection(db, 'studentProgress', studentId, 'courses', courseId, 'lessons');
    const progressSnapshot = await getDocs(lessonsProgressRef);
    
    const progressMap = {};
    progressSnapshot.docs.forEach(doc => {
      progressMap[doc.id] = doc.data();
    });
    
    return progressMap;
  } catch (error) {
    console.error('Error getting course progress:', error);
    return {};
  }
};

/**
 * Get course progress summary (percentage, completed lessons, etc.)
 * @param {string} studentId - Student's user ID
 * @param {string} courseId - Course ID
 * @param {number} totalLessons - Total number of lessons in the course
 */
export const getCourseProgressSummary = async (studentId, courseId, totalLessons) => {
  try {
    const progressMap = await getCourseProgress(studentId, courseId);
    
    const completedLessons = Object.values(progressMap).filter(p => p.completed === true).length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    // Calculate total watch time
    const totalWatchTime = Object.values(progressMap).reduce((sum, p) => sum + (p.watchTime || 0), 0);
    
    return {
      completedLessons,
      totalLessons,
      progressPercentage,
      totalWatchTime,
      progressMap
    };
  } catch (error) {
    console.error('Error getting course progress summary:', error);
    return {
      completedLessons: 0,
      totalLessons: totalLessons || 0,
      progressPercentage: 0,
      totalWatchTime: 0,
      progressMap: {}
    };
  }
};

/**
 * Update course-level progress summary
 * @param {string} studentId - Student's user ID
 * @param {string} courseId - Course ID
 */
const updateCourseProgress = async (studentId, courseId) => {
  try {
    // This will be called after lesson completion
    // The summary is calculated on-demand in getCourseProgressSummary
    // But we can store a cached version here if needed
    const courseProgressRef = doc(db, 'studentProgress', studentId, 'courses', courseId);
    await setDoc(courseProgressRef, {
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating course progress:', error);
  }
};

/**
 * Get all courses progress for a student
 * @param {string} studentId - Student's user ID
 */
export const getAllCoursesProgress = async (studentId) => {
  try {
    const coursesProgressRef = collection(db, 'studentProgress', studentId, 'courses');
    const coursesSnapshot = await getDocs(coursesProgressRef);
    
    const coursesProgress = {};
    coursesSnapshot.docs.forEach(doc => {
      coursesProgress[doc.id] = doc.data();
    });
    
    return coursesProgress;
  } catch (error) {
    console.error('Error getting all courses progress:', error);
    return {};
  }
};

/**
 * Get student progress for a teacher (all students in a course)
 * @param {string} courseId - Course ID
 */
export const getCourseStudentsProgress = async (courseId) => {
  try {
    // Get all enrollments for this course
    const studentsRef = collection(db, 'enrollments', courseId, 'students');
    const studentsSnapshot = await getDocs(studentsRef);
    
    const studentsProgress = [];
    
    for (const studentDoc of studentsSnapshot.docs) {
      const studentId = studentDoc.id;
      const studentData = studentDoc.data();
      
      // Get progress for this student
      const lessonsProgressRef = collection(db, 'studentProgress', studentId, 'courses', courseId, 'lessons');
      const progressSnapshot = await getDocs(lessonsProgressRef);
      
      const completedLessons = progressSnapshot.docs.filter(doc => doc.data().completed === true).length;
      const totalWatchTime = progressSnapshot.docs.reduce((sum, doc) => sum + (doc.data().watchTime || 0), 0);
      
      studentsProgress.push({
        studentId: studentId,
        studentName: studentData.studentName || 'Unknown',
        studentEmail: studentData.studentEmail || '',
        completedLessons: completedLessons,
        totalLessons: progressSnapshot.size,
        totalWatchTime: totalWatchTime,
        enrolledAt: studentData.enrolledAt
      });
    }
    
    return studentsProgress;
  } catch (error) {
    console.error('Error getting course students progress:', error);
    return [];
  }
};

/**
 * Format watch time for display
 * @param {number} seconds - Time in seconds
 */
export const formatWatchTime = (seconds) => {
  if (!seconds || seconds === 0) return '0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

