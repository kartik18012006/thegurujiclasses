import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../context/AuthContext';
import StudentNav from '../../components/StudentNav';
import CustomVideoPlayer from '../../components/CustomVideoPlayer';

const StudentCourseDetail = () => {
  const { courseId } = useParams();
  const { currentUser, userProfile, isProfileLoaded } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [allLessons, setAllLessons] = useState([]); // All lessons for the course
  const [lessons, setLessons] = useState([]); // Filtered lessons by subject/chapter
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [subjects, setSubjects] = useState([]); // Available subjects
  const [chapters, setChapters] = useState([]); // Available chapters for selected subject
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState('');
  const [loading, setLoading] = useState(true);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  // Static course info - fallback if not in Firestore
  const staticCourseInfo = {
    '1': {
      title: 'Complete Web Development Bootcamp',
      description: 'Master HTML, CSS, JavaScript, React, Node.js and more. Build real-world projects and land your dream job.',
      instructor: 'Dr. Priya Sharma',
      price: 4999,
      lessons: [
        'Introduction to Web Development',
        'HTML Fundamentals',
        'CSS Styling',
        'JavaScript Basics',
        'React Fundamentals',
        'Node.js and Express',
        'Database Integration',
        'Deployment'
      ]
    },
    '2': {
      title: 'Data Science & Machine Learning',
      description: 'Learn Python, pandas, scikit-learn, TensorFlow. Build ML models and analyze data like a pro.',
      instructor: 'Rajesh Kumar',
      price: 5999,
      lessons: [
        'Python for Data Science',
        'Data Analysis with Pandas',
        'Data Visualization',
        'Machine Learning Basics',
        'Supervised Learning',
        'Unsupervised Learning',
        'Deep Learning with TensorFlow',
        'Model Deployment'
      ]
    },
    '3': {
      title: 'UI/UX Design Masterclass',
      description: 'Design beautiful interfaces, create user experiences, and master Figma, Adobe XD, and design principles.',
      instructor: 'Anita Patel',
      price: 3999,
      lessons: [
        'Design Principles',
        'User Research',
        'Wireframing',
        'Prototyping',
        'Figma Basics',
        'Adobe XD',
        'Design Systems',
        'Portfolio Building'
      ]
    }
  };

  useEffect(() => {
    checkEnrollment();
    fetchCourse();
  }, [courseId, currentUser]);

  useEffect(() => {
    if (isEnrolled && courseId) {
      fetchLessons();
    }
  }, [isEnrolled, courseId]);


  const fetchCourse = async () => {
    try {
      setLoading(true);
      // Try to fetch from Firestore
      const courseDocRef = doc(db, 'courses', courseId);
      const courseDocSnap = await getDoc(courseDocRef);
      
      if (courseDocSnap.exists()) {
        const courseData = courseDocSnap.data();
        setCourse({
          id: courseDocSnap.id,
          ...courseData
        });
      } else {
        // Fallback to static data
        setCourse(staticCourseInfo[courseId] || {
          id: courseId,
          title: 'Course Not Found',
          description: 'The course you are looking for does not exist.',
          instructor: 'Unknown',
          price: 0,
          lessons: []
        });
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      // Fallback to static data
      setCourse(staticCourseInfo[courseId] || {
        id: courseId,
        title: 'Course Not Found',
        description: 'The course you are looking for does not exist.',
        instructor: 'Unknown',
        price: 0,
        lessons: []
      });
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!currentUser) return;

    try {
      // Check nested enrollment structure: enrollments/{courseId}/students/{studentId}
      const enrollmentDocRef = doc(db, 'enrollments', courseId, 'students', currentUser.uid);
      const enrollmentDocSnap = await getDoc(enrollmentDocRef);
      setIsEnrolled(enrollmentDocSnap.exists());
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const fetchLessons = async () => {
    if (!isEnrolled || !courseId) return;

    try {
      setLessonsLoading(true);
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
      
      setAllLessons(lessonsData);
      
      // Extract unique subjects
      const uniqueSubjects = [...new Set(lessonsData.map(lesson => lesson.subject).filter(Boolean))];
      setSubjects(uniqueSubjects);
      
      // If no subject selected yet, don't filter lessons
      if (!selectedSubject) {
        setLessons([]);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setAllLessons([]);
      setLessons([]);
    } finally {
      setLessonsLoading(false);
    }
  };

  // Filter lessons by subject and chapter
  useEffect(() => {
    if (!selectedSubject || allLessons.length === 0) {
      setLessons([]);
      setChapters([]);
      return;
    }

    // Filter lessons by subject
    const subjectLessons = allLessons.filter(lesson => lesson.subject === selectedSubject);
    
    // Extract unique chapters for selected subject
    const uniqueChapters = [...new Set(subjectLessons.map(lesson => lesson.chapter).filter(Boolean))];
    setChapters(uniqueChapters);

    // Auto-select chapter if only one exists
    if (uniqueChapters.length === 1 && !selectedChapter) {
      setSelectedChapter(uniqueChapters[0]);
      return; // Will re-run with selectedChapter set
    }

    // Filter by chapter if selected
    let filteredLessons = subjectLessons;
    if (selectedChapter) {
      filteredLessons = subjectLessons.filter(lesson => lesson.chapter === selectedChapter);
    }

    // Sort by order
    filteredLessons.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    setLessons(filteredLessons);

    // Auto-select first lesson if available and no lesson selected
    if (filteredLessons.length > 0 && !selectedLesson) {
      setSelectedLesson(filteredLessons[0]);
    }
  }, [selectedSubject, selectedChapter, allLessons, selectedLesson]);

  // Handle subject selection
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setSelectedChapter(null); // Reset chapter when subject changes
    setSelectedLesson(null); // Reset selected lesson
  };

  // Handle chapter selection
  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter);
    setSelectedLesson(null); // Reset selected lesson
  };

  // Extract YouTube videoId safely from various URL formats
  const extractYouTubeVideoId = (url) => {
    if (!url) return null;
    
    // youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([^&?#]+)/);
    if (watchMatch && watchMatch[1]) {
      return watchMatch[1];
    }
    
    // youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
    if (shortMatch && shortMatch[1]) {
      return shortMatch[1];
    }
    
    // youtube.com/embed/VIDEO_ID
    const embedMatch = url.match(/youtube\.com\/embed\/([^?&#]+)/);
    if (embedMatch && embedMatch[1]) {
      return embedMatch[1];
    }
    
    return null;
  };

  // Convert YouTube URLs to clean, distraction-free embed format
  const getEmbedUrl = (url, autoplay = false) => {
    if (!url) return '';
    
    // Extract YouTube videoId
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      // Use youtube-nocookie.com with clean parameters
      // rel=0: No related videos, modestbranding=1: Minimal logo, controls=1: Show controls
      // fs=0: No fullscreen, disablekb=1: Disable keyboard, iv_load_policy=3: Hide annotations
      const baseParams = 'rel=0&modestbranding=1&controls=1&fs=0&disablekb=1&iv_load_policy=3&playsinline=1';
      const autoplayParam = autoplay ? '&autoplay=1' : '';
      return `https://www.youtube-nocookie.com/embed/${videoId}?${baseParams}${autoplayParam}`;
    }
    
    // Vimeo URL handling (keep existing)
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    // Return as-is for other URLs
    return url;
  };

  const handleEnroll = async () => {
    // CRITICAL: Enrollment Guard - Block ALL enrollment actions until profile is loaded
    if (!currentUser) {
      setEnrollmentError('You must be logged in to enroll.');
      return;
    }

    if (!isProfileLoaded) {
      setEnrollmentError('Loading profile... Please wait.');
      return;
    }

    if (!userProfile) {
      setEnrollmentError('Profile not found. Please contact support.');
      return;
    }

    // STRICT: Role must be "student" from Firestore
    if (userProfile.role !== 'student') {
      setEnrollmentError('Only students can enroll in courses.');
      return;
    }

    if (isEnrolled || isEnrolling) {
      return;
    }

    try {
      setEnrollmentError('');
      setIsEnrolling(true);
      
      // Check if already enrolled (double-check)
      const enrollmentDocRef = doc(db, 'enrollments', courseId, 'students', currentUser.uid);
      const enrollmentDocSnap = await getDoc(enrollmentDocRef);
      
      if (enrollmentDocSnap.exists()) {
        setIsEnrolled(true);
        await fetchLessons();
        return;
      }
      
      // Validate userProfile has required fields from Firestore
      if (!userProfile.name || !userProfile.email) {
        throw new Error('User profile is incomplete. Missing name or email.');
      }
      
      // Simulate payment success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // STRICT: Write ONLY to enrollments/{courseId}/students/{user.uid}
      // Payload MUST match Firestore rules
      await setDoc(enrollmentDocRef, {
        studentId: currentUser.uid,
        studentName: userProfile.name,  // From Firestore userProfile
        studentEmail: userProfile.email, // From Firestore userProfile
        enrolledAt: serverTimestamp()
      });

      // Update UI state
      setIsEnrolled(true);
      setEnrollmentError('');
      
      // Fetch lessons after enrollment
      await fetchLessons();
      
    } catch (error) {
      console.error('Error enrolling in course:', error);
      console.error('Firebase error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Display exact Firestore error message (no generic alerts)
      let errorMessage = '';
      
      if (error.code === 'permission-denied') {
        errorMessage = `Permission denied: ${error.message || 'You do not have permission to enroll in this course.'}`;
      } else if (error.code === 'unavailable') {
        errorMessage = `Service unavailable: ${error.message || 'Firestore service is temporarily unavailable.'}`;
      } else if (error.code === 'failed-precondition') {
        errorMessage = `Precondition failed: ${error.message || 'Course enrollment is not available at this time.'}`;
      } else if (error.code === 'already-exists') {
        errorMessage = `Already enrolled: ${error.message || 'You are already enrolled in this course.'}`;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Failed to enroll. Please try again.';
      }
      
      setEnrollmentError(errorMessage);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
    // Smooth scroll to video on mobile
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Gradient colors for subject/chapter cards
  const gradients = [
    'from-indigo-500 via-purple-500 to-pink-500',
    'from-blue-500 via-cyan-500 to-teal-500',
    'from-green-500 via-emerald-500 to-teal-500',
    'from-orange-500 via-red-500 to-pink-500',
    'from-purple-500 via-pink-500 to-rose-500',
    'from-cyan-500 via-blue-500 to-indigo-500',
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <StudentNav />
      
      {/* Course Header - Modern Design */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{course?.title}</h1>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-gray-600">Instructor: <span className="font-semibold text-indigo-600">{course?.teacherName || course?.instructor || 'Unknown'}</span></p>
              </div>
            </div>
            
            {/* Price and Enroll Button - Only show if NOT enrolled */}
            {!isEnrolled && (
              <div className="flex flex-col items-end gap-3">
                {course?.price && (
                  <div className="text-right">
                    <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">₹{course.price}</p>
                  </div>
                )}
                <button
                  onClick={handleEnroll}
                  disabled={isEnrolling || !isProfileLoaded || !userProfile || userProfile?.role !== 'student'}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
                >
                  {isEnrolling ? 'Processing...' : !isProfileLoaded ? 'Loading...' : 'Enroll Now'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enrollment Error Message */}
        {enrollmentError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{enrollmentError}</span>
            </div>
          </div>
        )}

        {/* Not Enrolled State - Show Enroll CTA */}
        {!isEnrolled ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-12 md:p-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Enroll to Unlock Lessons</h2>
              <p className="text-gray-600 text-lg mb-8">{course?.description}</p>
            </div>
          </div>
        ) : (
          /* Enrolled State - Show Subject/Chapter Selection and Lessons */
          <>
            {/* Subject Selection - Show if no subject selected */}
            {!selectedSubject && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-8 mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Choose a Subject to Study</h2>
                {lessonsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading subjects...</p>
                  </div>
                ) : subjects.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">No subjects available yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject, index) => {
                      const gradient = gradients[index % gradients.length];
                      const firstLetter = subject.charAt(0).toUpperCase();
                      const lessonCount = allLessons.filter(l => l.subject === subject).length;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleSubjectSelect(subject)}
                          className="group relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-left"
                        >
                          {/* Gradient Header */}
                          <div className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>
                            <div className="absolute top-4 left-4">
                              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                                <span className="text-2xl font-bold text-white">{firstLetter}</span>
                              </div>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <h3 className="text-xl font-bold text-white drop-shadow-lg line-clamp-1">{subject}</h3>
                            </div>
                            <div className="absolute top-4 right-4">
                              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="p-5">
                            <div className="flex items-center gap-2 text-gray-600">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              <span className="text-sm font-medium">{lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}</span>
                            </div>
                          </div>
                          
                          {/* Hover Effect Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none rounded-2xl"></div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Chapter Selection - Show if subject selected, no chapter selected, and chapters exist */}
            {selectedSubject && !selectedChapter && chapters.length > 1 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose a Chapter</h2>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-800">
                        {selectedSubject}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSubject(null);
                      setSelectedChapter(null);
                    }}
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Change Subject
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {chapters.map((chapter, index) => {
                    const gradient = gradients[(index + 1) % gradients.length];
                    const firstLetter = chapter.charAt(0).toUpperCase();
                    const lessonCount = allLessons.filter(l => l.subject === selectedSubject && l.chapter === chapter).length;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleChapterSelect(chapter)}
                        className="group relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-left"
                      >
                        {/* Gradient Header */}
                        <div className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>
                          <div className="absolute top-4 left-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                              <span className="text-2xl font-bold text-white">{firstLetter}</span>
                            </div>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-xl font-bold text-white drop-shadow-lg line-clamp-1">{chapter}</h3>
                          </div>
                          <div className="absolute top-4 right-4">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-5">
                          <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-medium">{lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}</span>
                          </div>
                        </div>
                        
                        {/* Hover Effect Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none rounded-2xl"></div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lessons View - Show if subject (and optionally chapter) selected */}
            {selectedSubject && (
              <div className="flex flex-col lg:flex-row gap-6">
            {/* Video Player Section - 70% width on desktop */}
            <div className="flex-1 lg:w-[70%]">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                {selectedLesson ? (
                  <>
                    {/* Lesson Title */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h2 className="text-xl font-bold text-gray-900">{selectedLesson.title}</h2>
                    </div>
                    
                    {/* Custom Video Player - No YouTube UI */}
                    <CustomVideoPlayer
                      key={selectedLesson.id}
                      videoUrl={selectedLesson.videoUrl}
                      title={selectedLesson.title}
                      courseId={courseId}
                      lessonId={selectedLesson.id}
                    />
                    
                    {/* Lesson Description (if available) */}
                    {selectedLesson.description && (
                      <div className="px-6 py-4">
                        <p className="text-gray-700">{selectedLesson.description}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-600 font-medium">Select a lesson to start watching</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lesson List Section - 30% width on desktop */}
            <div className="lg:w-[30%]">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="px-4 py-4 bg-indigo-50 border-b border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-gray-900">Lessons</h2>
                    {(selectedSubject || selectedChapter) && (
                      <button
                        onClick={() => {
                          setSelectedSubject(null);
                          setSelectedChapter(null);
                          setSelectedLesson(null);
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        Change
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedSubject && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                        {selectedSubject}
                      </span>
                    )}
                    {selectedChapter && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {selectedChapter}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{lessons.length} lessons</p>
                </div>
                
                {lessonsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Loading lessons...</p>
                  </div>
                ) : !selectedSubject ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-600 text-sm">Please select a subject above to view lessons.</p>
                  </div>
                ) : lessons.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-600 text-sm">
                      {selectedChapter 
                        ? `No lessons available for ${selectedChapter}.`
                        : selectedSubject 
                        ? `Please select a chapter to view lessons.`
                        : 'No lessons available yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                    <div className="divide-y divide-gray-200">
                      {lessons.map((lesson, index) => {
                        const isActive = selectedLesson?.id === lesson.id;
                        
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleLessonClick(lesson)}
                            className={`w-full text-left p-4 transition-all duration-200 ${
                              isActive
                                ? 'bg-indigo-50 border-l-4 border-indigo-600'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Lesson Number */}
                              <div className="relative flex-shrink-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                  isActive
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {lesson.order || index + 1}
                                </div>
                              </div>
                              
                              {/* Lesson Title */}
                              <div className="flex-1 min-w-0">
                                {lesson.chapter && !selectedChapter && (
                                  <p className="text-xs text-blue-600 mb-1">{lesson.chapter}</p>
                                )}
                                <p className={`font-medium text-sm ${
                                  isActive ? 'text-indigo-900' : 'text-gray-900'
                                }`}>
                                  {lesson.title}
                                </p>
                                {isActive && (
                                  <p className="text-xs text-indigo-600 mt-1">Currently playing</p>
                                )}
                              </div>
                              
                              {/* Active Indicator */}
                              {isActive && (
                                <div className="flex-shrink-0">
                                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentCourseDetail;
