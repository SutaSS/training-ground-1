import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import { initializeSocket, disconnectSocket } from './utils/socketManager';
import PublicDashboard from './pages/publicDashboard';
import Login from './pages/auth/Login';
import Books from './pages/user/Books';
import MyLoans from './pages/user/MyLoans';
import MyFines from './pages/user/MyFines';
import Profile from './pages/user/Profile';
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Initialize socket connection when user is authenticated
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      if (token) {
        initializeSocket(token);
      }
    } else {
      // Disconnect socket when user logs out
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated]);

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
        <Route 
          path="/my-fines" 
          element={isAuthenticated ? <MyFines /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile" 
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
        />
        
        {/* Protected Routes - Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/books" />
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