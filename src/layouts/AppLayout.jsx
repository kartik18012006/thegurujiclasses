import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

const AppLayout = () => {
  const { logout } = useAuth();
  const { userProfile } = useUser();
  const navigate = useNavigate();
  
  const isTeacherOrAdmin = userProfile?.role === 'teacher' || userProfile?.role === 'admin';
  const isStudent = userProfile?.role === 'student';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/app" className="text-xl font-bold text-indigo-600">
                The GuruJI Classes
              </Link>
              <div className="flex items-center space-x-6">
                <Link
                  to="/app"
                  className="text-gray-700 hover:text-indigo-600 transition font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/app/profile"
                  className="text-gray-700 hover:text-indigo-600 transition font-medium"
                >
                  Profile
                </Link>
                <Link
                  to="/app/settings"
                  className="text-gray-700 hover:text-indigo-600 transition font-medium"
                >
                  Settings
                </Link>
                {isStudent && (
                  <Link
                    to="/student"
                    className="text-gray-700 hover:text-indigo-600 transition font-medium"
                  >
                    Student Dashboard
                  </Link>
                )}
                {isTeacherOrAdmin && (
                  <Link
                    to="/teacher"
                    className="text-gray-700 hover:text-indigo-600 transition font-medium"
                  >
                    Teacher Dashboard
                  </Link>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;

