
import React from 'react';
import { Language } from '../../types';
import { ArrowLeft, Clock, Droplets, Sun, Sprout, BookOpen, Share2 } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';

const KnowledgeDetailView = ({ item, lang, onBack }: { item: any, lang: Language, onBack: () => void }) => {
  const isMr = lang === 'mr';
  const isHi = lang === 'hi';
  
  const getLocalizedText = (obj: any) => {
    return isMr ? obj.mr : isHi ? (obj.hi || obj.en) : obj.en;
  };

  const IconMap: any = {
    clock: Clock,
    droplet: Droplets,
    sun: Sun,
    'trending-up': Sprout,
    'indian-rupee': BookOpen
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#020617] animate-enter lg:pl-32 overflow-hidden">
      {/* Hero Header */}
      <div className="relative w-full h-[40vh] shrink-0">
        <img 
          src={item.image} 
          alt={getLocalizedText(item.title)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />
        
        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 p-6 pt-safe-top flex items-center justify-between z-20">
          <button 
            onClick={() => { onBack(); triggerHaptic(); }} 
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all"
          >
            <ArrowLeft size={20}/>
          </button>
          <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all">
            <Share2 size={18}/>
          </button>
        </div>

        {/* Title Block */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <div className="flex flex-wrap gap-2 mb-3">
            {item.tags.map((tag: string, i: number) => (
              <span key={i} className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2 drop-shadow-xl">
            {getLocalizedText(item.title)}
          </h1>
          <p className="text-slate-300 font-medium text-sm md:text-base max-w-2xl">
            {getLocalizedText(item.subtitle)}
          </p>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-24 -mt-4 relative z-30">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {item.stats.map((stat: any, i: number) => {
            const Icon = IconMap[stat.icon] || Sprout;
            return (
              <div key={i} className="bg-slate-800/50 backdrop-blur-md border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-1">
                <Icon size={18} className="text-emerald-400 mb-1" />
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide">{getLocalizedText(stat.label)}</span>
                <span className="text-sm font-bold text-white">{stat.value}</span>
              </div>
            );
          })}
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {item.sections.map((section: any, i: number) => (
            <div key={i} className="animate-enter" style={{ animationDelay: `${i * 100}ms` }}>
              <h3 className="flex items-center gap-3 text-lg font-black text-white mb-3">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                {getLocalizedText(section.title)}
              </h3>
              <div className="text-slate-300 leading-relaxed text-sm md:text-base font-medium pl-4 border-l border-white/5">
                {getLocalizedText(section.content)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeDetailView;
