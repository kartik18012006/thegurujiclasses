import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(''); // 'teacher' or 'student'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate name
    if (!name.trim()) {
      return setError('Please enter your full name');
    }

    // Validate role selection
    if (!role) {
      return setError('Please select a role (Teacher or Student)');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    let userCredential = null;

    try {
      setError('');
      setLoading(true);
      
      // Step 1: Create Firebase Auth account
      userCredential = await signup(email, password);
      const uid = userCredential.user.uid;
      const userEmail = userCredential.user.email; // Use email from Firebase Auth
      
      // Step 2: IMMEDIATELY create Firestore document
      // MANDATORY: Block app access if this fails
      // Structure must match: { name, email, role, createdAt }
      try {
        await setDoc(doc(db, 'users', uid), {
          name: name.trim(), // Full Name (required)
          email: userEmail, // From Firebase Auth user object
          role: role, // "student" | "teacher" (required)
          createdAt: serverTimestamp()
        });
      } catch (firestoreError) {
        console.error('CRITICAL: Failed to create user profile in Firestore:', firestoreError);
        console.error('Firestore error details:', {
          code: firestoreError.code,
          message: firestoreError.message
        });
        
        // CRITICAL: If Firestore write fails, logout and block access
        try {
          await logout();
        } catch (logoutError) {
          console.error('Error during logout after profile creation failure:', logoutError);
        }
        
        // Show exact Firestore error
        const errorMsg = firestoreError.message || 'Failed to create user profile';
        throw new Error(`Profile creation failed: ${errorMsg}. Please try again.`);
      }
      
      // Step 3: Redirect based on role (only if profile creation succeeded)
      if (role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err) {
      // Show exact error message
      const errorMessage = err.message || 'Failed to create an account. Please try again.';
      setError(errorMessage);
      console.error('Signup error:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-2">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Your Role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`p-4 border-2 rounded-lg transition ${
                  role === 'teacher'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold mb-1">Teacher</div>
                  <div className="text-xs text-gray-500">Create and manage courses</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`p-4 border-2 rounded-lg transition ${
                  role === 'student'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold mb-1">Student</div>
                  <div className="text-xs text-gray-500">Enroll and learn</div>
                </div>
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              This selection cannot be changed later
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !name.trim() || !role}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
