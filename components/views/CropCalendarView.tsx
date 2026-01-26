
import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import SimpleView from '../layout/SimpleView';
import { CROP_SCHEDULES } from '../../data/mock';
import { CheckCircle2, Circle, Clock, ChevronDown, Calendar, Sprout, Leaf, Droplets, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { triggerHaptic } from '../../utils/common';

const CropCalendarView = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
    const t = TRANSLATIONS[lang];
    const schedules = CROP_SCHEDULES[lang as keyof typeof CROP_SCHEDULES] || CROP_SCHEDULES['en'];
    const [selectedCropIdx, setSelectedCropIdx] = useState(0);
    const [animatedDay, setAnimatedDay] = useState(0);

    const crop = schedules[selectedCropIdx];
    
    // Animate the day counter on mount
    useEffect(() => {
        let start = 0;
        const end = crop.currentDay;
        const timer = setInterval(() => {
            start += 1;
            setAnimatedDay(start);
            if (start >= end) clearInterval(timer);
        }, 20);
        return () => clearInterval(timer);
    }, [crop]);

    return (
        <SimpleView title={t.crop_schedule} onBack={onBack}>
            <div className="pb-32 space-y-8 animate-enter">
                
                {/* 1. Crop Selector Carousel */}
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 px-1">
                    {schedules.map((c: any, i: number) => (
                        <button 
                            key={i}
                            onClick={() => { setSelectedCropIdx(i); triggerHaptic(); }}
                            className={clsx(
                                "flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-300 shrink-0 shadow-lg",
                                selectedCropIdx === i 
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-400/50 scale-105 shadow-emerald-500/20" 
                                  : "bg-white/5 border-white/10 hover:bg-white/10 grayscale hover:grayscale-0"
                            )}
                        >
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <Sprout size={16} className="text-white"/>
                            </div>
                            <div className="text-left">
                                <p className={clsx("text-sm font-black uppercase", selectedCropIdx === i ? "text-white" : "text-slate-400")}>{c.name}</p>
                                <p className="text-[10px] text-white/60 font-mono">{c.variety}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* 2. Hero Progress Orb */}
                <div className="relative w-full h-48 flex items-center justify-center">
                    {/* Background Glows */}
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-[3rem] blur-3xl"></div>
                    
                    {/* Central Orb */}
                    <div className="relative w-40 h-40 flex items-center justify-center">
                         {/* Spinning Rings */}
                         <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/30 animate-[spin-slow_10s_linear_infinite]"></div>
                         <div className="absolute inset-2 rounded-full border border-emerald-400/20 animate-[spin-reverse-slow_15s_linear_infinite]"></div>
                         
                         {/* SVG Progress Circle */}
                         <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                             <circle cx="50" cy="50" r="45" fill="none" stroke="#0f172a" strokeWidth="8" />
                             <circle 
                                cx="50" cy="50" r="45" 
                                fill="none" 
                                stroke="url(#progress-gradient)" 
                                strokeWidth="8" 
                                strokeLinecap="round"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * (animatedDay / 100))}
                                className="transition-all duration-100 ease-out"
                             />
                             <defs>
                                <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#34d399" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                             </defs>
                         </svg>

                         {/* Center Text */}
                         <div className="flex flex-col items-center z-10">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Day</span>
                             <span className="text-4xl font-black text-white drop-shadow-lg">{animatedDay}</span>
                             <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1 border border-emerald-500/20">
                                Active
                             </span>
                         </div>
                    </div>
                </div>

                {/* 3. The "Living Vine" Timeline */}
                <div className="relative px-2">
                    {/* Main Central Stem */}
                    <div className="absolute left-[28px] top-4 bottom-0 w-[4px] bg-gradient-to-b from-emerald-500 via-teal-600 to-slate-800 rounded-full"></div>

                    <div className="space-y-8 relative">
                        {crop.stages.map((stage: any, idx: number) => {
                            const isCompleted = stage.status === 'completed';
                            const isActive = stage.status === 'active';
                            
                            return (
                                <div key={stage.id} className={clsx("relative pl-16 group transition-all duration-500", isActive && "scale-105")}>
                                    
                                    {/* Timeline Node (Leaf/Check) */}
                                    <div className={clsx(
                                        "absolute left-0 top-0 w-14 h-14 rounded-2xl flex items-center justify-center border-4 shadow-xl z-10 transition-all duration-500",
                                        isActive 
                                          ? "bg-gradient-to-br from-emerald-400 to-teal-500 border-[#020617] text-white shadow-emerald-500/40" 
                                          : isCompleted 
                                            ? "bg-slate-900 border-emerald-500/50 text-emerald-500" 
                                            : "bg-slate-900 border-slate-700 text-slate-600"
                                    )}>
                                        {isCompleted ? <CheckCircle2 size={24} /> : <stage.icon size={24} className={isActive ? "animate-bounce" : ""} />}
                                    </div>

                                    {/* Connector Line for Node */}
                                    <div className={clsx(
                                        "absolute left-[28px] top-7 w-8 h-[2px]",
                                        isActive ? "bg-emerald-400" : "bg-transparent"
                                    )}></div>

                                    {/* Content Card */}
                                    <div className={clsx(
                                        "glass-panel rounded-[1.5rem] p-5 border transition-all duration-500 relative overflow-hidden",
                                        isActive 
                                          ? "border-emerald-500/40 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]" 
                                          : "border-white/5 bg-white/5 opacity-80 hover:opacity-100"
                                    )}>
                                        {/* Background Pulse for Active */}
                                        {isActive && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>}

                                        <div className="flex justify-between items-start mb-2 relative z-10">
                                            <div>
                                                <h3 className={clsx("text-lg font-black leading-tight", isActive ? "text-white" : "text-slate-300")}>
                                                    {stage.title}
                                                </h3>
                                                <p className="text-xs font-bold font-mono text-slate-500 mt-1 flex items-center gap-1">
                                                    <Clock size={10} /> {stage.days} Days
                                                </p>
                                            </div>
                                            {isActive && (
                                                <span className="px-2 py-1 rounded-md bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
                                                    Current
                                                </span>
                                            )}
                                        </div>

                                        {/* Tasks List */}
                                        <div className="space-y-2 mt-4 relative z-10">
                                            {stage.tasks.map((task: any, tIdx: number) => (
                                                <div key={tIdx} className={clsx(
                                                    "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                                                    isActive ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/5"
                                                )}>
                                                    <div className={clsx("p-1.5 rounded-lg", isActive ? "bg-emerald-500/20" : "bg-white/10")}>
                                                        <task.i size={14} className={isActive ? "text-emerald-300" : "text-slate-400"} />
                                                    </div>
                                                    <span className={clsx("text-sm font-medium", isActive ? "text-emerald-100" : "text-slate-400")}>
                                                        {task.t}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Action Button for Active Stage */}
                                        {isActive && (
                                            <button className="mt-4 w-full py-3 rounded-xl bg-white text-emerald-900 font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-50 transition-colors active:scale-[0.98]">
                                                View Detailed Guide <ArrowRight size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
            
            <style>{`
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes spin-reverse-slow { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
            `}</style>
        </SimpleView>
    );
};

export default CropCalendarView;
