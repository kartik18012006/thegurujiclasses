# The GuruJI Classes - Ed-Tech Platform

A modern React-based ed-tech platform built with Vite, featuring course listings, user authentication, and course management.

## Features

- 🎓 **Course Management**: Browse and view detailed course information
- 🔐 **Firebase Authentication**: Secure user login and signup
- 🛒 **Checkout Flow**: Course enrollment process (payment integration pending)
- 📚 **My Courses**: View enrolled courses and track progress
- 🎨 **Modern UI**: Built with Tailwind CSS for a beautiful, responsive design

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Firebase Auth** - User authentication
- **Tailwind CSS** - Styling framework

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Email/Password authentication
   - Copy your Firebase config
   - Update `src/firebase/config.js` with your Firebase configuration

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── ProtectedRoute.jsx
├── context/            # React context providers
│   └── AuthContext.jsx
├── data/              # Placeholder data
│   └── courses.js
├── firebase/          # Firebase configuration
│   └── config.js
├── pages/             # Page components
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── CourseListing.jsx
│   ├── CourseDetail.jsx
│   ├── Checkout.jsx
│   └── MyCourses.jsx
├── App.jsx            # Main app component with routing
└── main.jsx           # Entry point
```

## Available Routes

- `/` - Landing page
- `/login` - User login
- `/signup` - User registration
- `/courses` - Course listing page
- `/courses/:id` - Course detail page
- `/checkout/:id` - Checkout page (protected)
- `/my-courses` - My enrolled courses (protected)

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication → Sign-in method → Email/Password
4. Get your config from Project Settings → General → Your apps
5. Update `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Notes

- Payment integration is not yet implemented
- Course data is currently using placeholder data
- User enrolled courses are simulated (first 3 courses shown as enrolled)

## License

MIT
