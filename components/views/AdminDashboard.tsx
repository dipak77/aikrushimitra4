
import React, { useState, useEffect } from 'react';
import { getAnalyticsStats, hashPassword, TARGET_HASH } from '../../services/analyticsService';
import { ShieldCheck, Lock, Unlock, Activity, MapPin, Smartphone, Calendar, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Button } from '../Button';
import SimpleView from '../layout/SimpleView';
import clsx from 'clsx';

const AdminDashboard = ({ onBack }: { onBack: () => void }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>(null);

  // Authentication Handler
  const handleLogin = async () => {
    // Sanitize input
    const cleanPassword = password.trim();

    if (!cleanPassword) {
        setError('Please enter password');
        return;
    }
    
    try {
      const hash = await hashPassword(cleanPassword);
      
      if (hash === TARGET_HASH) {
        setIsAuthenticated(true);
        setStats(getAnalyticsStats());
        setError('');
      } else {
        setError('Access Denied: Incorrect Password');
        setPassword('');
      }
    } catch (e) {
      console.error("Hashing failed", e);
      setError('System Error: Authentication Failed');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleLogin();
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#020617] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black opacity-80"></div>
        
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0" style={{ 
            backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
        }}></div>

        <div className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
           <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-purple-600/20 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
              <Lock size={32} className="text-red-400" />
           </div>
           
           <h2 className="text-2xl font-black text-white mb-2 tracking-tight">System Locked</h2>
           <p className="text-slate-400 text-sm mb-8 text-center">Restricted Area. Enter administrator passkey to access activity logs.</p>

           <div className="w-full space-y-4">
              <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter Passkey"
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
                className="shadow-red-500/20 from-red-600 to-pink-600"
              >
                Authenticate
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
    <SimpleView title="Activity Tracking" onBack={onBack}>
      <div className="pb-24 space-y-6 animate-enter">
        
        {/* Header Summary */}
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">System Active</span>
           </div>
           <span className="text-xs font-mono text-slate-500">{new Date().toLocaleString()}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <StatCard label="Total Visits" value={stats.total} icon={Eye} color="text-blue-400" bg="bg-blue-500/10" />
           <StatCard label="Today" value={stats.daily} icon={Activity} color="text-emerald-400" bg="bg-emerald-500/10" />
           <StatCard label="This Week" value={stats.weekly} icon={Calendar} color="text-purple-400" bg="bg-purple-500/10" />
           <StatCard label="This Month" value={stats.monthly} icon={ShieldCheck} color="text-amber-400" bg="bg-amber-500/10" />
        </div>

        {/* Top Views Chart Simulation */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/40">
           <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Smartphone size={16} className="text-slate-400" /> Page Wise Activity
           </h3>
           <div className="space-y-4">
              {Object.entries(stats.views).sort(([,a]:any, [,b]:any) => b - a).slice(0, 5).map(([page, count]: any, i) => (
                 <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-300">
                       <span>{page}</span>
                       <span>{count}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000" 
                         style={{ width: `${(count / stats.total) * 100}%` }}
                       ></div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Recent Logs Table */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/40 overflow-hidden">
           <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-slate-400" /> Recent User Locations
           </h3>
           <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400">
                 <thead>
                    <tr className="border-b border-white/5">
                       <th className="pb-3 pl-2 font-bold uppercase">Time</th>
                       <th className="pb-3 font-bold uppercase">Page</th>
                       <th className="pb-3 font-bold uppercase">Location</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {stats.logs.slice(0, 10).map((log: any) => (
                       <tr key={log.id} className="group hover:bg-white/5 transition-colors">
                          <td className="py-3 pl-2 font-mono text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                          <td className="py-3 text-white font-medium">{log.view}</td>
                          <td className="py-3 text-cyan-400 flex items-center gap-1">
                             <MapPin size={10} /> {log.location}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

      </div>
    </SimpleView>
  );
};

const StatCard = ({ label, value, icon: Icon, color, bg }: any) => (
  <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center gap-2">
     <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center mb-1", bg)}>
        <Icon size={16} className={color} />
     </div>
     <span className="text-2xl font-black text-white">{value}</span>
     <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{label}</span>
  </div>
);

export default AdminDashboard;
    