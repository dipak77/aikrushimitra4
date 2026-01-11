
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';

const SimpleView = ({ title, children, onBack }: { title: string, children: React.ReactNode, onBack: () => void }) => {
  return (
    <div className="h-full w-full flex flex-col bg-[#020617] animate-enter lg:pl-32">
       <div className="flex items-center gap-4 p-6 pt-safe-top z-10 sticky top-0 bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
          <button onClick={() => { onBack(); triggerHaptic(); }} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 hover:bg-white/10 active:scale-95 transition-all">
             <ArrowLeft size={20}/>
          </button>
          <h1 className="text-xl font-black text-white tracking-tight">{title}</h1>
       </div>
       <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-32 hide-scrollbar">
          <div className="max-w-3xl mx-auto w-full pt-4">
             {children}
          </div>
       </div>
    </div>
  );
};

export default SimpleView;
