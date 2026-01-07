import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import useAuthStore from '../store/authStore';

export default function PublicDashboard() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Welcome to Our Library
          </h1>
          <p className="text-xl mb-8">
            Discover thousands of books and manage your reading journey
          </p>
          {!isAuthenticated && (
            <div className="space-x-4">
              <Link
                to="/login"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
              >
                Get Started
              </Link>
              <Link
                to="/books"
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 inline-block"
              >
                Browse Books
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our Library?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-2">Vast Collection</h3>
              <p className="text-gray-600">
                Access thousands of books across various genres and categories
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Easy Borrowing</h3>
              <p className="text-gray-600">
                Borrow books online with just a few clicks, hassle-free
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-5xl mb-4">🔔</div>
              <h3 className="text-xl font-bold mb-2">Real-time Notifications</h3>
              <p className="text-gray-600">
                Get instant updates about due dates and new arrivals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-200">Books Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-blue-200">Active Members</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-200">Genres</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">Online Access</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="py-16 bg-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Your Reading Journey?
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Join thousands of readers and get access to our amazing collection
            </p>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}