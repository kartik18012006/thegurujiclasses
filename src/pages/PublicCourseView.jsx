import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/**
 * Public Course View Page
 * Anyone can view course details, but only students can enroll
 */
const PublicCourseView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const courseDocRef = doc(db, 'courses', courseId);
      const courseDocSnap = await getDoc(courseDocRef);
      
      if (courseDocSnap.exists()) {
        setCourse({
          id: courseDocSnap.id,
          ...courseDocSnap.data()
        });
      } else {
        setError('Course not found');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = () => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { redirectTo: `/student/course/${courseId}` } });
      return;
    }

    if (userProfile?.role !== 'student') {
      alert('Only students can enroll in courses');
      return;
    }

    // Redirect to student course detail page for enrollment
    navigate(`/student/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Course Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The course you are looking for does not exist.'}</p>
            <Link
              to="/"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <p className="text-indigo-600 font-medium mb-3">
                Instructor: {course.teacherName || course.instructor || 'Unknown'}
              </p>
              {course.description && (
                <p className="text-gray-600 mb-4">{course.description}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-4">
              {course.price && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-3xl font-bold text-indigo-600">₹{course.price}</p>
                </div>
              )}
              <button
                onClick={handleEnrollClick}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition text-lg"
              >
                {currentUser && userProfile?.role === 'student' 
                  ? 'Enroll Now' 
                  : currentUser 
                  ? 'View as Student' 
                  : 'Login to Enroll'}
              </button>
            </div>
          </div>
        </div>

        {/* Course Info */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
          {course.description ? (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{course.description}</p>
          ) : (
            <p className="text-gray-500">No description available for this course.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PublicCourseView;


