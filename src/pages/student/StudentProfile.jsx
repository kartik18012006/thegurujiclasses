import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../context/AuthContext';
import StudentNav from '../../components/StudentNav';

// Generate Gravatar URL from email
const getGravatarUrl = (email, size = 128) => {
  if (!email) return '';
  // Create MD5 hash of email (simplified - in production, use crypto library)
  // For now, we'll use Gravatar's default image service
  const emailHash = email.toLowerCase().trim();
  return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=identicon`;
};

// Alternative: Use UI Avatars service (simpler, no hash needed)
const getAvatarUrl = (name, size = 128) => {
  if (!name) return '';
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=3b82f6&color=fff&bold=true`;
};

const StudentProfile = () => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    school: '',
    gender: ''
  });
  const [profilePhoto, setProfilePhoto] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (currentUser && userProfile) {
      loadProfile();
      // Generate profile photo from email
      if (userProfile.email) {
        const avatarUrl = getAvatarUrl(userProfile.name || userProfile.email);
        setProfilePhoto(avatarUrl);
      }
    }
  }, [currentUser, userProfile]);

  const loadProfile = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setFormData({
          name: data.name || '',
          class: data.class || '',
          school: data.school || data.college || '',
          gender: data.gender || ''
        });
        // Generate profile photo from email if not already set
        if (userProfile.email) {
          const avatarUrl = getAvatarUrl(data.name || userProfile.email);
          setProfilePhoto(avatarUrl);
        }
      } else {
        // Initialize with userProfile data
        setFormData({
          name: userProfile.name || '',
          class: '',
          school: '',
          gender: ''
        });
        // Generate profile photo from email
        if (userProfile.email) {
          const avatarUrl = getAvatarUrl(userProfile.name || userProfile.email);
          setProfilePhoto(avatarUrl);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update profile photo when name changes
    if (name === 'name' && userProfile?.email) {
      const avatarUrl = getAvatarUrl(value || userProfile.email);
      setProfilePhoto(avatarUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setMessage({ type: 'error', text: 'You must be logged in to update your profile' });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      // Generate profile photo URL from email
      const photoURL = userProfile?.email ? getAvatarUrl(formData.name || userProfile.email) : '';

      // Update Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        name: formData.name,
        class: formData.class,
        school: formData.school,
        gender: formData.gender,
        profilePhoto: photoURL,
        updatedAt: new Date()
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Refresh user profile after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: `Failed to update profile: ${error.message || 'Please try again.'}` });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <StudentNav />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <StudentNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">My Profile</h1>
          <p className="text-xl text-gray-600">Manage your profile information</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  {profilePhoto ? (
                    <img 
                      src={profilePhoto} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span 
                    className="text-4xl font-bold text-white"
                    style={{ display: profilePhoto ? 'none' : 'flex' }}
                  >
                    {formData.name?.charAt(0)?.toUpperCase() || userProfile?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter your full name"
              />
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Class / Grade
              </label>
              <input
                type="text"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="e.g., 10th, 12th, B.Tech 2nd Year"
              />
            </div>

            {/* School/College */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                School / College Name
              </label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter your school or college name"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-4">
                {['Male', 'Female', 'Other'].map((option) => (
                  <label
                    key={option}
                    className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.gender === option
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={option}
                      checked={formData.gender === option}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <span className="font-medium">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={userProfile?.email || ''}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`p-4 rounded-xl ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {message.type === 'success' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{message.text}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

