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

            {/* Right Column - Floating Study Items */}
            <div className="relative h-[600px] hidden lg:block">
              {/* Notebook - Top Right */}
              <div className="absolute top-10 right-20 w-48 h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg shadow-2xl transform rotate-12 hover:rotate-6 transition-transform duration-500 animate-float">
                <div className="p-6 h-full flex flex-col">
                  <div className="h-1 w-12 bg-blue-400 rounded mb-4"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-1 w-full bg-blue-300 rounded"></div>
                    <div className="h-1 w-3/4 bg-blue-200 rounded"></div>
                    <div className="h-1 w-full bg-blue-300 rounded"></div>
                    <div className="h-1 w-2/3 bg-blue-200 rounded"></div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded"></div>
                    <div className="w-8 h-8 bg-indigo-500 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Pen - Center Left */}
              <div className="absolute top-1/2 left-10 -translate-y-1/2 w-8 h-48 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full shadow-xl transform -rotate-12 hover:rotate-0 transition-transform duration-500 animate-float-delay">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 rounded-full"></div>
              </div>

              {/* Stationery Set - Bottom Right */}
              <div className="absolute bottom-20 right-10 flex gap-4 animate-float-delay-2">
                {/* Ruler */}
                <div className="w-32 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded shadow-lg transform rotate-6 hover:rotate-0 transition-transform duration-500">
                  <div className="h-full flex items-center justify-between px-2">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <div key={num} className="h-4 w-px bg-white"></div>
                    ))}
                  </div>
                </div>
                
                {/* Pencil */}
                <div className="w-6 h-24 bg-gradient-to-b from-yellow-500 via-orange-500 to-red-500 rounded-full shadow-lg transform -rotate-12 hover:rotate-0 transition-transform duration-500">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rounded-full"></div>
                </div>
              </div>

              {/* Calculator - Top Left */}
              <div className="absolute top-32 left-20 w-32 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-xl transform -rotate-6 hover:rotate-0 transition-transform duration-500 animate-float">
                <div className="p-3 h-full flex flex-col">
                  <div className="h-8 bg-gray-800 rounded mb-2 flex items-center justify-end px-2">
                    <span className="text-white text-xs font-mono">123</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 flex-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <div key={num} className="bg-white rounded text-center text-xs py-2 font-semibold text-gray-700">
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Book Stack - Bottom Left */}
              <div className="absolute bottom-10 left-16 space-y-1 animate-float-delay-2">
                <div className="w-24 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded shadow-lg transform rotate-3"></div>
                <div className="w-24 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded shadow-lg transform -rotate-2"></div>
                <div className="w-24 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded shadow-lg transform rotate-1"></div>
              </div>

              {/* Highlighter - Center Right */}
              <div className="absolute top-1/3 right-32 w-40 h-8 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 rounded-full shadow-lg transform rotate-45 hover:rotate-12 transition-transform duration-500 animate-float">
                <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-600 rounded-full"></div>
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
