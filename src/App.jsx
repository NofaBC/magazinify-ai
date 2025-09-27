import React, { useState, useEffect } from 'react';

// Mock Landing Page Component
const LandingPage = () => {
  const [website, setWebsite] = useState('');

  const handleGetStarted = () => {
    if (website.trim()) {
      window.location.href = `/signup?website=${encodeURIComponent(website)}`;
    } else {
      window.location.href = '/signup';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Magazinify AI™
            </span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
            >
              Login
            </button>
          </nav>
        </div>
      </header>

      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 mb-6">
            AI-Powered Magazine Generation
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Business-Branded AI Magazines
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Magazinify AI™ generates a fully-branded, interactive flipbook magazine for your business—every month. 
            Articles, images, layout, and built-in calls-to-action that send readers straight to your website.
          </p>
          <p className="text-lg text-indigo-600 font-semibold mb-12">
            Includes $499 one-time setup. Monthly plans from $19–$99.
          </p>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto border border-gray-100">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Start Your Magazine</h3>
            <div className="space-y-4">
              <input
                type="url"
                placeholder="Enter your website URL"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-3 text-center text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                onClick={handleGetStarted}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg py-3 rounded-md font-medium"
              >
                Get Started Now
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">No credit card required to start</p>
          </div>
        </div>
      </section>
    </div>
  );
};

// Mock Signup Page Component
const SignupPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button 
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6 bg-transparent border-none cursor-pointer"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600">Start generating AI-powered magazines</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl border p-6">
          <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-md font-medium hover:from-indigo-700 hover:to-purple-700"
            >
              Create Account
            </button>
          </div>
          <p className="text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <button
              onClick={() => window.location.href = '/login'}
              className="text-indigo-600 hover:text-indigo-700 bg-transparent border-none cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Mock Login Page Component
const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button 
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6 bg-transparent border-none cursor-pointer"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl border p-6">
          <h2 className="text-2xl font-bold mb-4">Sign In</h2>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-md font-medium hover:from-indigo-700 hover:to-purple-700"
            >
              Sign In
            </button>
          </div>
          <p className="text-center text-gray-600 mt-4">
            Don't have an account?{' '}
            <button
              onClick={() => window.location.href = '/signup'}
              className="text-indigo-600 hover:text-indigo-700 bg-transparent border-none cursor-pointer"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Mock Dashboard Component
const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Magazinify AI™
                </span>
              </div>
              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Pro Plan
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">U</span>
                </div>
                <span className="text-sm text-gray-700">demo@magazinify.ai</span>
              </div>
              <button
                onClick={() => window.location.href = '/'}
                className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-600">Manage your AI-generated magazines and track performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600">👁</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">12,543</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600">📖</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Magazines</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Read Time</p>
                <p className="text-2xl font-bold text-gray-900">4.2 min</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-orange-600">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold text-gray-900">3.8%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Magazines</h2>
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-md font-medium">
              Generate New Issue
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Tech Innovation Quarterly", status: "Published", views: 2543 },
              { title: "Healthcare Trends", status: "Draft", views: 0 },
              { title: "Market Analysis Report", status: "Published", views: 1890 }
            ].map((magazine, index) => (
              <div key={index} className="border rounded-lg hover:shadow-lg transition-shadow">
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl">📖</span>
                  </div>
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs ${
                    magazine.status === 'Published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {magazine.status}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{magazine.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{magazine.views} views</p>
                  <div className="flex space-x-2">
                    <button className="flex-1 border border-gray-300 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-50">
                      View
                    </button>
                    <button className="flex-1 border border-gray-300 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-50">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple router component
const Router = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Route rendering
  switch (currentPath) {
    case '/':
      return <LandingPage />;
    case '/signup':
      return <SignupPage />;
    case '/login':
      return <LoginPage />;
    case '/dashboard':
      return <Dashboard />;
    default:
      return <NotFoundPage />;
  }
};

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <button
        onClick={() => {
          window.history.pushState(null, '', '/');
          window.location.reload();
        }}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Go Home
      </button>
    </div>
  </div>
);

// Navigation helper function (to be used in components)
export const navigateTo = (path) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

const App = () => {
  return (
    <div className="App">
      <Router />
    </div>
  );
};

export default App;
