import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../context/AuthContext';
import { getCourseStudentsProgress, formatWatchTime } from '../../services/progressService';
import TeacherNav from '../../components/TeacherNav';

const TeacherCourseStudents = () => {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser && courseId) {
      fetchCourse();
      fetchEnrolledStudents();
    }
  }, [courseId, currentUser]);

  const fetchCourse = async () => {
    try {
      const courseDocRef = doc(db, 'courses', courseId);
      const courseDocSnap = await getDoc(courseDocRef);
      
      if (courseDocSnap.exists()) {
        const courseData = courseDocSnap.data();
        // Security check: Ensure user is the course owner
        if (courseData.teacherId !== currentUser.uid) {
          setError('You do not have permission to view students for this course.');
          return;
        }
        setCourse({
          id: courseDocSnap.id,
          ...courseData
        });
      } else {
        setError('Course not found.');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course.');
    }
  };

  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true);
      setError('');

      // Get students with progress using the service
      const studentsWithProgress = await getCourseStudentsProgress(courseId);
      
      // Get total lessons count for progress calculation
      const lessonsRef = collection(db, 'lessons');
      const lessonsQuery = query(lessonsRef, where('courseId', '==', courseId));
      const lessonsSnapshot = await getDocs(lessonsQuery);
      const totalLessons = lessonsSnapshot.size;

      // Enhance students data with progress
      const studentsData = studentsWithProgress.map((student) => {
        const progressPercentage = totalLessons > 0 
          ? Math.round((student.completedLessons / totalLessons) * 100)
          : 0;
        
        return {
          id: student.studentId,
          name: student.studentName,
          email: student.studentEmail,
          enrolledAt: student.enrolledAt,
          completedLessons: student.completedLessons,
          totalLessons: totalLessons,
          progressPercentage: progressPercentage,
          totalWatchTime: student.totalWatchTime
        };
      });

      // Sort by enrollment date (newest first)
      studentsData.sort((a, b) => {
        if (!a.enrolledAt || !b.enrolledAt) return 0;
        try {
          return b.enrolledAt.toMillis() - a.enrolledAt.toMillis();
        } catch (error) {
          return 0;
        }
      });
      
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      setError('Failed to load enrolled students.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
        <TeacherNav />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
        <TeacherNav />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
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
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/teacher/course/${courseId}`}
            className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block"
          >
            ← Back to Course
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Enrolled Students
          </h1>
          {course && (
            <p className="text-gray-600">
              {course.title}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Students List */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-200">
            <h2 className="text-xl font-bold text-gray-900">
              Total Enrolled: {students.length}
            </h2>
          </div>

          {students.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No students enrolled yet
              </h2>
              <p className="text-gray-600">
                Students will appear here once they enroll in your course.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Watch Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollment Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold text-sm">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-[100px]">
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  student.progressPercentage === 100 ? 'bg-green-500' : 'bg-indigo-500'
                                }`}
                                style={{ width: `${student.progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-900 min-w-[50px]">
                            {student.progressPercentage}%
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {student.completedLessons} / {student.totalLessons} lessons
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatWatchTime(student.totalWatchTime || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(student.enrolledAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mobile-friendly card view (hidden on desktop) */}
        <div className="mt-6 md:hidden">
          {students.length > 0 && (
            <div className="space-y-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="bg-white rounded-lg shadow-md border border-gray-200 p-4"
                >
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold text-sm">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.email}
                      </div>
                    </div>
                  </div>
                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">Progress</span>
                      <span className="text-xs font-bold text-indigo-600">{student.progressPercentage || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          (student.progressPercentage || 0) === 100 ? 'bg-green-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${student.progressPercentage || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {student.completedLessons || 0} / {student.totalLessons || 0} lessons • {formatWatchTime(student.totalWatchTime || 0)}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    Enrolled: {formatDate(student.enrolledAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherCourseStudents;
