
import React, { useState } from 'react';
import { Language } from '../../types';
import { KNOWLEDGE_BASE, CATEGORIES, KnowledgeItem } from '../../data/knowledge';
import {
  Clock, Droplets, Sun, TrendingUp, IndianRupee, Percent, Sprout,
  Search, X, Wheat, Settings, Milk, Landmark, LayoutGrid, BookOpen,
  Tag, Info, ChevronRight, ArrowLeft
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

const catIconMap: Record<string, React.ReactNode> = {
  grid: <LayoutGrid className="w-5 h-5" />,
  wheat: <Wheat className="w-5 h-5" />,
  settings: <Settings className="w-5 h-5" />,
  milk: <Milk className="w-5 h-5" />,
  landmark: <Landmark className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  crop: 'from-green-500 to-emerald-600',
  tech: 'from-blue-500 to-indigo-600',
  livestock: 'from-amber-500 to-orange-600',
  scheme: 'from-purple-500 to-violet-600',
};

const categoryBadgeColors: Record<string, string> = {
  crop: 'bg-green-100 text-green-800',
  tech: 'bg-blue-100 text-blue-800',
  livestock: 'bg-amber-100 text-amber-800',
  scheme: 'bg-purple-100 text-purple-800',
};

function CategoryFilter({ selected, onSelect, lang }: {
  selected: string;
  onSelect: (id: string) => void;
  lang: Language;
}) {
  const getLabel = (obj: any) => lang === 'mr' ? obj.mr : (obj.hi || obj.en);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-1 hide-scrollbar">
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => { onSelect(cat.id); triggerHaptic(); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              isActive
                ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-[1.02]`
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            {catIconMap[cat.icon]}
            <span>{getLabel(cat.label)}</span>
          </button>
        );
      })}
    </div>
  );
}

function StatBadge({ stat, lang }: { stat: KnowledgeItem['stats'][0]; lang: Language }) {
  const label = lang === 'mr' ? stat.label.mr : stat.label.en;
  
  return (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-100">
      <span className="text-green-600">{iconMap[stat.icon] || <Info className="w-4 h-4" />}</span>
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-sm font-bold text-gray-800">{stat.value}</p>
      </div>
    </div>
  );
}

function CropCard({ item, lang, onClick }: { item: KnowledgeItem; lang: Language; onClick: () => void }) {
  const title = lang === 'mr' ? item.title.mr : (lang === 'hi' ? (item.title.hi || item.title.en) : item.title.en);
  const subtitle = lang === 'mr' ? item.subtitle.mr : (lang === 'hi' ? (item.subtitle.hi || item.subtitle.en) : item.subtitle.en);
  const catLabel = CATEGORIES.find(c => c.id === item.category)?.label;
  const categoryName = catLabel ? (lang === 'mr' ? catLabel.mr : catLabel.en) : item.category;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 overflow-hidden hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${categoryBadgeColors[item.category]}`}>
            {categoryName}
          </span>
        </div>

        {/* Title on image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
          <p className="text-sm text-gray-200 mt-0.5 line-clamp-1">{subtitle}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {item.stats.slice(0, 4).map((stat, i) => (
            <StatBadge key={i} stat={stat} lang={lang} />
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
              {tag}
            </span>
          ))}
        </div>

        {/* Read More */}
        <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-green-600 group-hover:text-green-700">
          <BookOpen className="w-4 h-4" />
          <span>{lang === 'mr' ? 'अधिक वाचा' : 'Read More'}</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}

function StatsOverview({ lang }: { lang: Language }) {
  const cropCount = KNOWLEDGE_BASE.filter(i => i.category === 'crop').length;
  const techCount = KNOWLEDGE_BASE.filter(i => i.category === 'tech').length;
  const livestockCount = KNOWLEDGE_BASE.filter(i => i.category === 'livestock').length;
  const schemeCount = KNOWLEDGE_BASE.filter(i => i.category === 'scheme').length;

  const stats = [
    { label: lang === 'mr' ? 'पिके' : 'Crops', value: cropCount, icon: <Wheat className="w-5 h-5" />, color: 'from-green-500 to-emerald-600', bg: 'bg-green-50' },
    { label: lang === 'mr' ? 'तंत्रज्ञान' : 'Technology', value: techCount, icon: <Settings className="w-5 h-5" />, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
    { label: lang === 'mr' ? 'पशुपालन' : 'Livestock', value: livestockCount, icon: <Milk className="w-5 h-5" />, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50' },
    { label: lang === 'mr' ? 'योजना' : 'Schemes', value: schemeCount, icon: <Landmark className="w-5 h-5" />, color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((s) => (
        <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-gray-100 shadow-sm`}>
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-md mb-3`}>
            {s.icon}
          </div>
          <p className="text-2xl font-bold text-gray-800">{s.value}</p>
          <p className="text-xs text-gray-500 font-medium">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

const AgriKnowledgeView = ({ lang, onBack, onSelect }: { lang: Language, onBack: () => void, onSelect: (item: KnowledgeItem) => void }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = KNOWLEDGE_BASE.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const titleEn = item.title.en.toLowerCase();
    const titleMr = item.title.mr;
    const titleHi = item.title.hi || '';
    
    const matchesSearch = !query ||
      titleEn.includes(query) ||
      titleMr.includes(query) ||
      titleHi.includes(query) ||
      item.tags.some(t => t.toLowerCase().includes(query));
      
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full bg-gray-50 flex flex-col lg:pl-28 animate-enter">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 shrink-0">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grain" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="25" cy="25" r="20" fill="white" opacity="0.1" />
                <circle cx="75" cy="75" r="30" fill="white" opacity="0.05" />
                <circle cx="60" cy="20" r="15" fill="white" opacity="0.08" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grain)" />
          </svg>
        </div>
        
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-20 pt-safe-top">
            <button 
                onClick={() => { onBack(); triggerHaptic(); }} 
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg"
            >
                <ArrowLeft size={20} />
            </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative pt-safe-top mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {lang === 'mr' ? '🌾 कृषी ज्ञानकोश' : '🌾 Agricultural Knowledge Base'}
              </h2>
              <p className="text-green-100 mt-1 text-sm sm:text-base max-w-xl">
                {lang === 'mr'
                  ? 'पिके, तंत्रज्ञान, पशुपालन आणि सरकारी योजनांची संपूर्ण माहिती — शेतकऱ्यांसाठी एकाच ठिकाणी'
                  : 'Complete information on crops, technology, livestock & government schemes — all in one place for farmers'}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/20">
              <BookOpen className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-lg">{KNOWLEDGE_BASE.length}</span>
              <span className="text-green-100 text-sm">
                {lang === 'mr' ? 'विषय' : 'Topics'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-24 hide-scrollbar">
        <div className="max-w-7xl mx-auto">
            {/* Stats Overview */}
            <StatsOverview lang={lang} />

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={lang === 'mr' ? 'शोधा...' : 'Search...'}
                        className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all outline-none shadow-sm"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                
                {/* Category Filter */}
                <div className="sm:w-auto overflow-hidden">
                    <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} lang={lang} />
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500 font-medium">
                {lang === 'mr'
                ? `${filtered.length} ${filtered.length === 1 ? 'विषय' : 'विषय'} सापडले`
                : `${filtered.length} ${filtered.length === 1 ? 'topic' : 'topics'} found`}
            </p>
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((item) => (
                <CropCard
                    key={item.id}
                    item={item}
                    lang={lang}
                    onClick={() => { onSelect(item); triggerHaptic(); }}
                />
                ))}
            </div>
            ) : (
            <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">
                {lang === 'mr' ? 'कोणताही विषय सापडला नाही' : 'No topics found'}
                </h3>
                <p className="text-sm text-gray-500">
                {lang === 'mr' ? 'कृपया वेगळा शोध घ्या' : 'Try a different search or category'}
                </p>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AgriKnowledgeView;
