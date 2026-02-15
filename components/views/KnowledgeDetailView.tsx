
import React, { useState, useCallback } from 'react';
import { Language } from '../../types';
import { KnowledgeItem, CATEGORIES } from '../../data/knowledge';
import {
  ArrowLeft, Clock, Droplets, Sun, TrendingUp, IndianRupee, Percent, Sprout,
  BookOpen, Star, Info, ChevronRight, ChevronDown, ChevronUp, Tag
} from 'lucide-react';
import { triggerHaptic } from '../../utils/common';

const iconMap: Record<string, React.ReactNode> = {
  clock: <Clock className="w-4 h-4" />,
  droplet: <Droplets className="w-4 h-4" />,
  sun: <Sun className="w-4 h-4" />,
  'trending-up': <TrendingUp className="w-4 h-4" />,
  'indian-rupee': <IndianRupee className="w-4 h-4" />,
  percent: <Percent className="w-4 h-4" />,
  sprout: <Sprout className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  crop: 'from-green-500 to-emerald-600',
  tech: 'from-blue-500 to-indigo-600',
  livestock: 'from-amber-500 to-orange-600',
  scheme: 'from-purple-500 to-violet-600',
};

const KnowledgeDetailView = ({ item, lang, onBack }: { item: KnowledgeItem, lang: Language, onBack: () => void }) => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(() => new Set([0]));

  const getLabel = (obj: any) => lang === 'mr' ? obj.mr : (obj.hi || obj.en);

  const toggleSection = useCallback((index: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
    triggerHaptic();
  }, []);

  const expandAll = () => {
    setExpandedSections(new Set(item.sections.map((_, i) => i)));
    triggerHaptic();
  };

  const title = getLabel(item.title);
  const subtitle = getLabel(item.subtitle);
  const catLabelObj = CATEGORIES.find(c => c.id === item.category)?.label;
  const categoryLabel = catLabelObj ? getLabel(catLabelObj) : item.category;

  return (
    <div className="h-full bg-gray-50 flex flex-col lg:pl-28 animate-enter overflow-hidden">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
        {/* Hero */}
        <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden shrink-0">
            <img
            src={item.image}
            alt={title}
            className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
            
            {/* Back Button */}
            <button
            onClick={() => { onBack(); triggerHaptic(); }}
            className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/20 hover:bg-white/30 transition-all pt-safe-top mt-2"
            >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{lang === 'mr' ? 'मागे' : 'Back'}</span>
            </button>

            {/* Category Badge */}
            <div className="absolute top-4 right-4 pt-safe-top mt-2">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r ${categoryColors[item.category]} text-white shadow-lg`}>
                {categoryLabel}
            </span>
            </div>

            {/* Title */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
                {title}
                </h1>
                <p className="text-base sm:text-lg text-gray-200 mt-1">{subtitle}</p>
            </div>
            </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 relative z-10 pb-12">
            {/* Stats Row */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {item.stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${categoryColors[item.category]} flex items-center justify-center text-white shadow-sm shrink-0`}>
                    {iconMap[stat.icon] || <Info className="w-4 h-4" />}
                    </div>
                    <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{getLabel(stat.label)}</p>
                    <p className="text-sm font-bold text-gray-800">{stat.value}</p>
                    </div>
                </div>
                ))}
            </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
            <Tag className="w-4 h-4 text-gray-400" />
            {item.tags.map((tag) => (
                <span key={tag} className="text-xs font-medium px-3 py-1 rounded-lg bg-white border border-gray-200 text-gray-600 shadow-sm">
                {tag}
                </span>
            ))}
            </div>

            {/* Best Varieties */}
            {item.bestVarieties && item.bestVarieties.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 mb-6 border border-green-100">
                <h3 className="flex items-center gap-2 text-sm font-bold text-green-800 mb-3">
                <Star className="w-4 h-4" />
                {lang === 'mr' ? 'शिफारस केलेले वाण' : 'Recommended Varieties'}
                </h3>
                <div className="flex flex-wrap gap-2">
                {item.bestVarieties.map((v) => (
                    <span key={v} className="text-sm px-3 py-1.5 rounded-lg bg-white border border-green-200 text-green-700 font-medium shadow-sm">
                    {v}
                    </span>
                ))}
                </div>
            </div>
            )}

            {/* Expected Yield */}
            {item.expectedYield && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-6 border border-amber-100">
                <h3 className="flex items-center gap-2 text-sm font-bold text-amber-800 mb-2">
                <TrendingUp className="w-4 h-4" />
                {lang === 'mr' ? 'अपेक्षित उत्पादन' : 'Expected Yield'}
                </h3>
                <p className="text-sm text-amber-900 leading-relaxed">{getLabel(item.expectedYield)}</p>
            </div>
            )}

            {/* Market Info */}
            {item.marketInfo && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 mb-6 border border-blue-100">
                <h3 className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-2">
                <IndianRupee className="w-4 h-4" />
                {lang === 'mr' ? 'बाजार माहिती' : 'Market Information'}
                </h3>
                <p className="text-sm text-blue-900 leading-relaxed">{getLabel(item.marketInfo)}</p>
            </div>
            )}

            {/* Sections Header */}
            <div className="flex items-center justify-between mb-4 mt-8">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                {lang === 'mr' ? 'सविस्तर माहिती' : 'Detailed Information'}
            </h2>
            <button
                onClick={expandAll}
                className="text-xs font-medium text-green-600 hover:text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
            >
                {lang === 'mr' ? 'सर्व उघडा' : 'Expand All'}
            </button>
            </div>

            {/* Sections */}
            <div className="space-y-3">
            {item.sections.map((section, index) => {
                const isExpanded = expandedSections.has(index);
                return (
                <div
                    key={index}
                    className={`bg-white rounded-2xl border transition-all duration-300 ${
                    isExpanded ? 'border-green-200 shadow-md' : 'border-gray-200 shadow-sm'
                    }`}
                >
                    <button
                    onClick={() => toggleSection(index)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                    >
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        isExpanded
                            ? `bg-gradient-to-br ${categoryColors[item.category]} text-white`
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                        {index + 1}
                        </div>
                        <h3 className={`text-sm sm:text-base font-semibold ${isExpanded ? 'text-gray-900' : 'text-gray-700'}`}>
                        {getLabel(section.title)}
                        </h3>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-green-600 shrink-0" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                    )}
                    </button>
                    {isExpanded && (
                    <div className="px-4 sm:px-5 pb-5">
                        <div className="border-t border-gray-100 pt-4">
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                            {getLabel(section.content)}
                        </div>
                        </div>
                    </div>
                    )}
                </div>
                );
            })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeDetailView;
