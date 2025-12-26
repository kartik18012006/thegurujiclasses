import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCourseProgressSummary, getAllCoursesProgress } from '../services/progressService';

const ProgressContext = createContext();

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    // Return default values instead of throwing to prevent white screen crashes
    console.warn('useProgress must be used within a ProgressProvider');
    return {
      courseProgress: {},
      loading: false,
      refreshCourseProgress: () => Promise.resolve(null),
      loadAllCoursesProgress: () => {}
    };
  }
  return context;
};

export const ProgressProvider = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const [courseProgress, setCourseProgress] = useState({}); // { courseId: { progressPercentage, completedLessons, totalLessons } }
  const [loading, setLoading] = useState(false);

  // Load all courses progress for the student
  useEffect(() => {
    if (currentUser && userProfile?.role === 'student') {
      loadAllCoursesProgress();
    } else {
      setCourseProgress({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, userProfile]);

  const loadAllCoursesProgress = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const allProgress = await getAllCoursesProgress(currentUser.uid);
      setCourseProgress(allProgress || {});
    } catch (error) {
      console.error('Error loading courses progress:', error);
      setCourseProgress({}); // Set empty object on error
    } finally {
      setLoading(false);
    }
  };

  // Refresh progress for a specific course
  const refreshCourseProgress = async (courseId, totalLessons) => {
    if (!currentUser || !courseId) return null;
    
    try {
      const summary = await getCourseProgressSummary(currentUser.uid, courseId, totalLessons || 0);
      if (summary) {
        setCourseProgress(prev => ({
          ...prev,
          [courseId]: summary
        }));
      }
      return summary;
    } catch (error) {
      console.error('Error refreshing course progress:', error);
      return null;
    }
  };

  const value = {
    courseProgress: courseProgress || {},
    loading,
    refreshCourseProgress: refreshCourseProgress || (() => Promise.resolve(null)),
    loadAllCoursesProgress: loadAllCoursesProgress || (() => {})
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

