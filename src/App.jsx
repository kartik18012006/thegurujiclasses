import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { ProgressProvider } from './context/ProgressContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import AppLayout from './layouts/AppLayout';
import Landing from './pages/Landing';
import About from './pages/About';
import Courses from './pages/Courses';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AppHome from './pages/AppHome';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import TestAdmin from './pages/TestAdmin';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherCourses from './pages/teacher/TeacherCourses';
import TeacherCourseDetail from './pages/teacher/TeacherCourseDetail';
import TeacherCourseStudents from './pages/teacher/TeacherCourseStudents';
import CreateCourse from './pages/teacher/CreateCourse';
import TeacherProfile from './pages/teacher/TeacherProfile';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';
import StudentCourseDetail from './pages/student/StudentCourseDetail';
import StudentExploreCourses from './pages/student/StudentExploreCourses';
import StudentProfile from './pages/student/StudentProfile';
import PublicCourseView from './pages/PublicCourseView';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <ProgressProvider>
          <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/about" element={<About />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/course/:courseId" element={<PublicCourseView />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AppHome />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                {/* Test route for admin role (temporary) */}
                <Route
                  path="/test-admin"
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <TestAdmin />
                    </RoleProtectedRoute>
                  }
                />
                {/* Teacher routes */}
                <Route
                  path="/teacher"
                  element={
                    <RoleProtectedRoute allowedRoles={['teacher', 'admin']}>
                      <TeacherDashboard />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/courses"
                  element={
                    <RoleProtectedRoute allowedRoles={['teacher', 'admin']}>
                      <TeacherCourses />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/create-course"
                  element={
                    <RoleProtectedRoute allowedRoles={['teacher', 'admin']}>
                      <CreateCourse />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/course/:courseId"
                  element={
                    <RoleProtectedRoute allowedRoles={['teacher', 'admin']}>
                      <TeacherCourseDetail />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/course/:courseId/students"
                  element={
                    <RoleProtectedRoute allowedRoles={['teacher', 'admin']}>
                      <TeacherCourseStudents />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/profile"
                  element={
                    <RoleProtectedRoute allowedRoles={['teacher', 'admin']}>
                      <TeacherProfile />
                    </RoleProtectedRoute>
                  }
                />
                {/* Student routes */}
                <Route
                  path="/student"
                  element={
                    <RoleProtectedRoute allowedRoles={['student']}>
                      <StudentDashboard />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/student/courses"
                  element={
                    <RoleProtectedRoute allowedRoles={['student']}>
                      <StudentCourses />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/student/explore"
                  element={
                    <RoleProtectedRoute allowedRoles={['student']}>
                      <StudentExploreCourses />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/student/course/:courseId"
                  element={
                    <RoleProtectedRoute allowedRoles={['student']}>
                      <StudentCourseDetail />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/student/profile"
                  element={
                    <RoleProtectedRoute allowedRoles={['student']}>
                      <StudentProfile />
                    </RoleProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
        </ProgressProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
