import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../context/AuthContext';
import { APP_CONFIG } from '../../config/appConfig';
import TeacherNav from '../../components/TeacherNav';

// Share Course Button Component
const ShareCourseButton = ({ courseId, courseTitle }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use production URL for sharing (works for everyone, not just localhost)
  const shareUrl = `${APP_CONFIG.BASE_URL}/course/${courseId}`;
  
  // Check if share URL is configured
  const isLocalhost = shareUrl.includes('localhost') || shareUrl.includes('127.0.0.1');
  const isConfigured = !shareUrl.includes('CONFIGURE') && !isLocalhost;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: courseTitle,
          text: `Check out this course: ${courseTitle}`,
          url: shareUrl
        });
        setShowShareMenu(false);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share Course
      </button>

      {showShareMenu && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowShareMenu(false)}
          ></div>
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-2">
              <button
                onClick={handleCopyLink}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              {navigator.share && (
                <button
                  onClick={handleShare}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share via...
                </button>
              )}
            </div>
            <div className="border-t border-gray-200 p-3">
              {isLocalhost ? (
                <div className="px-2 py-2 text-xs text-yellow-700 bg-yellow-50 rounded border border-yellow-200">
                  ⚠️ <strong>Warning:</strong> This link uses localhost and won't work for others.
                  <br />
                  <br />
                  <strong>To fix:</strong> Open <code className="bg-yellow-100 px-1 rounded">src/config/appConfig.js</code> and set <code className="bg-yellow-100 px-1 rounded">PRODUCTION_URL</code> to your domain.
                  <br />
                  Example: <code className="bg-yellow-100 px-1 rounded">const PRODUCTION_URL = 'https://thegurujiclasses.com';</code>
                </div>
              ) : (
                <div className="px-2 py-1 text-xs text-gray-500 break-all bg-gray-50 rounded">
                  {shareUrl}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * SIMPLIFIED: Lesson Management with YouTube URL Input Only
 * 
 * This component:
 * - Allows creating lessons with YouTube video URL
 * - Allows deleting lessons with confirmation
 * - No file uploads, no Firebase Storage, no upload progress
 * - Validates YouTube URLs (youtube.com or youtu.be)
 * - Extracts video ID and saves to Firestore
 * - Displays videos using YouTube embed iframe
 */
const TeacherCourseDetail = () => {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    videoUrl: '',
    order: '',
    subject: '',
    chapter: ''
  });

  useEffect(() => {
    if (currentUser && courseId) {
      fetchCourse();
      fetchLessons();
      fetchEnrolledCount();
    }
  }, [courseId, currentUser]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchCourse = async () => {
    try {
      const courseDocRef = doc(db, 'courses', courseId);
      const courseDocSnap = await getDoc(courseDocRef);
      
      if (courseDocSnap.exists()) {
        const courseData = courseDocSnap.data();
        if (courseData.teacherId !== currentUser.uid) {
          alert('You do not have permission to view this course.');
          return;
        }
        setCourse({
          id: courseDocSnap.id,
          ...courseData
        });
      } else {
        alert('Course not found.');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      alert('Failed to load course.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const lessonsRef = collection(db, 'lessons');
      const lessonsQuery = query(
        lessonsRef,
        where('courseId', '==', courseId),
        orderBy('order', 'asc')
      );
      const lessonsSnapshot = await getDocs(lessonsQuery);
      const lessonsData = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLessons(lessonsData);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setLessons([]);
    }
  };

  const fetchEnrolledCount = async () => {
    try {
      // Count enrollments using nested structure: enrollments/{courseId}/students
      const studentsRef = collection(db, 'enrollments', courseId, 'students');
      const studentsSnapshot = await getDocs(studentsRef);
      setEnrolledCount(studentsSnapshot.size);
    } catch (error) {
      console.error('Error fetching enrollment count:', error);
      setEnrolledCount(0);
    }
  };

  /**
   * Extract YouTube video ID from URL
   * Supports:
   * - https://www.youtube.com/watch?v=VIDEO_ID
   * - https://youtu.be/VIDEO_ID
   * - https://youtube.com/watch?v=VIDEO_ID
   */
  const extractVideoId = (url) => {
    if (!url) return null;

    // Match youtu.be format: https://youtu.be/VIDEO_ID
    const youtuBeMatch = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtuBeMatch) {
      return youtuBeMatch[1];
    }

    // Match youtube.com format: https://www.youtube.com/watch?v=VIDEO_ID
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
      return youtubeMatch[1];
    }

    return null;
  };

  /**
   * Validate YouTube URL
   * Must contain youtube.com OR youtu.be
   */
  const validateYouTubeUrl = (url) => {
    if (!url || !url.trim()) {
      return { valid: false, error: 'YouTube URL is required' };
    }

    const trimmedUrl = url.trim();
    
    // Check if URL contains youtube.com or youtu.be
    if (!trimmedUrl.includes('youtube.com') && !trimmedUrl.includes('youtu.be')) {
      return { valid: false, error: 'Please enter a valid YouTube URL (youtube.com or youtu.be)' };
    }

    // Try to extract video ID
    const videoId = extractVideoId(trimmedUrl);
    if (!videoId) {
      return { valid: false, error: 'Could not extract video ID from URL. Please check the URL format.' };
    }

    return { valid: true, videoId, url: trimmedUrl };
  };

  const handleLessonFormChange = (e) => {
    const { name, value } = e.target;
    setLessonForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) {
      setError('');
    }
  };

  /**
   * Create lesson with YouTube video URL
   */
  const handleAddLesson = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validate required fields
    if (!lessonForm.title.trim() || !lessonForm.order || !lessonForm.subject.trim() || !lessonForm.chapter.trim()) {
      setError('Please fill in all required fields (Subject, Chapter, Title, and Order)');
      return;
    }

    // Validate YouTube URL
    const urlValidation = validateYouTubeUrl(lessonForm.videoUrl);
    if (!urlValidation.valid) {
      setError(urlValidation.error);
      return;
    }

    try {
      setIsAddingLesson(true);

      // Create lesson document with video URL, subject, and chapter
      await addDoc(collection(db, 'lessons'), {
        courseId: courseId,
        subject: lessonForm.subject.trim(),
        chapter: lessonForm.chapter.trim(),
        title: lessonForm.title.trim(),
        videoUrl: urlValidation.url,
        youtubeVideoId: urlValidation.videoId,
        order: parseInt(lessonForm.order),
        createdAt: serverTimestamp()
      });

      // Reset form
      setLessonForm({
        title: '',
        videoUrl: '',
        order: '',
        subject: '',
        chapter: ''
      });

      // Show success message
      setSuccessMessage('Lesson added successfully!');

      // Refresh lessons to show the new one
      await fetchLessons();
    } catch (error) {
      console.error('Error adding lesson:', error);
      setError('Failed to add lesson. Please try again.');
    } finally {
      setIsAddingLesson(false);
    }
  };

  /**
   * Delete lesson with confirmation and security checks
   */
  const handleDeleteLesson = async (lessonId, lessonTitle) => {
    // Security check: Ensure user is authenticated and is the course owner
    if (!currentUser) {
      setError('You must be logged in to delete lessons.');
      return;
    }

    if (!course || course.teacherId !== currentUser.uid) {
      setError('You do not have permission to delete lessons from this course.');
      return;
    }

    // Confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${lessonTitle}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingLessonId(lessonId);
      setError('');
      setSuccessMessage('');

      // Delete lesson document from Firestore
      // Lessons are stored in the 'lessons' collection directly
      const lessonRef = doc(db, 'lessons', lessonId);
      await deleteDoc(lessonRef);

      // Remove lesson from local state immediately
      setLessons(prevLessons => prevLessons.filter(lesson => lesson.id !== lessonId));

      // Show success message
      setSuccessMessage('Lesson deleted successfully!');
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setError('Failed to delete lesson. Please try again.');
      // Do NOT remove from UI if delete failed
    } finally {
      setDeletingLessonId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
        <TeacherNav />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
        <TeacherNav />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <Link to="/teacher/courses" className="text-indigo-600 hover:text-indigo-700">
              ← Back to My Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <TeacherNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            to="/teacher/courses"
            className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block"
          >
            ← Back to My Courses
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-gray-600 mb-6">{course.description}</p>
            </div>
            <ShareCourseButton courseId={courseId} courseTitle={course.title} />
          </div>
        </div>

        {/* Enrollment Summary Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enrolled Students</h2>
              <p className="text-3xl font-bold text-indigo-600">{enrolledCount}</p>
            </div>
            <Link
              to={`/teacher/course/${courseId}/students`}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              View Enrolled Students
            </Link>
          </div>
        </div>

        {/* Add Lesson Form with YouTube URL */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Lesson</h2>
          
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleAddLesson} className="space-y-4">
            {/* Subject Selection */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={lessonForm.subject}
                onChange={handleLessonFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Mathematics, Physics, Chemistry"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Select or enter the subject for this lesson
              </p>
            </div>

            {/* Chapter Selection */}
            <div>
              <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 mb-2">
                Chapter <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="chapter"
                name="chapter"
                value={lessonForm.chapter}
                onChange={handleLessonFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Chapter 1: Introduction, Chapter 2: Basics"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Select or enter the chapter for this lesson
              </p>
            </div>

            {/* Lesson Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={lessonForm.title}
                onChange={handleLessonFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter lesson title"
                required
              />
            </div>
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Video URL
              </label>
              <input
                type="url"
                id="videoUrl"
                name="videoUrl"
                value={lessonForm.videoUrl}
                onChange={handleLessonFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter a YouTube video URL (youtube.com or youtu.be)
              </p>
            </div>
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                Order Number <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="order"
                name="order"
                value={lessonForm.order}
                onChange={handleLessonFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter order number (1, 2, 3...)"
                min="1"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                The sequence number for this lesson within the chapter
              </p>
            </div>
            <button
              type="submit"
              disabled={isAddingLesson}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingLesson ? 'Adding...' : 'Add Lesson'}
            </button>
          </form>
        </div>

        {/* Lessons List */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Lessons ({lessons.length})</h2>
          {lessons.length === 0 ? (
            <p className="text-gray-600">No lessons added yet. Add your first lesson above.</p>
          ) : (
            <div className="space-y-6">
              {lessons.map((lesson) => {
                // Extract video ID if not already stored
                const videoId = lesson.youtubeVideoId || extractVideoId(lesson.videoUrl);
                const isDeleting = deletingLessonId === lesson.id;
                
                return (
                  <div
                    key={lesson.id}
                    className="border border-gray-200 rounded-lg p-6 bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center flex-1">
                        <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-indigo-600 font-semibold">{lesson.order}</span>
                        </div>
                        <div className="flex-1">
                          {/* Subject and Chapter */}
                          {(lesson.subject || lesson.chapter) && (
                            <div className="flex items-center gap-2 mb-2">
                              {lesson.subject && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                  {lesson.subject}
                                </span>
                              )}
                              {lesson.chapter && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {lesson.chapter}
                                </span>
                              )}
                            </div>
                          )}
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{lesson.title}</h3>
                          {lesson.videoUrl && (
                            <a
                              href={lesson.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-600 hover:text-indigo-700 truncate block"
                            >
                              {lesson.videoUrl}
                            </a>
                          )}
                        </div>
                      </div>
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                        disabled={isDeleting}
                        className="ml-4 px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 hover:border-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        {isDeleting ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                            Deleting...
                          </span>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </div>

                    {/* Show YouTube Embed if video URL exists */}
                    {videoId && (
                      <div className="mt-4">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Video Preview</h4>
                          <div className="aspect-video bg-black rounded-lg overflow-hidden">
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title={lesson.title}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                          {lesson.videoUrl && (
                            <a
                              href={lesson.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-600 hover:text-indigo-700 mt-2 inline-block"
                            >
                              Open on YouTube →
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherCourseDetail;
