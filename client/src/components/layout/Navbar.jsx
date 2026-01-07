import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import NotificationDropdown from '../common/NotificationDropdown';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600';
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? (user?.role === 'admin' ? '/dashboard' : '/books') : '/'} className="flex items-center">
            <span className="text-2xl">📚</span>
            <span className="ml-2 text-xl font-bold text-gray-800">
              Library System
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                {/* User Navigation */}
                {user?.role !== 'admin' && (
                  <>
                    <Link
                      to="/books"
                      className={`px-3 py-2 rounded-md font-medium transition ${isActive('/books')}`}
                    >
                      Books
                    </Link>
                    <Link
                      to="/my-loans"
                      className={`px-3 py-2 rounded-md font-medium transition ${isActive('/my-loans')}`}
                    >
                      My Loans
                    </Link>
                    <Link
                      to="/my-fines"
                      className={`px-3 py-2 rounded-md font-medium transition ${isActive('/my-fines')}`}
                    >
                      My Fines
                    </Link>
                    <Link
                      to="/profile"
                      className={`px-3 py-2 rounded-md font-medium transition ${isActive('/profile')}`}
                    >
                      Profile
                    </Link>
                  </>
                )}

                {/* Admin Navigation */}
                {user?.role === 'admin' && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`px-3 py-2 rounded-md font-medium transition ${isActive('/dashboard')}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/books"
                      className={`px-3 py-2 rounded-md font-medium transition ${isActive('/admin/books')}`}
                    >
                      Books
                    </Link>
                    <Link
                      to="/admin/loans"
                      className={`px-3 py-2 rounded-md font-medium transition ${isActive('/admin/loans')}`}
                    >
                      Loans
                    </Link>
                    <Link
                      to="/admin/fines"
                      className={`px-3 py-2 rounded-md font-medium transition ${isActive('/admin/fines')}`}
                    >
                      Fines
                    </Link>
                  </>
                )}

                {/* User Menu */}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-300">
                  <NotificationDropdown />
                  
                  {/* User Badge */}
                  <div className="flex items-center gap-2">
                    {user?.role === 'admin' && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-semibold">
                        Admin
                      </span>
                    )}
                    <span className="text-gray-600 text-sm font-medium">
                      {user?.profile?.fullName || user?.email}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm font-medium transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 font-medium transition"
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