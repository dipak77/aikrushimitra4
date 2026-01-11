
import React from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { ArrowLeft, IndianRupee, CheckCircle2, CheckSquare, FileText, FileCheck, ListOrdered } from 'lucide-react';

const SchemeDetailView = ({ scheme, lang, onBack }: { scheme: any, lang: Language, onBack: () => void }) => {
    const t = TRANSLATIONS[lang];

    return (
        <div className="h-full w-full flex flex-col bg-[#020617] animate-enter lg:pl-32">
            {/* Header with Hero Gradient */}
            <div className={`relative w-full h-64 bg-gradient-to-br ${scheme.grad} shrink-0`}>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"></div>
                
                <div className="absolute top-0 left-0 right-0 p-6 pt-safe-top flex items-center gap-4 z-10">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-all border border-white/10">
                        <ArrowLeft size={20}/>
                    </button>
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">{t.schemes_title}</span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 z-10">
                    <h1 className="text-3xl font-black text-white leading-tight mb-2 shadow-sm">{scheme.title}</h1>
                    <p className="text-white/90 text-sm font-medium">{scheme.subtitle}</p>
                </div>
            </div>

            {/* Content Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-32 pt-6 -mt-6 rounded-t-[2.5rem] bg-[#020617] relative z-20 hide-scrollbar">
                
                {/* Description */}
                <div className="mb-8">
                    <p className="text-slate-300 leading-relaxed text-sm">{scheme.description}</p>
                </div>

                {/* Benefits Section */}
                <div className="mb-8">
                    <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">
                        <IndianRupee size={20} className="text-green-400"/>
                        {t.scheme_tabs_info}
                    </h3>
                    <div className="grid gap-3">
                        {scheme.benefits.map((b: string, i: number) => (
                            <div key={i} className="glass-panel p-4 rounded-xl flex gap-3 items-start border border-green-500/10 bg-green-900/5">
                                <CheckCircle2 size={18} className="text-green-400 shrink-0 mt-0.5"/>
                                <span className="text-slate-200 text-sm font-medium">{b}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Eligibility Section */}
                <div className="mb-8">
                    <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">
                        <CheckSquare size={20} className="text-blue-400"/>
                        {t.scheme_eligibility}
                    </h3>
                    <div className="glass-panel p-5 rounded-2xl border border-white/10">
                        <ul className="space-y-3">
                            {scheme.eligibility.map((e: string, i: number) => (
                                <li key={i} className="flex gap-3 text-slate-300 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></div>
                                    {e}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Documents Section */}
                <div className="mb-8">
                    <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-amber-400"/>
                        {t.scheme_documents_req}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {scheme.documents.map((d: string, i: number) => (
                            <div key={i} className="glass-panel p-3 rounded-xl flex flex-col items-center justify-center text-center gap-2 bg-white/5 min-h-[100px]">
                                <FileCheck size={24} className="text-amber-400/80"/>
                                <span className="text-xs text-slate-300 font-bold">{d}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step by Step Process */}
                <div className="mb-8">
                    <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">
                        <ListOrdered size={20} className="text-purple-400"/>
                        {t.scheme_step_by_step}
                    </h3>
                    <div className="relative pl-4 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                        {scheme.process.map((step: any, i: number) => (
                            <div key={i} className="relative pl-6">
                                <div className="absolute left-[-5px] top-0 w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]"></div>
                                <h4 className="text-white font-bold text-base mb-1">{step.title}</h4>
                                <p className="text-slate-400 text-sm">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-10"></div>
            </div>
        </div>
    );
};

export default SchemeDetailView;
