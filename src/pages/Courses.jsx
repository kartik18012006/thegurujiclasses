import { Link } from 'react-router-dom';

const Courses = () => {
  // Static mock data - NO Firebase
  const courses = [
    {
      id: 1,
      title: "Complete Web Development Bootcamp",
      description: "Master HTML, CSS, JavaScript, React, Node.js and more. Build real-world projects and land your dream job.",
      instructor: "Dr. Priya Sharma",
      price: "₹4,999",
      thumbnail: "https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Web+Development"
    },
    {
      id: 2,
      title: "Data Science & Machine Learning",
      description: "Learn Python, pandas, scikit-learn, TensorFlow. Build ML models and analyze data like a pro.",
      instructor: "Rajesh Kumar",
      price: "₹5,999",
      thumbnail: "https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=Data+Science"
    },
    {
      id: 3,
      title: "UI/UX Design Masterclass",
      description: "Design beautiful interfaces, create user experiences, and master Figma, Adobe XD, and design principles.",
      instructor: "Anita Patel",
      price: "₹3,999",
      thumbnail: "https://via.placeholder.com/400x300/10B981/FFFFFF?text=UI+UX+Design"
    },
    {
      id: 4,
      title: "Full Stack JavaScript Development",
      description: "Build complete web applications using React, Express, MongoDB. From frontend to backend, master it all.",
      instructor: "Dr. Priya Sharma",
      price: "₹6,999",
      thumbnail: "https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Full+Stack"
    },
    {
      id: 5,
      title: "Python Programming for Beginners",
      description: "Start your programming journey with Python. Learn fundamentals, data structures, and build your first projects.",
      instructor: "Rajesh Kumar",
      price: "₹2,999",
      thumbnail: "https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=Python"
    },
    {
      id: 6,
      title: "Mobile App Development with React Native",
      description: "Create iOS and Android apps with React Native. Build and deploy mobile applications from scratch.",
      instructor: "Dr. Priya Sharma",
      price: "₹5,499",
      thumbnail: "https://via.placeholder.com/400x300/10B981/FFFFFF?text=Mobile+Apps"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Explore Our Courses</h1>
            <p className="text-xl md:text-2xl text-indigo-100">
              Learn from industry experts and advance your career
            </p>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">All Courses</h2>
            <p className="text-gray-600 text-lg">
              Choose from our comprehensive collection of expert-led courses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition border border-gray-200"
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-indigo-600 font-medium mb-3">{course.instructor}</p>
                  <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-indigo-600">{course.price}</span>
                    <Link
                      to="/login"
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Learning?</h3>
            <p className="text-gray-600 mb-6">
              Sign up today and get access to all our courses
            </p>
            <Link
              to="/signup"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition transform hover:scale-105"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Courses;


