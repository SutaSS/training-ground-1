import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import NotificationDropdown from '../common/NotificationDropdown';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl">📚</span>
            <span className="ml-2 text-xl font-bold text-gray-800">
              Library System
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/books"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Books
                </Link>
                <Link
                  to="/my-loans"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  My Loans
                </Link>
                <Link
                  to="/my-fines"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  My Fines
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Profile
                </Link>

                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <NotificationDropdown />
                  <span className="text-gray-600 text-sm">
                    {user?.name || user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}