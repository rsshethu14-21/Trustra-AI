import React from 'react';
import { Link } from 'react-router-dom';

interface NavigationProps {
  userType: 'user' | 'admin';
  isAdminAuthenticated?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ userType, isAdminAuthenticated }) => {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Unique Biometric Logo Icon */}
            <svg viewBox="0 0 40 40" className="w-full h-full text-indigo-600 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35C28.2843 35 35 28.2843 35 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="2.5" className="animate-pulse" />
              <path d="M12 20H28" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 4"/>
              <path d="M20 12V28" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 4"/>
              <rect x="18.5" y="18.5" width="3" height="3" rx="1.5" fill="currentColor"/>
            </svg>
          </div>
          <span className="text-xl font-black tracking-tighter text-[#1e1b4b]">
            Trustra <span className="text-indigo-600">AI</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-6 text-sm font-bold text-[#1e1b4b]">
          {userType === 'user' ? (
            <>
              <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
              <Link to="/verify" className="hover:text-indigo-600 transition-colors">Verify Identity</Link>
              <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">My Profile</Link>
              {isAdminAuthenticated && (
                <Link to="/admin" className="px-5 py-2 bg-[#1e1b4b] text-white rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95">Admin Console</Link>
              )}
            </>
          ) : (
            <>
              <Link to="/admin" className="hover:text-indigo-600 transition-colors text-indigo-600">Analytics Dashboard</Link>
              <button onClick={() => window.location.hash = '#/'} className="px-5 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-all border border-indigo-100 font-bold active:scale-95">Exit View</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;