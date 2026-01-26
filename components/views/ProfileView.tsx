
import React, { useState } from 'react';
import { Language, UserProfile } from '../../types';
import SimpleView from '../layout/SimpleView';
import { Button } from '../Button';
import { UserCircle, MapPin, Ruler, Sprout, Save, User, Shield, Activity } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';

// --- CIRCULAR ORB BASE GRAPH ---
const LandAreaOrb = ({ area, unit }: { area: string, unit: string }) => {
    const num = parseFloat(area) || 0;
    const percentage = Math.min((num / 10) * 100, 100);
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-full py-8 flex flex-col items-center justify-center">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none"></div>
             <div className="relative w-48 h-48">
                 <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 140 140">
                     <circle cx="70" cy="70" r="60" fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
                     <circle 
                        cx="70" cy="70" r="60" 
                        fill="none" 
                        stroke="url(#gradient-land-profile)" 
                        strokeWidth="12" 
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-1000 ease-out"
                     >
                        <animate attributeName="stroke-dashoffset" from={circumference} to={offset} dur="1.5s" fill="freeze" />
                     </circle>
                     <defs>
                         <linearGradient id="gradient-land-profile" x1="0%" y1="0%" x2="100%" y2="0%">
                             <stop offset="0%" stopColor="#34d399" />
                             <stop offset="100%" stopColor="#059669" />
                         </linearGradient>
                     </defs>
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-4xl font-black text-white drop-shadow-lg">{num}</span>
                     <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest mt-1">{unit}</span>
                 </div>
             </div>
             <div className="mt-2 text-center">
                 <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Registered Land</h3>
             </div>
        </div>
    );
}

const ProfileView = ({ 
    lang, 
    currentUser, 
    onSave, 
    onBack,
    onNavigate 
}: { 
    lang: Language, 
    currentUser: UserProfile, 
    onSave: (u: UserProfile) => void, 
    onBack: () => void,
    onNavigate?: (v: any) => void
}) => {
    const [name, setName] = useState(currentUser.name);
    const [village, setVillage] = useState(currentUser.village);
    const [district, setDistrict] = useState(currentUser.district);
    const [landSize, setLandSize] = useState(currentUser.landSize);
    const [crop, setCrop] = useState(currentUser.crop);

    const handleSave = () => {
        triggerHaptic();
        onSave({ name, village, district, landSize, crop });
    };

    return (
        <SimpleView title="Farmer Profile" onBack={onBack}>
            <div className="pb-24 animate-enter space-y-6">
                <div className="flex flex-col items-center justify-center">
                    <LandAreaOrb area={landSize.split(' ')[0]} unit="Acres" />
                </div>

                <div className="glass-panel rounded-[2rem] p-6 border border-white/10 space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-cyan-400 tracking-wider flex items-center gap-2">
                            <User size={14}/> Name
                        </label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all text-lg font-medium placeholder:text-slate-600" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2"><MapPin size={14}/> Village</label>
                            <input type="text" value={village} onChange={(e) => setVillage(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-emerald-400 tracking-wider">District</label>
                            <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center gap-2"><Ruler size={14}/> Land Size</label>
                        <input type="text" value={landSize} onChange={(e) => setLandSize(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-fuchsia-400 tracking-wider flex items-center gap-2"><Sprout size={14}/> Main Crop</label>
                        <input type="text" value={crop} onChange={(e) => setCrop(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50 transition-all" />
                    </div>
                </div>

                <div className="space-y-3">
                    <Button fullWidth size="lg" variant="primary" onClick={handleSave} icon={<Save size={20}/>} className="shadow-cyan-500/20">Save Details</Button>
                    
                    {/* Admin Access inside Profile */}
                    <button 
                        onClick={() => onNavigate && onNavigate('ADMIN')} 
                        className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all group"
                    >
                        <Shield size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Access Activity Logs</span>
                        <Activity size={14} className="animate-pulse" />
                    </button>
                </div>
            </div>
        </SimpleView>
    );
};

export default ProfileView;
