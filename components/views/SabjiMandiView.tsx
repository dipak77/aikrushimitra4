
import React, { useState, useRef, useEffect } from 'react';
import { Language, UserProfile } from '../../types';
import { TRANSLATIONS, SHOP_PHONE } from '../../constants';
import { MOCK_VEGETABLES } from '../../data/mock';
import SimpleView from '../layout/SimpleView';
import { ShoppingCart, Plus, Minus, X, ArrowRight, MapPin, User, Send, CheckCircle2, Search } from 'lucide-react';
import { Button } from '../Button';
import { triggerHaptic } from '../../utils/common';
import clsx from 'clsx';

// Type definitions
type CartItem = {
  id: number;
  qty: number;
};

const SabjiMandiView = ({ lang, user, onBack }: { lang: Language, user: UserProfile, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  const [activeCategory, setActiveCategory] = useState<'all' | 'veg' | 'fruit' | 'leafy'>('all');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: user.name, address: user.village });
  const [isOrderSent, setIsOrderSent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products based on category AND search
  const products = MOCK_VEGETABLES.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || p.nameEn.toLowerCase().includes(q) || p.nameMr.includes(q) || p.nameHi.includes(q);
      return matchCat && matchSearch;
  });

  // Cart logic
  const addToCart = (id: number) => {
    triggerHaptic('light');
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: number) => {
    triggerHaptic('light');
    setCart(prev => {
      const newQty = (prev[id] || 0) - 1;
      if (newQty <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newQty };
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = MOCK_VEGETABLES.find(v => v.id === Number(id));
    return sum + (p ? p.price * qty : 0);
  }, 0);

  // WhatsApp Logic
  const handleCheckout = () => {
    if (totalItems === 0) return;
    
    // 1. Build Item List
    let itemsList = "";
    Object.entries(cart).forEach(([id, qty]) => {
        const p = MOCK_VEGETABLES.find(v => v.id === Number(id));
        if(p) {
            const name = lang === 'mr' ? p.nameMr : lang === 'hi' ? p.nameHi : p.nameEn;
            itemsList += `- ${name} (${qty} ${p.unit}) - ₹${p.price * qty}\n`;
        }
    });

    // 2. Construct Message
    const greeting = lang === 'mr' ? "नमस्कार 🙏\nनवीन भाजी ऑर्डर:" : "नमस्ते 🙏\nनई सब्जी ऑर्डर:";
    const totalLabel = lang === 'mr' ? "एकूण" : "कुल";
    const nameLabel = lang === 'mr' ? "नाव" : "नाम";
    const addrLabel = lang === 'mr' ? "पत्ता" : "पता";

    const message = `${greeting}
------------------
${itemsList}------------------
${totalLabel}: ₹${totalPrice}

${nameLabel}: ${userDetails.name}
${addrLabel}: ${userDetails.address}`;

    // 3. Open WhatsApp
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${SHOP_PHONE}?text=${encoded}`;
    window.open(url, '_blank');
    
    setIsOrderSent(true);
    setIsCartOpen(false);
    setCart({});
    triggerHaptic('heavy');
  };

  return (
    <SimpleView title={t.mandi_title} onBack={onBack}>
      <div className="pb-32 relative min-h-screen">
        
        {/* Success Overlay */}
        {isOrderSent && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-enter">
                <div className="bg-[#020617] border border-green-500/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-green-400 animate-bounce"/>
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Order Sent!</h2>
                    <p className="text-slate-400 mb-6">WhatsApp has been opened with your order details.</p>
                    <Button fullWidth onClick={() => setIsOrderSent(false)} variant="primary" className="from-green-600 to-emerald-600">
                        Okay, Done
                    </Button>
                </div>
            </div>
        )}

        {/* Search Bar */}
        <div className="sticky top-0 bg-[#020617]/95 backdrop-blur-md z-30 pt-2 pb-2 px-2 -mx-4 mb-2 border-b border-white/5">
            <div className="mx-4 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === 'mr' ? 'भाजी शोधा...' : 'Search vegetables...'}
                    className="w-full bg-white/10 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-green-500/50 focus:bg-white/15 transition-all"
                />
            </div>
            
            {/* Categories */}
            <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pt-3 pb-2">
               {['all', 'veg', 'leafy', 'fruit'].map((cat) => (
                   <button 
                     key={cat}
                     onClick={() => { setActiveCategory(cat as any); triggerHaptic(); }}
                     className={clsx(
                        "px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                        activeCategory === cat 
                          ? "bg-green-500 text-white border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]" 
                          : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                     )}
                   >
                     {t.mandi_categories[cat] || cat}
                   </button>
               ))}
            </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-2">
            {products.map((p) => {
                const qty = cart[p.id] || 0;
                const pName = lang === 'mr' ? p.nameMr : lang === 'hi' ? p.nameHi : p.nameEn;
                
                return (
                    <div key={p.id} className="glass-panel p-4 rounded-3xl bg-slate-900/40 border border-white/10 flex flex-col items-center text-center group active:scale-[0.98] transition-transform">
                        <div className="text-5xl mb-4 drop-shadow-xl transform group-hover:scale-110 transition-transform duration-300">{p.image}</div>
                        <h3 className="text-lg font-black text-white leading-tight">{pName}</h3>
                        <p className="text-xs text-slate-400 font-medium mb-3">{p.nameEn}</p>
                        
                        <div className="flex items-center gap-1 mb-4 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                            <span className="text-green-400 font-bold">₹{p.price}</span>
                            <span className="text-xs text-slate-500">/ {p.unit}</span>
                        </div>

                        {qty === 0 ? (
                            <button 
                                onClick={() => addToCart(p.id)}
                                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-green-500/20 text-green-400 font-bold text-sm border border-white/10 hover:border-green-500/50 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={16}/> {t.mandi_add}
                            </button>
                        ) : (
                            <div className="flex items-center gap-3 bg-green-500/20 rounded-xl px-2 py-1.5 border border-green-500/30 w-full justify-between">
                                <button onClick={() => removeFromCart(p.id)} className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 hover:bg-green-500/40 active:scale-90 transition-all"><Minus size={16}/></button>
                                <span className="font-black text-white w-6">{qty}</span>
                                <button onClick={() => addToCart(p.id)} className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white hover:bg-green-600 active:scale-90 transition-all shadow-[0_0_10px_rgba(34,197,94,0.4)]"><Plus size={16}/></button>
                            </div>
                        )}
                    </div>
                );
            })}
            
            {products.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">
                    <p>No items found matching "{searchQuery}"</p>
                </div>
            )}
        </div>

        {/* Floating Cart Bar - POSITIONED HIGHER for Mobile Nav */}
        {totalItems > 0 && (
            <div className="fixed bottom-6 inset-x-4 md:inset-x-auto md:w-[400px] md:right-6 z-[190] animate-enter">
                <div onClick={() => setIsCartOpen(true)} className="bg-[#1DB954] text-white p-4 rounded-[1.5rem] shadow-[0_10px_40px_rgba(29,185,84,0.4)] flex items-center justify-between cursor-pointer active:scale-95 transition-transform border border-white/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center font-black">
                            {totalItems}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">{t.mandi_total}</span>
                            <span className="text-xl font-black">₹{totalPrice}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-sm bg-black/20 px-4 py-2 rounded-xl">
                        {t.mandi_cart} <ArrowRight size={16}/>
                    </div>
                </div>
            </div>
        )}

        {/* Cart Drawer (Bottom Sheet) */}
        {isCartOpen && (
            <>
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250]" onClick={() => setIsCartOpen(false)}></div>
                <div className="fixed bottom-0 inset-x-0 bg-[#0f172a] border-t border-white/10 rounded-t-[2.5rem] z-[260] p-6 pb-12 max-h-[85vh] overflow-y-auto animate-[slide-up_0.3s_ease-out] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                    <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>
                    
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-white">{t.mandi_cart}</h2>
                        <button onClick={() => setIsCartOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"><X size={18}/></button>
                    </div>

                    <div className="space-y-4 mb-8">
                        {Object.entries(cart).map(([id, qty]) => {
                            const p = MOCK_VEGETABLES.find(v => v.id === Number(id));
                            if(!p) return null;
                            const pName = lang === 'mr' ? p.nameMr : lang === 'hi' ? p.nameHi : p.nameEn;
                            
                            return (
                                <div key={id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{p.image}</span>
                                        <div>
                                            <p className="font-bold text-white">{pName}</p>
                                            <p className="text-xs text-slate-400">₹{p.price} / {p.unit}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => removeFromCart(p.id)} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center"><Minus size={14}/></button>
                                        <span className="font-mono font-bold w-4 text-center text-white">{qty}</span>
                                        <button onClick={() => addToCart(p.id)} className="w-7 h-7 rounded-lg bg-green-500 text-white flex items-center justify-center"><Plus size={14}/></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Address Form */}
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 mb-6 space-y-4">
                        <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-wider mb-2">
                            <MapPin size={14}/> {t.mandi_delivery} Details
                        </div>
                        <input 
                            type="text" 
                            value={userDetails.name} 
                            onChange={(e) => setUserDetails(prev => ({...prev, name: e.target.value}))}
                            placeholder={t.mandi_name}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50"
                        />
                        <textarea 
                            value={userDetails.address}
                            onChange={(e) => setUserDetails(prev => ({...prev, address: e.target.value}))}
                            placeholder={t.mandi_address}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50 h-20 resize-none"
                        />
                    </div>

                    {/* Bill Summary */}
                    <div className="flex justify-between items-center mb-6 px-2">
                        <span className="text-slate-400 font-medium">{t.mandi_total}</span>
                        <span className="text-3xl font-black text-white">₹{totalPrice}</span>
                    </div>

                    <Button 
                        fullWidth 
                        size="lg" 
                        variant="primary" 
                        className="from-[#1DB954] to-[#168f40] shadow-lg shadow-green-500/20 py-4 text-lg text-white font-bold"
                        icon={<Send size={20} className="text-white"/>}
                        onClick={handleCheckout}
                    >
                        {t.mandi_checkout}
                    </Button>
                    <p className="text-center text-[10px] text-white/40 mt-4 uppercase tracking-widest font-bold">Powered by WhatsApp</p>
                </div>
            </>
        )}

      </div>
    </SimpleView>
  );
};

export default SabjiMandiView;
