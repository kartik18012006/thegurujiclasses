import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../context/AuthContext';
import TeacherNav from '../../components/TeacherNav';

// Generate avatar URL from email/name
const getAvatarUrl = (name, size = 128) => {
  if (!name) return '';
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=6366f1&color=fff&bold=true`;
};

const TeacherProfile = () => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    coachingName: ''
  });
  const [profilePhoto, setProfilePhoto] = useState('');
  const [totalStudents, setTotalStudents] = useState(0);
  const [studentsList, setStudentsList] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (currentUser && userProfile) {
      loadProfile();
      loadStudents();
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
          coachingName: data.coachingName || data.school || ''
        });
        // Generate profile photo from email
        if (userProfile.email) {
          const avatarUrl = getAvatarUrl(data.name || userProfile.email);
          setProfilePhoto(avatarUrl);
        }
      } else {
        setFormData({
          name: userProfile.name || '',
          coachingName: ''
        });
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

  const loadStudents = async () => {
    if (!currentUser) return;

    try {
      // Get all courses created by this teacher
      const coursesRef = collection(db, 'courses');
      const coursesQuery = collection(db, 'courses');
      const coursesSnapshot = await getDocs(coursesQuery);
      
      const allStudents = new Map(); // Use Map to avoid duplicates
      let totalCount = 0;

      for (const courseDoc of coursesSnapshot.docs) {
        const courseData = courseDoc.data();
        if (courseData.teacherId === currentUser.uid) {
          const courseId = courseDoc.id;
          const studentsRef = collection(db, 'enrollments', courseId, 'students');
          const studentsSnapshot = await getDocs(studentsRef);
          
          studentsSnapshot.docs.forEach(studentDoc => {
            const studentData = studentDoc.data();
            const studentId = studentDoc.id;
            
            // Only add if not already in map (avoid duplicates across courses)
            if (!allStudents.has(studentId)) {
              allStudents.set(studentId, {
                id: studentId,
                name: studentData.studentName || 'Unknown Student',
                email: studentData.studentEmail || 'No email'
              });
              totalCount++;
            }
          });
        }
      }

      setTotalStudents(totalCount);
      setStudentsList(Array.from(allStudents.values()));
    } catch (error) {
      console.error('Error loading students:', error);
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
        coachingName: formData.coachingName,
        profilePhoto: photoURL,
        updatedAt: new Date()
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
        <TeacherNav />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <TeacherNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">My Profile</h1>
          <p className="text-xl text-gray-600">Manage your profile information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Information Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-8 md:p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Photo */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-200 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      {profilePhoto ? (
                        <img 
                          src={profilePhoto} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span 
                        className="text-4xl font-bold text-white"
                        style={{ display: profilePhoto ? 'none' : 'flex' }}
                      >
                        {formData.name?.charAt(0)?.toUpperCase() || userProfile?.email?.charAt(0)?.toUpperCase() || 'T'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teacher Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Coaching Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Coaching / Institution Name
                  </label>
                  <input
                    type="text"
                    name="coachingName"
                    value={formData.coachingName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Enter your coaching or institution name"
                  />
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
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Students Stats */}
          <div className="space-y-8">
            {/* Total Students Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
              <p className="text-4xl font-bold text-gray-900">{totalStudents}</p>
              <p className="text-xs text-gray-500 mt-2">Enrolled across all courses</p>
            </div>

            {/* Students List Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">All Students</h3>
              {studentsList.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-600 text-sm">No students enrolled yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {studentsList.map((student) => (
                    <div
                      key={student.id}
                      className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {student.name?.charAt(0)?.toUpperCase() || 'S'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{student.name}</p>
                          <p className="text-sm text-gray-600 truncate">{student.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;


