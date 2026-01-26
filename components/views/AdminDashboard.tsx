
import React, { useState, useEffect } from 'react';
import { getServerAnalyticsStats, hashPassword, TARGET_HASH } from '../../services/analyticsService';
import { ShieldCheck, Lock, Unlock, Activity, MapPin, Smartphone, Calendar, Eye, EyeOff, AlertTriangle, RefreshCcw, Users, Globe, ChevronRight } from 'lucide-react';
import { Button } from '../Button';
import SimpleView from '../layout/SimpleView';
import { clsx } from 'clsx';
import { triggerHaptic } from '../../utils/common';

const AdminDashboard = ({ onBack }: { onBack: () => void }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getServerAnalyticsStats();
      setStats(data);
    } catch (e) {
      setError('Failed to fetch server data');
    } finally {
      setLoading(false);
    }
  };

  // Authentication Handler
  const handleLogin = async () => {
    const cleanPassword = password.trim();
    if (!cleanPassword) {
        setError('Please enter password');
        return;
    }
    
    setLoading(true);
    try {
      const hash = await hashPassword(cleanPassword);
      if (hash === TARGET_HASH) {
        setIsAuthenticated(true);
        await loadStats();
        setError('');
      } else {
        setError('Access Denied: Incorrect Password');
        setPassword('');
      }
    } catch (e) {
      setError('Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleLogin();
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#020617] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black opacity-80"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        
        <div className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-enter">
           <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-purple-600/20 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
              <Lock size={32} className="text-red-400" />
           </div>
           
           <h2 className="text-2xl font-black text-white mb-2 tracking-tight">System Locked</h2>
           <p className="text-slate-400 text-sm mb-8 text-center">Global activity logs require server-level authentication.</p>

           <div className="w-full space-y-4">
              <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter Admin Passkey"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-center text-white tracking-[0.2em] focus:outline-none focus:border-emerald-500/50 transition-all font-mono placeholder:tracking-normal placeholder:text-slate-600"
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
              </div>
              
              {error && (
                <div className="flex items-center justify-center gap-2 text-red-400 text-xs font-bold animate-pulse">
                   <AlertTriangle size={12} /> {error}
                </div>
              )}

              <Button 
                fullWidth 
                variant="primary" 
                onClick={handleLogin}
                loading={loading}
                className="shadow-red-500/20 from-red-600 to-pink-600"
              >
                Access Server Logs
              </Button>
              
              <button onClick={onBack} className="w-full text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors py-2">
                Return to App
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <SimpleView title="Server Insights" onBack={onBack}>
      <div className="pb-32 space-y-8 animate-enter">
        
        {/* Real-time Status Header */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-slate-900/40 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                 <Globe size={24} className="text-emerald-400 animate-pulse" />
              </div>
              <div>
                 <h2 className="text-lg font-black text-white">Live Activity Monitor</h2>
                 <p className="text-xs text-slate-400">Syncing with app server logs</p>
              </div>
           </div>
           <button 
            onClick={() => { triggerHaptic(); loadStats(); }} 
            className={clsx("w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all", loading && "animate-spin")}
           >
              <RefreshCcw size={18} />
           </button>
        </div>

        {/* Major Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           <InsightCard label="Global Interactions" value={stats?.total || 0} icon={Users} color="text-blue-400" />
           <InsightCard label="Today's Traffic" value={stats?.daily || 0} icon={Activity} color="text-emerald-400" />
           <InsightCard label="Weekly Reach" value={stats?.weekly || 0} icon={Calendar} color="text-purple-400" />
           <InsightCard label="Monthly Growth" value={stats?.monthly || 0} icon={ShieldCheck} color="text-amber-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Page Breakdown */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/40">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Smartphone size={16} /> POPULAR PAGES
                </h3>
                <div className="space-y-5">
                    {stats && Object.entries(stats.views).sort(([,a]:any, [,b]:any) => b - a).slice(0, 6).map(([page, count]: any, i) => (
                        <div key={i} className="group">
                            <div className="flex justify-between items-end mb-1.5">
                                <span className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{page}</span>
                                <span className="text-xs font-mono text-slate-500">{count} visits</span>
                            </div>
                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                                    style={{ width: `${(count / stats.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Geographical Distribution */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/40">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <MapPin size={16} /> TOP LOCATIONS
                </h3>
                <div className="space-y-4">
                    {stats && Object.entries(stats.locations).sort(([,a]:any, [,b]:any) => b - a).slice(0, 6).map(([loc, count]: any, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                    <MapPin size={14} />
                                </div>
                                <span className="text-sm font-bold text-slate-200">{loc}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-slate-400">{((count / stats.total) * 100).toFixed(1)}%</span>
                                <span className="text-sm font-black text-white">{count}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Global User Timeline */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/40 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Activity size={16} /> LIVE ACTIVITY FEED
                </h3>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">GLOBAL STREAM</span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-400">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="pb-4 pl-2 font-black uppercase tracking-widest text-slate-500">TIME (UTC)</th>
                            <th className="pb-4 font-black uppercase tracking-widest text-slate-500">USER ACTION</th>
                            <th className="pb-4 font-black uppercase tracking-widest text-slate-500">LOCATION</th>
                            <th className="pb-4 font-black uppercase tracking-widest text-slate-500 text-right">DEVICE</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {stats && stats.logs.slice(0, 20).map((log: any) => (
                            <tr key={log.id} className="group hover:bg-emerald-500/5 transition-all">
                                <td className="py-4 pl-2 font-mono text-slate-500 group-hover:text-slate-300">
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </td>
                                <td className="py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        <span className="text-slate-100 font-bold group-hover:text-emerald-400 transition-colors">{log.view}</span>
                                    </div>
                                </td>
                                <td className="py-4">
                                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-cyan-300 font-medium">
                                        {log.location}
                                    </span>
                                </td>
                                <td className="py-4 text-right pr-2">
                                    <span className="text-[10px] text-slate-500 truncate max-w-[120px] inline-block opacity-60 group-hover:opacity-100">
                                        {log.userAgent.split(')')[0].split('(')[1] || 'Mobile Device'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {stats?.logs.length > 20 && (
                <div className="mt-6 flex justify-center">
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                        View More Logs <ChevronRight size={14} />
                    </button>
                </div>
            )}
        </div>

      </div>
    </SimpleView>
  );
};

const InsightCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="glass-panel p-5 rounded-3xl border border-white/5 bg-slate-900/30 flex flex-col items-center justify-center text-center gap-3 group hover:scale-105 transition-all">
     <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6 shadow-lg", "bg-white/5 border border-white/10 group-hover:border-emerald-500/50")}>
        <Icon size={20} className={color} />
     </div>
     <div className="flex flex-col">
        <span className="text-3xl font-black text-white drop-shadow-lg">{value.toLocaleString()}</span>
        <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.15em] mt-1">{label}</span>
     </div>
  </div>
);

export default AdminDashboard;
