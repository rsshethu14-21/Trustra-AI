import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
  userType?: 'user' | 'admin';
  isAdminAuthenticated?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, userType = 'user', isAdminAuthenticated }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation userType={userType} isAdminAuthenticated={isAdminAuthenticated} />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {children}
      </main>
      <footer className="border-t border-slate-200 py-12 bg-white/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#1e1b4b] font-bold text-xs uppercase tracking-[0.3em] opacity-40">
            &copy; 2024 Trustra AI. Biometric Behavioral Mesh Network.
          </p>
          <div className="mt-4">
            <Link 
              to="/admin-login" 
              className="text-[10px] font-black text-[#1e1b4b] opacity-20 uppercase tracking-[0.2em] hover:opacity-100 transition-opacity"
            >
              System Admin Access
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;