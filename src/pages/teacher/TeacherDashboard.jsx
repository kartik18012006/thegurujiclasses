import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../context/AuthContext';
import TeacherNav from '../../components/TeacherNav';

const TeacherDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalLessons: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadStats();
    }
  }, [currentUser]);

  const loadStats = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      const coursesRef = collection(db, 'courses');
      const coursesQuery = query(coursesRef, where('teacherId', '==', currentUser.uid));
      const coursesSnapshot = await getDocs(coursesQuery);
      
      let totalStudents = 0;
      let totalLessons = 0;
      const coursesList = [];
      
      for (const courseDoc of coursesSnapshot.docs) {
        const courseId = courseDoc.id;
        const courseData = courseDoc.data();
        
        // Count students enrolled
        const studentsRef = collection(db, 'enrollments', courseId, 'students');
        const studentsSnapshot = await getDocs(studentsRef);
        const studentCount = studentsSnapshot.size;
        totalStudents += studentCount;
        
        // Count lessons
        const lessonsRef = collection(db, 'lessons');
        const lessonsQuery = query(lessonsRef, where('courseId', '==', courseId));
        const lessonsSnapshot = await getDocs(lessonsQuery);
        const lessonCount = lessonsSnapshot.size;
        totalLessons += lessonCount;
        
        coursesList.push({
          id: courseId,
          ...courseData,
          studentCount,
          lessonCount
        });
      }
      
      setStats({
        totalCourses: coursesSnapshot.size,
        totalStudents,
        totalLessons
      });
      
      setRecentCourses(coursesList.slice(0, 3));
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <TeacherNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <TeacherNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back{userProfile?.name ? `, ${userProfile.name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-gray-600">Manage your courses and students</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Large Hero Card - Create Course */}
          <Link
            to="/teacher/create-course"
            className="group relative md:col-span-2 lg:col-span-2 md:row-span-2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 overflow-hidden hover:scale-[1.02] transition-all duration-300 shadow-xl"
          >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Create New Course</h2>
                <p className="text-white/90 text-lg">Start teaching and share your knowledge with students</p>
              </div>
              <div className="flex items-center text-white mt-6 group-hover:translate-x-2 transition-transform">
                <span className="font-semibold">Create course</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          </Link>

          {/* Stats Card 1 - Total Courses */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Courses</p>
            <p className="text-4xl font-bold text-gray-900">{stats.totalCourses}</p>
            <p className="text-xs text-gray-500 mt-2">Active courses</p>
          </div>

          {/* Stats Card 2 - Total Students */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
            <p className="text-4xl font-bold text-gray-900">{stats.totalStudents}</p>
            <p className="text-xs text-gray-500 mt-2">Enrolled students</p>
          </div>

          {/* My Courses Card */}
          <Link
            to="/teacher/courses"
            className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">My Courses</h3>
            <p className="text-gray-600 text-sm mb-4">Manage and edit your courses</p>
            {stats.totalCourses > 0 && (
              <div className="flex items-center text-blue-600 font-semibold text-sm">
                <span>{stats.totalCourses} course{stats.totalCourses !== 1 ? 's' : ''} created</span>
              </div>
            )}
          </Link>

          {/* Total Lessons Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl p-6 shadow-xl text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-white/90 mb-1">Total Lessons</p>
            <p className="text-4xl font-bold mb-2">{stats.totalLessons}</p>
            <p className="text-xs text-white/80 mt-2">Across all courses</p>
          </div>

          {/* Recent Courses Card */}
          {recentCourses.length > 0 && (
            <div className="md:col-span-2 lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Recent Courses</h3>
                <Link to="/teacher/courses" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {recentCourses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/teacher/course/${course.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {course.title?.charAt(0) || 'C'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {course.title || 'Untitled Course'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {course.studentCount || 0} students • {course.lessonCount || 0} lessons
                        </p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Action Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/teacher/create-course"
                className="flex items-center space-x-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900 group-hover:text-blue-600">Create New Course</span>
              </Link>
              <Link
                to="/teacher/courses"
                className="flex items-center space-x-3 p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900 group-hover:text-indigo-600">Manage Courses</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
