
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { User, VerificationStatus } from '../types';

interface DashboardProps { 
  user: User; 
  onLogout: () => void; 
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const isVerified = user.status === VerificationStatus.VERIFIED;
  const hasStarted = user.status !== VerificationStatus.NOT_STARTED;

  return (
    <Layout isAdminAuthenticated={localStorage.getItem('is_admin') === 'true'}>
      <div className="space-y-8 animate-fade-in">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#1e1b4b] tracking-tight">User Command Center</h1>
            <p className="text-[#1e1b4b] opacity-60 mt-2 font-black uppercase text-[10px] tracking-widest">Active session: <span className="text-indigo-600">{user.email}</span></p>
          </div>
          <button 
            type="button"
            onClick={onLogout} 
            className="text-rose-600 font-black hover:bg-rose-50 px-5 py-2.5 rounded-xl transition-all active:scale-95 border border-transparent hover:border-rose-100 uppercase text-xs tracking-widest"
          >
            End Session
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-100/50 transition-all relative overflow-hidden group">
            <div className="absolute inset-0 z-0 opacity-[0.05] group-hover:opacity-10 transition-opacity">
               <img src="https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=1200&h=1200" alt="Identity Interface background" className="w-full h-full object-cover" />
            </div>
            
            <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-[#1e1b4b] opacity-40">Identity Security Tier</span>
                    <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isVerified ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]'}`}></div>
                </div>
                <h2 className="text-6xl font-black text-[#1e1b4b] tracking-tighter">
                    {user.status === VerificationStatus.NOT_STARTED ? 'Unverified' : user.status.replace('_', ' ')}
                </h2>
                <p className="text-[#1e1b4b] text-xl max-w-lg leading-relaxed font-black opacity-80">
                    {isVerified 
                        ? "Biometric credentials authorized. Your identity signature is verified across all distributed nodes."
                        : "High-tier platform features are currently locked. Complete biometric screening to authorize your account."
                    }
                </p>
            </div>
            
            {!isVerified && (
              <div className="relative z-10">
                <Link 
                  to="/verify" 
                  className="mt-12 inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 active:scale-95 transition-all text-center tracking-wide"
                >
                  {hasStarted ? 'Resume Security Check' : 'Begin Biometric Verification'}
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 relative overflow-hidden group">
                <div className="absolute inset-0 z-0 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                    <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600&h=600" alt="Security Mesh accent" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-black text-[#1e1b4b] text-xs uppercase tracking-[0.2em] mb-6 opacity-40 relative z-10">Trust Index</h3>
                <div className="flex items-baseline gap-2 relative z-10">
                    <span className="text-7xl font-black tracking-tighter text-[#1e1b4b]">{user.riskScore ?? '--'}</span>
                    <span className="text-[#1e1b4b] opacity-30 font-bold text-2xl">/100</span>
                </div>
                <p className="text-[11px] text-[#1e1b4b] mt-6 leading-relaxed font-black opacity-60 relative z-10">
                    Consolidated score derived from semantic liveness and behavioral biometric patterns.
                </p>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] text-[#1e1b4b] border border-indigo-50 shadow-xl shadow-indigo-100/50 relative overflow-hidden group">
                <div className="absolute inset-0 z-0 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600&h=600" alt="Data Network background" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 opacity-40 relative z-10">Privileges</h3>
                <ul className="space-y-4 text-sm font-black relative z-10">
                    {[
                      { name: 'Biometric API Keys', active: isVerified },
                      { name: 'Asset Withdrawal', active: isVerified },
                      { name: 'Node Verification', active: isVerified }
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-4">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${item.active ? "bg-indigo-600 border-indigo-600 text-white scale-110" : "bg-slate-50 border-slate-100 text-slate-300"}`}>
                            {item.active ? "✓" : "×"}
                        </span> 
                        {item.name}
                      </li>
                    ))}
                </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-lg shadow-slate-200/50">
            <h3 className="text-2xl font-black text-[#1e1b4b] mb-8">System Hardening</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-3xl flex justify-between items-center border border-slate-100 hover:border-indigo-200 transition-all group cursor-pointer">
                    <div>
                        <p className="font-black text-[#1e1b4b]">Multi-Factor Auth</p>
                        <p className="text-[10px] font-black text-[#1e1b4b] opacity-40 mt-1 uppercase tracking-[0.3em]">Hardware: ACTIVE</p>
                    </div>
                    <div className="w-14 h-7 bg-emerald-500 rounded-full flex items-center px-1.5 shadow-lg shadow-emerald-50">
                        <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm"></div>
                    </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl flex justify-between items-center border border-slate-100 hover:border-indigo-200 transition-all group cursor-pointer">
                    <div>
                        <p className="font-black text-[#1e1b4b]">Biometric Sync</p>
                        <p className="text-[10px] font-black text-[#1e1b4b] opacity-40 mt-1 uppercase tracking-[0.3em]">Face ID: LINKED</p>
                    </div>
                    <div className="w-14 h-7 bg-indigo-600 rounded-full flex items-center px-1.5 shadow-lg shadow-indigo-50">
                        <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm"></div>
                    </div>
                </div>
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

export default Dashboard;
