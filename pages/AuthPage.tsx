
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

interface AuthPageProps {
  onAuth: (email: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) onAuth(email);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 animate-fade-in">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-[#1e1b4b] tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-[#1e1b4b] opacity-60 font-bold mt-2 text-sm">{isLogin ? 'Log in to manage your identity' : 'Join thousands of verified humans'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-[#1e1b4b] uppercase tracking-widest mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-bold text-[#1e1b4b] placeholder-slate-400"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#1e1b4b] uppercase tracking-widest mb-2">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-bold text-[#1e1b4b] placeholder-slate-400"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all mt-4 tracking-widest uppercase text-xs"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
            <Link 
              to="/admin-login"
              className="text-[#1e1b4b] opacity-40 font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-100 transition-all"
            >
              Authorized Staff Portal &rarr;
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

export default AuthPage;
