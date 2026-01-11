
import React, { useState } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import SimpleView from '../layout/SimpleView';
import { Button } from '../Button';
import { TrendingUp } from 'lucide-react';
import { predictYield } from '../../services/geminiService';

const YieldPredictor = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
    const t = TRANSLATIONS[lang];
    const [crop, setCrop] = useState('');
    const [sowingDate, setSowingDate] = useState('');
    const [soil, setSoil] = useState('');
    const [irrigation, setIrrigation] = useState('');
    const [area, setArea] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handlePredict = async () => {
        if (!crop || !area) return;
        setLoading(true);
        const prediction = await predictYield({ crop, sowingDate, soilType: soil, irrigation, area }, lang);
        setResult(prediction);
        setLoading(false);
    };

    return (
        <SimpleView title={t.yield_title} onBack={onBack}>
            <div className="space-y-6 pb-20 animate-enter">
                <div className="glass-panel rounded-[2rem] p-6 border border-white/10 relative overflow-hidden bg-slate-900/40">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <label className="text-xs text-slate-400 font-bold uppercase">{t.crop_input}</label>
                             <input type="text" value={crop} onChange={(e) => setCrop(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500/50" />
                        </div>
                        <div className="space-y-2">
                             <label className="text-xs text-slate-400 font-bold uppercase">{t.sowing_date}</label>
                             <input type="date" value={sowingDate} onChange={(e) => setSowingDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500/50" />
                        </div>
                        <div className="space-y-2">
                             <label className="text-xs text-slate-400 font-bold uppercase">{t.soil_type}</label>
                             <select value={soil} onChange={(e) => setSoil(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500/50">
                                 <option value="">Select Soil</option>
                                 <option value="Black">Black Soil (काळी)</option>
                                 <option value="Red">Red Soil (तांबडी)</option>
                                 <option value="Sandy">Sandy (रेताड)</option>
                             </select>
                        </div>
                        <div className="space-y-2">
                             <label className="text-xs text-slate-400 font-bold uppercase">{t.irrigation_type}</label>
                             <select value={irrigation} onChange={(e) => setIrrigation(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500/50">
                                 <option value="">Select Type</option>
                                 <option value="Rainfed">Rainfed (जिरायती)</option>
                                 <option value="Irrigated">Irrigated (बागायती)</option>
                             </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                             <label className="text-xs text-slate-400 font-bold uppercase">{t.area_size}</label>
                             <input type="number" value={area} onChange={(e) => setArea(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500/50" placeholder="e.g. 2.5" />
                        </div>
                    </div>
                    <div className="mt-8">
                        <Button fullWidth onClick={handlePredict} loading={loading} variant="primary" className="from-blue-600 to-cyan-600 shadow-blue-500/20">{t.predict_btn}</Button>
                    </div>
                </div>

                {result && (
                     <div className="glass-panel p-6 rounded-[2rem] border border-blue-500/20 bg-gradient-to-b from-blue-900/10 to-transparent animate-enter shadow-2xl">
                         <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <TrendingUp size={24}/>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">{t.yield_result}</h3>
                                <p className="text-blue-400 text-xs font-bold uppercase tracking-wider">AI Forecast</p>
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

export default YieldPredictor;
