
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AdminLoginPage from './pages/AdminLoginPage';
import VerificationFlow from './pages/VerificationFlow';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import { User, VerificationStatus } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('veri_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('is_admin') === 'true';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('veri_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('veri_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('is_admin', isAdmin.toString());
  }, [isAdmin]);

  const handleLogin = (email: string) => {
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      email,
      status: VerificationStatus.NOT_STARTED,
      signupDate: new Date().toISOString(),
    });
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
  };

  const updateStatus = (status: VerificationStatus, riskScore?: number) => {
    if (user) {
      setUser({ ...user, status, riskScore });
    }
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage isAdmin={isAdmin} />} />
        <Route 
          path="/auth" 
          element={user ? <Navigate to="/dashboard" /> : <AuthPage onAuth={handleLogin} />} 
        />
        <Route 
          path="/admin-login" 
          element={isAdmin ? <Navigate to="/admin" /> : <AdminLoginPage onLogin={handleAdminLogin} />} 
        />
        <Route 
          path="/verify" 
          element={user ? <VerificationFlow user={user} onComplete={updateStatus} /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/admin" 
          element={isAdmin ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/admin-login" />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
