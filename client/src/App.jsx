import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Login from './pages/auth/Login';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />} 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
                  <h1 className="text-3xl font-bold mb-4">Welcome to Library System</h1>
                  <p className="text-gray-600 mb-4">
                    Logged in as: <strong>{user?.email}</strong>
                  </p>
                  <p className="text-gray-600 mb-4">
                    Role: <strong className="uppercase">{user?.role}</strong>
                  </p>
                  <button
                    onClick={() => useAuthStore.getState().logout()}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;