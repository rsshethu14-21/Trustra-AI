
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

interface AdminLoginPageProps {
  onLogin: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Admin21' && password === 'Admin$@21') {
      onLogin();
    } else {
      setError('Invalid system credentials. Access denied.');
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 animate-fade-in">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-indigo-100">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
               <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V9C20 7.89543 19.1046 7 18 7H6C4.89543 7 4 7.89543 4 9V19C4 20.1046 4.89543 21 6 21ZM16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7H16Z" strokeLinecap="round"/>
               </svg>
            </div>
            <h2 className="text-3xl font-black text-[#1e1b4b] tracking-tight">System Admin</h2>
            <p className="text-indigo-600 font-bold mt-2 text-xs uppercase tracking-[0.2em]">Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-[#1e1b4b] opacity-40 uppercase tracking-widest mb-2">Username</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-[#1e1b4b] placeholder-slate-300"
                placeholder="Admin ID"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#1e1b4b] opacity-40 uppercase tracking-widest mb-2">Security Key</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-[#1e1b4b] placeholder-slate-300"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-rose-500 text-xs font-black text-center uppercase tracking-widest animate-pulse">{error}</p>}
            <button 
              type="submit" 
              className="w-full py-5 bg-[#1e1b4b] text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-black transition-all mt-4 tracking-[0.2em] uppercase text-xs"
            >
              Authenticate System
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link 
              to="/"
              className="text-[#1e1b4b] opacity-40 font-black text-[10px] uppercase tracking-widest hover:opacity-100 transition-opacity"
            >
              &larr; Return to Public Shell
            </Link>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </Layout>
  );
};

export default AdminLoginPage;
