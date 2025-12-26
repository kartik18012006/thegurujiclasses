import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

/**
 * Role-Based Protected Route
 * 
 * Ensures:
 * - User is authenticated
 * - User has required role
 * - Redirects to appropriate dashboard if role mismatch
 * - Shows "Access Denied" if profile is missing
 */
const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser } = useAuth();
  const { userProfile, loading } = useUser();

  // If not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Wait for user profile to load
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user profile doesn't exist - profile setup incomplete
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h2 className="text-xl font-bold text-red-900 mb-2">Access Denied</h2>
            <p className="text-red-700 mb-4">Profile setup incomplete. Please contact support.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user role is in allowed roles
  if (!allowedRoles.includes(userProfile.role)) {
    // Redirect based on role
    if (userProfile.role === 'teacher' || userProfile.role === 'admin') {
      return <Navigate to="/teacher" replace />;
    }
    if (userProfile.role === 'student') {
      return <Navigate to="/student" replace />;
    }
    // Unknown role - redirect to login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
