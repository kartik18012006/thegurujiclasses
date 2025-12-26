import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { userProfile } = useUser();
  const location = useLocation();
  const isInApp = location.pathname.startsWith('/app');
  const isInTeacher = location.pathname.startsWith('/teacher');
  const isInStudent = location.pathname.startsWith('/student');
  const isLandingPage = location.pathname === '/';
  const isSignupPage = location.pathname === '/signup';
  const isLoginPage = location.pathname === '/login';
  const isPrivacyPolicyPage = location.pathname === '/privacy-policy';
  const isTermsOfServicePage = location.pathname === '/terms-of-service';
  const isPublicPage = isLandingPage || isSignupPage || isLoginPage || isPrivacyPolicyPage || isTermsOfServicePage;
  
  // Hide main navbar when inside /app, /teacher, or /student (they have their own navs)
  if (isInApp || isInTeacher || isInStudent) {
    return null;
  }
  
  const isTeacherOrAdmin = userProfile?.role === 'teacher' || userProfile?.role === 'admin';
  const isStudent = userProfile?.role === 'student';

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-indigo-600">The GuruJI Classes</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-indigo-600 transition"
            >
              Home
            </Link>
            {currentUser && !isPublicPage ? (
              <>
                {/* Show role-specific dashboard links - but NOT on public pages */}
                {isStudent && (
                  <Link
                    to="/student"
                    className="text-gray-700 hover:text-indigo-600 transition"
                  >
                    Student Dashboard
                  </Link>
                )}
                {isTeacherOrAdmin && (
                  <Link
                    to="/teacher"
                    className="text-gray-700 hover:text-indigo-600 transition"
                  >
                    Teacher Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
