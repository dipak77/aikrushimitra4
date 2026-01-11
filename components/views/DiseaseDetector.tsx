
import React, { useState, useRef } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import SimpleView from '../layout/SimpleView';
import { X, Camera, ScanLine, Loader2, CheckCircle2, Share2 } from 'lucide-react';
import { Button } from '../Button';
import { analyzeCropDisease } from '../../services/geminiService';

const DiseaseDetector = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
         if (ev.target?.result) setImage(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const analyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    const res = await analyzeCropDisease(image, lang);
    setResult(res || "Error analyzing image.");
    setAnalyzing(false);
  };

  const reset = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <SimpleView title={t.scan_title} onBack={onBack}>
       <div className="flex flex-col gap-6 animate-enter pb-20">
          {/* Image Area */}
          <div className="aspect-square w-full md:aspect-video rounded-[2.5rem] glass-panel border border-white/10 relative overflow-hidden flex flex-col items-center justify-center bg-slate-900/40 group shadow-2xl">
             {image ? (
               <div className="relative w-full h-full">
                 <img src={image} alt="Crop" className="w-full h-full object-cover" />
                 {!analyzing && !result && (
                     <button onClick={reset} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md">
                        <X size={16} />
                     </button>
                 )}
               </div>
             ) : (
               <div className="text-center p-6 relative z-10">
                  <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 cursor-pointer group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
                     <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping opacity-0 group-hover:opacity-100"></div>
                     <Camera size={36} className="text-cyan-300 relative z-10 drop-shadow-md"/>
                  </div>
                  <p className="text-slate-300 font-bold text-sm mb-6 max-w-[200px] mx-auto leading-relaxed">{t.scan_desc}</p>
                  <Button onClick={() => fileInputRef.current?.click()} variant="primary" icon={<Camera size={18}/>} className="shadow-cyan-500/20">
                     {t.take_photo}
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile} capture="environment" />
               </div>
             )}
          </div>

          {/* Controls / Result */}
          {image && !analyzing && !result && (
             <div className="flex gap-3 animate-enter">
                <Button onClick={reset} variant="secondary" fullWidth className="py-4">Retake</Button>
                <Button onClick={analyze} variant="primary" fullWidth icon={<ScanLine size={18}/>} className="py-4 shadow-emerald-500/20 from-emerald-600 to-teal-600">Analyze Disease</Button>
             </div>
          )}

          {analyzing && (
             <div className="glass-panel p-10 rounded-[2rem] flex flex-col items-center justify-center text-center animate-enter border border-cyan-500/20 bg-cyan-900/5">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse"></div>
                    <Loader2 size={48} className="text-cyan-400 animate-spin relative z-10"/>
                </div>
                <p className="font-bold text-xl text-white animate-pulse">{t.analyzing}</p>
                <p className="text-slate-400 text-sm mt-2">Checking for symptoms...</p>
             </div>
          )}

          {result && (
             <div className="glass-panel p-6 rounded-[2rem] border border-emerald-500/20 bg-gradient-to-b from-emerald-900/10 to-transparent animate-enter shadow-2xl shadow-emerald-900/10">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                   <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 size={24}/>
                   </div>
                   <div>
                       <h3 className="text-xl font-black text-white">{t.analysis_report}</h3>
                       <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">AI Diagnosis Complete</p>
                   </div>
                </div>
                <div className="prose prose-invert prose-lg max-w-none">
                   <p className="whitespace-pre-wrap leading-relaxed text-slate-200 font-medium">{result}</p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3">
                   <Button variant="primary" fullWidth icon={<Share2 size={18}/>}>{t.share_expert}</Button>
                   <Button onClick={reset} variant="ghost" fullWidth>Scan Another Crop</Button>
                </div>
             </div>
          )}
       </div>
    </SimpleView>
  );
};

export default DiseaseDetector;
