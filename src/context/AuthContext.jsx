import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from "../firebase/firebase";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  // Fetch user profile from Firestore
  // STRICT: Profile MUST exist in Firestore - force logout if missing
  const fetchUserProfile = async (uid) => {
    try {
      setIsProfileLoaded(false);
      setProfileError(null);
      
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        // STRICT: Role must exist and be valid - no fallback
        if (!userData.role || (userData.role !== 'student' && userData.role !== 'teacher')) {
          console.error('CRITICAL: User profile missing valid role in Firestore for uid:', uid, 'role:', userData.role);
          setUserProfile(null);
          setProfileError('Profile not initialized: Invalid role');
          // Force logout if role is invalid
          await logout();
          setIsProfileLoaded(true);
          return;
        }
        
        // Validate required fields
        if (!userData.name || !userData.email) {
          console.error('CRITICAL: User profile missing required fields for uid:', uid);
          setUserProfile(null);
          setProfileError('Profile not initialized: Missing required fields');
          await logout();
          setIsProfileLoaded(true);
          return;
        }
        
        setUserProfile({
          uid: userData.uid || uid,
          name: userData.name,
          email: userData.email,
          role: userData.role // STRICT: Only from Firestore, no fallback
        });
        setProfileError(null);
      } else {
        // CRITICAL: User document doesn't exist - force logout
        console.error('CRITICAL: User profile not found in Firestore for uid:', uid);
        setUserProfile(null);
        setProfileError('Profile not initialized');
        // Force logout if profile doesn't exist
        await logout();
      }
    } catch (error) {
      console.error('CRITICAL: Error fetching user profile:', error);
      setUserProfile(null);
      setProfileError('Profile not initialized: ' + (error.message || 'Unknown error'));
      // Force logout on error
      try {
        await logout();
      } catch (logoutError) {
        console.error('Error during logout after profile fetch failure:', logoutError);
      }
    } finally {
      setIsProfileLoaded(true);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsProfileLoaded(false);
      setProfileError(null);
      
      if (user) {
        // Fetch user profile when user is logged in
        // STRICT: Profile MUST exist or user will be logged out
        await fetchUserProfile(user.uid);
      } else {
        // Clear profile when user logs out
        setUserProfile(null);
        setProfileError(null);
        setIsProfileLoaded(true);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    isProfileLoaded,
    profileError,
    signup,
    login,
    logout,
    refreshUserProfile: () => currentUser && fetchUserProfile(currentUser.uid)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
