
import React from 'react';
import { Language } from '../../types';
import { TRANSLATIONS, SCHEMES_DATA } from '../../constants';
import SimpleView from '../layout/SimpleView';
import { Landmark, ArrowUpRight } from 'lucide-react';

const SchemesView = ({ lang, onBack, onSelect }: { lang: Language, onBack: () => void, onSelect: (scheme: any) => void }) => {
    const t = TRANSLATIONS[lang];
    const schemes = SCHEMES_DATA[lang as Language] || SCHEMES_DATA['en'];

    return (
        <SimpleView title={t.schemes_title} onBack={onBack}>
            <div className="space-y-4 pb-24">
                <p className="text-slate-400 text-sm px-2 mb-4">{t.schemes_desc}</p>
                {schemes.map((s: any) => (
                    <div onClick={() => onSelect(s)} key={s.id} className="glass-panel rounded-[2rem] p-5 relative overflow-hidden cursor-pointer group active:scale-[0.98] transition-all border border-white/10 flex flex-col gap-4">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${s.grad} opacity-10 blur-3xl rounded-full`}></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-white shadow-lg`}>
                                <Landmark size={24}/>
                            </div>
                            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-green-500/20">{s.status}</span>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white leading-tight mb-1">{s.title}</h3>
                            <p className="text-slate-400 text-sm">{s.subtitle}</p>
                        </div>
                        <div className="pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.apply_btn}</span>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                <ArrowUpRight size={16} className="text-white"/>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </SimpleView>
    );
};

export default SchemesView;
