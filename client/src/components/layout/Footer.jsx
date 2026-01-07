export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-3">📚 Library System</h3>
            <p className="text-gray-400 text-sm">
              Modern library management system for borrowing and managing books online.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-400 hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="/books" className="text-gray-400 hover:text-white">
                  Browse Books
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-400 hover:text-white">
                  Login
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📧 library@example.com</li>
              <li>📞 +62 123 4567 8900</li>
              <li>📍 Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; 2026 Library System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}