import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Box } from '@mui/material';
import { checkAuthStatus } from './store/slices/authSlice';
import ErrorBoundary from './components/Common/ErrorBoundary';
import AuthProvider from './components/Auth/AuthProvider';
import Navbar from './components/Layout/Navbar';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import EntriesPage from './pages/Entries/EntriesPage';
import EntryDetailPage from './pages/Entries/EntryDetailPage';
import EntryFormPage from './pages/Entries/EntryFormPage';
import ProfilePage from './pages/Profile/ProfilePage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/Common/LoadingSpinner';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {isAuthenticated && <Navbar />}
          
          <Container 
            component="main" 
            maxWidth="lg" 
            sx={{ 
              flexGrow: 1, 
              py: isAuthenticated ? 3 : 0,
              px: isAuthenticated ? 3 : 0 
            }}
          >
            <Routes>
              {/* 公开路由 */}
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
                } 
              />
              <Route 
                path="/register" 
                element={
                  isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
                } 
              />
              
              {/* 受保护的路由 */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              
              <Route path="/entries" element={
                <ProtectedRoute>
                  <EntriesPage />
                </ProtectedRoute>
              } />
              
              <Route path="/entries/create" element={
                <ProtectedRoute>
                  <EntryFormPage />
                </ProtectedRoute>
              } />
              
              <Route path="/entries/:id" element={
                <ProtectedRoute>
                  <EntryDetailPage />
                </ProtectedRoute>
              } />
              
              <Route path="/entries/:id/edit" element={
                <ProtectedRoute>
                  <EntryFormPage />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              {/* 默认重定向 */}
              <Route 
                path="/" 
                element={
                  <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
                } 
              />
            </Routes>
          </Container>
        </Box>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;