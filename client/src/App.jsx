import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import PublicDashboard from './pages/publicDashboard';
import Login from './pages/auth/Login';
import Books from './pages/user/Books';
import MyLoans from './pages/user/MyLoans';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicDashboard />} />
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
        />
        
        {/* Protected Routes - User */}
        <Route 
          path="/books" 
          element={isAuthenticated ? <Books /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/my-loans" 
          element={isAuthenticated ? <MyLoans /> : <Navigate to="/login" />} 
        />
        
        {/* Protected Routes - Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
                  <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
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