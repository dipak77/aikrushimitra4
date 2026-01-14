
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';

interface SimpleViewProps {
  title: string;
  children?: React.ReactNode;
  onBack: () => void;
}

const SimpleView = ({ title, children, onBack }: SimpleViewProps) => {
  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-b from-[#020617] via-[#0b1120] to-[#020617] animate-enter lg:pl-36">
       
       {/* Frosted Glass Sticky Header */}
       <div className="flex items-center gap-5 p-8 pt-safe-top z-50 sticky top-0 bg-[#020617]/80 backdrop-blur-2xl border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300">
          
          {/* Lens-style Back Button */}
          <button onClick={() => { onBack(); triggerHaptic(); }} className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center text-slate-200 border border-white/10 hover:bg-white/15 active:scale-90 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] group relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform relative z-10"/>
          </button>
          
          {/* Shimmer Text Title */}
          <h1 className="text-3xl font-black tracking-tight leading-none relative">
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-white to-cyan-200 bg-[length:200%_auto] animate-[text-shimmer_4s_linear_infinite] drop-shadow-lg">
                {title}
             </span>
          </h1>
          
          <style>{`
            @keyframes text-shimmer {
                0% { background-position: 200% center; }
                100% { background-position: -200% center; }
            }
          `}</style>
       </div>

       {/* Scrollable Content with Fade Mask at bottom */}
       <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-40 hide-scrollbar mask-image-gradient-bottom">
          <div className="max-w-4xl mx-auto w-full pt-8 animate-enter">
             {children}
          </div>
       </div>
    </div>
  );
};

export default SimpleView;
