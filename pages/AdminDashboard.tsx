
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import RiskBadge from '../components/RiskBadge';
import { MOCK_LOGS } from '../constants';
import { VerificationLog, VerificationStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [view, setView] = useState<'analytics' | 'users'>('analytics');
  const navigate = useNavigate();
  
  useEffect(() => {
    const stored = localStorage.getItem('verification_logs');
    const combined = stored ? [...JSON.parse(stored), ...MOCK_LOGS] : MOCK_LOGS;
    setLogs(combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, []);

  const uniqueUsers = Array.from(new Set(logs.map(l => l.email))).map(email => {
    const userLogs = logs.filter(l => l.email === email);
    const latestLog = userLogs[0];
    const totalRisk = userLogs.reduce((acc, curr) => acc + curr.riskScore, 0);
    return {
      email,
      lastSeen: latestLog.timestamp,
      avgRisk: Math.round(totalRisk / userLogs.length),
      attempts: userLogs.length,
      status: latestLog.decision === 'Verified' ? VerificationStatus.VERIFIED : 
              latestLog.decision === 'Bot' ? VerificationStatus.FAILED : VerificationStatus.SUSPICIOUS
    };
  });

  const riskDistribution = [
    { name: 'Low Risk', value: logs.filter(l => l.riskScore <= 30).length },
    { name: 'Warning', value: logs.filter(l => l.riskScore > 30 && l.riskScore <= 70).length },
    { name: 'Critical', value: logs.filter(l => l.riskScore > 70).length },
  ];

  const CHART_COLORS = ['#6366f1', '#f59e0b', '#f43f5e'];

  const decisionSummary = [
    { name: 'Verified', count: logs.filter(l => l.decision === 'Verified').length },
    { name: 'Suspicious', count: logs.filter(l => l.decision === 'Suspicious').length },
    { name: 'Bot', count: logs.filter(l => l.decision === 'Bot').length },
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <Layout userType="admin" isAdminAuthenticated={true}>
      <div className="space-y-10 animate-fade-in">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-[#1e1b4b] tracking-tight">Admin Portal</h1>
            <p className="text-[#1e1b4b] opacity-60 mt-2 font-bold uppercase text-[10px] tracking-widest">
              Identity Storage & Fraud Analytics
            </p>
          </div>
          <div className="flex gap-4">
            <nav className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
                <button 
                  onClick={() => setView('analytics')}
                  className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'analytics' ? 'bg-white text-[#1e1b4b] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Analytics
                </button>
                <button 
                  onClick={() => setView('users')}
                  className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'users' ? 'bg-white text-[#1e1b4b] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  User Registry
                </button>
            </nav>
            <button onClick={handleLogout} className="px-6 py-3 bg-rose-50 text-rose-600 font-bold rounded-2xl border border-rose-100 hover:bg-rose-100 transition-all active:scale-95 text-xs tracking-widest uppercase">
              Logout
            </button>
          </div>
        </header>

        {view === 'analytics' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Audits', value: logs.length, bg: 'bg-white', text: 'text-[#1e1b4b]' },
                { label: 'Verified Humans', value: decisionSummary[0].count, bg: 'bg-emerald-50/50', text: 'text-emerald-600' },
                { label: 'Active Flags', value: decisionSummary[1].count, bg: 'bg-amber-50/50', text: 'text-amber-600' },
                { label: 'Bot Deterrence', value: decisionSummary[2].count, bg: 'bg-rose-50/50', text: 'text-rose-600' }
              ].map((stat, i) => (
                <div key={i} className={`${stat.bg} p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 hover:-translate-y-1 transition-all`}>
                  <p className="text-[10px] font-black text-[#1e1b4b] opacity-40 uppercase tracking-[0.2em]">{stat.label}</p>
                  <p className={`text-5xl font-black mt-3 ${stat.text} tracking-tighter`}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                <h3 className="text-xl font-black text-[#1e1b4b] mb-10">Risk Score Distribution</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={riskDistribution}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(30,27,75,0.05)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#1e1b4b', fontWeight: 800, opacity: 0.4}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#1e1b4b', fontWeight: 800, opacity: 0.4}} />
                        <Tooltip cursor={{fill: 'rgba(99,102,241,0.05)'}} contentStyle={{backgroundColor: '#fff', borderRadius: '16px', border: '1px solid rgba(30,27,75,0.1)', color: '#1e1b4b'}} />
                        <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                          {riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <h3 className="text-xl font-black text-[#1e1b4b] mb-10">Decision Composition</h3>
                <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={decisionSummary}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={8}
                            dataKey="count"
                            stroke="none"
                          >
                            {decisionSummary.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-4 pr-8">
                        {decisionSummary.map((item, i) => (
                            <div key={item.name} className="flex items-center gap-3 text-[10px] font-black text-[#1e1b4b] opacity-40 uppercase tracking-widest">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: CHART_COLORS[i]}}></div>
                                <span>{item.name}: {item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden animate-fade-in">
            <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-[#1e1b4b]">Master Identity Registry</h3>
                <p className="text-xs font-bold text-indigo-500 mt-2 uppercase tracking-[0.2em]">Stored Mesh User Data</p>
              </div>
              <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Total Identities: {uniqueUsers.length}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-[#1e1b4b] opacity-40 uppercase tracking-[0.3em]">
                    <th className="px-10 py-6">Unique Identifier (Email)</th>
                    <th className="px-10 py-6">Identity State</th>
                    <th className="px-10 py-6 text-center">Avg Risk Index</th>
                    <th className="px-10 py-6 text-center">Verification Cycles</th>
                    <th className="px-10 py-6">Last Checksum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {uniqueUsers.map(u => (
                    <tr key={u.email} className="hover:bg-indigo-50/30 transition-all group">
                      <td className="px-10 py-6 font-black text-[#1e1b4b] text-sm">{u.email}</td>
                      <td className="px-10 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          u.status === VerificationStatus.VERIFIED ? 'bg-emerald-100 text-emerald-700' : 
                          u.status === VerificationStatus.FAILED ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-center font-black text-lg text-[#1e1b4b] tracking-tighter">
                          {u.avgRisk}
                      </td>
                      <td className="px-10 py-6 text-center font-bold text-slate-400">
                          {u.attempts}
                      </td>
                      <td className="px-10 py-6 text-[11px] text-[#1e1b4b] opacity-50 font-black">
                          {new Date(u.lastSeen).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-10 border-b border-slate-50 bg-slate-50/30">
            <h3 className="text-2xl font-black text-[#1e1b4b]">Audit Trail: Verification Logs</h3>
            <p className="text-xs font-bold text-indigo-500 mt-2 uppercase tracking-[0.2em]">Live Transactional Telemetry</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-[#1e1b4b] opacity-40 uppercase tracking-[0.3em]">
                  <th className="px-10 py-6">Timestamp</th>
                  <th className="px-10 py-6">Identity Profile</th>
                  <th className="px-10 py-6 text-center">Risk</th>
                  <th className="px-10 py-6">Outcome</th>
                  <th className="px-10 py-6">Kernel Logic Reasoning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.length > 0 ? logs.map(log => (
                  <tr key={log.id} className="hover:bg-indigo-50/30 transition-all group">
                    <td className="px-10 py-6 text-[11px] text-[#1e1b4b] opacity-50 font-black whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-10 py-6 font-black text-[#1e1b4b] text-sm">{log.email}</td>
                    <td className="px-10 py-6 text-center font-black text-[#1e1b4b]">{log.riskScore}</td>
                    <td className="px-10 py-6"><RiskBadge decision={log.decision} /></td>
                    <td className="px-10 py-6 text-xs text-[#1e1b4b] opacity-70 font-bold italic leading-relaxed">
                        {log.reasoning}
                    </td>
                  </tr>
                )) : (
                    <tr><td colSpan={5} className="px-10 py-20 text-center opacity-40 font-black uppercase text-sm tracking-widest">No Security Events Detected</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
