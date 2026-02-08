
import React from 'react';
import { Language } from '../../types';
import SimpleView from '../layout/SimpleView';
import { KNOWLEDGE_BASE } from '../../data/knowledge';
import { ArrowRight, BookOpen, Sprout, Droplets, Sun } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';

const AgriKnowledgeView = ({ lang, onBack, onSelect }: { lang: Language, onBack: () => void, onSelect: (item: any) => void }) => {
  const isMr = lang === 'mr';
  const isHi = lang === 'hi';
  
  const getLocalizedText = (obj: any) => {
    return isMr ? obj.mr : isHi ? (obj.hi || obj.en) : obj.en;
  };

  return (
    <SimpleView title={isMr ? "कृषी ज्ञान" : isHi ? "कृषि ज्ञान" : "Agri Knowledge"} onBack={onBack}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-24 animate-enter">
        {KNOWLEDGE_BASE.map((item, idx) => (
          <div 
            key={item.id}
            onClick={() => { onSelect(item); triggerHaptic(); }}
            className="group relative h-64 rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/10 hover:-translate-y-1"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={item.image} 
                alt={getLocalizedText(item.title)}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              {/* Floating Badge */}
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full">
                <span className="text-[10px] font-black uppercase tracking-wider text-white">
                  {item.category === 'crop' ? (isMr ? 'पीक' : 'Crop') : (isMr ? 'तंत्रज्ञान' : 'Tech')}
                </span>
              </div>

              <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-2xl font-black text-white leading-tight mb-1 drop-shadow-lg">
                  {getLocalizedText(item.title)}
                </h3>
                <p className="text-slate-300 text-sm font-medium mb-4 line-clamp-2 opacity-90">
                  {getLocalizedText(item.subtitle)}
                </p>

                {/* Stats Row */}
                <div className="flex items-center gap-4 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                   {item.stats.slice(0,2).map((stat: any, i: number) => (
                     <div key={i} className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                        {stat.icon === 'clock' && <Sun size={14}/>}
                        {stat.icon === 'droplet' && <Droplets size={14}/>}
                        <span>{stat.value}</span>
                     </div>
                   ))}
                </div>

                {/* Button */}
                <div className="flex items-center gap-2 text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  <span>{isMr ? 'सविस्तर वाचा' : 'Read More'}</span>
                  <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SimpleView>
  );
};

export default AgriKnowledgeView;
