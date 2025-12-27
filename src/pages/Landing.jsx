import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

const Landing = () => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const rafId = useRef(null);
  const lastUpdateTime = useRef(0);
  const isOverInteractive = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isOverInteractive.current) {
        return;
      }

      const now = Date.now();
      if (now - lastUpdateTime.current < 32) {
        return;
      }
      lastUpdateTime.current = now;

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        setMousePosition({
          x: (e.clientX / window.innerWidth) * 100,
          y: (e.clientY / window.innerHeight) * 100,
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-900 overflow-hidden relative">
      {/* Animated Background Gradient */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.08), transparent 70%)`,
          willChange: 'background',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto relative w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-blue-200 shadow-sm mb-6 animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span className="text-sm text-gray-700 font-medium">Welcome to The GuruJI Classes</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="block text-gray-900 mb-2">Transform Your</span>
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Learning Journey
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                learn from your own GuruJi
              </p>

              {/* CTA Button */}
              <div className="flex items-center justify-center lg:justify-start mb-8">
                <Link
                  to="/signup"
                  onMouseEnter={() => { isOverInteractive.current = true; }}
                  onMouseLeave={() => { isOverInteractive.current = false; }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full font-semibold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  <span className="relative z-10 flex items-center gap-2 pointer-events-none">
                    Get Started Free
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </Link>
              </div>
            </div>

            {/* Right Column - Minimalist Line Icons */}
            <div className="relative h-[600px] hidden lg:block">
              {/* Book Icon - Top Right */}
              <div className="absolute top-10 right-20 w-32 h-32 flex items-center justify-center animate-float">
                <svg className="w-full h-full text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>

              {/* Chart Icon - Middle Right */}
              <div className="absolute top-32 right-32 w-28 h-28 flex items-center justify-center animate-float">
                <svg className="w-full h-full text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>

              {/* Graduation Cap Icon - Center Left */}
              <div className="absolute top-1/2 left-10 -translate-y-1/2 w-24 h-24 flex items-center justify-center animate-float-delay">
                <svg className="w-full h-full text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 0L3 3m0 0l3 3M3 3h12.75M12 3v12.75" />
                </svg>
              </div>

              {/* Shield/Target Icon - Bottom Right */}
              <div className="absolute bottom-20 right-10 w-24 h-24 flex items-center justify-center animate-float-delay-2">
                <svg className="w-full h-full text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>

              {/* Lightbulb Icon - Bottom Left */}
              <div className="absolute bottom-10 left-16 w-20 h-20 flex items-center justify-center animate-float-delay-2">
                <svg className="w-full h-full text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m4.5 0a12.05 12.05 0 003-3.478m-3-3.478a12.05 12.05 0 00-3 3.478m3-3.478a12.05 12.05 0 013 3.478m0 0a12.06 12.06 0 004.5 0m-4.5 0a12.05 12.05 0 003-3.478" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why The GuruJI Classes Section */}
      <section className="relative pt-24 pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Why The GuruJI Classes?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to providing the best learning experience with expert instructors, 
              practical projects, and lifetime access to course materials.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">Expert Instructors</h3>
              <p className="text-gray-600">Learn from industry experts with years of real-world experience</p>
            </div>
            
            <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">Lifetime Access</h3>
              <p className="text-gray-600">Get lifetime access to all course materials and updates</p>
            </div>
            
            <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">Learn at Your Pace</h3>
              <p className="text-gray-600">Study anytime, anywhere with our flexible learning platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="relative pt-12 pb-0 bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Need Help? We're Here For You
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <a
                href="mailto:thegurujiclasses11@gmail.com"
                className="group flex items-center gap-3 px-6 py-4 bg-white backdrop-blur-sm border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500">Email Support</p>
                  <p className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    thegurujiclasses11@gmail.com
                  </p>
                </div>
              </a>
              
              <a
                href="tel:+918448250988"
                className="group flex items-center gap-3 px-6 py-4 bg-white backdrop-blur-sm border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500">Contact Number</p>
                  <p className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    +91 8448250988
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
