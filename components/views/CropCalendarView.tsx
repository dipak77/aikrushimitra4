import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import SimpleView from '../layout/SimpleView';
import { CROP_SCHEDULES } from '../../data/mock';
import { CheckCircle2, Circle, Clock, ChevronDown, Calendar, Sprout, Leaf, Droplets, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { triggerHaptic } from '../../utils/common';

const CropCalendarView = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
    const t = TRANSLATIONS[lang];
    const schedules = CROP_SCHEDULES[lang as keyof typeof CROP_SCHEDULES] || CROP_SCHEDULES['en'];
    const [selectedCropIdx, setSelectedCropIdx] = useState(0);
    const [animatedDay, setAnimatedDay] = useState(0);

    const crop = schedules[selectedCropIdx];
    
    // Animate the day counter on mount or crop change
    useEffect(() => {
        let start = 0;
        const end = crop.currentDay;
        const timer = setInterval(() => {
            start += 1;
            setAnimatedDay(start);
            if (start >= end) clearInterval(timer);
        }, 20);
        return () => clearInterval(timer);
    }, [selectedCropIdx, crop.currentDay]);

    return (
        <SimpleView title={t.crop_schedule || "Crop Schedule"} onBack={onBack}>
            <div className="space-y-6 pb-24 animate-enter">
                {/* Crop Selector */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                    {schedules.map((c: any, idx: number) => (
                        <button
                            key={c.id}
                            onClick={() => { setSelectedCropIdx(idx); triggerHaptic(); }}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap",
                                selectedCropIdx === idx 
                                    ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                            )}
                        >
                            {selectedCropIdx === idx && <CheckCircle2 size={14} />}
                            <span className="text-sm font-bold uppercase tracking-wider">{c.name}</span>
                        </button>
                    ))}
                </div>

                {/* Status Card */}
                <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-900/40 to-cyan-900/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-white mb-1">{crop.name}</h2>
                                <p className="text-slate-400 text-sm font-medium">{crop.variety}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Day</p>
                                <p className="text-4xl font-black text-white leading-none">{animatedDay}</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden mb-2">
                            <div 
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300 ease-out"
                                style={{ width: `${(animatedDay / 150) * 100}%` }} // Assuming max duration approx 150 days for visuals
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]"></div>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <span>Sowing</span>
                            <span>Harvest ({crop.duration})</span>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="relative space-y-8 pl-4">
                    {/* Vertical Line */}
                    <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-emerald-500/50 via-slate-700 to-transparent"></div>

                    {crop.stages.map((stage: any, i: number) => {
                        const isActive = stage.status === 'active';
                        const isCompleted = stage.status === 'completed';
                        const Icon = stage.icon || Circle;

                        return (
                            <div key={stage.id} className={clsx("relative pl-10 transition-all duration-500", isActive ? "opacity-100 scale-100" : isCompleted ? "opacity-70" : "opacity-50")}>
                                {/* Node Dot */}
                                <div className={clsx(
                                    "absolute left-3 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center border-[3px] z-10 transition-all duration-500 bg-slate-900",
                                    isActive 
                                        ? "border-emerald-400 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-110" 
                                        : isCompleted 
                                            ? "border-emerald-600/50 text-emerald-600 bg-emerald-900/20" 
                                            : "border-slate-700 text-slate-600"
                                )}>
                                    {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                                </div>

                                {/* Content */}
                                <div className={clsx(
                                    "glass-panel rounded-2xl p-5 border transition-all duration-300",
                                    isActive 
                                        ? "bg-white/10 border-emerald-500/30 shadow-lg" 
                                        : "bg-white/5 border-transparent"
                                )}>
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className={clsx("font-bold text-lg", isActive ? "text-white" : "text-slate-300")}>
                                            {stage.title}
                                        </h3>
                                        <span className={clsx("text-xs font-bold px-2 py-1 rounded-full", isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-slate-500")}>
                                            Day {stage.days}
                                        </span>
                                    </div>

                                    {/* Tasks */}
                                    <div className="space-y-3">
                                        {stage.tasks.map((task: any, idx: number) => {
                                            const TaskIcon = task.i || Circle;
                                            return (
                                                <div key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                                                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                                        <TaskIcon size={12} />
                                                    </div>
                                                    <span>{task.t}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    {isActive && (
                                        <div className="mt-4 pt-4 border-t border-white/5">
                                            <button className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                                <span>View Advisory</span>
                                                <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </SimpleView>
    );
};

export default CropCalendarView;
