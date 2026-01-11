
import React, { useState } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import SimpleView from '../layout/SimpleView';
import { Button } from '../Button';
import { FlaskConical, TestTube } from 'lucide-react';
import { getSoilAdvice } from '../../services/geminiService';

const SoilAnalysis = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
    const t = TRANSLATIONS[lang];
    const [n, setN] = useState(50);
    const [p, setP] = useState(30);
    const [k, setK] = useState(20);
    const [crop, setCrop] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!crop) return;
        setLoading(true);
        const advice = await getSoilAdvice({ n, p, k }, crop, lang);
        setResult(advice);
        setLoading(false);
    };

    return (
        <SimpleView title={t.soil_title} onBack={onBack}>
            <div className="space-y-6 pb-20 animate-enter">
                <div className="glass-panel rounded-[2rem] p-6 border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-1 text-white">{t.soil_subtitle}</h2>
                        <p className="text-slate-400 text-sm mb-6">Adjust sliders based on your soil health card.</p>
                        
                        {/* Sliders */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-green-300">{t.n_label}</label>
                                    <span className="font-mono text-white bg-white/10 px-2 rounded">{n}</span>
                                </div>
                                <input type="range" min="0" max="200" value={n} onChange={(e) => setN(Number(e.target.value))} 
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-blue-300">{t.p_label}</label>
                                    <span className="font-mono text-white bg-white/10 px-2 rounded">{p}</span>
                                </div>
                                <input type="range" min="0" max="100" value={p} onChange={(e) => setP(Number(e.target.value))} 
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-orange-300">{t.k_label}</label>
                                    <span className="font-mono text-white bg-white/10 px-2 rounded">{k}</span>
                                </div>
                                <input type="range" min="0" max="100" value={k} onChange={(e) => setK(Number(e.target.value))} 
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                            </div>
                        </div>

                        {/* Crop Input */}
                        <div className="mt-8">
                            <label className="block text-sm font-bold text-slate-300 mb-2">{t.crop_input}</label>
                            <input 
                                type="text" 
                                value={crop}
                                onChange={(e) => setCrop(e.target.value)}
                                placeholder="e.g. Soyabean, Cotton, Rice"
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                            />
                        </div>

                        <div className="mt-8">
                            <Button 
                                fullWidth 
                                onClick={handleAnalyze} 
                                loading={loading}
                                disabled={!crop}
                                variant="primary"
                                icon={<FlaskConical size={18} />}
                                className="from-orange-600 to-amber-600 shadow-orange-500/20"
                            >
                                {t.analyze_soil_btn}
                            </Button>
                        </div>
                    </div>
                </div>

                {result && (
                    <div className="glass-panel p-6 rounded-[2rem] border border-cyan-500/20 bg-gradient-to-b from-cyan-900/10 to-transparent animate-enter shadow-2xl">
                         <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                                <TestTube size={24}/>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">{t.soil_result_title}</h3>
                                <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider">AI Recommendation</p>
                            </div>
                         </div>
                         <div className="prose prose-invert prose-lg max-w-none">
                            <p className="whitespace-pre-wrap leading-relaxed text-slate-200 font-medium">{result}</p>
                         </div>
                    </div>
                )}
            </div>
        </SimpleView>
    );
};

export default SoilAnalysis;
