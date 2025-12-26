import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

const TeacherNav = () => {
  const location = useLocation();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef(null);
  const linksRef = useRef([]);

  const navItems = [
    { path: '/teacher', label: 'Home' },
    { path: '/teacher/create-course', label: 'Create Course' },
    { path: '/teacher/courses', label: 'My Courses' },
    { path: '/teacher/profile', label: 'Profile' }
  ];

  useEffect(() => {
    const updateIndicator = () => {
      const activeIndex = navItems.findIndex(item => {
        if (item.path === '/teacher') {
          return location.pathname === '/teacher';
        }
        return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
      });
      
      if (activeIndex !== -1 && linksRef.current[activeIndex]) {
        const activeLink = linksRef.current[activeIndex];
        const nav = navRef.current;
        if (nav && activeLink) {
          const navRect = nav.getBoundingClientRect();
          const linkRect = activeLink.getBoundingClientRect();
          setIndicatorStyle({
            left: linkRect.left - navRect.left,
            width: linkRect.offsetWidth
          });
        }
      } else {
        setIndicatorStyle({ left: 0, width: 0 });
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [location.pathname]);

  return (
    <nav className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/teacher"
            className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200"
          >
            The GuruJI Classes
          </Link>

          {/* Navigation Links */}
          <div 
            ref={navRef}
            className="relative flex items-center space-x-1 bg-gray-800/50 rounded-full p-1.5 backdrop-blur-sm border border-gray-700/50"
          >
            {/* Tubelight Indicator */}
            <div
              className="absolute h-9 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out shadow-lg shadow-indigo-500/50"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.width > 0 ? 1 : 0
              }}
            />
            
            {/* Navigation Items */}
            {navItems.map((item, index) => {
              const isActive = item.path === '/teacher' 
                ? location.pathname === '/teacher'
                : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  ref={(el) => (linksRef.current[index] = el)}
                  to={item.path}
                  className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Subtle glow effect at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
    </nav>
  );
};

export default TeacherNav;


