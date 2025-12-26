import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserProfile({
            uid: userData.uid || currentUser.uid,
            name: userData.name || '',
            email: userData.email || currentUser.email,
            role: userData.role, // Required field - no fallback
            createdAt: userData.createdAt
          });
        } else {
          // User document doesn't exist - profile setup incomplete
          console.error('User profile not found in Firestore');
          setUserProfile(null);
          // Force logout if profile is missing
          await logout();
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile(null);
        // Force logout on error
        await logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser, logout]);

  const value = {
    userProfile,
    loading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
