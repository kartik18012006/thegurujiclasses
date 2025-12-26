import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../context/AuthContext';
import { APP_CONFIG } from '../../config/appConfig';
import TeacherNav from '../../components/TeacherNav';

// Share Course Button Component
const ShareCourseButton = ({ courseId, courseTitle }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${APP_CONFIG.BASE_URL}/course/${courseId}`;
  
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
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowShareMenu(!showShareMenu);
        }}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </button>

      {showShareMenu && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowShareMenu(false)}
          ></div>
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-20">
            <div className="p-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCopyLink();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              {navigator.share && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share via...
                </button>
              )}
            </div>
            <div className="border-t border-gray-200 p-2">
              {isLocalhost ? (
                <div className="px-4 py-2 text-xs text-yellow-700 bg-yellow-50 rounded-lg">
                  ⚠️ This link uses localhost and won't work for others.
                  <br />
                  Configure PRODUCTION_URL in src/config/appConfig.js
                </div>
              ) : (
                <div className="px-4 py-2 text-xs text-gray-500 break-all bg-gray-50 rounded-lg">
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

const TeacherCourses = () => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchCourses();
    }
  }, [currentUser]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      const coursesRef = collection(db, 'courses');
      const coursesQuery = query(coursesRef, where('teacherId', '==', currentUser.uid));
      const coursesSnapshot = await getDocs(coursesQuery);

      const coursesWithCounts = await Promise.all(
        coursesSnapshot.docs.map(async (courseDoc) => {
          const courseData = courseDoc.data();
          const courseId = courseDoc.id;

          const studentsRef = collection(db, 'enrollments', courseId, 'students');
          const studentsSnapshot = await getDocs(studentsRef);
          const enrolledCount = studentsSnapshot.size;

          return {
            id: courseId,
            ...courseData,
            enrolledCount
          };
        })
      );

      setCourses(coursesWithCounts);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Gradient colors for cards
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
        <TeacherNav />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <TeacherNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">My Courses</h1>
          <p className="text-xl text-gray-600">Manage and share your courses</p>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">No courses yet</h2>
            <p className="text-gray-600 text-lg mb-8">Get started by creating your first course</p>
            <Link
              to="/teacher/create-course"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => {
              const gradient = gradients[index % gradients.length];
              const firstLetter = course.title?.charAt(0)?.toUpperCase() || 'C';
              
              return (
                <div
                  key={course.id}
                  className="group relative bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  {/* Gradient Header */}
                  <div className={`h-48 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>
                    <div className="absolute top-6 left-6">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                        <span className="text-3xl font-bold text-white">{firstLetter}</span>
                      </div>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2 drop-shadow-lg">
                        {course.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 min-h-[3.75rem]">
                      {course.description || 'No description available'}
                    </p>

                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                      {course.price && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Price</p>
                          <p className="text-2xl font-bold text-indigo-600">₹{course.price}</p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Enrolled Students</p>
                        <p className="text-2xl font-bold text-indigo-600">{course.enrolledCount || 0}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Link
                        to={`/teacher/course/${course.id}`}
                        className={`w-full bg-gradient-to-r ${gradient} text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 text-center`}
                      >
                        Manage Course
                      </Link>
                      <ShareCourseButton courseId={course.id} courseTitle={course.title} />
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none rounded-3xl"></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCourses;
