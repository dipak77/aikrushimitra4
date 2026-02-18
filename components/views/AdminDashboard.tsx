
import React, { useState, useEffect } from 'react';
import { getAnalyticsStats, hashPassword, TARGET_HASH } from '../../services/analyticsService';
import { 
  ShieldCheck, Lock, Unlock, Activity, MapPin, Smartphone, 
  Calendar, Eye, EyeOff, AlertTriangle, Users, Clock, 
  Globe, Laptop, Search, ChevronDown, CheckCircle2, User, Loader2
} from 'lucide-react';
import { Button } from '../Button';
import SimpleView from '../layout/SimpleView';
import clsx from 'clsx';

const AdminDashboard = ({ onBack }: { onBack: () => void }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'logs'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Initial Load & Auto-Refresh
  useEffect(() => {
      let interval: any;
      
      const loadStats = async () => {
          try {
              if (!stats) setLoading(true); // Only show loader on first load
              const data = await getAnalyticsStats();
              setStats(data);
          } catch(e) {
              console.error("Failed to load stats", e);
          } finally {
              setLoading(false);
          }
      };

      if (isAuthenticated) {
          // Load immediately
          loadStats();
          // Refresh every 10s for near-realtime updates
          interval = setInterval(loadStats, 10000);
      }
      return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogin = async () => {
    const cleanPassword = password.trim();
    if (!cleanPassword) { setError('Enter Password'); return; }
    
    try {
      const hash = await hashPassword(cleanPassword);
      if (hash === TARGET_HASH) {
        setIsAuthenticated(true);
        // Stats loading triggers via useEffect
        setError('');
      } else {
        setError('Access Denied');
        setPassword('');
      }
    } catch (e) {
      setError('Auth Error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleLogin();
  };

  // ── LOCK SCREEN ──
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#020617] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black opacity-80"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
           <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-purple-600/20 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
              <Lock size={32} className="text-red-400" />
           </div>
           <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Admin Console</h2>
           <p className="text-slate-400 text-sm mb-8 text-center">Secure Access Only</p>

           <div className="w-full space-y-4">
              <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Passkey"
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

              <Button fullWidth variant="primary" onClick={handleLogin} className="shadow-red-500/20 from-red-600 to-pink-600">
                Unlock System
              </Button>
              <button onClick={onBack} className="w-full text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors py-2">Exit</button>
           </div>
        </div>
      </div>
    );
  }

  if (loading && !stats) {
      return (
          <div className="h-screen w-full flex items-center justify-center bg-[#020617] text-emerald-400">
              <Loader2 className="animate-spin" size={32} />
          </div>
      );
  }

  // Handle error state where stats failed to load
  if (!stats) {
      return (
          <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617] text-slate-400 gap-6">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                  <AlertTriangle size={36} />
              </div>
              <div className="text-center space-y-1">
                  <p className="text-lg font-bold text-slate-200">Unable to load analytics</p>
                  <p className="text-sm text-slate-500">Please check your connection and try again.</p>
              </div>
              <div className="flex gap-4">
                  <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all">
                      Retry
                  </button>
                  <button onClick={onBack} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-bold transition-all">
                      Go Back
                  </button>
              </div>
          </div>
      );
  }

  // ── DATA PREP ──
  const filteredUsers = stats.users?.filter((u: any) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.lastLocation && u.lastLocation.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <SimpleView title="App Intelligence" onBack={onBack}>
      <div className="pb-24 space-y-6 animate-enter min-h-screen">
        
        {/* Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <StatCard 
             label="Active Now" 
             value={stats.overview.activeUsers} 
             icon={Activity} 
             color="text-emerald-400" 
             bg="bg-emerald-500/10" 
             sub={`out of ${stats.overview.totalUsers} total`}
           />
           <StatCard 
             label="Google Users" 
             value={stats.overview.googleUsers} 
             icon={Globe} 
             color="text-blue-400" 
             bg="bg-blue-500/10"
             sub={`${stats.overview.guestUsers} Guests`}
           />
           <StatCard 
             label="Avg Session" 
             value={stats.overview.avgSessionTime} 
             icon={Clock} 
             color="text-amber-400" 
             bg="bg-amber-500/10"
             sub={`${stats.overview.totalSessions} Sessions`}
           />
           <StatCard 
             label="Total Hits" 
             value={stats.overview.totalLogs} 
             icon={Activity} 
             color="text-purple-400" 
             bg="bg-purple-500/10"
             sub="All Time"
           />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-1">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" icon={Activity} />
            <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="User Details" icon={Users} />
            <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} label="Raw Logs" icon={Calendar} />
        </div>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Page Views */}
                <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/40">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Smartphone size={16} className="text-slate-400" /> Most Visited Pages
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(stats.views).sort(([,a]:any, [,b]:any) => b - a).slice(0, 6).map(([page, count]: any, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between text-xs font-medium text-slate-300">
                                <span>{page}</span>
                                <span>{count}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" 
                                    style={{ width: `${(count / stats.overview.totalLogs) * 100}%` }}
                                ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Device Breakdown Simulation (Visual Only) */}
                <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/40 flex flex-col justify-center items-center">
                     <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 w-full text-left flex items-center gap-2">
                        <Laptop size={16} className="text-slate-400" /> User Devices
                     </h3>
                     <div className="flex gap-8 items-end h-40">
                         <DeviceBar label="Mobile" height="80%" color="bg-pink-500" />
                         <DeviceBar label="Desktop" height="20%" color="bg-blue-500" />
                         <DeviceBar label="Tablet" height="10%" color="bg-amber-500" />
                     </div>
                </div>
            </div>
        )}

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
            <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/40 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black/20 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-white/30 w-64"
                        />
                    </div>
                    <span className="text-xs font-mono text-slate-500">{filteredUsers.length} Users Found</span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-white/5 text-slate-400 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="py-3 pl-6">User</th>
                                <th className="py-3">Status</th>
                                <th className="py-3">Type</th>
                                <th className="py-3">Last Active</th>
                                <th className="py-3">Time Used</th>
                                <th className="py-3">Device</th>
                                <th className="py-3 pr-6">Location</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((u: any, i: number) => (
                                <tr key={i} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-3 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold border border-white/10">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{u.name}</p>
                                                <p className="text-[10px] text-slate-500">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        {u.isActive ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
                                            </span>
                                        ) : (
                                            <span className="text-slate-600 text-[10px] font-medium">Offline</span>
                                        )}
                                    </td>
                                    <td className="py-3">
                                        {u.provider === 'google' ? (
                                            <span className="flex items-center gap-1 text-blue-400"><Globe size={12}/> Google</span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-slate-500"><User size={12}/> Guest</span>
                                        )}
                                    </td>
                                    <td className="py-3 font-mono text-slate-400">
                                        {new Date(u.lastSeen).toLocaleString()}
                                    </td>
                                    <td className="py-3 font-mono text-amber-400 font-bold">
                                        {u.totalTimeFormatted}
                                    </td>
                                    <td className="py-3">
                                        <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] text-slate-300">
                                            {u.osList[0] || 'Unknown'} / {u.deviceList[0] || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-6 text-cyan-400">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={12} /> {u.lastLocation}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- RAW LOGS TAB --- */}
        {activeTab === 'logs' && (
            <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/40 overflow-hidden">
                <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-left text-xs text-slate-400">
                        <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="py-3 pl-6">Time</th>
                                <th className="py-3">User</th>
                                <th className="py-3">Action</th>
                                <th className="py-3 pr-6">Location</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {stats.recentLogs.map((log: any) => (
                                <tr key={log.id} className="group hover:bg-white/5 transition-colors font-mono">
                                    <td className="py-2 pl-6 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                    <td className="py-2 text-white">{log.userEmail.split('@')[0]}</td>
                                    <td className="py-2">
                                        <span className="text-cyan-400 bg-cyan-950/30 px-1.5 py-0.5 rounded">{log.view}</span>
                                        {log.action && <span className="ml-2 text-slate-500 text-[10px]">{log.action}</span>}
                                    </td>
                                    <td className="py-2 pr-6">{log.location}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

      </div>
    </SimpleView>
  );
};

// --- Sub Components ---

const StatCard = ({ label, value, sub, icon: Icon, color, bg }: any) => (
  <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center gap-1 min-h-[110px]">
     <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center mb-1", bg)}>
        <Icon size={16} className={color} />
     </div>
     <span className="text-2xl font-black text-white">{value}</span>
     <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{label}</span>
     {sub && <span className="text-[9px] text-slate-500 font-mono mt-1">{sub}</span>}
  </div>
);

const TabButton = ({ active, onClick, label, icon: Icon }: any) => (
    <button 
        onClick={onClick}
        className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all",
            active ? "bg-white/10 text-white shadow-lg border border-white/10" : "text-slate-500 hover:text-white hover:bg-white/5"
        )}
    >
        <Icon size={14} /> {label}
    </button>
);

const DeviceBar = ({ label, height, color }: any) => (
    <div className="flex flex-col items-center gap-2 h-full justify-end w-16">
        <div className="w-full bg-slate-800 rounded-t-lg relative overflow-hidden group" style={{ height }}>
            <div className={clsx("absolute inset-0 opacity-70 group-hover:opacity-100 transition-opacity", color)}></div>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
    </div>
);

export default AdminDashboard;
